#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const swaggerPath = path.join(projectRoot, "swagger.json");
const postmanCollectionsDir = path.join(projectRoot, "postman-collections");
const generatedClientsDir = path.join(projectRoot, "app", "api", "generated");

const supportedMethods = new Set([
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "head",
  "options",
]);

async function main() {
  const raw = await fs.readFile(swaggerPath, "utf8");
  const spec = JSON.parse(raw);

  const collections = buildCollections(spec);
  await writeTypeScriptClients(collections);
  await writePostmanCollections(spec.info?.title ?? "API", collections);

  console.log(
    `Generated ${Object.keys(collections).length} tag modules with ${Object.values(
      collections
    ).reduce((sum, list) => sum + list.length, 0)} endpoints.`
  );
}

function buildCollections(spec) {
  const grouped = {};

  for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!pathItem || typeof pathItem !== "object") continue;
    const pathLevelParams = Array.isArray(pathItem.parameters)
      ? pathItem.parameters
      : [];

    for (const [methodKey, operation] of Object.entries(pathItem)) {
      if (!supportedMethods.has(methodKey)) continue;
      if (!operation || typeof operation !== "object") continue;

      const tags =
        Array.isArray(operation.tags) && operation.tags.length > 0
          ? operation.tags
          : ["Untagged"];
      const endpoint = buildEndpoint({
        pathKey,
        method: methodKey,
        operation,
        pathLevelParams,
      });

      for (const tag of tags) {
        if (!grouped[tag]) grouped[tag] = [];
        grouped[tag].push(endpoint);
      }
    }
  }

  for (const endpoints of Object.values(grouped)) {
    endpoints.sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

function buildEndpoint({ pathKey, method, operation, pathLevelParams }) {
  const uppercaseMethod = method.toUpperCase();
  const operationId =
    operation.operationId ?? generateOperationId(method, pathKey);
  const name =
    operation.summary ?? operationId ?? `${uppercaseMethod} ${pathKey}`;

  const parameters = mergeParameters(pathLevelParams, operation.parameters);
  const requestBody = normalizeRequestBody(operation.requestBody);
  const responses = normalizeResponses(operation.responses);

  return {
    id: operationId,
    name,
    summary: operation.summary,
    description: operation.description,
    method: uppercaseMethod,
    path: pathKey,
    operationId,
    deprecated: !!operation.deprecated,
    parameters,
    requestBody,
    responses,
    security: operation.security ?? [],
  };
}

function mergeParameters(pathParams, operationParams) {
  const combined = [...(Array.isArray(pathParams) ? pathParams : [])];
  if (Array.isArray(operationParams)) combined.push(...operationParams);

  const seen = new Map();
  for (const param of combined) {
    if (!param) continue;
    const key = param.$ref ?? `${param.name}:${param.in}`;
    if (!seen.has(key)) seen.set(key, normalizeParameter(param));
  }

  return Array.from(seen.values());
}

function normalizeParameter(param) {
  if (param.$ref) return { ref: param.$ref };
  return {
    name: param.name,
    in: param.in,
    required: param.required ?? false,
    description: param.description,
    schema: summarizeSchema(param.schema),
    deprecated: param.deprecated ?? false,
    allowEmptyValue: param.allowEmptyValue ?? false,
    style: param.style,
    explode: param.explode,
  };
}

function normalizeRequestBody(requestBody) {
  if (!requestBody) return undefined;
  if (requestBody.$ref) return { ref: requestBody.$ref };

  return {
    description: requestBody.description,
    required: requestBody.required ?? false,
    content: normalizeContent(requestBody.content),
  };
}

function normalizeResponses(responses) {
  if (!responses || typeof responses !== "object") return [];

  return Object.entries(responses).map(([status, response]) => {
    if (response && response.$ref) {
      return {
        status,
        ref: response.$ref,
      };
    }

    return {
      status,
      description: response?.description,
      headers: normalizeHeaders(response?.headers),
      content: normalizeContent(response?.content),
    };
  });
}

function normalizeHeaders(headers) {
  if (!headers || typeof headers !== "object") return undefined;
  return Object.entries(headers).map(([name, header]) => ({
    name,
    description: header?.description,
    required: header?.required ?? false,
    deprecated: header?.deprecated ?? false,
    schema: summarizeSchema(header?.schema),
  }));
}

function normalizeContent(content) {
  if (!content || typeof content !== "object") return undefined;
  return Object.entries(content).map(([mimeType, value]) => ({
    mimeType,
    schema: summarizeSchema(value?.schema),
    example: value?.example,
    examples: value?.examples,
  }));
}

function summarizeSchema(schema) {
  if (!schema || typeof schema !== "object") return undefined;

  const summary = {};
  if (schema.$ref) summary.ref = schema.$ref;
  if (schema.type) summary.type = schema.type;
  if (schema.format) summary.format = schema.format;
  if (schema.nullable) summary.nullable = true;
  if (schema.enum) summary.enum = schema.enum;
  if (schema.default !== undefined) summary.default = schema.default;
  if (schema.description) summary.description = schema.description;
  if (schema.items) summary.items = summarizeSchema(schema.items);
  if (schema.properties) {
    summary.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        summarizeSchema(value),
      ])
    );
  }
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  ) {
    summary.additionalProperties = summarizeSchema(schema.additionalProperties);
  }
  if (schema.oneOf)
    summary.oneOf = schema.oneOf.map((entry) => summarizeSchema(entry));
  if (schema.anyOf)
    summary.anyOf = schema.anyOf.map((entry) => summarizeSchema(entry));
  if (schema.allOf)
    summary.allOf = schema.allOf.map((entry) => summarizeSchema(entry));

  return summary;
}

function generateOperationId(method, pathKey) {
  const cleanSegments = pathKey
    .replace(/[{}]/g, "")
    .split("/")
    .filter(Boolean)
    .join("_");
  return `${method}_${cleanSegments || "root"}`;
}

async function writeTypeScriptClients(collections) {
  await fs.rm(generatedClientsDir, { recursive: true, force: true });
  await fs.mkdir(generatedClientsDir, { recursive: true });

  await fs.writeFile(
    path.join(generatedClientsDir, "core.ts"),
    `${buildCoreFile()}\n`,
    "utf8"
  );

  const indexExports = [];
  const sortedTags = Object.keys(collections).sort((a, b) =>
    a.localeCompare(b)
  );

  for (const tag of sortedTags) {
    const endpoints = collections[tag];
    const slug = slugify(tag);
    const apiName = buildApiName(tag);
    const filePath = path.join(generatedClientsDir, `${slug}.ts`);
    const fileContent = buildTagModule(tag, apiName, endpoints);
    await fs.writeFile(filePath, `${fileContent}\n`, "utf8");
    indexExports.push({ slug, apiName });
  }

  await fs.writeFile(
    path.join(generatedClientsDir, "index.ts"),
    buildIndexFile(indexExports),
    "utf8"
  );
}

function buildCoreFile() {
  return `/**
 * Auto-generated API request helpers.
 * Do not edit manually. Run \`npm run generate:api\`.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export interface ApiRequestOptions {
  baseUrl?: string;
  pathParams?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  init?: RequestInit;
}

export interface RequestConfig extends ApiRequestOptions {
  method: HttpMethod;
  path: string;
}

export function request(config: RequestConfig): Promise<Response> {
  const url = buildUrl(config.path, config.baseUrl, config.pathParams, config.query);
  const headers = new Headers(config.init?.headers ?? {});

  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      if (value === undefined) continue;
      headers.set(key, value);
    }
  }

  const body = resolveBody(headers, config.body);

  const init: RequestInit = {
    ...config.init,
    method: config.method,
    headers,
    body,
  };

  return fetch(url, init);
}

function buildUrl(
  pathTemplate: string,
  baseUrl?: string,
  pathParams: Record<string, string | number> = {},
  query: Record<string, string | number | boolean | undefined> = {},
) {
  const pathWithParams = pathTemplate.replace(/\\{([^}]+)\\}/g, (_, paramName) => {
    if (!(paramName in pathParams)) {
      throw new Error(\`Missing path parameter "\${paramName}" for \${pathTemplate}\`);
    }
    return encodeURIComponent(String(pathParams[paramName]));
  });

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }

  const queryString = search.toString();
  const relativeUrl = queryString ? \`\${pathWithParams}?\${queryString}\` : pathWithParams;

  if (!baseUrl) return relativeUrl;
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return \`\${baseUrl.replace(/\\/$/, "")}\${relativeUrl}\`;
  }
}

function resolveBody(headers: Headers, body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has("Content-Type") && !headers.has("content-type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

function isBodyInit(value: unknown): value is BodyInit {
  if (typeof value === "string") return true;
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (typeof FormData !== "undefined" && value instanceof FormData) return true;
  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) return true;
  if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) return true;
  return false;
}
`;
}

function buildTagModule(tag, apiName, endpoints) {
  const header = `// Auto-generated client for tag "${tag}".
// Do not edit manually. Run \`npm run generate:api\`.

import { request } from "./core";
import type { ApiRequestOptions } from "./core";
`;

  const usedNames = new Set();
  const functionBlocks = [];
  const fnNames = [];

  for (const endpoint of endpoints) {
    const functionName = createFunctionName(endpoint, usedNames);
    fnNames.push(functionName);
    const doc = buildDocComment(tag, endpoint);
    functionBlocks.push(`${doc}
export function ${functionName}(options: ApiRequestOptions = {}) {
  return request({
    method: "${endpoint.method}",
    path: "${endpoint.path}",
    ...options,
  });
}
`);
  }

  const apiObject = `export const ${apiName} = {
${fnNames.map((name) => `  ${name},`).join("\n")}
} as const;
`;

  return `${header}
${functionBlocks.join("\n")}
${apiObject}`;
}

function buildDocComment(tag, endpoint) {
  const lines = [`/**`, ` * [${tag}] ${endpoint.method} ${endpoint.path}`];
  if (endpoint.summary) {
    lines.push(` * ${escapeCommentText(endpoint.summary)}`);
  }
  if (endpoint.description) {
    for (const line of endpoint.description.split(/\r?\n/)) {
      if (!line) continue;
      lines.push(` * ${escapeCommentText(line)}`);
    }
  }

  const pathParams = getParameterNames(endpoint, "path");
  if (pathParams.length > 0) {
    lines.push(` * Path params: ${pathParams.join(", ")}`);
  }

  const queryParams = getParameterNames(endpoint, "query");
  if (queryParams.length > 0) {
    lines.push(` * Query params: ${queryParams.join(", ")}`);
  }

  const bodyDescription = describeRequestBody(endpoint.requestBody);
  if (bodyDescription) {
    lines.push(` * Body: ${bodyDescription}`);
  }

  const responses = (endpoint.responses ?? [])
    .map((response) => response.status)
    .join(", ");
  if (responses) {
    lines.push(` * Responses: ${responses}`);
  }

  if (endpoint.deprecated) {
    lines.push(" * @deprecated");
  }

  lines.push(" */");
  return lines.join("\n");
}

function escapeCommentText(value) {
  return value.replace(/\*\//g, "* /");
}

function describeRequestBody(requestBody) {
  if (!requestBody || requestBody.ref) return "";
  if (!Array.isArray(requestBody.content) || requestBody.content.length === 0)
    return "";
  const mimeTypes = requestBody.content
    .map((entry) => entry.mimeType)
    .join(", ");
  return `${requestBody.required ? "required" : "optional"}${mimeTypes ? ` (${mimeTypes})` : ""}`;
}

function getParameterNames(endpoint, location) {
  return (endpoint.parameters ?? [])
    .filter((param) => !param.ref && param.in === location && param.name)
    .map((param) => param.name);
}

function createFunctionName(endpoint, usedNames) {
  const base = sanitizeIdentifier(
    endpoint.operationId ?? `${endpoint.method}_${endpoint.path}`
  );
  let candidate = base;
  let counter = 2;

  while (usedNames.has(candidate)) {
    candidate = `${base}${counter}`;
    counter += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function sanitizeIdentifier(value) {
  const camel = toCamelCase(value);
  let name = camel.replace(/[^a-zA-Z0-9]/g, "");
  if (!name) name = "endpoint";
  if (!/^[A-Za-z_]/.test(name)) {
    name = `endpoint${capitalize(name)}`;
  }
  return name;
}

function buildApiName(tag) {
  const base = toPascalCase(tag) || "Untagged";
  const sanitized = base.replace(/[^a-zA-Z0-9]/g, "") || "Untagged";
  if (!/^[A-Za-z_]/.test(sanitized)) {
    return `Api${sanitized}Api`;
  }
  return `${sanitized}Api`;
}

function buildIndexFile(entries) {
  const lines = ['export * from "./core";'];
  for (const entry of entries) {
    lines.push(`export * from "./${entry.slug}";`);
  }
  lines.push("");
  return lines.join("\n");
}

function slugify(value) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "untagged"
  );
}

function toPascalCase(value) {
  const words = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_\-./:\\]+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  return words.map((word) => capitalize(word.toLowerCase())).join("");
}

function toCamelCase(value) {
  const pascal = toPascalCase(value);
  if (!pascal) return "";
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function writePostmanCollections(apiTitle, collections) {
  await fs.mkdir(postmanCollectionsDir, { recursive: true });

  const writes = Object.entries(collections).map(async ([tag, endpoints]) => {
    const slug = slugify(tag);
    const filePath = path.join(
      postmanCollectionsDir,
      `${slug}.postman_collection.json`
    );
    const collection = buildPostmanCollection(apiTitle, tag, endpoints);
    await fs.writeFile(
      filePath,
      `${JSON.stringify(collection, null, 2)}\n`,
      "utf8"
    );
  });

  await Promise.all(writes);
}

function buildPostmanCollection(apiTitle, tag, endpoints) {
  return {
    info: {
      name: `${apiTitle} - ${tag}`,
      _postman_id: crypto.randomUUID(),
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: `Auto-generated from swagger.json for the ${tag} tag.`,
    },
    item: endpoints.map((endpoint) => ({
      name: endpoint.name,
      request: buildPostmanRequest(endpoint),
    })),
    variable: [
      {
        key: "baseUrl",
        value: "{{baseUrl}}",
        description:
          "Set this to your API base URL when importing into Postman.",
      },
    ],
  };
}

function buildPostmanRequest(endpoint) {
  const headers = [];
  const body = buildPostmanBody(endpoint, headers);

  const url = {
    raw: `{{baseUrl}}${endpoint.path}`,
    host: ["{{baseUrl}}"],
    path: endpoint.path
      .replace(/^\//, "")
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.replace(/\{(.+?)}/g, ":$1")),
  };

  const pathParamMatches = Array.from(endpoint.path.matchAll(/\{([^}]+)\}/g));
  if (pathParamMatches.length > 0) {
    url.variable = pathParamMatches.map((match) => ({
      key: match[1],
      value: "",
      description: `Path parameter ${match[1]}`,
    }));
  }

  const queryParams =
    endpoint.parameters?.filter((param) => param.in === "query") ?? [];
  if (queryParams.length > 0) {
    url.query = queryParams.map((param) => ({
      key: param.name ?? "param",
      value: "",
      description: param.description,
      disabled: !param.required,
    }));
  }

  return {
    method: endpoint.method,
    header: headers,
    body,
    url,
    description: endpoint.description ?? endpoint.summary,
  };
}

function buildPostmanBody(endpoint, headers) {
  const jsonContent =
    endpoint.requestBody?.content?.find((entry) =>
      entry.mimeType.includes("json")
    ) ?? endpoint.requestBody?.content?.[0];

  if (!jsonContent) return undefined;

  headers.push({
    key: "Content-Type",
    value: jsonContent.mimeType,
  });

  return {
    mode: "raw",
    raw: "{\n  \n}",
    options: {
      raw: {
        language: jsonContent.mimeType.includes("json") ? "json" : "text",
      },
    },
  };
}

main().catch((error) => {
  console.error("Failed to generate API clients.");
  console.error(error);
  process.exitCode = 1;
});

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("/team", "routes/home.tsx"),
  route("/calendar", "routes/calendar.tsx"),
  route("/components", "routes/components.tsx"),
  route("/login", "routes/login.tsx"),
] satisfies RouteConfig;

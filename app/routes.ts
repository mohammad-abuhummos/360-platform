import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("/team", "routes/team.tsx"),
  route("/calendar", "routes/calendar.tsx"),
  route("/chat", "routes/chat.tsx"),
  route("/components", "routes/components.tsx"),
  route("/login", "routes/login.tsx"),
  route("/video-analyze", "routes/video-analyze.tsx"),
  route("/video-analyze-stone", "routes/video-analyze-stone.tsx"),
  route("/video-preview/:id", "routes/video-preview.$id.tsx"),
  route("/management/overview", "routes/management/overview.tsx"),
  route("/management/organization", "routes/management/organization.tsx"),
  route("/management/contacts", "routes/management/contacts.tsx"),
  route("/management/attendance", "routes/management/attendance.tsx"),
  route("/registrations", "routes/registrations.tsx"),
] satisfies RouteConfig;

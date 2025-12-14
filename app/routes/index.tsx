import { redirect } from "react-router";
import type { Route } from "./+types/index";
import Home from "./home";
// export function loader({ }: Route.LoaderArgs) {
//   throw redirect("/team");
// }

export default function Index() {
  return <Home />;
}

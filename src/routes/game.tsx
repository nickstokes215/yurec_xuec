import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/game")({ component: GameLayout });

function GameLayout() {
  return <Outlet />;
}

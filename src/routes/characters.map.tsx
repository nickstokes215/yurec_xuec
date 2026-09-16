import { createFileRoute } from "@tanstack/react-router";
import { YardMap } from "@/components/yard-map";

export const Route = createFileRoute("/characters/map")({ component: YardMap });

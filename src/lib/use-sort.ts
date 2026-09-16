import { useCallback, useEffect, useState } from "react";
import { cycleSortMode, readSortMode, writeSortMode, type SortMode } from "@/data/catalog";

export function useSortMode() {
  const [mode, setMode] = useState<SortMode>("old");

  useEffect(() => {
    setMode(readSortMode());
  }, []);

  const cycle = useCallback(() => {
    setMode((current) => {
      const next = cycleSortMode(current);
      writeSortMode(next);
      return next;
    });
  }, []);

  return { mode, cycle };
}

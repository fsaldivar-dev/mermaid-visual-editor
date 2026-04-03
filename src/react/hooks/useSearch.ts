import { useCallback, useState } from "react";
import type { Node } from "@xyflow/react";

export interface SearchState {
  query: string;
  isOpen: boolean;
  matchIds: string[];
  currentIndex: number;
}

export function useSearch(nodes: Node[]) {
  const [state, setState] = useState<SearchState>({
    query: "",
    isOpen: false,
    matchIds: [],
    currentIndex: -1,
  });

  const open = useCallback(() => {
    setState((s) => ({ ...s, isOpen: true }));
  }, []);

  const close = useCallback(() => {
    setState({ query: "", isOpen: false, matchIds: [], currentIndex: -1 });
  }, []);

  const search = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setState((s) => ({ ...s, query, matchIds: [], currentIndex: -1 }));
        return;
      }
      const lowerQuery = query.toLowerCase();
      const matchIds = nodes
        .filter((n) => {
          const label = (n.data?.label as string) || "";
          return label.toLowerCase().includes(lowerQuery);
        })
        .map((n) => n.id);

      setState((s) => ({
        ...s,
        query,
        matchIds,
        currentIndex: matchIds.length > 0 ? 0 : -1,
      }));
    },
    [nodes]
  );

  const nextMatch = useCallback(() => {
    setState((s) => {
      if (s.matchIds.length === 0) return s;
      return { ...s, currentIndex: (s.currentIndex + 1) % s.matchIds.length };
    });
  }, []);

  const prevMatch = useCallback(() => {
    setState((s) => {
      if (s.matchIds.length === 0) return s;
      return {
        ...s,
        currentIndex: (s.currentIndex - 1 + s.matchIds.length) % s.matchIds.length,
      };
    });
  }, []);

  return { ...state, open, close, search, nextMatch, prevMatch };
}

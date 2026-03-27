"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type CompareItemType = "loan" | "insurance" | "deposit";

export interface CompareItem {
  id: string;
  type: CompareItemType;
  name: string;       // bank / company name
  logo: string;       // emoji
  applyUrl: string;
  metrics: {
    label: string;
    value: string | number;
    highlight?: boolean; // best value in column
  }[];
  // Raw values for highlight calculation
  rawRate?: number;
  rawMonthly?: number;
  rawPremium?: number;
  rawInterest?: number;
  rawTotal?: number;
}

interface CompareCtx {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  MAX: number;
}

const STORAGE_KEY = "balticrate-compare";

const CompareContext = createContext<CompareCtx>({
  items: [],
  add: () => {},
  remove: () => {},
  has: () => false,
  clear: () => {},
  MAX: 3,
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const MAX = 3;

  const [items, setItems] = useState<CompareItem[]>(() => {
    // Hydrate from sessionStorage on mount (client only)
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CompareItem[]) : [];
    } catch {
      return [];
    }
  });

  // Persist to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // sessionStorage not available (SSR, privacy mode)
    }
  }, [items]);

  const add = useCallback(
    (item: CompareItem) => {
      setItems((prev) => {
        if (prev.length >= MAX) return prev;
        if (prev.find((i) => i.id === item.id)) return prev;
        return [...prev, item];
      });
    },
    []
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const has = useCallback(
    (id: string) => {
      return items.some((i) => i.id === id);
    },
    [items]
  );

  const clear = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider value={{ items, add, remove, has, clear, MAX }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}

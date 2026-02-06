"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ViewType } from "@/lib/types";

interface TickerContextType {
  ticker: string;
  setTicker: (ticker: string) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const TickerContext = createContext<TickerContextType>({
  ticker: "AAPL",
  setTicker: () => {},
  activeView: "snapshot",
  setActiveView: () => {},
});

export function TickerProvider({ children }: { children: React.ReactNode }) {
  const [ticker, setTickerState] = useState("AAPL");
  const [activeView, setActiveView] = useState<ViewType>("snapshot");

  const setTicker = useCallback((t: string) => {
    setTickerState(t.toUpperCase());
  }, []);

  return (
    <TickerContext.Provider value={{ ticker, setTicker, activeView, setActiveView }}>
      {children}
    </TickerContext.Provider>
  );
}

export function useTicker() {
  return useContext(TickerContext);
}

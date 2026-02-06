import type { DataProvider } from "@/lib/types";
import { MockProvider } from "./mock";

// ── Provider Registry ───────────────────────────────────────────────────────
// Swap this to use a different data source.
// To use FMP: import { FMPProvider } from "./fmp" and set apiKey.

export type ProviderType = "mock" | "fmp";

let activeProvider: DataProvider | null = null;

export function getProvider(): DataProvider {
  if (!activeProvider) {
    activeProvider = new MockProvider();
  }
  return activeProvider;
}

export function setProvider(type: ProviderType, config?: { apiKey?: string }) {
  switch (type) {
    case "mock":
      activeProvider = new MockProvider();
      break;
    case "fmp":
      // To enable FMP:
      // import { FMPProvider } from "./fmp";
      // activeProvider = new FMPProvider(config?.apiKey ?? "");
      console.warn("FMP provider not yet configured. Using mock data.");
      activeProvider = new MockProvider();
      break;
  }
}

// Re-export types for convenience
export type { DataProvider } from "@/lib/types";

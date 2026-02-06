import { CategorizationResult } from "./types";

// Keyword-to-account mapping with confidence levels
interface KeywordRule {
  keywords: string[];
  accountCode: string;
  accountName: string;
  confidence: number;
}

const EXACT_RULES: KeywordRule[] = [
  // Payroll - high confidence exact matches
  { keywords: ["gusto payroll", "gusto"], accountCode: "5000", accountName: "Payroll Expense", confidence: 0.95 },
  { keywords: ["year-end bonus", "bonus payment"], accountCode: "5000", accountName: "Payroll Expense", confidence: 0.92 },

  // Rent
  { keywords: ["wework office rent", "wework"], accountCode: "5100", accountName: "Rent Expense", confidence: 0.95 },

  // Digital Advertising - exact vendor matches
  { keywords: ["google ads"], accountCode: "5210", accountName: "Digital Advertising", confidence: 0.95 },
  { keywords: ["meta ads", "facebook ads", "instagram ads"], accountCode: "5210", accountName: "Digital Advertising", confidence: 0.95 },
  { keywords: ["linkedin recruiter", "linkedin premium"], accountCode: "6400", accountName: "Recruiting", confidence: 0.88 },

  // Marketing Software
  { keywords: ["hubspot marketing", "hubspot"], accountCode: "5220", accountName: "Marketing Software", confidence: 0.92 },

  // Software & Subscriptions
  { keywords: ["adobe creative cloud", "adobe"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.95 },
  { keywords: ["slack technologies", "slack"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.95 },
  { keywords: ["zoom video", "zoom"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.95 },
  { keywords: ["salesforce crm", "salesforce"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.93 },
  { keywords: ["microsoft 365", "microsoft"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.93 },
  { keywords: ["dropbox business", "dropbox"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.93 },
  { keywords: ["quickbooks subscription", "quickbooks"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.93 },
  { keywords: ["jira", "atlassian"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.90 },

  // Cloud & Infrastructure
  { keywords: ["aws cloud services", "aws"], accountCode: "5400", accountName: "Cloud & Infrastructure", confidence: 0.95 },

  // Office Supplies
  { keywords: ["amzn marketplace - office supplies", "staples - printer"], accountCode: "5500", accountName: "Office Supplies", confidence: 0.90 },
  { keywords: ["amzn marketplace - keyboards", "amzn marketplace - cables", "amzn marketplace - monitor"], accountCode: "5500", accountName: "Office Supplies", confidence: 0.85 },
  { keywords: ["amzn marketplace - standing desks"], accountCode: "1300", accountName: "Office Equipment", confidence: 0.85 },

  // Travel - Airfare
  { keywords: ["delta airlines", "united airlines", "american airlines", "southwest airlines"], accountCode: "5610", accountName: "Airfare", confidence: 0.95 },

  // Travel - Hotels
  { keywords: ["hilton hotels", "marriott", "hyatt regency", "hyatt"], accountCode: "5620", accountName: "Hotels & Lodging", confidence: 0.95 },

  // Meals & Entertainment
  { keywords: ["doordash"], accountCode: "5630", accountName: "Meals & Entertainment", confidence: 0.88 },
  { keywords: ["holiday party", "catering"], accountCode: "5630", accountName: "Meals & Entertainment", confidence: 0.82 },

  // Ground Transportation
  { keywords: ["uber business", "uber"], accountCode: "5640", accountName: "Ground Transportation", confidence: 0.92 },

  // Telecommunications
  { keywords: ["at&t wireless", "at&t"], accountCode: "5700", accountName: "Telecommunications", confidence: 0.95 },
  { keywords: ["comcast business internet", "comcast"], accountCode: "5700", accountName: "Telecommunications", confidence: 0.95 },

  // Insurance
  { keywords: ["state farm insurance", "state farm"], accountCode: "5800", accountName: "Insurance", confidence: 0.95 },

  // Utilities
  { keywords: ["pg&e utilities", "pg&e"], accountCode: "5900", accountName: "Utilities", confidence: 0.93 },

  // Shipping
  { keywords: ["fedex shipping", "fedex", "ups shipping"], accountCode: "6100", accountName: "Shipping & Postage", confidence: 0.93 },

  // Revenue - Client Payments
  { keywords: ["stripe deposit", "client payment"], accountCode: "4000", accountName: "Service Revenue", confidence: 0.92 },

  // Interest Income
  { keywords: ["interest income"], accountCode: "4200", accountName: "Interest Income", confidence: 0.97 },

  // Transfers
  { keywords: ["transfer to savings"], accountCode: "1020", accountName: "Savings Account", confidence: 0.95 },

  // Credit card payments
  { keywords: ["american express"], accountCode: "5600", accountName: "Travel & Entertainment", confidence: 0.70 },
];

// Broader category fallback rules (lower confidence)
const PARTIAL_RULES: KeywordRule[] = [
  { keywords: ["payroll", "salary", "wages"], accountCode: "5000", accountName: "Payroll Expense", confidence: 0.70 },
  { keywords: ["rent", "lease", "office space"], accountCode: "5100", accountName: "Rent Expense", confidence: 0.70 },
  { keywords: ["ads", "advertising", "campaign"], accountCode: "5200", accountName: "Marketing & Advertising", confidence: 0.65 },
  { keywords: ["software", "subscription", "license", "saas"], accountCode: "5300", accountName: "Software & Subscriptions", confidence: 0.65 },
  { keywords: ["cloud", "hosting", "server"], accountCode: "5400", accountName: "Cloud & Infrastructure", confidence: 0.65 },
  { keywords: ["supplies", "toner", "paper"], accountCode: "5500", accountName: "Office Supplies", confidence: 0.60 },
  { keywords: ["flight", "airline", "travel"], accountCode: "5600", accountName: "Travel & Entertainment", confidence: 0.60 },
  { keywords: ["hotel", "lodging", "stay"], accountCode: "5620", accountName: "Hotels & Lodging", confidence: 0.60 },
  { keywords: ["meal", "food", "lunch", "dinner", "catering"], accountCode: "5630", accountName: "Meals & Entertainment", confidence: 0.55 },
  { keywords: ["uber", "lyft", "taxi", "rideshare"], accountCode: "5640", accountName: "Ground Transportation", confidence: 0.60 },
  { keywords: ["phone", "wireless", "internet", "telecom"], accountCode: "5700", accountName: "Telecommunications", confidence: 0.60 },
  { keywords: ["insurance", "premium", "coverage"], accountCode: "5800", accountName: "Insurance", confidence: 0.65 },
  { keywords: ["utility", "electric", "gas", "water"], accountCode: "5900", accountName: "Utilities", confidence: 0.60 },
  { keywords: ["shipping", "postage", "delivery"], accountCode: "6100", accountName: "Shipping & Postage", confidence: 0.60 },
  { keywords: ["payment", "deposit", "revenue"], accountCode: "4000", accountName: "Service Revenue", confidence: 0.55 },
  { keywords: ["interest"], accountCode: "4200", accountName: "Interest Income", confidence: 0.70 },
  { keywords: ["amzn", "amazon"], accountCode: "5500", accountName: "Office Supplies", confidence: 0.55 },
];

const FALLBACK: CategorizationResult = {
  accountCode: "6300",
  accountName: "Miscellaneous Expense",
  confidence: 0.40,
};

const FALLBACK_CREDIT: CategorizationResult = {
  accountCode: "4300",
  accountName: "Other Income",
  confidence: 0.40,
};

export function categorizeTransaction(
  description: string,
  amount: number
): CategorizationResult {
  const desc = description.toLowerCase();

  // Try exact rules first (longest match wins)
  let bestMatch: CategorizationResult | null = null;
  let bestMatchLength = 0;

  for (const rule of EXACT_RULES) {
    for (const keyword of rule.keywords) {
      if (desc.includes(keyword.toLowerCase()) && keyword.length > bestMatchLength) {
        bestMatch = {
          accountCode: rule.accountCode,
          accountName: rule.accountName,
          confidence: rule.confidence,
        };
        bestMatchLength = keyword.length;
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  // Try partial rules
  for (const rule of PARTIAL_RULES) {
    for (const keyword of rule.keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        return {
          accountCode: rule.accountCode,
          accountName: rule.accountName,
          confidence: rule.confidence,
        };
      }
    }
  }

  // Fallback based on debit/credit
  return amount >= 0 ? FALLBACK_CREDIT : FALLBACK;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "#2E7D32"; // green
  if (confidence >= 0.6) return "#F9A825"; // yellow/amber
  return "#C62828"; // red
}

export function getConfidenceBgColor(confidence: number): string {
  if (confidence >= 0.8) return "#E8F5E9"; // light green
  if (confidence >= 0.6) return "#FFF8E1"; // light amber
  return "#FFEBEE"; // light red
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "High";
  if (confidence >= 0.7) return "Medium";
  if (confidence >= 0.5) return "Low";
  return "Very Low";
}

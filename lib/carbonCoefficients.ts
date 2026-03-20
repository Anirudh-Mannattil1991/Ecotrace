// lib/carbonCoefficients.ts
// Carbon coefficients sourced from EPA GHG Protocol
// Values expressed as kg CO₂ per USD spent

export const CARBON_COEFFICIENTS: Record<string, { coefficient: number; label: string; icon: string }> = {
  air_travel:        { coefficient: 0.400, label: "Air Travel",            icon: "✈️"  },
  road_freight:      { coefficient: 0.320, label: "Road Freight",          icon: "🚚" },
  sea_freight:       { coefficient: 0.180, label: "Sea Freight",           icon: "🚢" },
  energy_utilities:  { coefficient: 0.233, label: "Energy & Utilities",    icon: "⚡" },
  manufacturing:     { coefficient: 0.290, label: "Manufacturing",         icon: "🏭" },
  it_cloud:          { coefficient: 0.035, label: "IT & Cloud Services",   icon: "☁️"  },
  food_hospitality:  { coefficient: 0.120, label: "Food & Hospitality",    icon: "🍽️" },
  local_groceries:   { coefficient: 0.050, label: "Local Groceries",       icon: "🛒" },
  professional_svcs: { coefficient: 0.025, label: "Professional Services", icon: "💼" },
  retail_ecommerce:  { coefficient: 0.095, label: "Retail & E-Commerce",   icon: "📦" },
};

export function calculateCO2(category: string, amountUsd: number): number {
  const entry = CARBON_COEFFICIENTS[category];
  if (!entry) return 0;
  return parseFloat((entry.coefficient * amountUsd).toFixed(4));
}

export const CATEGORY_COLORS: Record<string, string> = {
  air_travel:        "#2ECC71",
  road_freight:      "#27AE60",
  sea_freight:       "#1E8449",
  energy_utilities:  "#145A32",
  manufacturing:     "#0B3D20",
  it_cloud:          "#A9DFBF",
  food_hospitality:  "#58D68D",
  local_groceries:   "#82E0AA",
  professional_svcs: "#D5F5E3",
  retail_ecommerce:  "#196F3D",
};

export const INDUSTRY_BENCHMARKS = [
  { sector: "Air Travel",          ideal: 200, average: 400 },
  { sector: "Road Freight",        ideal: 150, average: 320 },
  { sector: "Retail & E-Commerce", ideal: 60,  average: 130 },
  { sector: "Food & Hospitality",  ideal: 80,  average: 160 },
  { sector: "IT & Cloud",          ideal: 20,  average: 50  },
  { sector: "Energy & Utilities",  ideal: 130, average: 260 },
  { sector: "Manufacturing",       ideal: 180, average: 350 },
];

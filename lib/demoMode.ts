// lib/demoMode.ts
// Built-in demo mode for EcoTrace - works without Supabase
// Provides demo transactions and AI insights for showcase/testing

export interface DemoTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount_usd: number;
  co2_kg: number;
  source: string;
}

export interface DemoUser {
  id: string;
  email: string;
  company_name: string;
  industry: string;
}

export const DEMO_USER: DemoUser = {
  id: 'demo-user-001',
  email: 'demo@ecotrace.app',
  company_name: 'TechFlow Solutions',
  industry: 'Technology',
};

// Full set of demo transactions for dashboard
export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  // Air Travel
  { id: '1', date: '2025-01-05', description: 'Flight SG → NYC (business)', category: 'air_travel', amount_usd: 1200, co2_kg: 480, source: 'demo' },
  { id: '2', date: '2025-01-18', description: 'Flight SG → Tokyo (conference)', category: 'air_travel', amount_usd: 800, co2_kg: 320, source: 'demo' },
  { id: '3', date: '2025-02-10', description: 'Flight SG → Bangkok (client visit)', category: 'air_travel', amount_usd: 400, co2_kg: 160, source: 'demo' },

  // Road Freight
  { id: '4', date: '2025-01-12', description: 'Courier delivery (local)', category: 'road_freight', amount_usd: 150, co2_kg: 48, source: 'demo' },
  { id: '5', date: '2025-02-03', description: 'Logistics partner shipment', category: 'road_freight', amount_usd: 320, co2_kg: 102.4, source: 'demo' },
  { id: '6', date: '2025-02-25', description: 'Regional distribution', category: 'road_freight', amount_usd: 500, co2_kg: 160, source: 'demo' },

  // IT & Cloud
  { id: '7', date: '2025-01-08', description: 'AWS cloud services (monthly)', category: 'it_cloud', amount_usd: 800, co2_kg: 28, source: 'demo' },
  { id: '8', date: '2025-02-08', description: 'Datadog monitoring subscription', category: 'it_cloud', amount_usd: 300, co2_kg: 10.5, source: 'demo' },
  { id: '9', date: '2025-02-15', description: 'GitHub Enterprise license', category: 'it_cloud', amount_usd: 250, co2_kg: 8.75, source: 'demo' },

  // Professional Services
  { id: '10', date: '2025-01-20', description: 'Legal consultation', category: 'professional_svcs', amount_usd: 1500, co2_kg: 37.5, source: 'demo' },
  { id: '11', date: '2025-02-05', description: 'Accounting services', category: 'professional_svcs', amount_usd: 2000, co2_kg: 50, source: 'demo' },

  // Energy & Utilities
  { id: '12', date: '2025-01-15', description: 'Office electricity bill', category: 'energy_utilities', amount_usd: 450, co2_kg: 104.85, source: 'demo' },
  { id: '13', date: '2025-02-12', description: 'Water & waste management', category: 'energy_utilities', amount_usd: 200, co2_kg: 46.6, source: 'demo' },

  // Food & Hospitality
  { id: '14', date: '2025-01-22', description: 'Team lunch catering', category: 'food_hospitality', amount_usd: 350, co2_kg: 42, source: 'demo' },
  { id: '15', date: '2025-02-18', description: 'Client dinner meeting', category: 'food_hospitality', amount_usd: 280, co2_kg: 33.6, source: 'demo' },

  // Retail & E-Commerce
  { id: '16', date: '2025-01-28', description: 'Office supplies (Amazon)', category: 'retail_ecommerce', amount_usd: 180, co2_kg: 17.1, source: 'demo' },
  { id: '17', date: '2025-02-20', description: 'Equipment purchase', category: 'retail_ecommerce', amount_usd: 450, co2_kg: 42.75, source: 'demo' },
];

// AI insights for demo dashboard
export const DEMO_AI_INSIGHT = {
  headline: "Reduce air travel emissions by 40% through virtual meetings.",
  top_category_insight: {
    category: "Air Travel",
    co2_kg: 960,
    pct_of_total: 38.2,
    finding: "Air travel is your largest emission source, accounting for 38% of your carbon footprint.",
    three_actions: [
      {
        action: "Adopt virtual-first meeting policy for non-critical travel",
        estimated_reduction_pct: 40,
        effort: "Low",
        local_context: "Singapore has excellent video conferencing infrastructure; tools like Zoom and Microsoft Teams are widely used across APAC."
      },
      {
        action: "Negotiate direct flights and carbon offset programs with travel providers",
        estimated_reduction_pct: 15,
        effort: "Medium",
        local_context: "Singapore Airlines offers carbon offset options for regional flights; consider bundling with corporate travel programs."
      },
      {
        action: "Implement a 'flight-free' month quarterly and promote rail/ferry alternatives for regional travel",
        estimated_reduction_pct: 25,
        effort: "High",
        local_context: "ASEAN rail networks (KTT, Thai Railways) are expanding; ferries connect Singapore to Malaysia and Indonesia efficiently."
      }
    ]
  },
  quick_wins: [
    {
      category: "Energy & Utilities",
      tip: "Switch office lighting to LED and install motion sensors — typical payback in 18 months.",
      estimated_co2_saving_kg: 45
    },
    {
      category: "Road Freight",
      tip: "Consolidate shipments into fewer, fuller trucks to reduce per-unit emissions.",
      estimated_co2_saving_kg: 32
    },
    {
      category: "Food & Hospitality",
      tip: "Offer plant-based catering options for team events — reduces emissions by 60% vs beef-heavy menus.",
      estimated_co2_saving_kg: 28
    }
  ],
  benchmark_note: "Your carbon intensity (0.142 kg CO₂/$) is 18% better than the technology sector average (0.173 kg CO₂/$), but there's room to reach best-in-class (0.08 kg CO₂/$)."
};

// Demo mode helpers
export function isDemoMode(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem('ecotrace_demo_mode') === 'true';
}

export function enableDemoMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ecotrace_demo_mode', 'true');
  }
}

export function disableDemoMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ecotrace_demo_mode');
  }
}

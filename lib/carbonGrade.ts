// lib/carbonGrade.ts
// Grade is based on total kg CO2 per $1000 of total spend

export function getCarbonGrade(totalCO2Kg: number, totalSpendUsd: number): {
  grade: "A" | "B" | "C" | "D" | "F";
  colour: string;
  label: string;
} {
  if (totalSpendUsd === 0) return { grade: "A", colour: "#2ECC71", label: "No Data" };
  const ratio = (totalCO2Kg / totalSpendUsd) * 1000; // kg CO2 per $1000 spent

  if (ratio < 50)   return { grade: "A", colour: "#2ECC71", label: "Excellent"  };
  if (ratio < 120)  return { grade: "B", colour: "#81C784", label: "Good"       };
  if (ratio < 220)  return { grade: "C", colour: "#F39C12", label: "Average"    };
  if (ratio < 350)  return { grade: "D", colour: "#E67E22", label: "Poor"       };
  return              { grade: "F", colour: "#E74C3C", label: "Critical"  };
}

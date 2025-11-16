import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "ai_planning_impact.csv");
    
    if (!fs.existsSync(filePath)) {
      console.error("❌ AI Planning Impact CSV not found at:", filePath);
      return NextResponse.json({ error: "Data file not found" }, { status: 404 });
    }

    const csv = fs.readFileSync(filePath, "utf-8");
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split(",").map(h => h.trim());

    const rows = lines.map(line => {
      // Handle CSV parsing with potential commas in quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });

    const data = rows.map(cols =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), parseFloat(cols[i]) || cols[i].trim()]))
    );

    // Compute average summary
    const avg = (key: string) => {
      const vals = data.map(d => parseFloat(String(d[key])) || 0);
      return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    };

    const summary = {
      avgTrafficBefore: avg("Traffic_Efficiency_Before"),
      avgTrafficAfter: avg("Traffic_Efficiency_After"),
      avgCommuteBefore: avg("Commute_Before"),
      avgCommuteAfter: avg("Commute_After"),
      avgInfraBefore: avg("Infra_Util_Before"),
      avgInfraAfter: avg("Infra_Util_After"),
      avgPollutionBefore: avg("Pollution_Index_Before"),
      avgPollutionAfter: avg("Pollution_Index_After"),
    };

    const improvements = {
      trafficImprovement: (parseFloat(summary.avgTrafficAfter) - parseFloat(summary.avgTrafficBefore)).toFixed(1),
      commuteReduction: (parseFloat(summary.avgCommuteBefore) - parseFloat(summary.avgCommuteAfter)).toFixed(1),
      infraGain: (parseFloat(summary.avgInfraAfter) - parseFloat(summary.avgInfraBefore)).toFixed(1),
      pollutionReduction: (parseFloat(summary.avgPollutionBefore) - parseFloat(summary.avgPollutionAfter)).toFixed(1),
    };

    return NextResponse.json({ data, summary, improvements }, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300"
      }
    });
  } catch (err) {
    console.error("❌ Failed to load planning data:", err);
    return NextResponse.json({ error: "Data load failed" }, { status: 500 });
  }
}


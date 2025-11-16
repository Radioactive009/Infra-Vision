import fs from "fs";
import path from "path";

export interface ParkCoverageZone {
  zone_id: string;
  zone_name: string;
  predicted_coverage_score: number;
  num_parks: number;
  total_area: number;
  urban_green_balance_index: number;
  progress_to_who: number;
  coverage_label: string;
  status: string;
}

export interface ParkCoverageSummary {
  zones: ParkCoverageZone[];
  summary: {
    totalZones: number;
    totalParks: number;
    avgUGBI: number;
    avgProgressWHO: number;
  };
}

export async function getParkCoverageSummary(): Promise<ParkCoverageSummary> {
  const filePath = path.join(process.cwd(), "data", "park_coverage_predictions.csv");
  const csv = fs.readFileSync(filePath, "utf8").trim();
  const lines = csv.split("\n").filter((line) => line.trim());
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",").map((h) => h.trim());

  const zones: ParkCoverageZone[] = rows
    .filter((row) => row.trim())
    .map((row) => {
      const values = row.split(",").map((v) => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return {
        zone_id: obj.zone_id || "",
        zone_name: obj.zone_name || "",
        predicted_coverage_score: parseFloat(obj.predicted_coverage_score) || 0,
        num_parks: parseInt(obj.num_parks) || 0,
        total_area: parseFloat(obj.total_area) || 0,
        urban_green_balance_index: parseFloat(obj.urban_green_balance_index) || 0,
        progress_to_who: parseFloat(obj.progress_to_who) || 0,
        coverage_label: obj.coverage_label || "",
        status: obj.status || "good",
      };
    });

  if (zones.length === 0) {
    throw new Error("No zones found in CSV file");
  }

  const avgUGBI = zones.reduce((a, z) => a + z.urban_green_balance_index, 0) / zones.length;
  const avgProgressWHO = zones.reduce((a, z) => a + z.progress_to_who, 0) / zones.length;
  const totalParks = zones.reduce((a, z) => a + z.num_parks, 0);

  return {
    zones,
    summary: {
      totalZones: zones.length,
      totalParks,
      avgUGBI: Math.round(avgUGBI * 10) / 10, // Round to 1 decimal
      avgProgressWHO: Math.round(avgProgressWHO * 10) / 10, // Round to 1 decimal
    },
  };
}


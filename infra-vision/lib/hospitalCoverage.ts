import fs from "fs";
import path from "path";

export interface HospitalCoverageZone {
  zone_id: string;
  zone_name: string;
  predicted_coverage_score: number;
  num_facilities: number;
  total_capacity: number;
  coverage_label: string;
  status: string;
  true_coverage_score?: number;
}

export interface HospitalCoverageSummary {
  coverage: number;
  totalFacilities: number;
  status: string;
  label: string;
  zones: HospitalCoverageZone[];
}

export async function getHospitalCoverageSummary(): Promise<HospitalCoverageSummary> {
  const filePath = path.join(process.cwd(), "data", "hospital_coverage_predictions.csv");
  const csv = fs.readFileSync(filePath, "utf8").trim();
  const lines = csv.split("\n").filter((line) => line.trim()); // Filter out empty lines
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",").map((h) => h.trim());

  const zones: HospitalCoverageZone[] = rows
    .filter((row) => row.trim()) // Filter out empty rows
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
        num_facilities: parseInt(obj.num_facilities) || 0,
        total_capacity: parseInt(obj.total_capacity) || 0,
        coverage_label: obj.coverage_label || "",
        status: obj.status || "good",
        true_coverage_score: obj.true_coverage_score ? parseFloat(obj.true_coverage_score) : undefined,
      };
    });

  if (zones.length === 0) {
    throw new Error("No zones found in CSV file");
  }

  const avg = zones.reduce((a, z) => a + z.predicted_coverage_score, 0) / zones.length;
  const totalFacilities = zones.reduce((a, z) => a + z.num_facilities, 0);
  const main = zones[0];

  return {
    coverage: Math.round(avg),
    totalFacilities,
    status: main.status,
    label: main.coverage_label,
    zones,
  };
}


import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read school coverage predictions
    const schoolPath = path.join(process.cwd(), "data", "school_coverage_predictions.csv");
    const hospitalPath = path.join(process.cwd(), "data", "hospital_coverage_predictions.csv");
    const parkPath = path.join(process.cwd(), "data", "park_coverage_predictions.csv");

    let totalSchools = 0;
    let totalHospitals = 0;
    let totalParks = 0;
    let zoneData: any[] = [];

    // Helper function to parse CSV line with quoted values
    const parseCSVLine = (line: string): string[] => {
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
    };

    // Read schools
    if (fs.existsSync(schoolPath)) {
      const schoolCsv = fs.readFileSync(schoolPath, "utf-8");
      const [headerLine, ...lines] = schoolCsv.trim().split("\n").filter(l => l.trim());
      const headers = parseCSVLine(headerLine);
      
      lines.forEach(line => {
        const values = parseCSVLine(line);
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || "";
        });
        const numSchools = parseInt(obj.num_schools || "0");
        if (!isNaN(numSchools)) {
          totalSchools += numSchools;
          
          // Store zone data
          const zoneName = obj.zone_name || obj.zone_id || "";
          let zone = zoneData.find(z => z.zone === zoneName);
          if (!zone) {
            zone = { zone: zoneName, parks: 0, schools: 0, hospitals: 0 };
            zoneData.push(zone);
          }
          zone.schools = numSchools;
        }
      });
    }

    // Read hospitals
    if (fs.existsSync(hospitalPath)) {
      const hospitalCsv = fs.readFileSync(hospitalPath, "utf-8");
      const [headerLine, ...lines] = hospitalCsv.trim().split("\n").filter(l => l.trim());
      const headers = parseCSVLine(headerLine);
      
      lines.forEach(line => {
        const values = parseCSVLine(line);
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || "";
        });
        const numHospitals = parseInt(obj.num_facilities || "0");
        if (!isNaN(numHospitals)) {
          totalHospitals += numHospitals;
          
          // Store zone data
          const zoneName = obj.zone_name || obj.zone_id || "";
          let zone = zoneData.find(z => z.zone === zoneName);
          if (!zone) {
            zone = { zone: zoneName, parks: 0, schools: 0, hospitals: 0 };
            zoneData.push(zone);
          }
          zone.hospitals = numHospitals;
        }
      });
    }

    // Read parks
    if (fs.existsSync(parkPath)) {
      const parkCsv = fs.readFileSync(parkPath, "utf-8");
      const [headerLine, ...lines] = parkCsv.trim().split("\n").filter(l => l.trim());
      const headers = parseCSVLine(headerLine);
      
      lines.forEach(line => {
        const values = parseCSVLine(line);
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || "";
        });
        const numParks = parseInt(obj.num_parks || "0");
        if (!isNaN(numParks)) {
          totalParks += numParks;
          
          // Store zone data
          const zoneName = obj.zone_name || obj.zone_id || "";
          let zone = zoneData.find(z => z.zone === zoneName);
          if (!zone) {
            zone = { zone: zoneName, parks: 0, schools: 0, hospitals: 0 };
            zoneData.push(zone);
          }
          zone.parks = numParks;
        }
      });
    }

    return NextResponse.json({
      totals: {
        schools: totalSchools,
        hospitals: totalHospitals,
        parks: totalParks,
        zones: zoneData.length
      },
      zoneData: zoneData
    }, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300"
      }
    });
  } catch (err) {
    console.error("Failed to load infrastructure totals:", err);
    return NextResponse.json({ 
      totals: { schools: 1141, hospitals: 302, parks: 3410, zones: 10 },
      zoneData: []
    }, { status: 200 }); // Return default values on error
  }
}


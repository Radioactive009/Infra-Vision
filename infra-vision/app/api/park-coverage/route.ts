import { NextResponse } from "next/server";
import { getParkCoverageSummary } from "@/lib/parkCoverage";

export async function GET() {
  try {
    const data = await getParkCoverageSummary();
    
    // Transform to match the requested structure
    const response = {
      zones: data.zones.map((zone) => ({
        zone_id: zone.zone_id,
        zone_name: zone.zone_name,
        predicted_coverage_score: zone.predicted_coverage_score,
        coverage_label: zone.coverage_label,
        num_parks: zone.num_parks,
        total_area: zone.total_area,
        urban_green_balance_index: zone.urban_green_balance_index,
        progress_to_who: zone.progress_to_who,
        status: zone.status,
      })),
      summary: {
        ...data.summary,
        avgUGBI: 42,
        avgProgressWHO: 42,
      },
    };

    return NextResponse.json(response, {
      headers: { 
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300" 
      },
    });
  } catch (err) {
    console.error("[API] Failed to load park coverage:", err);
    return new NextResponse("Failed to load park coverage", { status: 404 });
  }
}


import { NextResponse } from "next/server";
import { getHospitalCoverageSummary } from "@/lib/hospitalCoverage";

export async function GET() {
  try {
    const summary = await getHospitalCoverageSummary();
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[API] Failed to load hospital coverage:", err);
    return new NextResponse("Failed to load hospital coverage", { status: 500 });
  }
}


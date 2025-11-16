"use client";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ai-features/components/ui/button";

interface Zone {
  zone_id: string;
  zone_name: string;
  predicted_coverage_score: number;
  num_schools: number;
  coverage_label: string;
  status: string;
}

interface Summary {
  coverage: number;
  totalFacilities: number;
  status: string;
  label: string;
  zones: Zone[];
}

export function SchoolCoverageDetails({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/school-coverage")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        console.error("Failed to load school coverage:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school coverage data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-10">
          <p className="text-red-500 text-lg mb-4">Failed to load data.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'bg-green-100 text-green-700';
      case 'needs-improvement':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-[#00A8E8] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Infrastructure Analysis
        </Button>

        {/* Main Summary Card */}
        <div className="rounded-3xl bg-white shadow-lg p-8 space-y-6 border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">School Coverage Analysis</h1>
            <p className="text-gray-500">Live model results from city-wide coverage predictions</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-6xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent">
                {data.coverage}%
              </span>
              <p className="text-sm text-gray-500 mt-1">Average Coverage</p>
            </div>
            
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
              {data.label}
            </div>
            
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-gray-900">{data.totalFacilities}</div>
              <p className="text-sm text-gray-500">Total Facilities</p>
            </div>
          </div>
        </div>

        {/* Zone-wise Breakdown */}
        <div className="rounded-3xl bg-white shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Zone-wise Breakdown</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b-2 border-gray-200">
                <tr>
                  <th className="py-3 text-left font-semibold">Zone ID</th>
                  <th className="py-3 text-left font-semibold">Zone Name</th>
                  <th className="py-3 text-left font-semibold">Coverage</th>
                  <th className="py-3 text-left font-semibold">Label</th>
                  <th className="py-3 text-left font-semibold">Schools</th>
                  <th className="py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.zones.map((z, index) => (
                  <tr 
                    key={z.zone_id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 font-medium text-gray-900">{z.zone_id}</td>
                    <td className="py-4 font-medium text-gray-900">{z.zone_name}</td>
                    <td className="py-4">
                      <span className="font-semibold text-gray-900">
                        {z.predicted_coverage_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-600">{z.coverage_label}</span>
                    </td>
                    <td className="py-4 text-gray-700">{z.num_schools}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(z.status)}`}>
                        {z.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white shadow p-6 border border-gray-100">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
              {data.zones.length}
            </div>
            <div className="text-gray-600">Zones Analyzed</div>
          </div>
          
          <div className="rounded-2xl bg-white shadow p-6 border border-gray-100">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
              {Math.round(data.zones.reduce((sum, z) => sum + z.predicted_coverage_score, 0) / data.zones.length)}%
            </div>
            <div className="text-gray-600">Average Zone Coverage</div>
          </div>
          
          <div className="rounded-2xl bg-white shadow p-6 border border-gray-100">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
              {data.zones.filter(z => z.status.toLowerCase() === 'good' || z.status.toLowerCase() === 'excellent').length}
            </div>
            <div className="text-gray-600">Zones with Good Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "motion/react";
import { TrendingUp, Clock, Building2, Leaf } from "lucide-react";

export default function AiPlanningImpact() {
  const [impact, setImpact] = useState<any>(null);

  useEffect(() => {
    fetch("/api/ai-planning-impact")
      .then(res => res.json())
      .then(setImpact)
      .catch(err => console.error("Error loading impact data:", err));
  }, []);

  if (!impact) {
    return (
      <div className="text-center text-gray-400 py-10 font-medium">
        Loading AI Planning Impact data...
      </div>
    );
  }

  const { data, summary, improvements } = impact;

  const chartData = data.map((z: any) => ({
    Zone: z.Zone,
    Traffic: parseFloat((z.Traffic_Efficiency_After - z.Traffic_Efficiency_Before).toFixed(1)),
    Commute: parseFloat((z.Commute_Before - z.Commute_After).toFixed(1)),
    Infra: parseFloat((z.Infra_Util_After - z.Infra_Util_Before).toFixed(1)),
    Pollution: parseFloat((z.Pollution_Index_Before - z.Pollution_Index_After).toFixed(1)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-14 py-8 px-4"
    >
      <h2 className="text-3xl font-bold text-center text-gray-900">
        AI Planning Impact Analysis
      </h2>

      {/* 📊 Zone-wise Chart */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Zone-wise Improvement Comparison
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="Zone" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="Traffic" fill="#10B981" name="Traffic Efficiency ↑" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Commute" fill="#3B82F6" name="Commute Time Reduction ↓" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Infra" fill="#8B5CF6" name="Infrastructure Gain ↑" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pollution" fill="#F59E0B" name="Pollution Reduction ↓" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🧩 Before/After Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-red-600 font-semibold mb-4 text-xl">Before AI Planning</h3>
          <ul className="text-gray-700 space-y-3">
            <li className="flex justify-between items-center">
              <span>Traffic Flow Efficiency:</span>
              <b>{summary.avgTrafficBefore}%</b>
            </li>
            <li className="flex justify-between items-center">
              <span>Average Commute:</span>
              <b>{summary.avgCommuteBefore} min</b>
            </li>
            <li className="flex justify-between items-center">
              <span>Infrastructure Utilization:</span>
              <b>{summary.avgInfraBefore}%</b>
            </li>
            <li className="flex justify-between items-center">
              <span>Pollution Index:</span>
              <b>{summary.avgPollutionBefore}</b>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-green-600 font-semibold mb-4 text-xl">After AI Planning</h3>
          <ul className="text-gray-700 space-y-3">
            <li className="flex justify-between items-center">
              <span>Traffic Flow Efficiency:</span>
              <span>
                <b>{summary.avgTrafficAfter}%</b>{" "}
                <span className="text-green-600">+{improvements.trafficImprovement}%</span>
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Average Commute:</span>
              <span>
                <b>{summary.avgCommuteAfter} min</b>{" "}
                <span className="text-blue-500">↓{improvements.commuteReduction} min</span>
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Infrastructure Utilization:</span>
              <span>
                <b>{summary.avgInfraAfter}%</b>{" "}
                <span className="text-purple-600">+{improvements.infraGain}%</span>
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Pollution Index:</span>
              <span>
                <b>{summary.avgPollutionAfter}</b>{" "}
                <span className="text-amber-600">↓{improvements.pollutionReduction}</span>
              </span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* 🚀 Key Improvements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <TrendingUp className="mx-auto text-green-500 mb-2" size={32} />
          <p className="text-3xl font-bold text-green-600">{improvements.trafficImprovement}%</p>
          <p className="text-gray-600 mt-1">Traffic Efficiency Gain</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <Clock className="mx-auto text-blue-500 mb-2" size={32} />
          <p className="text-3xl font-bold text-blue-600">{improvements.commuteReduction} min</p>
          <p className="text-gray-600 mt-1">Commute Time Saved</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <Building2 className="mx-auto text-purple-500 mb-2" size={32} />
          <p className="text-3xl font-bold text-purple-600">{improvements.infraGain}%</p>
          <p className="text-gray-600 mt-1">Infra Efficiency Gain</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <Leaf className="mx-auto text-amber-500 mb-2" size={32} />
          <p className="text-3xl font-bold text-amber-600">{improvements.pollutionReduction}</p>
          <p className="text-gray-600 mt-1">Pollution Reduction</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

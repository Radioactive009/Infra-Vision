// Delhi Urban Growth Dataset
export interface ZoneData {
  Zone: string;
  Region: string;
  PopulationDensity: number;
  HousingDensity: number;
  GrowthRate: number;
  TotalRoadLengthKM: number;
  HighwayRatio: number;
  ArterialRatio: number;
  LocalRoadRatio: number;
  CongestionLevel: number;
  GreenAreaPercent: number;
  ParkCount: number;
  SchoolCount: number;
  HospitalCount: number;
  InfrastructureIndex: number;
  BaseIndex2024: number;
  ForecastIndex2034: number;
}

export const delhiZones: ZoneData[] = [
  {
    Zone: "Zone A",
    Region: "Central Delhi",
    PopulationDensity: 28500,
    HousingDensity: 6200,
    GrowthRate: 2.3,
    TotalRoadLengthKM: 145,
    HighwayRatio: 0.15,
    ArterialRatio: 0.45,
    LocalRoadRatio: 0.40,
    CongestionLevel: 78,
    GreenAreaPercent: 8.5,
    ParkCount: 12,
    SchoolCount: 45,
    HospitalCount: 8,
    InfrastructureIndex: 72,
    BaseIndex2024: 68,
    ForecastIndex2034: 75,
  },
  {
    Zone: "Zone B",
    Region: "North Delhi",
    PopulationDensity: 32000,
    HousingDensity: 7100,
    GrowthRate: 3.1,
    TotalRoadLengthKM: 128,
    HighwayRatio: 0.12,
    ArterialRatio: 0.38,
    LocalRoadRatio: 0.50,
    CongestionLevel: 82,
    GreenAreaPercent: 5.2,
    ParkCount: 8,
    SchoolCount: 38,
    HospitalCount: 5,
    InfrastructureIndex: 58,
    BaseIndex2024: 55,
    ForecastIndex2034: 62,
  },
  {
    Zone: "Zone C",
    Region: "South Delhi",
    PopulationDensity: 18200,
    HousingDensity: 4100,
    GrowthRate: 4.5,
    TotalRoadLengthKM: 198,
    HighwayRatio: 0.25,
    ArterialRatio: 0.50,
    LocalRoadRatio: 0.25,
    CongestionLevel: 45,
    GreenAreaPercent: 18.3,
    ParkCount: 28,
    SchoolCount: 52,
    HospitalCount: 12,
    InfrastructureIndex: 88,
    BaseIndex2024: 82,
    ForecastIndex2034: 92,
  },
  {
    Zone: "Zone D",
    Region: "East Delhi",
    PopulationDensity: 26800,
    HousingDensity: 5900,
    GrowthRate: 2.8,
    TotalRoadLengthKM: 156,
    HighwayRatio: 0.18,
    ArterialRatio: 0.42,
    LocalRoadRatio: 0.40,
    CongestionLevel: 68,
    GreenAreaPercent: 9.8,
    ParkCount: 15,
    SchoolCount: 42,
    HospitalCount: 7,
    InfrastructureIndex: 68,
    BaseIndex2024: 64,
    ForecastIndex2034: 72,
  },
  {
    Zone: "Zone E",
    Region: "West Delhi",
    PopulationDensity: 24500,
    HousingDensity: 5400,
    GrowthRate: 3.2,
    TotalRoadLengthKM: 172,
    HighwayRatio: 0.22,
    ArterialRatio: 0.48,
    LocalRoadRatio: 0.30,
    CongestionLevel: 58,
    GreenAreaPercent: 12.4,
    ParkCount: 22,
    SchoolCount: 48,
    HospitalCount: 9,
    InfrastructureIndex: 76,
    BaseIndex2024: 71,
    ForecastIndex2034: 80,
  },
  {
    Zone: "Zone F",
    Region: "North East Delhi",
    PopulationDensity: 29500,
    HousingDensity: 6600,
    GrowthRate: 2.1,
    TotalRoadLengthKM: 142,
    HighwayRatio: 0.10,
    ArterialRatio: 0.35,
    LocalRoadRatio: 0.55,
    CongestionLevel: 85,
    GreenAreaPercent: 6.1,
    ParkCount: 10,
    SchoolCount: 35,
    HospitalCount: 6,
    InfrastructureIndex: 54,
    BaseIndex2024: 52,
    ForecastIndex2034: 58,
  },
  {
    Zone: "Zone G",
    Region: "South East Delhi",
    PopulationDensity: 21000,
    HousingDensity: 4700,
    GrowthRate: 3.8,
    TotalRoadLengthKM: 185,
    HighwayRatio: 0.20,
    ArterialRatio: 0.45,
    LocalRoadRatio: 0.35,
    CongestionLevel: 52,
    GreenAreaPercent: 14.6,
    ParkCount: 24,
    SchoolCount: 46,
    HospitalCount: 10,
    InfrastructureIndex: 82,
    BaseIndex2024: 76,
    ForecastIndex2034: 86,
  },
  {
    Zone: "Zone H",
    Region: "South West Delhi",
    PopulationDensity: 19800,
    HousingDensity: 4400,
    GrowthRate: 4.2,
    TotalRoadLengthKM: 205,
    HighwayRatio: 0.28,
    ArterialRatio: 0.52,
    LocalRoadRatio: 0.20,
    CongestionLevel: 38,
    GreenAreaPercent: 16.2,
    ParkCount: 30,
    SchoolCount: 55,
    HospitalCount: 8,
    InfrastructureIndex: 84,
    BaseIndex2024: 79,
    ForecastIndex2034: 90,
  },
  {
    Zone: "Zone I",
    Region: "North West Delhi",
    PopulationDensity: 25200,
    HousingDensity: 5600,
    GrowthRate: 2.9,
    TotalRoadLengthKM: 168,
    HighwayRatio: 0.19,
    ArterialRatio: 0.44,
    LocalRoadRatio: 0.37,
    CongestionLevel: 62,
    GreenAreaPercent: 11.2,
    ParkCount: 18,
    SchoolCount: 44,
    HospitalCount: 9,
    InfrastructureIndex: 74,
    BaseIndex2024: 69,
    ForecastIndex2034: 78,
  },
  {
    Zone: "Zone J",
    Region: "New Delhi",
    PopulationDensity: 15200,
    HousingDensity: 3400,
    GrowthRate: 1.8,
    TotalRoadLengthKM: 225,
    HighwayRatio: 0.35,
    ArterialRatio: 0.55,
    LocalRoadRatio: 0.10,
    CongestionLevel: 42,
    GreenAreaPercent: 22.5,
    ParkCount: 35,
    SchoolCount: 48,
    HospitalCount: 15,
    InfrastructureIndex: 95,
    BaseIndex2024: 90,
    ForecastIndex2034: 96,
  },
];

// Helper functions for analysis
export const getGrowthCategory = (growthRate: number): string => {
  if (growthRate >= 4.0) return "High";
  if (growthRate >= 3.0) return "Medium";
  return "Low";
};

export const getGrowthColor = (growthRate: number): string => {
  if (growthRate >= 4.0) return "#10b981"; // green
  if (growthRate >= 3.0) return "#f59e0b"; // orange
  return "#ef4444"; // red
};

export const getCongestionColor = (level: number): string => {
  if (level >= 75) return "#ef4444";
  if (level >= 60) return "#f59e0b";
  if (level >= 45) return "#fbbf24";
  return "#10b981";
};

export const getInfrastructureCategory = (index: number): string => {
  if (index >= 80) return "Excellent";
  if (index >= 70) return "Good";
  if (index >= 60) return "Adequate";
  return "Needs Improvement";
};

// Calculate derived metrics
export const calculateRoadMixScore = (zone: ZoneData): number => {
  return zone.HighwayRatio * 0.4 + zone.ArterialRatio * 0.4 + zone.LocalRoadRatio * 0.2;
};

export const calculateResidentsPerSchool = (zone: ZoneData): number => {
  // Assuming average area per zone is 50 sq km
  const estimatedPopulation = (zone.PopulationDensity * 50) / 1000;
  return Math.round(estimatedPopulation / zone.SchoolCount);
};

export const calculateResidentsPerHospital = (zone: ZoneData): number => {
  const estimatedPopulation = (zone.PopulationDensity * 50) / 1000;
  return Math.round(estimatedPopulation / zone.HospitalCount);
};

export const calculatePredictedCongestion2034 = (zone: ZoneData): number => {
  // Simple prediction model based on growth rate and current congestion
  const growthImpact = zone.GrowthRate * 2;
  const infraEffect = (100 - zone.InfrastructureIndex) * 0.1;
  const predicted = zone.CongestionLevel + growthImpact + infraEffect;
  return Math.min(100, Math.round(predicted));
};


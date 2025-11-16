import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface CSVRow {
  Category: string;
  Subcategory: string;
  Year: number;
  Value: number;
  Unit: string;
}

interface ProcessedData {
  year: number;
  water_consumption: number; // liters/capita/day (calculated from Daily Water Supply)
  energy_consumption: number; // kWh/capita/day (calculated from Annual Electricity)
  waste_generation: number; // kg/capita/day (calculated from MSW Generation)
  efficiency_index: number; // 0-1 scale (calculated from treatment/processing rates)
  sustainability_score: number; // 0-100 (calculated from GHG emissions and other factors)
}

// Simple linear regression for time series prediction
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

function predictValue(year: number, slope: number, intercept: number): number {
  return slope * year + intercept;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "expanded_sustainable_resource_management_delhi.csv");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Data file not found" }, { status: 404 });
    }

    const csv = fs.readFileSync(filePath, "utf-8");
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    
    // Parse CSV rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
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
      
      if (values.length >= headers.length) {
        rows.push({
          Category: values[0] || "",
          Subcategory: values[1] || "",
          Year: parseInt(values[2]) || 0,
          Value: parseFloat(values[3]) || 0,
          Unit: values[4] || ""
        });
      }
    }

    // Delhi population estimate (in millions) - approximate
    const populationByYear: { [key: number]: number } = {
      2013: 18.6, 2014: 19.0, 2015: 19.4, 2016: 19.8, 2017: 20.2,
      2018: 20.6, 2019: 21.0, 2020: 21.4, 2021: 21.8, 2022: 22.2
    };

    // Process data by year
    const processedData: ProcessedData[] = [];
    const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

    years.forEach(year => {
      const yearRows = rows.filter(r => r.Year === year);
      const population = populationByYear[year] * 1000000; // Convert to actual number

      // Water Consumption (liters/capita/day)
      // Daily Water Supply in MGD, convert to liters/capita/day
      const dailyWaterSupply = yearRows.find(r => 
        r.Category === "Water Management" && r.Subcategory === "Daily Water Supply (DJB)"
      )?.Value || 0;
      // 1 MGD = 3.78541 million liters
      const waterLitersPerDay = (dailyWaterSupply * 3.78541 * 1000000) / population;
      const waterConsumption = waterLitersPerDay;

      // Energy Consumption (kWh/capita/day)
      const annualElectricity = yearRows.find(r => 
        r.Category === "Energy Usage" && r.Subcategory === "Electricity Consumption (Annual)"
      )?.Value || 0; // Million Units = Million kWh
      const energyConsumption = (annualElectricity * 1000000) / (population * 365);

      // Waste Generation (kg/capita/day)
      const mswGeneration = yearRows.find(r => 
        r.Category === "Solid Waste" && r.Subcategory === "MSW Generation (Daily)"
      )?.Value || 0; // TPD = tonnes per day
      const wasteGeneration = (mswGeneration * 1000) / population; // kg per capita per day

      // Efficiency Index (0-1 scale) - based on treatment/processing rates
      const wastewaterTreatment = yearRows.find(r => 
        r.Category === "Water Management" && r.Subcategory === "Wastewater Treatment Capacity"
      )?.Value || 0;
      const wastewaterGeneration = yearRows.find(r => 
        r.Category === "Water Management" && r.Subcategory === "Wastewater Generation (Daily)"
      )?.Value || 0;
      const mswProcessed = yearRows.find(r => 
        r.Category === "Solid Waste" && r.Subcategory === "MSW Processed (Share)"
      )?.Value || 0;
      
      const waterEfficiency = wastewaterGeneration > 0 ? Math.min(1, wastewaterTreatment / wastewaterGeneration) : 0;
      const wasteEfficiency = mswProcessed / 100; // Already in percentage
      const efficiencyIndex = (waterEfficiency + wasteEfficiency) / 2;

      // Sustainability Score (0-100) - inverse of GHG emissions per capita
      const ghgPerCapita = yearRows.find(r => 
        r.Category === "Sustainability Indicators" && r.Subcategory === "GHG Emissions per Capita"
      )?.Value || 0;
      // Normalize: lower emissions = higher score (max 2.5 tCO2e = 0, min 2.0 = 100)
      const sustainabilityScore = Math.max(0, Math.min(100, 100 - ((ghgPerCapita - 2.0) / 0.5) * 100));

      processedData.push({
        year,
        water_consumption: Math.round(waterConsumption * 100) / 100,
        energy_consumption: Math.round(energyConsumption * 100) / 100,
        waste_generation: Math.round(wasteGeneration * 100) / 100,
        efficiency_index: Math.round(efficiencyIndex * 1000) / 1000,
        sustainability_score: Math.round(sustainabilityScore * 100) / 100
      });
    });

    // Train models for each metric
    const yearsArray = processedData.map(d => d.year);
    
    const waterModel = linearRegression(
      yearsArray,
      processedData.map(d => d.water_consumption)
    );
    const energyModel = linearRegression(
      yearsArray,
      processedData.map(d => d.energy_consumption)
    );
    const wasteModel = linearRegression(
      yearsArray,
      processedData.map(d => d.waste_generation)
    );
    const efficiencyModel = linearRegression(
      yearsArray,
      processedData.map(d => d.efficiency_index)
    );
    const scoreModel = linearRegression(
      yearsArray,
      processedData.map(d => d.sustainability_score)
    );

    // Generate predictions for 2023-2027
    const forecastYears = [2023, 2024, 2025, 2026, 2027];
    const predictions = {
      years: forecastYears,
      water: forecastYears.map(year => 
        Math.max(0, Math.round(predictValue(year, waterModel.slope, waterModel.intercept) * 100) / 100)
      ),
      energy: forecastYears.map(year => 
        Math.max(0, Math.round(predictValue(year, energyModel.slope, energyModel.intercept) * 100) / 100)
      ),
      waste: forecastYears.map(year => 
        Math.max(0, Math.round(predictValue(year, wasteModel.slope, wasteModel.intercept) * 100) / 100)
      ),
      efficiency: forecastYears.map(year => 
        Math.max(0, Math.min(1, Math.round(predictValue(year, efficiencyModel.slope, efficiencyModel.intercept) * 1000) / 1000))
      ),
      score: forecastYears.map(year => 
        Math.max(0, Math.min(100, Math.round(predictValue(year, scoreModel.slope, scoreModel.intercept) * 100) / 100))
      )
    };

    // Calculate insights
    const lastHistorical = processedData[processedData.length - 1];
    const firstHistorical = processedData[0];
    const lastForecast = {
      water: predictions.water[predictions.water.length - 1],
      energy: predictions.energy[predictions.energy.length - 1],
      waste: predictions.waste[predictions.waste.length - 1],
      efficiency: predictions.efficiency[predictions.efficiency.length - 1],
      score: predictions.score[predictions.score.length - 1]
    };

    const waterReduction = ((firstHistorical.water_consumption - lastHistorical.water_consumption) / firstHistorical.water_consumption * 100);
    const efficiencyImprovement = ((lastForecast.efficiency - lastHistorical.efficiency_index) / lastHistorical.efficiency_index * 100);
    const wasteReduction = ((lastHistorical.waste_generation - lastForecast.waste) / lastHistorical.waste_generation * 100);

    const insights = [
      `Water consumption ${waterReduction > 0 ? 'reduced' : 'increased'} by ${Math.abs(waterReduction).toFixed(1)}% since 2013.`,
      `Forecast indicates ${efficiencyImprovement > 0 ? '' : 'a '}${Math.abs(efficiencyImprovement).toFixed(1)}% ${efficiencyImprovement > 0 ? 'improvement' : 'decline'} in circular efficiency by 2027.`,
      `Delhi's waste per capita projected to ${wasteReduction > 0 ? 'decline' : 'increase'} ${Math.abs(wasteReduction).toFixed(1)}% by 2027.`
    ];

    return NextResponse.json({
      historical: processedData,
      predictions,
      insights
    });

  } catch (error) {
    console.error("Error processing sustainable resource data:", error);
    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 }
    );
  }
}


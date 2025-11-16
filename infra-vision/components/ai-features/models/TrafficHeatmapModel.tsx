'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Activity, Brain, Loader2, X, AlertCircle, TrendingUp, Clock, Users, Car } from 'lucide-react';
import Papa from 'papaparse';
import { formatZoneDisplay, getZoneRegion, ZONE_MAPPING } from './zoneMapping';

interface TrafficData {
  zone: string;
  year: number;
  trafficVolume: number;
  populationDensity: number;
  avgCommuteTime: number;
  congestionLevel: number;
  trafficStatus: 'Low' | 'Moderate' | 'High';
  housingUnits: number;
  roadLength: number;
}

interface ZoneHeatmapItem {
  zone: string;
  status: 'Low' | 'Moderate' | 'High';
  congestion: number;
  volume: number;
  commuteTime: number;
  populationDensity: number;
  hasData: boolean;
}

// Enhanced classification based on congestion level
function classifyTrafficStatus(congestionLevel: number): 'Low' | 'Moderate' | 'High' {
  if (congestionLevel < 40) return 'Low';
  if (congestionLevel <= 70) return 'Moderate';
  return 'High';
}

// Calculate regional averages for zones without data
function getRegionalAverage(data: TrafficData[], region: string): {
  congestion: number;
  volume: number;
  commuteTime: number;
  populationDensity: number;
} {
  const zonesInRegion = Object.keys(ZONE_MAPPING).filter(z => ZONE_MAPPING[z] === region);
  const regionData = data.filter(d => zonesInRegion.includes(d.zone));
  
  if (regionData.length === 0) {
    // Fallback to overall average
    const avgCongestion = data.reduce((sum, d) => sum + d.congestionLevel, 0) / data.length;
    const avgVolume = data.reduce((sum, d) => sum + d.trafficVolume, 0) / data.length;
    const avgCommute = data.reduce((sum, d) => sum + d.avgCommuteTime, 0) / data.length;
    const avgDensity = data.reduce((sum, d) => sum + d.populationDensity, 0) / data.length;
    
    return {
      congestion: avgCongestion || 50,
      volume: avgVolume || 30000,
      commuteTime: avgCommute || 35,
      populationDensity: avgDensity || 15000
    };
  }
  
  // Calculate averages for the region
  const avgCongestion = regionData.reduce((sum, d) => sum + d.congestionLevel, 0) / regionData.length;
  const avgVolume = regionData.reduce((sum, d) => sum + d.trafficVolume, 0) / regionData.length;
  const avgCommute = regionData.reduce((sum, d) => sum + d.avgCommuteTime, 0) / regionData.length;
  const avgDensity = regionData.reduce((sum, d) => sum + d.populationDensity, 0) / regionData.length;
  
  return {
    congestion: avgCongestion || 50,
    volume: avgVolume || 30000,
    commuteTime: avgCommute || 35,
    populationDensity: avgDensity || 15000
  };
}

// Get zone data with fallback for missing zones
function getZoneSummary(
  data: TrafficData[], 
  zone: string, 
  year?: number, 
  useLatestAvailable: boolean = true,
  allData?: TrafficData[] // Pass all data for regional averages
): ZoneHeatmapItem | null {
  // Get ALL data for this zone (accept all data points)
  // Use exact match and handle potential whitespace issues
  let zoneData: TrafficData[] = data.filter(d => {
    const zoneMatch = d.zone.trim() === zone.trim();
    return zoneMatch;
  });
  
  // If zone has data, process it
  if (zoneData.length > 0) {
    // Filter out completely invalid data points (but keep 0 values as they're valid)
    zoneData = zoneData.filter(d => 
      !isNaN(d.congestionLevel) && 
      isFinite(d.congestionLevel) &&
      d.congestionLevel >= 0 && 
      d.congestionLevel <= 100 &&
      d.year > 0 &&
      !isNaN(d.year)
    );
    if (year && !useLatestAvailable) {
      // Try to find exact year match first
      const yearData = zoneData.filter(d => d.year === year);
      if (yearData.length > 0) {
        zoneData = yearData;
      } else {
        // If no exact match and useLatestAvailable is false, use latest available anyway
        const latestYear = Math.max(...zoneData.map(d => d.year));
        zoneData = zoneData.filter(d => d.year === latestYear);
      }
    } else if (year && useLatestAvailable) {
      // If year is specified, prefer that year but allow fallback
      const yearData = zoneData.filter(d => d.year === year);
      if (yearData.length === 0) {
        // No data for specified year, use latest available for this zone
        const latestYear = Math.max(...zoneData.map(d => d.year));
        zoneData = zoneData.filter(d => d.year === latestYear);
      } else {
        zoneData = yearData;
      }
    } else {
      // No year specified - use latest available data for this zone
      // Find the maximum year for THIS zone (not global)
      if (zoneData.length > 0) {
        const latestYear = Math.max(...zoneData.map(d => d.year));
        zoneData = zoneData.filter(d => d.year === latestYear);
      }
    }
    
    // If multiple data points for the same year, calculate averages
    let dataPoint: TrafficData;
    if (zoneData.length > 1) {
      const avgCongestion = zoneData.reduce((sum, d) => sum + d.congestionLevel, 0) / zoneData.length;
      const avgVolume = zoneData.reduce((sum, d) => sum + d.trafficVolume, 0) / zoneData.length;
      const avgCommute = zoneData.reduce((sum, d) => sum + d.avgCommuteTime, 0) / zoneData.length;
      const avgDensity = zoneData.reduce((sum, d) => sum + d.populationDensity, 0) / zoneData.length;
      
      dataPoint = {
        ...zoneData[0],
        congestionLevel: avgCongestion,
        trafficVolume: avgVolume,
        avgCommuteTime: avgCommute,
        populationDensity: avgDensity,
        trafficStatus: classifyTrafficStatus(avgCongestion)
      };
    } else {
      dataPoint = zoneData[0];
    }
    
    // Validate dataPoint exists and has valid values
    if (dataPoint && 
        !isNaN(dataPoint.congestionLevel) && 
        isFinite(dataPoint.congestionLevel) &&
        dataPoint.congestionLevel >= 0 && 
        dataPoint.congestionLevel <= 100) {
      return {
        zone,
        status: classifyTrafficStatus(dataPoint.congestionLevel),
        congestion: Math.max(0, Math.min(100, dataPoint.congestionLevel)),
        volume: Math.max(0, dataPoint.trafficVolume || 0),
        commuteTime: Math.max(0, dataPoint.avgCommuteTime || 0),
        populationDensity: Math.max(0, dataPoint.populationDensity || 0),
        hasData: true
      };
    }
  }
  
  // Zone has no data - check if it exists in mapping
  if (ZONE_MAPPING[zone]) {
    const region = ZONE_MAPPING[zone];
    
    // Try to estimate based on regional averages if we have all data
    if (allData && allData.length > 0) {
      const regionalAvg = getRegionalAverage(allData, region);
      
      // Add some variation based on zone name to make estimates unique
      const zoneSeed = zone.charCodeAt(zone.length - 1) || 0;
      const variation = (zoneSeed % 20) - 10; // -10 to +10 variation
      
      return {
        zone,
        status: classifyTrafficStatus(regionalAvg.congestion + variation),
        congestion: Math.max(0, Math.min(100, regionalAvg.congestion + variation)),
        volume: Math.max(10000, regionalAvg.volume + (variation * 500)),
        commuteTime: Math.max(20, regionalAvg.commuteTime + (variation * 0.5)),
        populationDensity: Math.max(5000, regionalAvg.populationDensity + (variation * 200)),
        hasData: false // Mark as estimated data
      };
    }
    
    // Fallback: return zone with default values
    return {
      zone,
      status: 'Low',
      congestion: 30,
      volume: 25000,
      commuteTime: 30,
      populationDensity: 12000,
      hasData: false
    };
  }
  
  return null;
}

export function TrafficHeatmapModel() {
  const [rawData, setRawData] = useState<TrafficData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalZone, setModalZone] = useState<ZoneHeatmapItem | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/delhi_housing_density_and_road_network_extended.csv');
        if (!response.ok) throw new Error('Failed to load data');
        
        const text = await response.text();
        const parsed = Papa.parse<any>(text, { header: true, skipEmptyLines: true });
        
        const data: TrafficData[] = parsed.data
          .map((row: any) => {
            const popDensity = parseFloat(row['Population Density (per sq km)']) || 0;
            let congestion = parseFloat(row['Current Congestion Level (%)']);
            // Handle NaN or missing congestion - derive from other factors if available
            if (isNaN(congestion) || congestion === null || congestion === undefined) {
              // Derive congestion from population density and road length if available
              if (popDensity > 0) {
                // Higher density typically means higher congestion
                congestion = Math.min(95, 20 + (popDensity / 500) * 60);
              } else {
                congestion = 30; // Default moderate congestion
              }
            }
            const housingUnits = parseFloat(row['Housing Units']) || 0;
            const roadLength = parseFloat(row['Total Road Length (km)']) || 0;
            // Normalize zone name - trim and ensure consistent formatting
            let zone = String(row.Zone || row.zone || '').trim();
            // Clean up any double spaces or formatting issues
            zone = zone.replace(/\s+/g, ' ').trim();
            const year = parseInt(row.Year || row.year) || 0;
            
            // Only skip rows with missing zone or year - accept all other data
            // Accept any zone that starts with "Zone" (case insensitive) followed by a space and letter/number
            if (!zone || zone.length < 5 || !zone.match(/^Zone\s+[A-Z]/i) || year === 0 || isNaN(year)) {
              return null;
            }
            
            // Normalize zone format: ensure "Zone " prefix (case-insensitive match, preserve original case)
            if (!zone.match(/^Zone\s+/i)) {
              zone = `Zone ${zone}`;
            } else {
              // Ensure consistent capitalization: "Zone " followed by the rest
              const zoneCode = zone.replace(/^Zone\s+/i, '').trim();
              zone = `Zone ${zoneCode}`;
            }
            
            // Enhanced traffic volume calculation
            const baseVolume = popDensity > 0 
              ? popDensity * 2.5 
              : (housingUnits > 0 ? housingUnits * 1.2 : 15000); // Fallback calculations
            const roadFactor = roadLength > 0 ? Math.min(1.5, roadLength / 200) : 1;
            const trafficVolume = baseVolume * roadFactor;
            
            // Enhanced commute time calculation
            const baseCommuteTime = 20; // Base commute time in minutes
            const congestionFactor = (congestion / 100) * 40; // 0-40 minutes additional time
            const densityFactor = popDensity > 0 ? Math.min(10, popDensity / 3000) : 0; // Density impact
            const avgCommuteTime = baseCommuteTime + congestionFactor + densityFactor;
            
            return {
              zone,
              year,
              trafficVolume,
              populationDensity: popDensity,
              avgCommuteTime,
              congestionLevel: Math.max(0, Math.min(100, congestion)), // Clamp between 0-100
              trafficStatus: classifyTrafficStatus(congestion),
              housingUnits,
              roadLength
            };
          })
          .filter((d): d is TrafficData => d !== null && d.zone !== '' && d.year > 0);
        
        setRawData(data);
        
        if (data.length > 0) {
          const zones = Array.from(new Set(data.map(d => d.zone))).sort();
          setSelectedZone(zones[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get all zones from dataset and zone mapping
  const allZones = useMemo(() => {
    const datasetZones = Array.from(new Set(rawData.map(d => d.zone))).sort();
    const mappingZones = Object.keys(ZONE_MAPPING).sort();
    // Combine and deduplicate
    const combined = new Set([...datasetZones, ...mappingZones]);
    return Array.from(combined).sort();
  }, [rawData]);

  const years = useMemo(() => {
    const yearSet = new Set(rawData.map(d => d.year));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [rawData]);

  // Get heatmap data for all zones
  const heatmapData = useMemo(() => {
    if (rawData.length === 0) return [];
    
    // When no year is selected, show latest available data for each zone individually
    // When year is selected, prefer that year but allow fallback to latest available
    const useLatestAvailable = true; // Always allow fallback to latest available data
    
    const heatmapItems = allZones
      .map(zone => {
        // Always pass all data for regional averages
        if (selectedYear) {
          // Year is selected - prefer that year, but allow fallback to latest available for this zone
          const result = getZoneSummary(rawData, zone, selectedYear, useLatestAvailable, rawData);
          return result;
        } else {
          // No year selected - use latest available for each zone (each zone's own latest year)
          const result = getZoneSummary(rawData, zone, undefined, useLatestAvailable, rawData);
          return result;
        }
      })
      .filter((item): item is ZoneHeatmapItem => item !== null);
    
    // Log summary for debugging
    const withRealData = heatmapItems.filter(item => item.hasData).length;
    const withEstimated = heatmapItems.filter(item => !item.hasData).length;
    
    return heatmapItems.sort((a, b) => {
      // Sort by congestion level (highest first), then by zone name
      // Prioritize zones with real data over estimated data
      if (a.hasData && b.hasData) return b.congestion - a.congestion;
      if (a.hasData) return -1;
      if (b.hasData) return 1;
      // If both estimated or both real, sort by congestion
      return b.congestion - a.congestion;
    });
  }, [rawData, selectedYear, allZones]);

  // Get top 3 most congested zones
  const topCongestedZones = useMemo(() => {
    return heatmapData
      .filter(item => item.hasData)
      .slice(0, 3)
      .map(item => item.zone);
  }, [heatmapData]);

  // Get selected zone details
  const selectedZoneData = useMemo(() => {
    if (!selectedZone) return null;
    return getZoneSummary(rawData, selectedZone, selectedYear || undefined);
  }, [selectedZone, selectedYear, rawData]);

  const getStatusColor = (status: string, isHighlighted: boolean = false) => {
    const baseColors = {
      'Low': 'bg-green-500',
      'Moderate': 'bg-yellow-500',
      'High': 'bg-red-500'
    };
    const color = baseColors[status as keyof typeof baseColors] || 'bg-gray-500';
    
    if (isHighlighted) {
      return `${color} ring-4 ring-orange-400 ring-opacity-50 shadow-lg`;
    }
    return color;
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Low': return 'text-green-400';
      case 'Moderate': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'Low': return 'border-green-400';
      case 'Moderate': return 'border-yellow-400';
      case 'High': return 'border-red-400';
      default: return 'border-gray-400';
    }
  };

  const handleZoneClick = (zoneItem: ZoneHeatmapItem) => {
    setModalZone(zoneItem);
    setShowModal(true);
  };

  // Handle escape key to close modal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Traffic & Congestion Heatmaps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Filter by Zone</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {allZones.map(zone => (
                    <SelectItem key={zone} value={zone}>
                      {formatZoneDisplay(zone)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Filter by Year</label>
              <Select 
                value={selectedYear?.toString() || 'latest'} 
                onValueChange={(v) => setSelectedYear(v === 'latest' ? null : parseInt(v))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Available ({years[0] || 'N/A'})</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Zone Details */}
          {selectedZoneData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-6 border border-purple-500"
            >
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Zone: {selectedZone}</h3>
                  {!selectedZoneData.hasData && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/50">
                      Estimated
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-200 mt-1">{getZoneRegion(selectedZone)}</p>
                {!selectedZoneData.hasData && (
                  <p className="text-xs text-yellow-300 mt-1">
                    Data estimated based on regional averages for {getZoneRegion(selectedZone)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Traffic Status</p>
                  <p className={`text-2xl font-bold ${getStatusTextColor(selectedZoneData.status)}`}>
                    {selectedZoneData.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-1">Congestion</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedZoneData.congestion.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-1">Traffic Volume</p>
                  <p className="text-2xl font-bold text-white">{(selectedZoneData.volume / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-1">Avg Commute</p>
                  <p className="text-2xl font-bold text-white">{selectedZoneData.commuteTime.toFixed(0)} min</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top 3 Most Congested Zones Alert */}
          {topCongestedZones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-900/30 border border-red-500/50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-400" />
                <h4 className="text-red-300 font-semibold">Top 3 Most Congested Zones</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {topCongestedZones.map((zone, index) => {
                  const zoneData = heatmapData.find(d => d.zone === zone);
                  if (!zoneData) return null;
                  return (
                    <span
                      key={zone}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/50"
                    >
                      {index + 1}. {zone} - {zoneData.congestion.toFixed(1)}%
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Heatmap Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Zone-wise Traffic Status Heatmap</h3>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>
                  {heatmapData.filter(d => d.hasData).length} zones with data
                </span>
                {heatmapData.filter(d => !d.hasData).length > 0 && (
                  <span className="text-yellow-400">
                    {heatmapData.filter(d => !d.hasData).length} estimated*
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {heatmapData.map((item, index) => {
                  const isTopCongested = topCongestedZones.includes(item.zone);
                  const isHovered = hoveredZone === item.zone;
                  
                  return (
                    <motion.div
                      key={item.zone}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05, zIndex: 20 }}
                      onHoverStart={() => setHoveredZone(item.zone)}
                      onHoverEnd={() => setHoveredZone(null)}
                      onClick={() => handleZoneClick(item)}
                      className={`
                        relative rounded-lg p-3 cursor-pointer transition-all
                        ${item.hasData 
                          ? `${getStatusColor(item.status, isTopCongested)} border-2 ${getStatusBorderColor(item.status)}` 
                          : 'bg-gray-700 border-2 border-gray-600 opacity-60'
                        }
                        ${isHovered ? 'shadow-2xl' : 'shadow-md'}
                      `}
                    >
                      {/* Zone Label */}
                      <div className="text-white font-bold text-sm mb-1 text-center">
                        {item.zone}
                      </div>
                      
                      {/* Region */}
                      <div className="text-white text-xs text-center opacity-90 mb-2">
                        {getZoneRegion(item.zone).split(' ')[0]}
                      </div>
                      
                      {/* Always show data - real or estimated */}
                      <>
                        {/* Congestion Percentage */}
                        <div className="text-white text-lg font-bold text-center mb-1">
                          {item.congestion.toFixed(1)}%
                          {!item.hasData && (
                            <span className="text-[10px] text-yellow-300 ml-1" title="Estimated data">*</span>
                          )}
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`
                          text-xs font-semibold text-center px-2 py-1 rounded
                          ${item.status === 'Low' ? 'bg-green-600/80' : ''}
                          ${item.status === 'Moderate' ? 'bg-yellow-600/80' : ''}
                          ${item.status === 'High' ? 'bg-red-600/80' : ''}
                          ${!item.hasData ? 'opacity-75' : ''}
                        `}>
                          {item.status}
                          {!item.hasData && (
                            <span className="text-[10px] ml-1" title="Estimated">~</span>
                          )}
                        </div>
                        
                        {/* Quick Stats on Hover */}
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-2 z-30 shadow-xl"
                          >
                            <div className="text-white text-xs space-y-1">
                              {!item.hasData && (
                                <div className="text-yellow-400 text-[10px] font-semibold mb-1 border-b border-yellow-400/30 pb-1">
                                  Estimated (Regional Average)
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-400">Volume:</span>
                                <span className="font-semibold">{(item.volume / 1000).toFixed(0)}k</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Commute:</span>
                                <span className="font-semibold">{item.commuteTime.toFixed(0)} min</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Status:</span>
                                <span className={`font-semibold ${getStatusTextColor(item.status)}`}>
                                  {item.status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Congestion:</span>
                                <span className="font-semibold">{item.congestion.toFixed(1)}%</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Top Congested Badge - only for zones with real data */}
                        {isTopCongested && item.hasData && (
                          <div className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            TOP
                          </div>
                        )}
                      </>
                    </motion.div>
                  );
                })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-gray-300 font-medium text-sm">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-300 text-sm">Low (&lt;40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300 text-sm">Moderate (40-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-300 text-sm">High (&gt;70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-orange-400 rounded bg-red-500"></div>
                <span className="text-gray-300 text-sm">Top 3 Congested</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-yellow-400 text-sm">* Estimated data (based on regional averages)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Detail Modal */}
      {showModal && modalZone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 ${getStatusBorderColor(modalZone.status)} shadow-2xl`}
          >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{modalZone.zone}</h3>
                  <p className="text-purple-200">{getZoneRegion(modalZone.zone)}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {modalZone.hasData ? (
                <div className="space-y-4">
                  {/* Traffic Status */}
                  <div className={`p-4 rounded-lg ${getStatusColor(modalZone.status)} bg-opacity-20 border ${getStatusBorderColor(modalZone.status)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Predicted Traffic Status</span>
                      <span className={`text-xl font-bold ${getStatusTextColor(modalZone.status)}`}>
                        {modalZone.status}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-xs">Traffic Congestion</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{modalZone.congestion.toFixed(1)}%</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-xs">Traffic Volume</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{(modalZone.volume / 1000).toFixed(0)}k</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-xs">Avg Commute Time</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{modalZone.commuteTime.toFixed(0)} min</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-xs">Population Density</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{(modalZone.populationDensity / 1000).toFixed(1)}k</p>
                    </div>
                  </div>

                  {/* Classification Info */}
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-400 text-xs mb-2">Classification Logic:</p>
                    <div className="text-gray-300 text-xs space-y-1">
                      <div>• Low: Congestion &lt; 40%</div>
                      <div>• Moderate: Congestion 40-70%</div>
                      <div>• High: Congestion &gt; 70%</div>
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        Current: {modalZone.congestion.toFixed(1)}% → {modalZone.status}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No data available for this zone</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Data may not be available for the selected year or zone.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
    </div>
  );
}

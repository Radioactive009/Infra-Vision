// Zone Code to Region Description Mapping
// Based on Delhi administrative zones
export const ZONE_MAPPING: Record<string, string> = {
  // Primary Zones
  'Zone A': 'Central Delhi',
  'Zone B': 'North Delhi',
  'Zone C': 'South Delhi',
  'Zone D': 'West Delhi',
  'Zone E': 'East Delhi',
  'Zone F': 'North West Delhi',
  'Zone G': 'South East Delhi',
  'Zone H': 'South West Delhi',
  'Zone I': 'North East Delhi',
  'Zone J': 'Shahdara',
  
  // New Delhi Administrative Zones
  'Zone K': 'New Delhi',
  'Zone K1': 'New Delhi',
  'Zone K2': 'New Delhi',
  
  // Extended Administrative Zones (typically part of New Delhi or adjacent regions)
  'Zone L': 'New Delhi',
  'Zone M': 'New Delhi',
  'Zone N': 'New Delhi',
  'Zone O': 'New Delhi',
  'Zone P1': 'New Delhi',
  'Zone P2': 'New Delhi',
};

// Helper function to get region description from zone code
export function getZoneRegion(zone: string): string {
  return ZONE_MAPPING[zone] || zone;
}

// Helper function to format zone display (Zone Code - Region)
export function formatZoneDisplay(zone: string): string {
  const region = getZoneRegion(zone);
  return `${zone} - ${region}`;
}

// Get all unique regions
export function getUniqueRegions(): string[] {
  return Array.from(new Set(Object.values(ZONE_MAPPING))).sort();
}

// Get zones by region
export function getZonesByRegion(region: string): string[] {
  return Object.keys(ZONE_MAPPING).filter(zone => ZONE_MAPPING[zone] === region);
}


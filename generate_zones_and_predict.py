"""
Generate Delhi Admin Zones GeoJSON from School Data
and Run Full School Coverage Prediction Pipeline
================================================================================

This script:
1. Generates delhi_admin_full.geojson from school CSV data
2. Runs the school coverage model
3. Verifies results
4. Syncs CSV to Next.js app

Usage:
    python generate_zones_and_predict.py
"""

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, MultiPoint
import json
import os
from pathlib import Path

# Detect available CSV automatically
possible_files = [
    "delhi_schools_all.csv",
    "8d8736c0-b8c2-4d92-89b7-5f1b6be3b05f.csv"
]

csv_file = next((f for f in possible_files if os.path.exists(f)), None)

if not csv_file:
    raise FileNotFoundError("No valid Delhi school CSV found in the current directory.")

print(f"✅ Using CSV file: {csv_file}")

# Load CSV - handle header row issue (first row is category, second row is header)
try:
    first_row = pd.read_csv(csv_file, encoding='utf-8', nrows=1, header=None)
    if first_row.iloc[0, 0] in ['Category', 'DOE_Government']:
        # Skip first row, use second row as header
        df = pd.read_csv(csv_file, encoding='utf-8', low_memory=False, header=1)
        # Remove the category column if it exists
        if df.columns[0] in ['Category', 'DOE_Government']:
            df = df.drop(columns=[df.columns[0]])
    else:
        df = pd.read_csv(csv_file, encoding='utf-8', low_memory=False)
except Exception as e:
    print(f"Warning: Error reading CSV with header detection: {e}")
    df = pd.read_csv(csv_file, encoding='utf-8', low_memory=False)

# Find latitude/longitude columns (case-insensitive)
lat_col = None
lon_col = None

for col in df.columns:
    col_lower = str(col).lower()
    if 'lat' in col_lower or 'latitude' in col_lower:
        lat_col = col
    if 'lon' in col_lower or 'longitude' in col_lower or 'lng' in col_lower:
        lon_col = col

if lat_col is None or lon_col is None:
    raise ValueError(f"Could not find latitude/longitude columns in CSV. Found columns: {list(df.columns)}")

print(f"✅ Using coordinate columns: {lat_col}, {lon_col}")

# Convert to float and drop missing coordinates
df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
df[lon_col] = pd.to_numeric(df[lon_col], errors='coerce')
df = df.dropna(subset=[lat_col, lon_col])

# Validate coordinate ranges
df = df[(df[lat_col].between(-90, 90)) & (df[lon_col].between(-180, 180))]

# Convert to GeoDataFrame
df['geometry'] = [Point(xy) for xy in zip(df[lon_col], df[lat_col])]
gdf = gpd.GeoDataFrame(df, geometry='geometry', crs="EPSG:4326")

# Find Zone column
zone_col = None
for col in df.columns:
    col_lower = str(col).lower()
    if 'zone' in col_lower:
        zone_col = col
        break

if zone_col is None:
    raise ValueError(f"Could not find Zone column in CSV. Found columns: {list(df.columns)}")

print(f"✅ Using zone column: {zone_col}")

# Find District column
district_col = None
for col in df.columns:
    col_lower = str(col).lower()
    if 'district' in col_lower:
        district_col = col
        break

if district_col is None:
    raise ValueError(f"Could not find District column in CSV. Found columns: {list(df.columns)}")

print(f"✅ Using district column: {district_col}")

# Zone to descriptive name mapping based on District
def get_zone_name(zone_id, district):
    """Map zone ID and district to descriptive zone name."""
    zone_str = str(zone_id).strip()
    district_str = str(district).strip() if district else ""
    
    # Create mapping based on zone number and district
    zone_mapping = {
        '01': 'East Zone 1',
        '02': 'East Zone 2', 
        '03': 'East Zone 3',
        '04': 'North East Zone 1',
        '05': 'North East Zone 2',
        '06': 'North East Zone 3',
        '07': 'North Zone 1',
        '08': 'North Zone 2',
        '09': 'North West Zone A1',
        '10': 'North West Zone A2',
        '11': 'North West Zone B1',
        '12': 'North West Zone B2',
        '13': 'North West Zone B3',
        '14': 'West Zone A1',
        '15': 'West Zone A2',
        '16': 'West Zone A3',
        '17': 'West Zone B1',
        '18': 'West Zone B2',
        '19': 'South West Zone A1',
        '20': 'South West Zone A2',
        '21': 'South West Zone B1',
        '22': 'South West Zone B2',
        '23': 'South Zone 1',
        '24': 'South Zone 2',
        '25': 'South East Zone 1',
        '26': 'New Delhi',
        '27': 'Central Zone 1',
        '28': 'Central Zone 2',
        '29': 'South East Zone 2',
    }
    
    # Use mapping if available, otherwise create from district
    if zone_str in zone_mapping:
        return zone_mapping[zone_str]
    elif district_str:
        # Fallback: use district name with zone number
        return f"{district_str} - Zone {zone_str}"
    else:
        return f"Zone {zone_str}"

# Group by Zone and create polygons (convex hulls)
zones = []
for zone_id, group in gdf.groupby(zone_col):
    if len(group) > 2:
        # Get the most common district for this zone
        district = group[district_col].mode().iloc[0] if district_col in group.columns else None
        
        # Get descriptive zone name
        zone_name = get_zone_name(zone_id, district)
        
        polygon = MultiPoint(group.geometry.tolist()).convex_hull
        # Convert shapely geometry to GeoJSON format
        from shapely.geometry import mapping
        zones.append({
            "type": "Feature",
            "properties": {
                "zone_id": str(zone_id).strip(),
                "zone_name": zone_name
            },
            "geometry": mapping(polygon)
        })

# Create FeatureCollection
geojson_data = {
    "type": "FeatureCollection",
    "features": zones
}

# Save to file
output_path = "delhi_admin_full.geojson"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(geojson_data, f, indent=2)

print(f"✅ GeoJSON created successfully: {output_path}")
print(f"✅ Zones generated: {len(zones)}")

# Retrain model and verify
print("\n🚀 Running school coverage model...")
os.system("python school_coverage_model.py")

print("\n📊 Checking results...")
os.system("python check_results.py")

# Copy CSV to Next.js data folder
if os.path.exists("infra-vision/data"):
    import shutil
    src = "school_coverage_predictions.csv"
    dst = "infra-vision/data/school_coverage_predictions.csv"
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"✅ Copied predictions CSV to {dst}")
    else:
        print(f"⚠️  Source file {src} not found")
else:
    print("⚠️  Next.js data folder not found. Please copy manually if needed.")

print("\n✅ All steps completed successfully.")
print("\n📋 Next Steps:")
print("1. Restart your Next.js server with:")
print("   cd infra-vision && npm run dev")
print("2. Visit: http://localhost:3000/ai-features")
print("3. Click: 'Identify Infrastructure Gaps in Cities'")
print("4. Click: 'Analyze School Distribution in the City'")
print("5. Verify all zones appear in the Zone-wise Breakdown table")


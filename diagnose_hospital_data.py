"""
Diagnostic script for hospital coverage data.
Checks data quality and identifies potential issues.
"""

import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).parent

print("="*60)
print("HOSPITAL DATA DIAGNOSTICS")
print("="*60)

# Check hospital CSV
hospital_csv = BASE_DIR / "GurugramHospital.csv"
if not hospital_csv.exists():
    print(f"\n❌ Hospital CSV not found: {hospital_csv}")
    print("   Please ensure the hospital CSV file exists.")
    exit(1)

print(f"\n✅ Hospital CSV found: {hospital_csv}")

# Load and analyze
df = pd.read_csv(hospital_csv, low_memory=False)
print(f"\n✅ Loaded {len(df)} hospital records")

# Check for required columns
print("\n" + "="*60)
print("COLUMN CHECK")
print("="*60)
required_cols = ['latitude', 'longitude']
found_cols = []
for col in df.columns:
    col_lower = col.lower()
    if 'lat' in col_lower:
        found_cols.append(col)
    if 'lon' in col_lower:
        found_cols.append(col)

if len(found_cols) >= 2:
    print(f"✅ Found coordinate columns: {found_cols}")
else:
    print(f"❌ Missing coordinate columns. Found: {found_cols}")

# Check data quality
print("\n" + "="*60)
print("DATA QUALITY CHECK")
print("="*60)

# Check for missing coordinates
lat_col = None
lon_col = None
for col in df.columns:
    col_lower = col.lower()
    if 'lat' in col_lower:
        lat_col = col
    if 'lon' in col_lower:
        lon_col = col

if lat_col and lon_col:
    missing_coords = df[[lat_col, lon_col]].isna().any(axis=1).sum()
    print(f"  Records with missing coordinates: {missing_coords}")
    
    # Check coordinate ranges
    valid_coords = df.dropna(subset=[lat_col, lon_col])
    valid_coords = valid_coords[
        (valid_coords[lat_col].between(-90, 90)) & 
        (valid_coords[lon_col].between(-180, 180))
    ]
    print(f"  Records with valid coordinates: {len(valid_coords)}")
    print(f"  Records with invalid coordinates: {len(df) - len(valid_coords)}")
    
    if len(valid_coords) > 0:
        print(f"  Latitude range: {valid_coords[lat_col].min():.4f} to {valid_coords[lat_col].max():.4f}")
        print(f"  Longitude range: {valid_coords[lon_col].min():.4f} to {valid_coords[lon_col].max():.4f}")

# Check for facility type information
print("\n" + "="*60)
print("FACILITY TYPE CHECK")
print("="*60)
type_cols = [col for col in df.columns if 'type' in col.lower() or 'healthcare' in col.lower() or 'facility' in col.lower()]
if type_cols:
    print(f"✅ Found facility type columns: {type_cols}")
    for col in type_cols[:2]:  # Show first 2
        unique_types = df[col].dropna().unique()[:10]
        print(f"  {col} unique values (first 10): {list(unique_types)}")
else:
    print("⚠️  No facility type columns found")

# Check for capacity/bed information
print("\n" + "="*60)
print("CAPACITY DATA CHECK")
print("="*60)
capacity_cols = [col for col in df.columns if 'bed' in col.lower() or 'capacity' in col.lower()]
if capacity_cols:
    print(f"✅ Found capacity columns: {capacity_cols}")
    for col in capacity_cols:
        non_zero = (pd.to_numeric(df[col], errors='coerce') > 0).sum()
        print(f"  {col}: {non_zero} records with non-zero values")
else:
    print("⚠️  No capacity/bed columns found")

# Check for name information
print("\n" + "="*60)
print("NAME DATA CHECK")
print("="*60)
name_cols = [col for col in df.columns if 'name' in col.lower()]
if name_cols:
    print(f"✅ Found name columns: {name_cols}")
    missing_names = df[name_cols[0]].isna().sum()
    print(f"  Records with missing names: {missing_names}")
else:
    print("⚠️  No name columns found")

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print(f"Total records: {len(df)}")
print(f"Columns: {len(df.columns)}")
print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

print("\n✅ Diagnostic complete!")

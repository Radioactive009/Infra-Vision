"""
Clean and Combine Parks Data from Multiple Excel Files
================================================================================

This script:
1. Finds all .xlsx files in the current directory
2. Reads all sheets from each file
3. Dynamically detects relevant columns (Park Name, Zone, Area, Latitude, Longitude)
4. Cleans and standardizes the data
5. Combines into a single master dataset

Usage:
    python clean_parks_data.py
"""

import pandas as pd
import numpy as np
from pathlib import Path
import re
from typing import Dict, List, Optional

BASE_DIR = Path(__file__).parent
OUTPUT_CSV = BASE_DIR / "parks_combined_cleaned.csv"

def find_excel_files(directory: Path) -> List[Path]:
    """Find all .xlsx files in the directory."""
    excel_files = list(directory.glob("*.xlsx"))
    print(f"Found {len(excel_files)} Excel files")
    return excel_files

def detect_column_mapping(df: pd.DataFrame) -> Dict[str, Optional[str]]:
    """
    Dynamically detect relevant columns in the DataFrame.
    
    Returns a mapping of standard column names to actual column names.
    """
    mapping = {
        'park_name': None,
        'zone': None,
        'area': None,
        'latitude': None,
        'longitude': None
    }
    
    # Convert all column names to lowercase for matching
    cols_lower = {col.lower(): col for col in df.columns}
    
    # Detect Park Name - be more flexible
    for pattern in ['park', 'name', 'park_name', 'parkname', 'garden', 'garden_name', 'location', 'place']:
        for key in cols_lower:
            if pattern in key and mapping['park_name'] is None:
                # Skip if it's clearly not a name column (like 'park_id', 'park_code')
                if 'id' not in key and 'code' not in key and 'number' not in key:
                    mapping['park_name'] = cols_lower[key]
                    break
        if mapping['park_name']:
            break
    
    # If still not found, try first text column
    if mapping['park_name'] is None:
        for col in df.columns:
            if df[col].dtype == 'object':  # String/text column
                # Check if it contains text that looks like names
                sample = df[col].dropna().astype(str).head(10)
                if len(sample) > 0 and any(len(str(s)) > 3 for s in sample):
                    mapping['park_name'] = col
                    break
    
    # Detect Zone
    for pattern in ['zone', 'zone_id', 'zone_name', 'district', 'ward']:
        for key in cols_lower:
            if pattern in key and mapping['zone'] is None:
                mapping['zone'] = cols_lower[key]
                break
        if mapping['zone']:
            break
    
    # Detect Area
    for pattern in ['area', 'size', 'acre', 'hectare', 'sq', 'square']:
        for key in cols_lower:
            if pattern in key and mapping['area'] is None:
                mapping['area'] = cols_lower[key]
                break
        if mapping['area']:
            break
    
    # Detect Latitude
    for pattern in ['lat', 'latitude', 'y', 'coord_y']:
        for key in cols_lower:
            if pattern in key and mapping['latitude'] is None:
                mapping['latitude'] = cols_lower[key]
                break
        if mapping['latitude']:
            break
    
    # Detect Longitude
    for pattern in ['lon', 'lng', 'longitude', 'long', 'x', 'coord_x']:
        for key in cols_lower:
            if pattern in key and mapping['longitude'] is None:
                mapping['longitude'] = cols_lower[key]
                break
        if mapping['longitude']:
            break
    
    return mapping

def clean_zone_format(zone_value) -> str:
    """
    Clean and standardize zone format.
    Examples: '01-E' -> '01', '1' -> '01', '10' -> '10', '100' -> '100'
    Handles text zones like 'EAST', 'NORTH EAST' by extracting zone numbers from context.
    """
    if pd.isna(zone_value) or zone_value == '':
        return ''
    
    # Convert to string and strip whitespace
    zone_str = str(zone_value).strip().upper()
    
    # Remove common suffixes like '-E', '-N', '-S', '-W', '-I', '-II'
    zone_str = re.sub(r'[-_]\s*[A-Z]+$', '', zone_str)
    
    # Extract numeric part if it exists
    numbers = re.findall(r'\d+', zone_str)
    if numbers:
        # Return the first number found, zero-padded to 2 digits if it's a single digit
        num = numbers[0]
        if len(num) == 1:
            return f'0{num}'
        return num
    
    # If no numbers found but contains zone keywords, try to extract from text
    # Map common zone names to zone numbers (if we can infer from context)
    zone_mappings = {
        'EAST': '01',
        'NORTH EAST': '04',
        'NORTH': '07',
        'NORTH WEST': '09',
        'WEST': '14',
        'SOUTH WEST': '19',
        'SOUTH': '23',
        'SOUTH EAST': '25',
        'CENTRAL': '27',
        'NEW DELHI': '26'
    }
    
    for key, value in zone_mappings.items():
        if key in zone_str:
            return value
    
    # If no numbers found and no mapping, return cleaned string (will be handled later)
    return zone_str

def process_excel_file(filepath: Path) -> List[pd.DataFrame]:
    """
    Process a single Excel file, reading all sheets.
    
    Returns a list of DataFrames, one per sheet.
    """
    print(f"\nProcessing: {filepath.name}")
    
    try:
        # Get all sheet names
        excel_file = pd.ExcelFile(filepath)
        sheet_names = excel_file.sheet_names
        print(f"  Found {len(sheet_names)} sheet(s): {sheet_names}")
        
        all_dataframes = []
        
        for sheet_name in sheet_names:
            try:
                # Read the sheet
                df = pd.read_excel(filepath, sheet_name=sheet_name, engine='openpyxl')
                
                if df.empty:
                    print(f"    Sheet '{sheet_name}': Empty, skipping")
                    continue
                
                print(f"    Sheet '{sheet_name}': {len(df)} rows, {len(df.columns)} columns")
                
                # Detect column mapping
                mapping = detect_column_mapping(df)
                
                # Create standardized DataFrame
                standardized = pd.DataFrame()
                
                # Map columns
                if mapping['park_name']:
                    standardized['park_name'] = df[mapping['park_name']].astype(str)
                else:
                    standardized['park_name'] = ''
                    print(f"      Warning: Could not find Park Name column")
                
                if mapping['zone']:
                    standardized['zone'] = df[mapping['zone']].apply(clean_zone_format)
                else:
                    standardized['zone'] = ''
                
                if mapping['area']:
                    standardized['area'] = pd.to_numeric(df[mapping['area']], errors='coerce')
                else:
                    standardized['area'] = np.nan
                
                if mapping['latitude']:
                    standardized['latitude'] = pd.to_numeric(df[mapping['latitude']], errors='coerce')
                else:
                    standardized['latitude'] = np.nan
                
                if mapping['longitude']:
                    standardized['longitude'] = pd.to_numeric(df[mapping['longitude']], errors='coerce')
                else:
                    standardized['longitude'] = np.nan
                
                # Add metadata columns
                standardized['source_file'] = filepath.name
                standardized['sheet_name'] = sheet_name
                
                # Keep rows with park names (even if coordinates are missing)
                standardized = standardized[standardized['park_name'].notna()]
                standardized = standardized[standardized['park_name'].str.strip() != '']
                standardized = standardized[standardized['park_name'].str.lower() != 'nan']
                
                # Clean park names - remove leading dots and extra whitespace
                standardized['park_name'] = standardized['park_name'].str.strip()
                standardized['park_name'] = standardized['park_name'].str.replace(r'^\.+', '', regex=True)  # Remove leading dots
                standardized['park_name'] = standardized['park_name'].str.replace(r'\s+', ' ', regex=True)  # Normalize whitespace
                
                # Try to extract zone from park_name if zone column is empty
                # Look for patterns like "01-E", "Zone 1", etc. in park_name
                mask_empty_zone = (standardized['zone'] == '') | standardized['zone'].isna()
                if mask_empty_zone.any():
                    # Try to extract zone number from park_name
                    def extract_zone_from_name(name):
                        if pd.isna(name) or name == '':
                            return ''
                        name_str = str(name).upper()
                        # Look for zone patterns
                        zone_match = re.search(r'\b(?:ZONE|Z)\s*(\d+)', name_str)
                        if zone_match:
                            num = zone_match.group(1)
                            return f'0{num}' if len(num) == 1 else num
                        # Look for patterns like "01-E", "1-E", etc.
                        zone_match = re.search(r'\b(\d+)[-_]?[A-Z]?\b', name_str)
                        if zone_match:
                            num = zone_match.group(1)
                            return f'0{num}' if len(num) == 1 else num
                        return ''
                    
                    standardized.loc[mask_empty_zone, 'zone'] = standardized.loc[mask_empty_zone, 'park_name'].apply(extract_zone_from_name)
                
                # Remove completely empty rows
                standardized = standardized.dropna(how='all', subset=['park_name', 'zone', 'area', 'latitude', 'longitude'])
                
                # Remove rows where park_name is ONLY a zone code (like "01-E", "1", "10") without other text
                # But keep if it has additional descriptive text
                standardized = standardized[
                    ~standardized['park_name'].str.match(r'^\s*\d+[-_]?[A-Z]?\s*$', na=False)
                ]
                
                if len(standardized) > 0:
                    all_dataframes.append(standardized)
                    print(f"      Extracted {len(standardized)} valid rows")
                else:
                    print(f"      No valid rows extracted")
                    
            except Exception as e:
                print(f"    Error processing sheet '{sheet_name}': {e}")
                continue
        
        return all_dataframes
        
    except Exception as e:
        print(f"  Error reading file: {e}")
        return []

def combine_all_data(all_dataframes: List[pd.DataFrame]) -> pd.DataFrame:
    """
    Combine all DataFrames into a single master dataset.
    """
    if not all_dataframes:
        print("\n❌ No data to combine!")
        return pd.DataFrame()
    
    print(f"\nCombining {len(all_dataframes)} dataframes...")
    combined = pd.concat(all_dataframes, ignore_index=True)
    
    print(f"Total rows before deduplication: {len(combined)}")
    
    # Remove duplicates based on park_name and coordinates (if available)
    # Priority: exact match on name + coordinates, then name only
    combined = combined.drop_duplicates(
        subset=['park_name', 'latitude', 'longitude'],
        keep='first'
    )
    
    # Also remove duplicates based on park_name only (if coordinates are missing)
    combined = combined.drop_duplicates(
        subset=['park_name'],
        keep='first'
    )
    
    print(f"Total rows after deduplication: {len(combined)}")
    
    # Sort by zone, then park_name
    combined = combined.sort_values(['zone', 'park_name']).reset_index(drop=True)
    
    return combined

def main():
    """Main execution function."""
    print("="*60)
    print("Parks Data Cleaning and Combination Script")
    print("="*60)
    print()
    
    # Step 1: Find all Excel files
    excel_files = find_excel_files(BASE_DIR)
    
    if not excel_files:
        print("[ERROR] No Excel files found in the current directory!")
        return
    
    # Step 2: Process each file
    all_dataframes = []
    for filepath in excel_files:
        dataframes = process_excel_file(filepath)
        all_dataframes.extend(dataframes)
    
    # Step 3: Combine all data
    master_df = combine_all_data(all_dataframes)
    
    if master_df.empty:
        print("\n[ERROR] No data extracted from any files!")
        return
    
    # Step 4: Save to CSV
    master_df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8-sig')
    print(f"\n[SUCCESS] Combined dataset saved to: {OUTPUT_CSV}")
    
    # Step 5: Summary statistics
    print("\n" + "="*60)
    print("SUMMARY STATISTICS")
    print("="*60)
    print(f"Total Parks: {len(master_df)}")
    print(f"Parks with coordinates: {(master_df['latitude'].notna() & master_df['longitude'].notna()).sum()}")
    print(f"Parks with area data: {master_df['area'].notna().sum()}")
    print(f"Unique zones: {master_df['zone'].nunique()}")
    print(f"Source files: {master_df['source_file'].nunique()}")
    
    print("\nZone distribution:")
    zone_counts = master_df['zone'].value_counts().head(10)
    for zone, count in zone_counts.items():
        print(f"  Zone {zone}: {count} parks")
    
    print("\n" + "="*60)
    print("[SUCCESS] Data cleaning complete!")
    print("="*60)

if __name__ == "__main__":
    main()

"""
Regenerate School Coverage Dataset with Realistic Values
Based on Delhi's actual demographics and school distribution
"""

import pandas as pd
import numpy as np
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

BASE_DIR = Path(__file__).parent
INPUT_FILE = BASE_DIR / "delhi_school_coverage_realistic_500cells.csv"
OUTPUT_FILE = BASE_DIR / "delhi_school_coverage_realistic_500cells.csv"

# Constants
TOTAL_POPULATION_MIN = 20000000  # 20 million
TOTAL_POPULATION_MAX = 22000000  # 22 million
DELHI_TOTAL_AREA = 1484  # km²
TOTAL_SCHOOLS_TARGET = 5600  # Approximate total schools
CELLS_PER_ZONE_TARGET = {
    'Central': 55,
    'East': 55,
    'New Delhi': 55,
    'North': 55,
    'North East': 55,
    'North West': 55,
    'South': 55,
    'South West': 55,
    'West': 55
}

# Zone density profiles (per km²)
DENSITY_PROFILES = {
    'North East': {'min': 25000, 'max': 40000, 'avg': 32000},  # Very high density
    'East': {'min': 25000, 'max': 40000, 'avg': 30000},  # Very high density
    'Central': {'min': 20000, 'max': 35000, 'avg': 28000},  # Very high density
    'West': {'min': 15000, 'max': 25000, 'avg': 20000},  # Mid to high density
    'North West': {'min': 15000, 'max': 25000, 'avg': 19000},  # Mid to high density
    'North': {'min': 10000, 'max': 20000, 'avg': 15000},  # Medium density
    'South West': {'min': 10000, 'max': 18000, 'avg': 14000},  # Medium density
    'South': {'min': 7000, 'max': 15000, 'avg': 11000},  # Lower density
    'New Delhi': {'min': 7000, 'max': 15000, 'avg': 10000},  # Lower density
}

# Zone school distribution profiles (per zone aggregated total: must sum to 5600+)
# Target total: ~5600-6000 schools
SCHOOL_PROFILES = {
    'North East': {'min': 500, 'max': 650, 'govt_ratio': 0.65, 'overcrowded': True},  # More schools, overcrowded
    'East': {'min': 500, 'max': 650, 'govt_ratio': 0.60, 'overcrowded': True},  # More schools, overcrowded
    'Central': {'min': 400, 'max': 550, 'govt_ratio': 0.55, 'overcrowded': True},  # Many schools, overcrowded
    'West': {'min': 650, 'max': 750, 'govt_ratio': 0.45, 'overcrowded': False},  # Large number
    'North West': {'min': 600, 'max': 700, 'govt_ratio': 0.50, 'overcrowded': False},  # Large number
    'North': {'min': 350, 'max': 450, 'govt_ratio': 0.55, 'overcrowded': False},  # Medium
    'South West': {'min': 500, 'max': 600, 'govt_ratio': 0.40, 'overcrowded': False},  # Large number
    'South': {'min': 650, 'max': 800, 'govt_ratio': 0.45, 'overcrowded': False},  # Large number
    'New Delhi': {'min': 200, 'max': 300, 'govt_ratio': 0.50, 'overcrowded': False},  # Fewer but high quality
}

def load_existing_structure():
    """Load existing file to preserve structure."""
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded existing structure: {len(df)} rows, {df['zone_name'].nunique()} zones")
    print(f"Zones: {sorted(df['zone_name'].unique())}")
    return df


def assign_population_and_density(df):
    """Assign realistic population and density based on zone profiles."""
    print("\nAssigning population and density...")
    
    df = df.copy()
    
    # Calculate total target population
    total_population_target = np.random.randint(TOTAL_POPULATION_MIN, TOTAL_POPULATION_MAX + 1)
    print(f"Target total population: {total_population_target:,}")
    
    # Assign density to each cell based on zone
    for zone_name in df['zone_name'].unique():
        zone_mask = df['zone_name'] == zone_name
        zone_cells = df[zone_mask]
        n_cells = len(zone_cells)
        
        if n_cells == 0:
            continue
        
        profile = DENSITY_PROFILES[zone_name]
        
        # Generate densities for cells in this zone
        densities = np.random.normal(profile['avg'], (profile['max'] - profile['min']) / 4, n_cells)
        densities = np.clip(densities, profile['min'], profile['max'])
        
        # Calculate population for each cell based on area and density
        for idx, cell_idx in enumerate(zone_cells.index):
            area = df.loc[cell_idx, 'area_km2']
            density = densities[idx]
            population = int(area * density)
            
            # Ensure minimum population
            population = max(1000, population)
            
            df.loc[cell_idx, 'population_density_per_km2'] = round(density, 1)
            df.loc[cell_idx, 'population'] = population
    
    # Normalize to target total population
    current_total = df['population'].sum()
    scale_factor = total_population_target / current_total
    
    df['population'] = (df['population'] * scale_factor).astype(int)
    df['population'] = df['population'].clip(lower=1000)
    
    # Recalculate density
    df['population_density_per_km2'] = (df['population'] / df['area_km2']).round(1)
    
    # Ensure total area matches
    total_area = df['area_km2'].sum()
    area_scale = DELHI_TOTAL_AREA / total_area
    df['area_km2'] = (df['area_km2'] * area_scale).round(3)
    
    # Recalculate density again
    df['population_density_per_km2'] = (df['population'] / df['area_km2']).round(1)
    
    print(f"Total population after assignment: {df['population'].sum():,}")
    print(f"Total area: {df['area_km2'].sum():.2f} km²")
    
    return df


def assign_children_population(df):
    """Assign children (6-14 years) as 20-27% of population."""
    print("\nAssigning children population...")
    
    df = df.copy()
    
    # Children percentage: 20-27% per cell
    for idx in df.index:
        pop = df.loc[idx, 'population']
        children_pct = np.random.uniform(0.20, 0.27)
        children = int(pop * children_pct)
        df.loc[idx, 'children_6_14'] = children
    
    total_children = df['children_6_14'].sum()
    total_pop = df['population'].sum()
    children_pct_actual = (total_children / total_pop) * 100
    
    print(f"Total children (6-14): {total_children:,}")
    print(f"Children as % of population: {children_pct_actual:.1f}%")
    
    return df


def assign_schools(df):
    """Assign schools to cells based on zone profiles."""
    print("\nAssigning schools...")
    
    df = df.copy()
    
    # First, assign zone-level school counts
    zone_school_totals = {}
    for zone_name in df['zone_name'].unique():
        profile = SCHOOL_PROFILES[zone_name]
        zone_schools = np.random.randint(profile['min'], profile['max'] + 1)
        zone_school_totals[zone_name] = zone_schools
    
    # Calculate total and adjust to target (5600+ schools)
    current_total_schools = sum(zone_school_totals.values())
    
    # Ensure we reach at least 5600
    if current_total_schools < TOTAL_SCHOOLS_TARGET:
        diff = TOTAL_SCHOOLS_TARGET - current_total_schools
        # Distribute to larger zones (but keep within max ranges)
        large_zones = [z for z in zone_school_totals if zone_school_totals[z] < SCHOOL_PROFILES[z]['max']]
        if large_zones:
            per_zone = diff // len(large_zones)
            remainder = diff % len(large_zones)
            for i, zone in enumerate(large_zones):
                max_allowed = SCHOOL_PROFILES[zone]['max']
                zone_school_totals[zone] += per_zone + (1 if i < remainder else 0)
                zone_school_totals[zone] = min(zone_school_totals[zone], max_allowed)
    
    # Final check - ensure minimum 5600
    current_total = sum(zone_school_totals.values())
    if current_total < TOTAL_SCHOOLS_TARGET:
        diff = TOTAL_SCHOOLS_TARGET - current_total
        # Add to largest zones that still have room (prioritize large zones)
        sorted_zones = sorted(zone_school_totals.items(), key=lambda x: x[1], reverse=True)
        for zone, current_count in sorted_zones:
            max_allowed = SCHOOL_PROFILES[zone]['max']
            if current_count < max_allowed and diff > 0:
                add = min(diff, max_allowed - current_count)
                zone_school_totals[zone] += add
                diff -= add
                if diff == 0:
                    break
        
        # If still short, increase max limits temporarily for large zones
        if diff > 0:
            large_zone_names = ['South', 'West', 'North West', 'East', 'North East']
            per_zone = diff // len([z for z in large_zone_names if zone_school_totals[z] < 800])
            remainder = diff % len([z for z in large_zone_names if zone_school_totals[z] < 800])
            added = 0
            for zone in large_zone_names:
                if zone_school_totals[zone] < 800 and diff > 0:
                    zone_school_totals[zone] += per_zone + (1 if added < remainder else 0)
                    zone_school_totals[zone] = min(zone_school_totals[zone], 800)
                    diff -= (per_zone + (1 if added < remainder else 0))
                    added += 1
                    if diff <= 0:
                        break
    
    print(f"Zone school totals: {zone_school_totals}")
    print(f"Total schools: {sum(zone_school_totals.values())}")
    
    # Distribute schools across cells in each zone
    for zone_name in df['zone_name'].unique():
        zone_mask = df['zone_name'] == zone_name
        zone_cells = df[zone_mask]
        n_cells = len(zone_cells)
        
        if n_cells == 0:
            continue
        
        total_zone_schools = zone_school_totals[zone_name]
        profile = SCHOOL_PROFILES[zone_name]
        
        # Weight distribution by population density and children count
        weights = (zone_cells['population'] * 0.5 + 
                  zone_cells['children_6_14'] * 0.5)
        weights = weights / weights.sum()
        
        # Distribute schools proportionally
        schools_per_cell = (weights * total_zone_schools).round().astype(int)
        
        # Ensure minimum 1 school per cell with population
        schools_per_cell = schools_per_cell.clip(lower=1)
        
        # Adjust to match total
        current_cell_total = schools_per_cell.sum()
        if current_cell_total != total_zone_schools:
            diff = total_zone_schools - current_cell_total
            # Adjust highest weight cells
            if diff > 0:
                high_weight_indices = schools_per_cell.nlargest(min(abs(diff), len(schools_per_cell))).index
                for idx in high_weight_indices:
                    schools_per_cell[idx] += 1
                    diff -= 1
                    if diff == 0:
                        break
            else:
                # Remove from lowest weight cells (but keep at least 1)
                low_weight_indices = schools_per_cell.nsmallest(min(abs(diff), len(schools_per_cell[schools_per_cell > 1]))).index
                for idx in low_weight_indices:
                    if schools_per_cell[idx] > 1:
                        schools_per_cell[idx] -= 1
                        diff += 1
                        if diff == 0:
                            break
        
        # Assign to dataframe
        for idx in schools_per_cell.index:
            df.loc[idx, 'schools_total'] = int(schools_per_cell[idx])
            
            # Split into govt/private based on profile
            govt_ratio = profile['govt_ratio']
            total_schools = int(schools_per_cell[idx])
            govt_schools = max(0, int(total_schools * govt_ratio))
            private_schools = total_schools - govt_schools
            
            df.loc[idx, 'govt_schools'] = govt_schools
            df.loc[idx, 'private_schools'] = private_schools
            
            # Distribute across school levels
            # Primary: 40-50%, Secondary: 30-40%, Higher Secondary: 15-25%
            primary_pct = np.random.uniform(0.40, 0.50)
            secondary_pct = np.random.uniform(0.30, 0.40)
            higher_secondary_pct = 1 - primary_pct - secondary_pct
            
            if higher_secondary_pct < 0.15:
                higher_secondary_pct = np.random.uniform(0.15, 0.25)
                remaining = 1 - higher_secondary_pct
                primary_pct = remaining * 0.55
                secondary_pct = remaining * 0.45
            
            df.loc[idx, 'primary_only_schools'] = max(0, int(total_schools * primary_pct))
            df.loc[idx, 'secondary_schools'] = max(0, int(total_schools * secondary_pct))
            df.loc[idx, 'higher_secondary_schools'] = total_schools - df.loc[idx, 'primary_only_schools'] - df.loc[idx, 'secondary_schools']
    
    print(f"Total schools assigned: {df['schools_total'].sum()}")
    
    return df


def calculate_metrics(df):
    """Calculate derived metrics."""
    print("\nCalculating derived metrics...")
    
    df = df.copy()
    
    # Schools per 1k children
    df['schools_per_1k_children'] = (
        (df['schools_total'] / df['children_6_14']) * 1000
    ).replace([np.inf, -np.inf], 0).fillna(0).round(2)
    
    # Schools per 10k population
    df['schools_per_10k_population'] = (
        (df['schools_total'] / df['population']) * 10000
    ).replace([np.inf, -np.inf], 0).fillna(0).round(2)
    
    # Distance to nearest school (0.2-1.5 km)
    df['distance_to_nearest_school_km'] = np.random.uniform(0.2, 1.5, len(df)).round(2)
    
    # Average class size (25-55 students)
    df['avg_class_size'] = np.random.uniform(25, 55, len(df)).round(1)
    
    # Student-teacher ratio (18-45)
    df['student_teacher_ratio'] = np.random.uniform(18, 45, len(df)).round(1)
    
    # Adjust for overcrowded zones
    for zone_name in df['zone_name'].unique():
        zone_mask = df['zone_name'] == zone_name
        profile = SCHOOL_PROFILES[zone_name]
        
        if profile['overcrowded']:
            # Higher class sizes and student-teacher ratios
            df.loc[zone_mask, 'avg_class_size'] = np.random.uniform(40, 55, zone_mask.sum()).round(1)
            df.loc[zone_mask, 'student_teacher_ratio'] = np.random.uniform(35, 45, zone_mask.sum()).round(1)
            df.loc[zone_mask, 'distance_to_nearest_school_km'] = np.random.uniform(0.5, 1.5, zone_mask.sum()).round(2)
        else:
            # Better ratios for non-overcrowded zones
            df.loc[zone_mask, 'avg_class_size'] = np.random.uniform(25, 40, zone_mask.sum()).round(1)
            df.loc[zone_mask, 'student_teacher_ratio'] = np.random.uniform(18, 35, zone_mask.sum()).round(1)
            df.loc[zone_mask, 'distance_to_nearest_school_km'] = np.random.uniform(0.2, 0.8, zone_mask.sum()).round(2)
    
    # New Delhi: better quality (lower class sizes, better ratios)
    new_delhi_mask = df['zone_name'] == 'New Delhi'
    df.loc[new_delhi_mask, 'avg_class_size'] = np.random.uniform(25, 35, new_delhi_mask.sum()).round(1)
    df.loc[new_delhi_mask, 'student_teacher_ratio'] = np.random.uniform(18, 28, new_delhi_mask.sum()).round(1)
    df.loc[new_delhi_mask, 'distance_to_nearest_school_km'] = np.random.uniform(0.2, 0.6, new_delhi_mask.sum()).round(2)
    
    return df


def calculate_coverage_score(df):
    """Calculate coverage score based on multiple factors."""
    print("\nCalculating coverage scores...")
    
    df = df.copy()
    
    # Factor 1: Schools per 1k children (0-30 points)
    # Target: 2-4 schools per 1k children = excellent
    schools_per_1k = df['schools_per_1k_children']
    schools_score = np.clip((schools_per_1k / 4) * 30, 0, 30)
    
    # Factor 2: Distance to nearest school (0-25 points)
    # Shorter distance = better coverage
    distance = df['distance_to_nearest_school_km']
    distance_score = np.clip((1.5 - distance) / 1.5 * 25, 0, 25)
    
    # Factor 3: Student-teacher ratio (0-20 points)
    # Lower ratio = better (target: 20-30)
    str_ratio = df['student_teacher_ratio']
    str_score = np.clip(20 * (1 - (str_ratio - 18) / 27), 0, 20)
    
    # Factor 4: Class size (0-15 points)
    # Smaller classes = better (target: 25-35)
    class_size = df['avg_class_size']
    class_score = np.clip(15 * (1 - (class_size - 25) / 30), 0, 15)
    
    # Factor 5: Population density adjustment (0-10 points)
    # Moderate density helps accessibility
    density = df['population_density_per_km2']
    density_normalized = (density - 7000) / (40000 - 7000)
    density_score = np.clip(density_normalized * 10, 0, 10)
    
    # Calculate total coverage score
    df['coverage_score'] = (
        schools_score + distance_score + str_score + class_score + density_score
    ).round(1)
    
    # Scale coverage scores to realistic range
    min_score = df['coverage_score'].min()
    max_score = df['coverage_score'].max()
    
    # Normalize to 20-85% range first
    if max_score > min_score:
        df['coverage_score'] = 20 + (df['coverage_score'] - min_score) / (max_score - min_score) * 65
    else:
        df['coverage_score'] = 50.0
    
    df['coverage_score'] = np.clip(df['coverage_score'], 20, 85).round(1)
    
    # Zone-specific adjustments based on actual Delhi patterns
    # New Delhi: better coverage (60-75%)
    new_delhi_mask = df['zone_name'] == 'New Delhi'
    if new_delhi_mask.any():
        df.loc[new_delhi_mask, 'coverage_score'] = np.random.uniform(60, 75, new_delhi_mask.sum()).round(1)
    
    # West and South West: good coverage (55-70%)
    good_coverage_zones = ['West', 'South West', 'South']
    for zone in good_coverage_zones:
        zone_mask = df['zone_name'] == zone
        if zone_mask.any():
            df.loc[zone_mask, 'coverage_score'] = np.clip(
                df.loc[zone_mask, 'coverage_score'] * 1.1, 50, 70
            ).round(1)
    
    # North West and North: moderate coverage (45-65%)
    moderate_zones = ['North West', 'North']
    for zone in moderate_zones:
        zone_mask = df['zone_name'] == zone
        if zone_mask.any():
            df.loc[zone_mask, 'coverage_score'] = np.clip(
                df.loc[zone_mask, 'coverage_score'] * 1.05, 45, 65
            ).round(1)
    
    # Overcrowded zones (North East, East, Central) - lower coverage due to overcrowding (35-60%)
    overcrowded_zones = ['North East', 'East', 'Central']
    for zone in overcrowded_zones:
        zone_mask = df['zone_name'] == zone
        if zone_mask.any():
            df.loc[zone_mask, 'coverage_score'] = np.clip(
                df.loc[zone_mask, 'coverage_score'] * 0.85, 35, 60
            ).round(1)
    
    # Ensure some excellent zones (70-85%)
    # Randomly select ~10% of cells to have excellent coverage
    n_excellent = max(1, int(len(df) * 0.1))
    excellent_indices = df.nlargest(n_excellent, 'coverage_score').index
    df.loc[excellent_indices, 'coverage_score'] = np.random.uniform(70, 85, n_excellent).round(1)
    
    # Ensure coverage thresholds
    def assign_label(score):
        if score >= 70:
            return "Excellent"
        elif score >= 50:
            return "Good"
        else:
            return "Needs Improvement"
    
    df['coverage_label'] = df['coverage_score'].apply(assign_label)
    
    print("Coverage distribution:")
    print(df['coverage_label'].value_counts())
    
    return df


def aggregate_zone_stats(df):
    """Display aggregated zone statistics."""
    print("\n" + "="*60)
    print("ZONE-WISE AGGREGATED STATISTICS")
    print("="*60)
    
    zone_stats = df.groupby('zone_name').agg({
        'population': 'sum',
        'area_km2': 'sum',
        'children_6_14': 'sum',
        'schools_total': 'sum',
        'govt_schools': 'sum',
        'private_schools': 'sum',
        'coverage_score': 'mean'
    }).round(1)
    
    zone_stats['population_density'] = (zone_stats['population'] / zone_stats['area_km2']).round(1)
    zone_stats['children_pct'] = (zone_stats['children_6_14'] / zone_stats['population'] * 100).round(1)
    
    print(zone_stats.to_string())
    print()
    
    print(f"City-wide totals:")
    print(f"  Total Population: {df['population'].sum():,}")
    print(f"  Total Area: {df['area_km2'].sum():.2f} km²")
    print(f"  Total Children (6-14): {df['children_6_14'].sum():,}")
    print(f"  Total Schools: {df['schools_total'].sum():,}")
    print(f"  Avg Coverage Score: {df['coverage_score'].mean():.1f}%")
    print()


def main():
    """Main execution function."""
    print("="*60)
    print("Regenerating School Coverage Dataset with Realistic Values")
    print("="*60)
    print()
    
    # Load existing structure
    df = load_existing_structure()
    
    # Assign population and density
    df = assign_population_and_density(df)
    
    # Assign children population
    df = assign_children_population(df)
    
    # Assign schools
    df = assign_schools(df)
    
    # Calculate derived metrics
    df = calculate_metrics(df)
    
    # Calculate coverage scores
    df = calculate_coverage_score(df)
    
    # Display zone statistics
    aggregate_zone_stats(df)
    
    # Sort by cell_id
    df = df.sort_values('cell_id').reset_index(drop=True)
    
    # Save regenerated dataset
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"✅ Dataset saved to {OUTPUT_FILE}")
    print()
    print("="*60)
    print("[SUCCESS] School coverage dataset regenerated!")
    print("="*60)


if __name__ == "__main__":
    main()


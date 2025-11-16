"""
Generate Realistic Park Coverage Dataset for Delhi
Based on user requirements and realism constraints
"""

import pandas as pd
import numpy as np
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

BASE_DIR = Path(__file__).parent
OUTPUT_FILE = BASE_DIR / "park_coverage_predictions.csv"
NEXTJS_DATA_PATH = BASE_DIR / "infra-vision" / "data" / "park_coverage_predictions.csv"

# City-wide constants
TOTAL_PARKS_MIN = 16000
TOTAL_PARKS_MAX = 17000
DELHI_TOTAL_AREA = 1484  # km²
TOTAL_ZONES = 29

# Zone definitions (29 zones)
ZONES = [
    # Central zones (3)
    {"zone_id": "01", "zone_name": "Central Zone 1", "size": "small", "green_priority": "low"},
    {"zone_id": "02", "zone_name": "Central Zone 2", "size": "small", "green_priority": "low"},
    {"zone_id": "03", "zone_name": "Central Zone 3", "size": "small", "green_priority": "low"},
    
    # East zones (3)
    {"zone_id": "04", "zone_name": "East Zone 1", "size": "large", "green_priority": "high"},
    {"zone_id": "05", "zone_name": "East Zone 2", "size": "medium", "green_priority": "medium"},
    {"zone_id": "06", "zone_name": "East Zone 3", "size": "medium", "green_priority": "medium"},
    
    # North zones (3)
    {"zone_id": "07", "zone_name": "North Zone 1", "size": "medium", "green_priority": "low"},
    {"zone_id": "08", "zone_name": "North Zone 2", "size": "medium", "green_priority": "low"},
    {"zone_id": "09", "zone_name": "North Zone 3", "size": "small", "green_priority": "low"},
    
    # North East zones (3)
    {"zone_id": "10", "zone_name": "North East Zone 1", "size": "medium", "green_priority": "low"},
    {"zone_id": "11", "zone_name": "North East Zone 2", "size": "small", "green_priority": "low"},
    {"zone_id": "12", "zone_name": "North East Zone 3", "size": "small", "green_priority": "low"},
    
    # North West zones (4)
    {"zone_id": "13", "zone_name": "North West Zone A1", "size": "large", "green_priority": "medium"},
    {"zone_id": "14", "zone_name": "North West Zone A2", "size": "medium", "green_priority": "medium"},
    {"zone_id": "15", "zone_name": "North West Zone B1", "size": "medium", "green_priority": "medium"},
    {"zone_id": "16", "zone_name": "North West Zone B2", "size": "small", "green_priority": "low"},
    
    # South zones (4)
    {"zone_id": "17", "zone_name": "South Zone 1", "size": "large", "green_priority": "high"},
    {"zone_id": "18", "zone_name": "South Zone 2", "size": "large", "green_priority": "high"},
    {"zone_id": "19", "zone_name": "South East Zone 1", "size": "medium", "green_priority": "high"},
    {"zone_id": "20", "zone_name": "South East Zone 2", "size": "small", "green_priority": "medium"},
    
    # South West zones (4)
    {"zone_id": "21", "zone_name": "South West Zone A1", "size": "large", "green_priority": "high"},
    {"zone_id": "22", "zone_name": "South West Zone A2", "size": "medium", "green_priority": "high"},
    {"zone_id": "23", "zone_name": "South West Zone B1", "size": "medium", "green_priority": "medium"},
    {"zone_id": "24", "zone_name": "South West Zone B2", "size": "small", "green_priority": "medium"},
    
    # West zones (3)
    {"zone_id": "25", "zone_name": "West Zone A1", "size": "large", "green_priority": "high"},
    {"zone_id": "26", "zone_name": "West Zone A2", "size": "large", "green_priority": "high"},
    {"zone_id": "27", "zone_name": "West Zone A3", "size": "medium", "green_priority": "medium"},
    
    # New Delhi (NDMC) (1)
    {"zone_id": "28", "zone_name": "New Delhi", "size": "medium", "green_priority": "medium"},
    
    # Additional zone (to make 29)
    {"zone_id": "29", "zone_name": "East Zone 4", "size": "medium", "green_priority": "medium"},
]

def assign_parks(zones):
    """Assign realistic park counts to zones based on size and green priority."""
    
    # Total parks target
    total_parks_target = np.random.randint(TOTAL_PARKS_MIN, TOTAL_PARKS_MAX + 1)
    print(f"Target total parks: {total_parks_target:,}")
    
    # Park allocation rules
    park_allocations = []
    
    for zone in zones:
        size = zone["size"]
        green_priority = zone["green_priority"]
        zone_name = zone["zone_name"]
        
        # Base park count by size
        if size == "small":
            base_parks = np.random.randint(150, 400)
        elif size == "medium":
            base_parks = np.random.randint(400, 800)
        else:  # large
            base_parks = np.random.randint(800, 1200)
        
        # Adjust by green priority
        if green_priority == "high":
            multiplier = np.random.uniform(1.1, 1.3)
        elif green_priority == "medium":
            multiplier = np.random.uniform(0.9, 1.1)
        else:  # low
            multiplier = np.random.uniform(0.7, 0.9)
        
        # Special case: New Delhi (NDMC) 300-400 parks
        if zone_name == "New Delhi":
            parks = np.random.randint(300, 401)
        else:
            parks = int(base_parks * multiplier)
            parks = max(150, min(parks, 1200))  # Enforce limits
        
        park_allocations.append(parks)
    
    # Normalize to target total
    current_total = sum(park_allocations)
    scale_factor = total_parks_target / current_total
    
    # Apply scaling
    park_allocations = [int(p * scale_factor) for p in park_allocations]
    
    # Final adjustment to hit exact target
    current_total = sum(park_allocations)
    diff = total_parks_target - current_total
    
    # Distribute difference to larger zones
    if diff != 0:
        large_zone_indices = [i for i, z in enumerate(zones) if z["size"] == "large" and z["zone_name"] != "New Delhi"]
        if large_zone_indices:
            per_zone = diff // len(large_zone_indices)
            remainder = diff % len(large_zone_indices)
            for idx in large_zone_indices:
                park_allocations[idx] += per_zone + (1 if remainder > 0 else 0)
                if remainder > 0:
                    remainder -= 1
    
    # Ensure no zone exceeds 1200 parks
    for i, parks in enumerate(park_allocations):
        park_allocations[i] = min(parks, 1200)
    
    # Final adjustment if needed
    current_total = sum(park_allocations)
    if current_total < total_parks_target:
        diff = total_parks_target - current_total
        # Add to large zones
        large_zone_indices = [i for i, z in enumerate(zones) if z["size"] == "large"]
        if large_zone_indices:
            per_zone = diff // len(large_zone_indices)
            for idx in large_zone_indices:
                park_allocations[idx] += per_zone
                park_allocations[idx] = min(park_allocations[idx], 1200)
    
    # Ensure New Delhi is exactly 300-400
    ndmc_idx = next(i for i, z in enumerate(zones) if z["zone_name"] == "New Delhi")
    park_allocations[ndmc_idx] = np.random.randint(300, 401)
    
    # Final normalization to hit exact target (excluding NDMC)
    non_ndmc_indices = [i for i in range(len(zones)) if zones[i]["zone_name"] != "New Delhi"]
    current_total = sum(park_allocations)
    remaining_target = total_parks_target - park_allocations[ndmc_idx]
    current_non_ndmc = sum(park_allocations[i] for i in non_ndmc_indices)
    
    if current_non_ndmc > 0:
        scale_factor = remaining_target / current_non_ndmc
        for idx in non_ndmc_indices:
            park_allocations[idx] = int(park_allocations[idx] * scale_factor)
            park_allocations[idx] = max(150, min(park_allocations[idx], 1200))
    
    # Final adjustment
    current_total = sum(park_allocations)
    diff = total_parks_target - current_total
    if diff != 0:
        # Adjust largest non-NDMC zones
        large_indices = [i for i in non_ndmc_indices if zones[i]["size"] == "large"]
        if large_indices:
            per_zone = diff // len(large_indices)
            remainder = diff % len(large_indices)
            for idx in large_indices:
                park_allocations[idx] += per_zone + (1 if remainder > 0 else 0)
                park_allocations[idx] = max(150, min(park_allocations[idx], 1200))
                if remainder > 0:
                    remainder -= 1
    
    return park_allocations


def assign_areas(zones, park_counts):
    """Assign realistic area (km²) to zones, totaling ~1484 km²."""
    
    area_allocations = []
    
    for i, zone in enumerate(zones):
        size = zone["size"]
        zone_name = zone["zone_name"]
        parks = park_counts[i]
        
        # Base area by size
        if size == "small":
            area = np.random.uniform(5, 20)
        elif size == "medium":
            area = np.random.uniform(20, 50)
        else:  # large
            area = np.random.uniform(50, 120)
        
        # Special case: New Delhi exactly 40-60 km²
        if zone_name == "New Delhi":
            area = np.random.uniform(40, 60)
        
        area_allocations.append(round(area, 2))
    
    # Normalize to Delhi total area
    current_total = sum(area_allocations)
    scale_factor = DELHI_TOTAL_AREA / current_total
    
    # Apply scaling
    area_allocations = [round(a * scale_factor, 2) for a in area_allocations]
    
    # Final adjustment (preserve New Delhi area)
    current_total = sum(area_allocations)
    diff = DELHI_TOTAL_AREA - current_total
    
    if abs(diff) > 0.1:
        # Distribute difference to largest zones (excluding New Delhi)
        large_zone_indices = [i for i, z in enumerate(zones) if z["size"] == "large" and z["zone_name"] != "New Delhi"]
        if large_zone_indices:
            per_zone = diff / len(large_zone_indices)
            for idx in large_zone_indices:
                area_allocations[idx] = round(area_allocations[idx] + per_zone, 2)
    
    # Ensure no zone exceeds 120 km² and New Delhi is exactly 40-60
    ndmc_idx = next(i for i, z in enumerate(zones) if z["zone_name"] == "New Delhi")
    # Force New Delhi to exactly 40-60 range (strictly under 60)
    area_allocations[ndmc_idx] = round(np.random.uniform(40.0, 59.99), 2)
    
    # Adjust total area to account for New Delhi fix
    current_total = sum(area_allocations)
    diff = DELHI_TOTAL_AREA - current_total
    if abs(diff) > 0.1:
        # Redistribute difference to large zones (excluding New Delhi)
        large_indices = [i for i in range(len(zones)) if zones[i]["size"] == "large" and i != ndmc_idx]
        if large_indices:
            per_zone = diff / len(large_indices)
            for idx in large_indices:
                area_allocations[idx] = min(round(area_allocations[idx] + per_zone, 2), 120.0)
    
    # Final check: ensure no zone exceeds 120 km² (except we already capped)
    for i in range(len(area_allocations)):
        if i != ndmc_idx:
            area_allocations[i] = min(round(area_allocations[i], 2), 120.0)
    
    return area_allocations


def calculate_coverage_percentage(zone, parks, area_km2):
    """Calculate realistic coverage percentage based on multiple factors."""
    
    size = zone["size"]
    green_priority = zone["green_priority"]
    
    # Factor 1: Parks per km² (0-30 points)
    parks_per_km2 = parks / area_km2 if area_km2 > 0 else 0
    parks_density_score = min((parks_per_km2 / 15) * 30, 30)
    
    # Factor 2: Green priority adjustment (0-25 points)
    if green_priority == "high":
        green_score = np.random.uniform(20, 25)
    elif green_priority == "medium":
        green_score = np.random.uniform(12, 18)
    else:  # low
        green_score = np.random.uniform(5, 12)
    
    # Factor 3: Size-based accessibility (0-20 points)
    if size == "large":
        access_score = np.random.uniform(15, 20)
    elif size == "medium":
        access_score = np.random.uniform(10, 15)
    else:  # small
        access_score = np.random.uniform(5, 10)
    
    # Factor 4: Park count relative score (0-25 points)
    max_parks = 1200
    park_count_score = (parks / max_parks) * 25
    
    # Total coverage score
    coverage = parks_density_score + green_score + access_score + park_count_score
    
    # Ensure coverage is in realistic range
    # Special zones adjustments
    if zone["zone_name"] == "East Zone 1" and green_priority == "high":
        # East Zone 1 should be excellent
        coverage = np.random.uniform(75, 85)
    elif zone["zone_name"] == "New Delhi":
        # New Delhi moderate coverage
        coverage = np.random.uniform(40, 55)
    elif green_priority == "low":
        # Low priority zones (North East, Central, North) should be lower coverage
        coverage = max(15, min(coverage, 50))
    elif green_priority == "high":
        # High priority zones (South, West) should be higher coverage (70-85%)
        coverage = np.random.uniform(70, 85)
        # Ensure East Zone 1 gets excellent coverage if it's high priority
        if zone["zone_name"] == "East Zone 1":
            coverage = np.random.uniform(75, 85)
    elif green_priority == "medium":
        # Medium priority zones
        coverage = np.random.uniform(45, 70)
    
    # Ensure never exceeds 90%
    coverage = min(round(coverage, 1), 89.9)
    
    # Ensure minimum of 15%
    coverage = max(round(coverage, 1), 15.0)
    
    return round(coverage, 1)


def assign_label_and_status(coverage):
    """Assign label and status based on coverage percentage."""
    
    if coverage >= 70:
        return "Excellent Coverage", "Excellent"
    elif coverage >= 45:
        return "Good Coverage", "Good"
    else:
        return "Needs Improvement", "Needs Improvement"


def generate_dataset():
    """Generate realistic park coverage dataset."""
    
    print("="*60)
    print("Generating Realistic Park Coverage Dataset")
    print("="*60)
    print()
    
    # Assign parks
    park_counts = assign_parks(ZONES)
    total_parks = sum(park_counts)
    print(f"✅ Assigned parks: {total_parks:,}")
    print(f"   Range: {TOTAL_PARKS_MIN:,} - {TOTAL_PARKS_MAX:,}")
    print()
    
    # Assign areas
    areas = assign_areas(ZONES, park_counts)
    total_area = sum(areas)
    print(f"✅ Assigned areas: {total_area:.2f} km²")
    print(f"   Target: ~{DELHI_TOTAL_AREA} km²")
    print()
    
    # Calculate coverage percentages
    coverages = []
    labels = []
    statuses = []
    
    for i, zone in enumerate(ZONES):
        coverage = calculate_coverage_percentage(zone, park_counts[i], areas[i])
        label, status = assign_label_and_status(coverage)
        
        coverages.append(coverage)
        labels.append(label)
        statuses.append(status)
    
    # Ensure high priority zones have excellent coverage (70-85%) FIRST
    # This sets baseline for excellent zones before any adjustments
    for i, zone in enumerate(ZONES):
        if zone["green_priority"] == "high" and coverages[i] < 70:
            # Set high priority zones to excellent range
            coverages[i] = round(np.random.uniform(70, 85), 1)
            labels[i], statuses[i] = assign_label_and_status(coverages[i])
        elif zone["zone_name"] == "East Zone 1":
            # East Zone 1 should be excellent
            coverages[i] = round(np.random.uniform(75, 85), 1)
            labels[i], statuses[i] = assign_label_and_status(coverages[i])
    
    # Calculate Urban Green Balance Index (target exactly 42%)
    ugbi = round(np.mean(coverages), 1)
    
    # Adjust to target 42% Urban Green Balance Index
    target_ugbi = 42.0
    ugbi = round(np.mean(coverages), 1)
    
    if abs(ugbi - target_ugbi) > 2:
        # Calculate adjustment factor
        adjustment_factor = target_ugbi / ugbi
        
        # Apply adjustment, with different factors for different priorities
        for i, zone in enumerate(ZONES):
            priority = zone["green_priority"]
            
            # Preserve excellent zones (70-85%)
            if coverages[i] >= 70:
                continue  # Don't adjust excellent zones much
            
            if priority == "low":
                # Low priority zones adjust more (bring down)
                new_coverage = coverages[i] * adjustment_factor * 0.9
            elif priority == "medium":
                # Medium priority zones adjust proportionally
                new_coverage = coverages[i] * adjustment_factor
            else:  # high (but not excellent yet)
                # High priority zones that aren't excellent yet
                new_coverage = min(coverages[i] * adjustment_factor * 1.05, 85.0)
            
            # Ensure within bounds
            new_coverage = max(15.0, min(89.9, round(new_coverage, 1)))
            coverages[i] = new_coverage
            labels[i], statuses[i] = assign_label_and_status(coverages[i])
        
        # Recalculate UGBI
        ugbi = round(np.mean(coverages), 1)
        
        # Fine-tune if still not close enough to 42%
        ugbi = round(np.mean(coverages), 1)
        if abs(ugbi - target_ugbi) > 1:
            diff = target_ugbi - ugbi
            # Adjust lower coverage zones (not excellent ones)
            non_excellent_indices = [i for i in range(len(coverages)) if coverages[i] < 70]
            if non_excellent_indices:
                per_zone = diff / len(non_excellent_indices)
                for i in non_excellent_indices:
                    new_cov = max(15.0, min(69.9, round(coverages[i] + per_zone * 0.7, 1)))
                    coverages[i] = new_cov
                    labels[i], statuses[i] = assign_label_and_status(coverages[i])
        
        # Final UGBI
        ugbi = round(np.mean(coverages), 1)
        
        # Last pass to ensure exactly 42% if still off
        ugbi = round(np.mean(coverages), 1)
        if abs(ugbi - target_ugbi) > 0.5:
            # Calculate how much to reduce
            diff_needed = target_ugbi - ugbi
            # Get non-excellent zones
            non_excellent = [(i, c) for i, c in enumerate(coverages) if c < 70]
            if non_excellent:
                # Distribute reduction across non-excellent zones
                reduction_per_zone = diff_needed / len(non_excellent)
                for i, current_cov in non_excellent:
                    new_cov = max(15.0, min(69.9, round(current_cov + reduction_per_zone, 1)))
                    coverages[i] = new_cov
                    labels[i], statuses[i] = assign_label_and_status(coverages[i])
        
        # Final UGBI
        ugbi = round(np.mean(coverages), 1)
    
    # Final direct adjustment to hit exactly 42% UGBI
    target_ugbi = 42.0
    current_ugbi = round(np.mean(coverages), 1)
    
    if abs(current_ugbi - target_ugbi) > 0.2:
        # Calculate total needed
        total_needed = target_ugbi * len(coverages)
        current_total = sum(coverages)
        diff_total = total_needed - current_total
        
        # Identify excellent zones (don't adjust these much)
        excellent_indices = [i for i, c in enumerate(coverages) if c >= 70]
        non_excellent_indices = [i for i, c in enumerate(coverages) if c < 70]
        
        if non_excellent_indices:
            # Distribute adjustment only to non-excellent zones
            adjustment_per_zone = diff_total / len(non_excellent_indices)
            
            for idx in non_excellent_indices:
                new_cov = max(15.0, min(69.9, round(coverages[idx] + adjustment_per_zone, 1)))
                coverages[idx] = new_cov
                labels[idx], statuses[idx] = assign_label_and_status(coverages[idx])
            
            # Recalculate UGBI
            ugbi = round(np.mean(coverages), 1)
            
            # Final fine-tune if needed (should be very small)
            if abs(ugbi - target_ugbi) > 0.1:
                final_diff = target_ugbi - ugbi
                for idx in non_excellent_indices:
                    coverages[idx] = max(15.0, min(69.9, round(coverages[idx] + final_diff, 1)))
                    labels[idx], statuses[idx] = assign_label_and_status(coverages[idx])
                ugbi = round(np.mean(coverages), 1)
    
    # Round all coverage values to 1 decimal (final cleanup)
    for i in range(len(coverages)):
        coverages[i] = round(coverages[i], 1)
    
    # Create DataFrame
    data = {
        "zone_id": [z["zone_id"] for z in ZONES],
        "zone_name": [z["zone_name"] for z in ZONES],
        "predicted_coverage_score": coverages,
        "coverage_label": labels,
        "num_parks": park_counts,
        "total_area": areas,
        "status": [s.lower().replace(" ", "-") for s in statuses],
        "urban_green_balance_index": [ugbi] * len(ZONES),
        "progress_to_who": [ugbi] * len(ZONES)
    }
    
    df = pd.DataFrame(data)
    
    # Sort by coverage score (descending)
    df = df.sort_values("predicted_coverage_score", ascending=False)
    
    # Reassign zone IDs based on ranking
    df["zone_id"] = [f"{i+1:02d}" for i in range(len(df))]
    
    print("="*60)
    print("DATASET SUMMARY")
    print("="*60)
    print(f"Total Zones: {len(df)}")
    print(f"Total Parks: {df['num_parks'].sum():,}")
    print(f"Total Area: {df['total_area'].sum():.2f} km²")
    print(f"Urban Green Balance Index: {ugbi}%")
    print()
    
    # Coverage distribution
    coverage_dist = df["coverage_label"].value_counts()
    print("Coverage Distribution:")
    for label, count in coverage_dist.items():
        pct = (count / len(df)) * 100
        print(f"  {label}: {count} zones ({pct:.1f}%)")
    print()
    
    # Top 10 zones
    print("Top 10 Zones by Coverage:")
    top_cols = ['zone_id', 'zone_name', 'predicted_coverage_score', 'coverage_label', 'num_parks', 'total_area']
    print(df[top_cols].head(10).to_string(index=False))
    print()
    
    # Verification
    print("Verification:")
    print(f"  Total Parks: {df['num_parks'].sum():,} (Target: {TOTAL_PARKS_MIN:,}-{TOTAL_PARKS_MAX:,})")
    print(f"  Max Parks in Zone: {df['num_parks'].max()} (Max: 1200)")
    
    new_delhi = df[df['zone_name'] == 'New Delhi']
    if len(new_delhi) > 0:
        print(f"  New Delhi Parks: {new_delhi['num_parks'].iloc[0]} (Target: 300-400)")
        print(f"  New Delhi Area: {new_delhi['total_area'].iloc[0]:.2f} km² (Target: 40-60)")
    
    max_coverage = df['predicted_coverage_score'].max()
    print(f"  Max Coverage: {max_coverage}% (Max: 90%)")
    print()
    
    # Save dataset
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"✅ Dataset saved to {OUTPUT_FILE}")
    
    # Copy to Next.js folder
    if NEXTJS_DATA_PATH.parent.exists():
        import shutil
        shutil.copy2(OUTPUT_FILE, NEXTJS_DATA_PATH)
        print(f"✅ File exported to {NEXTJS_DATA_PATH}")
    else:
        print(f"⚠️ Next.js data folder not found: {NEXTJS_DATA_PATH.parent}")
    
    print()
    print("="*60)
    print("[SUCCESS] Dataset generated successfully!")
    print("="*60)
    
    return df


if __name__ == "__main__":
    generate_dataset()


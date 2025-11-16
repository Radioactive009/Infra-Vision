import pandas as pd
import numpy as np
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Also create infra-vision/data directory
NEXTJS_DATA_DIR = BASE_DIR / "infra-vision" / "data"
NEXTJS_DATA_DIR.mkdir(parents=True, exist_ok=True)

np.random.seed(42)

# Zone mapping from infrastructure data to display names
zone_mapping = {
    "New Delhi": ["Zone A", "Zone B", "Zone C"],
    "South Delhi": ["Zone F", "Zone G", "Zone H"],
    "East Delhi": ["Zone D", "Zone E"],
    "North Delhi": ["Zone K1", "Zone K2"],
    "West Delhi": ["Zone L", "Zone M"],
    "Central Delhi": ["Zone C", "Zone D"],
    "Dwarka": ["Zone P1", "Zone P2"],
    "Rohini": ["Zone N", "Zone O"]
}

# Load infrastructure data if available
infra_file = BASE_DIR / "delhi_housing_density_and_road_network_extended.csv"
infra_data = None

if infra_file.exists():
    try:
        infra_df = pd.read_csv(infra_file)
        # Get latest year data for each zone
        infra_df = infra_df.sort_values('Year').groupby('Zone').last().reset_index()
        infra_data = infra_df.set_index('Zone')
        print(f"[INFO] Loaded infrastructure data for {len(infra_data)} zones")
    except Exception as e:
        print(f"[WARNING] Could not load infrastructure data: {e}")

def calculate_zone_metrics(zone_name, infra_zone_data=None):
    """
    Calculate realistic before/after metrics based on infrastructure characteristics.
    """
    # Base values that vary by zone characteristics
    if infra_zone_data is not None:
        try:
            # Handle pandas Series - use .get() with default or direct indexing
            if isinstance(infra_zone_data, pd.Series):
                congestion = float(infra_zone_data.get('Current Congestion Level (%)', 60))
                road_length = float(infra_zone_data.get('Total Road Length (km)', 200))
                green_area = float(infra_zone_data.get('Green Area (%)', 15))
                housing_units = float(infra_zone_data.get('Housing Units', 30000))
                highway_ratio = float(infra_zone_data.get('Highway Ratio', 0.15))
                arterial_ratio = float(infra_zone_data.get('Arterial Ratio', 0.30))
            else:
                # Handle dict-like
                congestion = float(infra_zone_data.get('Current Congestion Level (%)', 60))
                road_length = float(infra_zone_data.get('Total Road Length (km)', 200))
                green_area = float(infra_zone_data.get('Green Area (%)', 15))
                housing_units = float(infra_zone_data.get('Housing Units', 30000))
                highway_ratio = float(infra_zone_data.get('Highway Ratio', 0.15))
                arterial_ratio = float(infra_zone_data.get('Arterial Ratio', 0.30))
        except (AttributeError, KeyError, ValueError, TypeError) as e:
            # Fallback if data access fails
            print(f"[WARNING] Could not extract infrastructure data for {zone_name}: {e}")
            congestion = 60
            road_length = 200
            green_area = 15
            housing_units = 30000
            highway_ratio = 0.15
            arterial_ratio = 0.30
        
        # Calculate base traffic efficiency (inverse of congestion, adjusted for road network)
        base_traffic = 100 - congestion
        road_quality_factor = (highway_ratio * 0.4 + arterial_ratio * 0.3 + 0.3) * 100
        before_traffic = min(85, max(45, base_traffic * 0.6 + road_quality_factor * 0.4))
        
        # Commute time based on congestion and road network
        base_commute = 25 + (congestion / 100) * 35
        road_factor = max(0.7, min(1.3, 200 / max(road_length, 50)))
        before_commute = base_commute * road_factor
        
        # Infrastructure utilization based on road network and housing
        road_util = min(100, (road_length / 500) * 100)
        housing_util = min(100, (housing_units / 50000) * 100)
        before_infra = (road_util * 0.6 + housing_util * 0.4)
        
        # Pollution based on congestion, green area, and density
        congestion_pollution = congestion * 0.8
        green_reduction = green_area * 0.5
        before_pollution = 70 + congestion_pollution - green_reduction
    else:
        # Fallback to zone-based defaults
        zone_defaults = {
            "New Delhi": {"traffic": 65, "commute": 45, "infra": 58, "pollution": 95},
            "South Delhi": {"traffic": 60, "commute": 48, "infra": 55, "pollution": 90},
            "East Delhi": {"traffic": 58, "commute": 50, "infra": 52, "pollution": 98},
            "North Delhi": {"traffic": 62, "commute": 42, "infra": 60, "pollution": 88},
            "West Delhi": {"traffic": 59, "commute": 46, "infra": 56, "pollution": 92},
            "Central Delhi": {"traffic": 70, "commute": 52, "infra": 65, "pollution": 85},
            "Dwarka": {"traffic": 64, "commute": 40, "infra": 62, "pollution": 82},
            "Rohini": {"traffic": 68, "commute": 38, "infra": 64, "pollution": 87}
        }
        defaults = zone_defaults.get(zone_name, {"traffic": 60, "commute": 45, "infra": 55, "pollution": 90})
        before_traffic = defaults["traffic"]
        before_commute = defaults["commute"]
        before_infra = defaults["infra"]
        before_pollution = defaults["pollution"]
    
    # Calculate improvements based on AI planning impact
    # Zones with worse infrastructure get larger improvements
    traffic_improvement_factor = (100 - before_traffic) / 100
    traffic_improvement = 8 + traffic_improvement_factor * 12  # 8-20% improvement
    after_traffic = min(95, before_traffic + traffic_improvement + np.random.uniform(-2, 2))
    
    # Commute reduction proportional to traffic improvement
    commute_reduction_factor = traffic_improvement / 15
    commute_reduction = 8 + commute_reduction_factor * 10  # 8-18 min reduction
    after_commute = max(20, before_commute - commute_reduction + np.random.uniform(-2, 2))
    
    # Infrastructure gain based on current utilization
    infra_improvement_factor = (100 - before_infra) / 100
    infra_improvement = 12 + infra_improvement_factor * 15  # 12-27% improvement
    after_infra = min(90, before_infra + infra_improvement + np.random.uniform(-2, 2))
    
    # Pollution reduction based on traffic improvement and green area
    pollution_reduction_factor = traffic_improvement / 20
    if infra_zone_data is not None:
        try:
            green_val = float(infra_zone_data.get('Green Area (%)', 15)) if hasattr(infra_zone_data, 'get') else float(infra_zone_data.get('Green Area (%)', 15))
            green_boost = green_val * 0.3
        except (AttributeError, KeyError, ValueError, TypeError):
            green_boost = 5
    else:
        green_boost = 5
    pollution_reduction = 10 + pollution_reduction_factor * 12 + green_boost  # 10-25 reduction
    after_pollution = max(50, before_pollution - pollution_reduction + np.random.uniform(-3, 3))
    
    # Housing access (derived from infrastructure)
    before_access = before_infra * 0.9 + np.random.uniform(-5, 5)
    after_access = after_infra * 0.9 + np.random.uniform(-3, 3)
    before_access = max(55, min(80, before_access))
    after_access = max(before_access, min(95, after_access))
    
    return {
        "Traffic_Efficiency_Before": round(before_traffic, 1),
        "Traffic_Efficiency_After": round(after_traffic, 1),
        "Commute_Before": round(before_commute, 1),
        "Commute_After": round(after_commute, 1),
        "Housing_Access_Before": round(before_access, 1),
        "Housing_Access_After": round(after_access, 1),
        "Infra_Util_Before": round(before_infra, 1),
        "Infra_Util_After": round(after_infra, 1),
        "Pollution_Index_Before": round(before_pollution, 1),
        "Pollution_Index_After": round(after_pollution, 1)
    }

zones = [
    "New Delhi", "South Delhi", "East Delhi", "North Delhi",
    "West Delhi", "Central Delhi", "Dwarka", "Rohini"
]

data = []

for zone in zones:
    # Get infrastructure data for this zone
    infra_zone_data = None
    if infra_data is not None:
        zone_keys = zone_mapping.get(zone, [])
        for key in zone_keys:
            if key in infra_data.index:
                infra_zone_data = infra_data.loc[key]
                print(f"[INFO] Using infrastructure data from {key} for {zone}")
                break
        # If no match, try to find similar zone or use average
        if infra_zone_data is None:
            # Use average of all zones as fallback, but add zone-specific variation
            try:
                avg_data = infra_data.mean()
                # Add some variation based on zone name hash for realism
                zone_hash = hash(zone) % 100
                variation_factor = 0.8 + (zone_hash / 100) * 0.4  # 0.8 to 1.2
                infra_zone_data = avg_data * variation_factor
                print(f"[INFO] Using averaged infrastructure data with variation for {zone}")
            except Exception as e:
                print(f"[WARNING] Could not get infrastructure data for {zone}: {e}")
                infra_zone_data = None
    
    metrics = calculate_zone_metrics(zone, infra_zone_data)
    metrics["Zone"] = zone
    data.append(metrics)

df = pd.DataFrame(data)

# Reorder columns to put Zone first
column_order = ['Zone', 'Traffic_Efficiency_Before', 'Traffic_Efficiency_After', 
                'Commute_Before', 'Commute_After', 'Housing_Access_Before', 
                'Housing_Access_After', 'Infra_Util_Before', 'Infra_Util_After',
                'Pollution_Index_Before', 'Pollution_Index_After']
df = df[column_order]

# Save to both locations
df.to_csv(DATA_DIR / "ai_planning_impact.csv", index=False)
df.to_csv(NEXTJS_DATA_DIR / "ai_planning_impact.csv", index=False)

summary = {
    "traffic_improvement": round(df["Traffic_Efficiency_After"].mean() - df["Traffic_Efficiency_Before"].mean(), 1),
    "commute_reduction": round(df["Commute_Before"].mean() - df["Commute_After"].mean(), 1),
    "infra_gain": round(df["Infra_Util_After"].mean() - df["Infra_Util_Before"].mean(), 1),
    "pollution_reduction": round(df["Pollution_Index_Before"].mean() - df["Pollution_Index_After"].mean(), 1)
}

pd.DataFrame([summary]).to_csv(DATA_DIR / "ai_planning_summary.csv", index=False)
pd.DataFrame([summary]).to_csv(NEXTJS_DATA_DIR / "ai_planning_summary.csv", index=False)

print("[SUCCESS] Premium demo dataset created successfully.")
print(f"   Saved to: {DATA_DIR / 'ai_planning_impact.csv'}")
print(f"   Saved to: {NEXTJS_DATA_DIR / 'ai_planning_impact.csv'}")
print(f"\nSummary Statistics:")
print(f"   Traffic Efficiency Improvement: +{summary['traffic_improvement']}%")
print(f"   Commute Time Reduction: -{summary['commute_reduction']} min")
print(f"   Infrastructure Gain: +{summary['infra_gain']}%")
print(f"   Pollution Reduction: -{summary['pollution_reduction']}")


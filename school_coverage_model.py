"""
City Infrastructure Intelligence Platform - School Coverage Analysis Model
================================================================================

This script implements a machine learning model to predict school coverage scores
and labels for administrative zones in Delhi NCR.

Author: Senior Geospatial Data Scientist
Date: 2025

Requirements:
    pip install pandas geopandas scikit-learn xgboost joblib shapely pyproj

Usage:
    python school_coverage_model.py
"""

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import warnings
import os
from pathlib import Path

warnings.filterwarnings('ignore')

# ============================================================================
# CONFIGURATION - Edit these paths according to your file locations
# ============================================================================

BASE_DIR = Path(__file__).parent

# Input file paths
SCHOOLS_CSV = BASE_DIR / "delhi_schools_all.csv"
ADMIN_GEOJSON = BASE_DIR / "delhi_admin_full.geojson"  # Updated to use full zone GeoJSON
POPULATION_CSV = BASE_DIR / "delhi_population_zones.csv"  # Create if doesn't exist

# Output paths
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_PATH = MODEL_DIR / "school_coverage_model.pkl"
SCALER_PATH = MODEL_DIR / "school_coverage_scaler.pkl"
PREDICTIONS_CSV = BASE_DIR / "school_coverage_predictions.csv"

# ============================================================================
# DATA LOADING AND CLEANING FUNCTIONS
# ============================================================================

def load_schools_data(filepath):
    """
    Load and clean school point data from CSV.
    
    Returns:
        GeoDataFrame with school locations and attributes
    """
    print("Loading schools data...")
    
    # Read CSV - handle different possible formats
    # The CSV may have a header row on line 2 (index 1), with data starting on line 3
    try:
        # First, check if first row is a category row
        first_row = pd.read_csv(filepath, encoding='utf-8', nrows=1, header=None)
        if first_row.iloc[0, 0] in ['Category', 'DOE_Government']:
            # Skip first row, use second row as header
            df = pd.read_csv(filepath, encoding='utf-8', low_memory=False, header=1)
            # Remove the category column if it exists
            if df.columns[0] in ['Category', 'DOE_Government']:
                df = df.drop(columns=[df.columns[0]])
        else:
            df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
    except Exception as e:
        print(f"Warning: Error reading CSV with header detection: {e}")
        df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
    
    # Check for common column name variations
    lat_col = None
    lon_col = None
    
    # Try to find latitude/longitude columns
    for col in df.columns:
        col_lower = col.lower()
        if 'lat' in col_lower or 'latitude' in col_lower:
            lat_col = col
        if 'lon' in col_lower or 'longitude' in col_lower or 'lng' in col_lower:
            lon_col = col
    
    if lat_col is None or lon_col is None:
        # Try to find numeric columns that might be coordinates
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) >= 2:
            # Assume last two numeric columns might be lat/lon
            lat_col = numeric_cols[-2]
            lon_col = numeric_cols[-1]
            print(f"Warning: Using inferred columns {lat_col} and {lon_col} as coordinates")
    
    if lat_col is None or lon_col is None:
        raise ValueError("Could not find latitude/longitude columns in schools CSV")
    
    # Clean coordinates
    df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
    df[lon_col] = pd.to_numeric(df[lon_col], errors='coerce')
    
    # Remove rows with invalid coordinates
    df = df.dropna(subset=[lat_col, lon_col])
    df = df[(df[lat_col].between(-90, 90)) & (df[lon_col].between(-180, 180))]
    
    # Create geometry column
    geometry = [Point(xy) for xy in zip(df[lon_col], df[lat_col])]
    gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
    
    # Standardize column names
    rename_map = {
        lat_col: 'latitude',
        lon_col: 'longitude'
    }
    
    # Try to find and rename common columns
    for col in df.columns:
        col_lower = col.lower()
        if 'school' in col_lower and 'id' in col_lower:
            rename_map[col] = 'school_id'
        elif 'name' in col_lower and 'school' in col_lower:
            rename_map[col] = 'name'
        elif 'level' in col_lower or 'schoollevel' in col_lower:
            rename_map[col] = 'school_level'
        elif 'management' in col_lower or 'type' in col_lower:
            rename_map[col] = 'management_type'
        elif 'enrol' in col_lower or 'student' in col_lower:
            rename_map[col] = 'enrolment_total'
        elif 'ratio' in col_lower or 'teacher' in col_lower:
            rename_map[col] = 'student_teacher_ratio'
    
    gdf = gdf.rename(columns=rename_map)
    
    # Ensure required columns exist, create if missing
    if 'school_id' not in gdf.columns:
        gdf['school_id'] = range(len(gdf))
    if 'name' not in gdf.columns:
        gdf['name'] = 'School_' + gdf['school_id'].astype(str)
    if 'school_level' not in gdf.columns:
        gdf['school_level'] = 'unknown'
    if 'management_type' not in gdf.columns:
        gdf['management_type'] = 'unknown'
    if 'enrolment_total' not in gdf.columns:
        gdf['enrolment_total'] = 0
    if 'student_teacher_ratio' not in gdf.columns:
        gdf['student_teacher_ratio'] = 30.0  # Default ratio
    
    # Clean categorical columns
    gdf['school_level'] = gdf['school_level'].astype(str).str.lower()
    gdf['management_type'] = gdf['management_type'].astype(str).str.lower()
    
    # Clean numeric columns
    gdf['enrolment_total'] = pd.to_numeric(gdf['enrolment_total'], errors='coerce').fillna(0)
    gdf['student_teacher_ratio'] = pd.to_numeric(gdf['student_teacher_ratio'], errors='coerce').fillna(30.0)
    
    # Remove invalid ratios
    gdf = gdf[gdf['student_teacher_ratio'] > 0]
    gdf = gdf[gdf['student_teacher_ratio'] < 100]  # Reasonable upper bound
    
    print(f"Loaded {len(gdf)} schools")
    return gdf


def load_admin_zones(filepath):
    """
    Load administrative zone boundaries from GeoJSON.
    
    Returns:
        GeoDataFrame with zone boundaries
    """
    print("Loading administrative zones...")
    
    gdf = gpd.read_file(filepath)
    
    # Standardize CRS to WGS84 if needed
    if gdf.crs is None:
        gdf.set_crs('EPSG:4326', inplace=True)
    else:
        gdf.to_crs('EPSG:4326', inplace=True)
    
    # Try to find zone_id and zone_name columns
    for col in gdf.columns:
        col_lower = col.lower()
        if 'zone' in col_lower and 'id' in col_lower:
            gdf = gdf.rename(columns={col: 'zone_id'})
        elif 'zone' in col_lower and 'name' in col_lower:
            gdf = gdf.rename(columns={col: 'zone_name'})
        elif col_lower == 'name' and 'zone_name' not in gdf.columns:
            gdf = gdf.rename(columns={col: 'zone_name'})
    
    # Create zone_id if missing
    if 'zone_id' not in gdf.columns:
        if 'zone_name' in gdf.columns:
            gdf['zone_id'] = gdf['zone_name'].astype(str)
        else:
            gdf['zone_id'] = range(len(gdf))
            gdf['zone_name'] = 'Zone_' + gdf['zone_id'].astype(str)
    
    # Ensure zone_name exists
    if 'zone_name' not in gdf.columns:
        gdf['zone_name'] = gdf['zone_id'].astype(str)
    
    print(f"Loaded {len(gdf)} administrative zones")
    return gdf[['zone_id', 'zone_name', 'geometry']]


def load_or_create_population_data(filepath, admin_gdf):
    """
    Load population data or create synthetic data if file doesn't exist.
    
    Returns:
        DataFrame with population data per zone
    """
    if os.path.exists(filepath):
        print("Loading population data...")
        df = pd.read_csv(filepath, index_col=False)  # Don't use first column as index
        
        # Standardize column names
        for col in df.columns:
            col_lower = col.lower()
            if 'zone' in col_lower and 'id' in col_lower:
                df = df.rename(columns={col: 'zone_id'})
            elif 'population' in col_lower and 'total' in col_lower:
                df = df.rename(columns={col: 'population_total'})
            elif 'population' in col_lower and ('6' in col_lower or '17' in col_lower):
                df = df.rename(columns={col: 'population_6_17'})
            elif 'literacy' in col_lower:
                df = df.rename(columns={col: 'literacy_rate'})
            elif 'urban' in col_lower or 'rural' in col_lower:
                df = df.rename(columns={col: 'urban_rural'})
        
        # Ensure zone_id exists and is a column (not index)
        if df.index.name == 'zone_id' or 'zone_id' in df.index.names:
            df = df.reset_index()
        if 'zone_id' not in df.columns:
            raise ValueError("Population CSV must have a zone_id column")
        
    else:
        print("Population CSV not found. Creating synthetic population data...")
        # Create synthetic population data based on zone areas
        zone_ids = admin_gdf['zone_id'].unique()
        
        # Estimate population based on zone area (larger zones = more population)
        admin_gdf['area_km2'] = admin_gdf.geometry.to_crs('EPSG:3857').area / 1e6
        area_stats = admin_gdf.groupby('zone_id')['area_km2'].first().reset_index()
        
        # Synthetic population: 5000-50000 per zone, scaled by area
        max_area = area_stats['area_km2'].max()
        population_total = (area_stats['area_km2'] / max_area * 45000 + 5000).astype(int)
        population_6_17 = (population_total * np.random.uniform(0.15, 0.25)).astype(int)
        literacy_rate = np.random.uniform(0.75, 0.95, size=len(zone_ids))
        urban_rural = ['Urban'] * len(zone_ids)  # Delhi is mostly urban
        
        df = pd.DataFrame({
            'zone_id': area_stats['zone_id'].values,  # Use values from area_stats to ensure matching
            'population_total': population_total.values,
            'population_6_17': population_6_17.values,
            'literacy_rate': literacy_rate,
            'urban_rural': urban_rural
        })
        
        # Save synthetic data for reference
        df.to_csv(filepath, index=False)
        print(f"Created and saved synthetic population data to {filepath}")
    
    # Ensure required columns exist
    if 'population_total' not in df.columns:
        df['population_total'] = 10000  # Default
    if 'population_6_17' not in df.columns:
        df['population_6_17'] = df['population_total'] * 0.20  # Assume 20% school-age
    if 'literacy_rate' not in df.columns:
        df['literacy_rate'] = 0.85  # Default
    if 'urban_rural' not in df.columns:
        df['urban_rural'] = 'Urban'
    
    # Clean numeric columns
    df['population_total'] = pd.to_numeric(df['population_total'], errors='coerce').fillna(10000)
    df['population_6_17'] = pd.to_numeric(df['population_6_17'], errors='coerce').fillna(df['population_total'] * 0.20)
    df['literacy_rate'] = pd.to_numeric(df['literacy_rate'], errors='coerce').fillna(0.85)
    df['literacy_rate'] = df['literacy_rate'].clip(0, 1)  # Ensure between 0 and 1
    
    print(f"Loaded population data for {len(df)} zones")
    return df


# ============================================================================
# SPATIAL JOIN AND AGGREGATION
# ============================================================================

def spatial_join_schools_to_zones(schools_gdf, admin_gdf, use_nearest=False):
    """
    Spatially join schools to administrative zones.
    
    Args:
        schools_gdf: GeoDataFrame with school locations
        admin_gdf: GeoDataFrame with administrative zone boundaries
        use_nearest: If True, assign schools outside zones to nearest zone
    
    Returns:
        GeoDataFrame with schools and their zone assignments
    """
    print("Performing spatial join...")
    
    # Ensure same CRS
    schools_gdf = schools_gdf.to_crs(admin_gdf.crs)
    
    # Perform spatial join
    schools_with_zones = gpd.sjoin(schools_gdf, admin_gdf, how='left', predicate='within')
    
    # Handle schools outside all zones
    schools_outside = schools_with_zones[schools_with_zones['zone_id'].isna()]
    
    if len(schools_outside) > 0:
        print(f"  {len(schools_outside)} schools outside zone boundaries")
        
        if use_nearest:
            print("  Assigning to nearest zone...")
            # Use geopandas sjoin_nearest if available (geopandas >= 0.11)
            try:
                # Try using sjoin_nearest (more efficient)
                schools_outside_clean = schools_outside[['geometry']].copy()
                nearest = gpd.sjoin_nearest(
                    schools_outside_clean,
                    admin_gdf[['zone_id', 'zone_name', 'geometry']], 
                    how='left',
                    distance_col='distance'
                )
                
                # Assign nearest zones - use index_left to match original schools
                if 'index_left' in nearest.columns:
                    for idx in schools_outside.index:
                        # Find matching row in nearest
                        matching = nearest[nearest.index == idx]
                        if len(matching) > 0:
                            schools_with_zones.loc[idx, 'zone_id'] = matching.iloc[0]['zone_id']
                            schools_with_zones.loc[idx, 'zone_name'] = matching.iloc[0]['zone_name']
                else:
                    # If no index_left, match by position
                    for i, idx in enumerate(schools_outside.index):
                        if i < len(nearest):
                            schools_with_zones.loc[idx, 'zone_id'] = nearest.iloc[i]['zone_id']
                            schools_with_zones.loc[idx, 'zone_name'] = nearest.iloc[i]['zone_name']
                
                print(f"  Assigned {len(schools_outside)} schools to nearest zones")
            except AttributeError:
                # Fallback: calculate distance manually (slower but works with older geopandas)
                print("  Using distance-based assignment (this may take a while)...")
                for idx, school in schools_outside.iterrows():
                    school_point = school.geometry
                    min_dist = float('inf')
                    nearest_zone_id = None
                    nearest_zone_name = None
                    
                    for zone_idx, zone in admin_gdf.iterrows():
                        # Calculate distance to zone boundary
                        dist = school_point.distance(zone.geometry)
                        if dist < min_dist:
                            min_dist = dist
                            nearest_zone_id = zone['zone_id']
                            nearest_zone_name = zone.get('zone_name', zone['zone_id'])
                    
                    schools_with_zones.loc[idx, 'zone_id'] = nearest_zone_id
                    schools_with_zones.loc[idx, 'zone_name'] = nearest_zone_name
                
                print(f"  Assigned {len(schools_outside)} schools to nearest zones")
        else:
            # Remove schools outside all zones
            schools_with_zones = schools_with_zones.dropna(subset=['zone_id'])
            print(f"  Removed {len(schools_outside)} schools outside zones")
    
    # Remove schools still without zones
    schools_with_zones = schools_with_zones.dropna(subset=['zone_id'])
    
    print(f"Assigned {len(schools_with_zones)} schools to zones")
    return schools_with_zones


def aggregate_schools_to_zones(schools_with_zones):
    """
    Aggregate school-level data to zone-level features.
    
    Returns:
        DataFrame with zone-level aggregated features
    """
    print("Aggregating school data to zones...")
    
    # Group by zone and aggregate
    zone_stats = schools_with_zones.groupby('zone_id').agg({
        'school_id': 'count',  # Number of schools
        'enrolment_total': ['sum', 'mean'],
        'student_teacher_ratio': 'mean',
        'school_level': lambda x: {
            'primary': (x.str.contains('primary', case=False, na=False)).sum(),
            'secondary': (x.str.contains('secondary', case=False, na=False)).sum(),
            'senior_secondary': (x.str.contains('senior', case=False, na=False)).sum()
        }
    }).reset_index()
    
    # Flatten column names
    zone_stats.columns = ['zone_id', 'num_schools', 'total_enrolment', 'avg_enrolment', 
                          'avg_student_teacher_ratio', 'school_levels']
    
    # Extract school level counts
    zone_stats['num_primary_schools'] = zone_stats['school_levels'].apply(
        lambda x: x.get('primary', 0) if isinstance(x, dict) else 0
    )
    zone_stats['num_secondary_schools'] = zone_stats['school_levels'].apply(
        lambda x: x.get('secondary', 0) if isinstance(x, dict) else 0
    )
    zone_stats['num_senior_secondary_schools'] = zone_stats['school_levels'].apply(
        lambda x: x.get('senior_secondary', 0) if isinstance(x, dict) else 0
    )
    
    # Drop the school_levels column
    zone_stats = zone_stats.drop(columns=['school_levels'])
    
    # Management type distribution
    mgmt_stats = schools_with_zones.groupby(['zone_id', 'management_type']).size().unstack(fill_value=0)
    if 'govt' in mgmt_stats.columns or 'government' in mgmt_stats.columns:
        govt_col = 'govt' if 'govt' in mgmt_stats.columns else 'government'
        zone_stats['num_govt_schools'] = mgmt_stats[govt_col].values
    else:
        zone_stats['num_govt_schools'] = 0
    
    if 'private' in mgmt_stats.columns:
        zone_stats['num_private_schools'] = mgmt_stats['private'].values
    else:
        zone_stats['num_private_schools'] = 0
    
    # Fill missing values
    zone_stats = zone_stats.fillna(0)
    
    print(f"Aggregated data for {len(zone_stats)} zones")
    return zone_stats


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def create_features(zone_stats, population_df):
    """
    Create engineered features for modeling.
    
    Returns:
        DataFrame with all features and target variable
    """
    print("Engineering features...")
    
    # Ensure zone_id is a column (not an index) in both DataFrames
    if zone_stats.index.name == 'zone_id' or 'zone_id' in zone_stats.index.names:
        zone_stats = zone_stats.reset_index()
    if population_df.index.name == 'zone_id' or 'zone_id' in population_df.index.names:
        population_df = population_df.reset_index()
    
    # Ensure zone_id exists as a column
    if 'zone_id' not in zone_stats.columns:
        raise ValueError("zone_stats must have 'zone_id' as a column")
    if 'zone_id' not in population_df.columns:
        raise ValueError("population_df must have 'zone_id' as a column")
    
    # Merge zone stats with population data
    features_df = zone_stats.merge(population_df, on='zone_id', how='left')
    
    # Fill missing population data with defaults
    features_df['population_total'] = features_df['population_total'].fillna(10000)
    features_df['population_6_17'] = features_df['population_6_17'].fillna(2000)
    features_df['literacy_rate'] = features_df['literacy_rate'].fillna(0.85)
    
    # Core coverage metrics
    features_df['schools_per_1000_children'] = (
        features_df['num_schools'] / features_df['population_6_17'] * 1000
    ).replace([np.inf, -np.inf], 0).fillna(0)
    
    # Capacity metrics (using enrolment as proxy for capacity)
    features_df['seat_capacity_per_100_children'] = (
        features_df['total_enrolment'] / features_df['population_6_17'] * 100
    ).replace([np.inf, -np.inf], 0).fillna(0)
    
    # School level diversity
    features_df['school_level_diversity'] = (
        features_df['num_primary_schools'] + 
        features_df['num_secondary_schools'] + 
        features_df['num_senior_secondary_schools']
    ) / (features_df['num_schools'] + 1)  # +1 to avoid division by zero
    
    # Management type distribution
    features_df['govt_school_ratio'] = (
        features_df['num_govt_schools'] / (features_df['num_schools'] + 1)
    )
    
    # Quality indicators
    features_df['avg_student_teacher_ratio'] = features_df['avg_student_teacher_ratio'].fillna(30.0)
    
    # Additional ratios
    features_df['enrolment_per_school'] = (
        features_df['total_enrolment'] / (features_df['num_schools'] + 1)
    )
    
    # Create target variable using rule-based formula
    # This formula can be adjusted based on domain expertise
    features_df['coverage_score'] = calculate_coverage_score(features_df)
    
    # Ensure coverage score is between 0 and 100
    features_df['coverage_score'] = features_df['coverage_score'].clip(0, 100)
    
    print(f"Created features for {len(features_df)} zones")
    return features_df


def calculate_coverage_score(features_df):
    """
    Calculate coverage score using a rule-based formula.
    
    Formula Components:
    - Base score from schools_per_1000_children (0-50 points)
    - Capacity adequacy from seat_capacity_per_100_children (0-30 points)
    - Quality adjustment from student_teacher_ratio (0-10 points)
    - Literacy bonus (0-10 points)
    
    This formula can be modified based on domain requirements.
    """
    score = np.zeros(len(features_df))
    
    # 1. Schools per 1000 children (0-50 points)
    # Target: 2-5 schools per 1000 children = good coverage
    schools_per_1k = features_df['schools_per_1000_children']
    score += np.clip(schools_per_1k / 5 * 50, 0, 50)
    
    # 2. Seat capacity per 100 children (0-30 points)
    # Target: 80-120 seats per 100 children = good capacity
    capacity_per_100 = features_df['seat_capacity_per_100_children']
    score += np.clip(capacity_per_100 / 120 * 30, 0, 30)
    
    # 3. Student-teacher ratio quality (0-10 points)
    # Lower ratio is better (target: 20-30)
    str_ratio = features_df['avg_student_teacher_ratio']
    # Invert: lower ratio = higher score
    str_score = 10 * (1 - np.clip((str_ratio - 20) / 30, 0, 1))
    score += str_score
    
    # 4. Literacy rate bonus (0-10 points)
    literacy = features_df['literacy_rate']
    score += literacy * 10
    
    return score


# ============================================================================
# MODEL TRAINING AND EVALUATION
# ============================================================================

def prepare_model_data(features_df):
    """
    Prepare features and target for modeling.
    
    Returns:
        X (features), y (target), feature_names
    """
    # Select feature columns (exclude identifiers and target)
    exclude_cols = ['zone_id', 'zone_name', 'coverage_score', 'urban_rural', 'geometry']
    feature_cols = [col for col in features_df.columns if col not in exclude_cols]
    
    X = features_df[feature_cols].copy()
    y = features_df['coverage_score'].copy()
    
    # Handle any remaining NaN values
    X = X.fillna(X.median())
    
    return X, y, feature_cols


def train_model(X_train, y_train, X_test, y_test, feature_names):
    """
    Train Random Forest model and evaluate performance.
    
    Returns:
        Trained model, scaler, evaluation metrics
    """
    print("Training model...")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest Regressor
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Make predictions
    y_train_pred = model.predict(X_train_scaled)
    y_test_pred = model.predict(X_test_scaled)
    
    # Calculate metrics
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    
    print("\n" + "="*60)
    print("MODEL EVALUATION METRICS")
    print("="*60)
    print(f"Training Set:")
    print(f"  R² Score: {train_r2:.4f}")
    print(f"  MAE: {train_mae:.4f}")
    print(f"  RMSE: {train_rmse:.4f}")
    print(f"\nTest Set:")
    print(f"  R² Score: {test_r2:.4f}")
    print(f"  MAE: {test_mae:.4f}")
    print(f"  RMSE: {test_rmse:.4f}")
    print("="*60 + "\n")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("Top 10 Most Important Features:")
    print(feature_importance.head(10).to_string(index=False))
    print()
    
    return model, scaler, {
        'train_r2': train_r2,
        'test_r2': test_r2,
        'train_mae': train_mae,
        'test_mae': test_mae,
        'train_rmse': train_rmse,
        'test_rmse': test_rmse,
        'feature_importance': feature_importance
    }


# ============================================================================
# COVERAGE LABEL CONVERSION
# ============================================================================

def score_to_label(score: float) -> str:
    """
    Convert numeric coverage score to label.
    
    Args:
        score: Coverage score between 0 and 100
        
    Returns:
        Coverage label: 'Excellent Coverage', 'Good Coverage', or 'Needs Improvement'
    """
    if score >= 80:
        return "Excellent Coverage"
    elif score >= 60:
        return "Good Coverage"
    else:
        return "Needs Improvement"


def score_to_status(score: float) -> str:
    """
    Convert numeric coverage score to UI status code.
    
    Args:
        score: Coverage score between 0 and 100
        
    Returns:
        Status: 'excellent', 'good', or 'needs-improvement'
    """
    if score >= 80:
        return "excellent"
    elif score >= 60:
        return "good"
    else:
        return "needs-improvement"


# ============================================================================
# PREDICTION FUNCTION
# ============================================================================

def predict_school_coverage(schools_df, admin_gdf, population_df, model, scaler, feature_names):
    """
    Predict school coverage for all zones.
    
    Args:
        schools_df: DataFrame/GeoDataFrame with school data
        admin_gdf: GeoDataFrame with administrative zone boundaries
        population_df: DataFrame with population data per zone
        model: Trained model
        scaler: Fitted scaler
        feature_names: List of feature column names
        
    Returns:
        DataFrame with zone_id, predicted_coverage_score, coverage_label, status
    """
    print("Generating predictions...")
    
    # Convert schools_df to GeoDataFrame if needed
    if not isinstance(schools_df, gpd.GeoDataFrame):
        if 'latitude' in schools_df.columns and 'longitude' in schools_df.columns:
            geometry = [Point(xy) for xy in zip(schools_df['longitude'], schools_df['latitude'])]
            schools_gdf = gpd.GeoDataFrame(schools_df, geometry=geometry, crs='EPSG:4326')
        else:
            raise ValueError("schools_df must have latitude/longitude columns or be a GeoDataFrame")
    else:
        schools_gdf = schools_df.copy()
    
    # Perform spatial join (use nearest so all schools get a zone)
    schools_with_zones = spatial_join_schools_to_zones(schools_gdf, admin_gdf, use_nearest=True)
    
    # Aggregate to zones
    zone_stats = aggregate_schools_to_zones(schools_with_zones)
    
    # Create features
    features_df = create_features(zone_stats, population_df)
    
    # Prepare features for prediction
    X = features_df[feature_names].copy()
    X = X.fillna(X.median())
    
    # Scale and predict
    X_scaled = scaler.transform(X)
    predictions = model.predict(X_scaled)
    predictions = np.clip(predictions, 0, 100)  # Ensure valid range
    
    # Merge zone_name from admin_gdf
    zone_name_map = admin_gdf[['zone_id', 'zone_name']].drop_duplicates()
    features_df = features_df.merge(zone_name_map, on='zone_id', how='left')
    
    # Fill missing zone_name with zone_id
    features_df['zone_name'] = features_df['zone_name'].fillna(features_df['zone_id'].astype(str))
    
    # Create results DataFrame
    results = pd.DataFrame({
        'zone_id': features_df['zone_id'],
        'zone_name': features_df['zone_name'],
        'predicted_coverage_score': predictions,
        'num_schools': features_df['num_schools'],
        'total_enrolment': features_df['total_enrolment']
    })
    
    # Add labels
    results['coverage_label'] = results['predicted_coverage_score'].apply(score_to_label)
    results['status'] = results['predicted_coverage_score'].apply(score_to_status)
    
    # Round coverage score
    results['predicted_coverage_score'] = results['predicted_coverage_score'].round(1)
    
    return results


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution function."""
    print("="*60)
    print("City Infrastructure Intelligence Platform")
    print("School Coverage Analysis Model")
    print("="*60)
    print()
    
    # Step 1: Load data
    schools_gdf = load_schools_data(SCHOOLS_CSV)
    admin_gdf = load_admin_zones(ADMIN_GEOJSON)
    population_df = load_or_create_population_data(POPULATION_CSV, admin_gdf)
    
    # Step 2: Spatial join
    # Using use_nearest=True so all schools are assigned to a zone
    schools_with_zones = spatial_join_schools_to_zones(
        schools_gdf,
        admin_gdf,
        use_nearest=True
    )
    
    # Step 3: Aggregate to zones
    zone_stats = aggregate_schools_to_zones(schools_with_zones)
    
    # Step 4: Create features
    features_df = create_features(zone_stats, population_df)
    
    # Step 5: Prepare model data
    X, y, feature_names = prepare_model_data(features_df)
    
    # Step 6: Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nTraining set size: {len(X_train)} zones")
    print(f"Test set size: {len(X_test)} zones\n")
    
    # Step 7: Train model
    model, scaler, metrics = train_model(X_train, y_train, X_test, y_test, feature_names)
    
    # Step 8: Save model and scaler
    print("Saving model and scaler...")
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}\n")
    
    # Step 9: Generate predictions for all zones
    predictions = predict_school_coverage(
        schools_gdf, admin_gdf, population_df, model, scaler, feature_names
    )
    
    # Step 10: Add true scores for comparison (if available)
    if 'coverage_score' in features_df.columns:
        true_scores = features_df[['zone_id', 'coverage_score']].copy()
        predictions = predictions.merge(true_scores, on='zone_id', how='left')
        predictions['true_coverage_score'] = predictions['coverage_score']
        predictions = predictions.drop(columns=['coverage_score'])
    
    # Step 11: Save predictions
    predictions.to_csv(PREDICTIONS_CSV, index=False)
    print(f"Predictions saved to {PREDICTIONS_CSV}\n")
    
    # Step 12: Display sample results
    print("="*60)
    print("SAMPLE PREDICTIONS")
    print("="*60)
    display_cols = ['zone_id', 'zone_name', 'predicted_coverage_score', 
                   'coverage_label', 'num_schools']
    if 'true_coverage_score' in predictions.columns:
        display_cols.insert(3, 'true_coverage_score')
    
    print(predictions[display_cols].head(10).to_string(index=False))
    print()
    
    # Step 13: Summary statistics for UI
    print("="*60)
    print("SUMMARY STATISTICS FOR UI")
    print("="*60)
    avg_coverage = predictions['predicted_coverage_score'].mean()
    total_schools = predictions['num_schools'].sum()
    total_enrolment = predictions['total_enrolment'].sum()
    
    print(f"Average Coverage Score: {avg_coverage:.1f}%")
    print(f"Total Schools: {total_schools:,}")
    print(f"Total Enrolment: {total_enrolment:,.0f}")
    print()
    
    # Coverage distribution
    coverage_dist = predictions['coverage_label'].value_counts()
    print("Coverage Distribution:")
    for label, count in coverage_dist.items():
        print(f"  {label}: {count} zones")
    print()
    
    # Example output for UI integration
    print("="*60)
    print("EXAMPLE UI DATA FORMAT")
    print("="*60)
    print("For the 'Analyze School Distribution in the City' card:")
    print(f"  coverage: {avg_coverage:.0f}")
    print(f"  totalFacilities: {total_schools}")
    print(f"  status: '{score_to_status(avg_coverage)}'")
    print()
    
    print("="*60)
    print("Model training and evaluation complete!")
    print("="*60)


if __name__ == "__main__":
    main()

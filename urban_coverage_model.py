"""
City Infrastructure Intelligence Platform - Urban Coverage Analysis Model
================================================================================

This script implements a machine learning model to predict urban infrastructure
coverage scores for administrative zones in Delhi NCR using cell-level data.

The model analyzes parks, schools, hospitals, and road infrastructure to predict
comprehensive coverage scores for each zone.

Author: Senior Geospatial Data Scientist
Date: 2025

Requirements:
    pip install pandas scikit-learn xgboost joblib numpy

Usage:
    python urban_coverage_model.py
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import warnings
from pathlib import Path

warnings.filterwarnings('ignore')

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_DIR = Path(__file__).parent

# Input file paths
URBAN_COVERAGE_CSV = BASE_DIR / "delhi_urban_coverage_realistic_2000cells.csv"

# Output paths
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_PATH = MODEL_DIR / "urban_coverage_model.pkl"
SCALER_PATH = MODEL_DIR / "urban_coverage_scaler.pkl"
PREDICTIONS_CSV = BASE_DIR / "urban_coverage_predictions.csv"
ZONE_AGGREGATIONS_CSV = BASE_DIR / "urban_coverage_zone_aggregations.csv"

# ============================================================================
# DATA LOADING FUNCTIONS
# ============================================================================

def load_urban_coverage_data(filepath):
    """
    Load urban coverage cell-level data from CSV.
    
    Returns:
        DataFrame with cell-level infrastructure data
    """
    print("Loading urban coverage data...")
    print(f"Reading from: {filepath}")
    
    df = pd.read_csv(filepath)
    
    print(f"Loaded {len(df)} cells")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst few rows:")
    print(df.head())
    print()
    
    return df


def aggregate_cells_to_zones(cells_df):
    """
    Aggregate cell-level data to zone-level statistics.
    
    Returns:
        DataFrame with zone-level aggregated statistics
    """
    print("Aggregating cell-level data to zones...")
    
    # Group by zone_name
    zone_agg = cells_df.groupby('zone_name').agg({
        # Area and population
        'area_km2': ['sum', 'mean'],
        'population': ['sum', 'mean'],
        'population_density_per_km2': 'mean',
        
        # Parks
        'park_count': 'sum',
        'park_area_km2': 'sum',
        'green_area_pct': 'mean',
        
        # Schools
        'school_count': 'sum',
        
        # Hospitals
        'hospital_count': 'sum',
        
        # Roads
        'primary_roads_km': 'sum',
        
        # Per capita metrics
        'parks_per_10k_residents': 'mean',
        'schools_per_10k_residents': 'mean',
        'hospitals_per_100k_residents': 'mean',
        
        # Coverage
        'coverage_score': ['mean', 'std', 'min', 'max'],
        'coverage_label': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else 'Needs Improvement'
    }).reset_index()
    
    # Flatten column names
    zone_agg.columns = ['_'.join(col).strip('_') for col in zone_agg.columns.values]
    
    # Rename columns for clarity
    zone_agg = zone_agg.rename(columns={
        'zone_name': 'zone_name',
        'area_km2_sum': 'total_area_km2',
        'area_km2_mean': 'avg_cell_area_km2',
        'population_sum': 'total_population',
        'population_mean': 'avg_cell_population',
        'population_density_per_km2_mean': 'avg_population_density',
        'park_count_sum': 'total_parks',
        'park_area_km2_sum': 'total_park_area_km2',
        'green_area_pct_mean': 'avg_green_area_pct',
        'school_count_sum': 'total_schools',
        'hospital_count_sum': 'total_hospitals',
        'primary_roads_km_sum': 'total_roads_km',
        'parks_per_10k_residents_mean': 'avg_parks_per_10k',
        'schools_per_10k_residents_mean': 'avg_schools_per_10k',
        'hospitals_per_100k_residents_mean': 'avg_hospitals_per_100k',
        'coverage_score_mean': 'avg_coverage_score',
        'coverage_score_std': 'coverage_score_std',
        'coverage_score_min': 'min_coverage_score',
        'coverage_score_max': 'max_coverage_score',
        'coverage_label_<lambda>': 'dominant_coverage_label'
    })
    
    # Create zone_id from zone_name (simple sequential ID)
    unique_zones = zone_agg['zone_name'].unique()
    zone_id_map = {zone: f"{i+1:02d}" for i, zone in enumerate(sorted(unique_zones))}
    zone_agg['zone_id'] = zone_agg['zone_name'].map(zone_id_map)
    
    # Calculate additional zone-level metrics
    zone_agg['total_facilities'] = (
        zone_agg['total_parks'] + 
        zone_agg['total_schools'] + 
        zone_agg['total_hospitals']
    )
    
    zone_agg['parks_per_km2'] = (
        zone_agg['total_parks'] / zone_agg['total_area_km2']
    ).fillna(0)
    
    zone_agg['schools_per_km2'] = (
        zone_agg['total_schools'] / zone_agg['total_area_km2']
    ).fillna(0)
    
    zone_agg['hospitals_per_km2'] = (
        zone_agg['total_hospitals'] / zone_agg['total_area_km2']
    ).fillna(0)
    
    zone_agg['road_density_km_per_km2'] = (
        zone_agg['total_roads_km'] / zone_agg['total_area_km2']
    ).fillna(0)
    
    # Fill any remaining NaN values
    zone_agg = zone_agg.fillna(0)
    
    print(f"Aggregated data for {len(zone_agg)} zones")
    print(f"\nZone summary:")
    print(zone_agg[['zone_id', 'zone_name', 'total_population', 'avg_coverage_score']].to_string(index=False))
    print()
    
    return zone_agg


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def create_features(zone_agg_df):
    """
    Create engineered features for modeling.
    
    Returns:
        DataFrame with all features and target variable
    """
    print("Engineering features...")
    
    features_df = zone_agg_df.copy()
    
    # Use existing coverage_score as target variable
    # Calculate coverage score based on zone-level metrics if not present
    if 'avg_coverage_score' in features_df.columns:
        features_df['coverage_score'] = features_df['avg_coverage_score']
    else:
        # Calculate coverage score from infrastructure metrics
        features_df['coverage_score'] = calculate_coverage_score_from_features(features_df)
    
    # Ensure coverage score is between 0 and 100
    features_df['coverage_score'] = features_df['coverage_score'].clip(0, 100)
    
    # Create additional composite features
    features_df['infrastructure_diversity'] = (
        (features_df['total_parks'] > 0).astype(int) +
        (features_df['total_schools'] > 0).astype(int) +
        (features_df['total_hospitals'] > 0).astype(int)
    )
    
    features_df['green_infrastructure_ratio'] = (
        features_df['total_park_area_km2'] / 
        (features_df['total_area_km2'] + 0.001)
    )
    
    features_df['facilities_per_population'] = (
        features_df['total_facilities'] / 
        (features_df['total_population'] + 1) * 10000
    )
    
    print(f"Created features for {len(features_df)} zones")
    return features_df


def calculate_coverage_score_from_features(features_df):
    """
    Calculate coverage score from infrastructure features if not already present.
    
    This is a fallback function if coverage_score is not in the data.
    """
    score = np.zeros(len(features_df))
    
    # Parks coverage (0-30 points)
    parks_score = np.clip(features_df['avg_parks_per_10k'] / 10 * 30, 0, 30)
    score += parks_score
    
    # Schools coverage (0-30 points)
    schools_score = np.clip(features_df['avg_schools_per_10k'] / 5 * 30, 0, 30)
    score += schools_score
    
    # Hospitals coverage (0-20 points)
    hospitals_score = np.clip(features_df['avg_hospitals_per_100k'] / 50 * 20, 0, 20)
    score += hospitals_score
    
    # Green space (0-10 points)
    green_score = np.clip(features_df['avg_green_area_pct'] / 10 * 10, 0, 10)
    score += green_score
    
    # Road infrastructure (0-10 points)
    road_score = np.clip(features_df['road_density_km_per_km2'] / 5 * 10, 0, 10)
    score += road_score
    
    return score


def score_to_label(score):
    """Convert coverage score to label."""
    if score >= 80:
        return "Excellent Coverage"
    elif score >= 60:
        return "Good Coverage"
    else:
        return "Needs Improvement"


def score_to_status(score):
    """Convert coverage score to UI status code."""
    if score >= 80:
        return "excellent"
    elif score >= 60:
        return "good"
    else:
        return "needs-improvement"


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
    exclude_cols = [
        'zone_id', 'zone_name', 'coverage_score', 'avg_coverage_score',
        'coverage_score_std', 'min_coverage_score', 'max_coverage_score',
        'dominant_coverage_label', 'coverage_label'
    ]
    feature_cols = [col for col in features_df.columns if col not in exclude_cols]
    
    X = features_df[feature_cols].copy()
    y = features_df['coverage_score'].copy()
    
    # Handle any remaining NaN values
    X = X.fillna(X.median())
    
    print(f"Using {len(feature_cols)} features for modeling")
    print(f"Features: {feature_cols}")
    print()
    
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
        n_estimators=200,
        max_depth=15,
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
    
    print("Top 15 Most Important Features:")
    print(feature_importance.head(15).to_string(index=False))
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
# PREDICTION FUNCTIONS
# ============================================================================

def predict_urban_coverage(zone_agg_df, model, scaler, feature_names):
    """
    Predict coverage scores for all zones.
    
    Returns:
        DataFrame with predictions including zone_id, predicted_coverage_score,
        coverage_label, and status
    """
    print("Generating predictions for all zones...")
    
    # Create features for prediction
    features_df = create_features(zone_agg_df)
    
    # Prepare feature matrix
    X = features_df[feature_names].copy()
    X = X.fillna(X.median())
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Make predictions
    predictions = model.predict(X_scaled)
    
    # Create results dataframe
    results = pd.DataFrame({
        'zone_id': features_df['zone_id'].values,
        'zone_name': features_df['zone_name'].values,
        'predicted_coverage_score': predictions,
    })
    
    # Add labels and status
    results['coverage_label'] = results['predicted_coverage_score'].apply(score_to_label)
    results['status'] = results['predicted_coverage_score'].apply(score_to_status)
    
    # Round predictions
    results['predicted_coverage_score'] = results['predicted_coverage_score'].round(2)
    
    # Add actual scores if available
    if 'coverage_score' in features_df.columns:
        results['actual_coverage_score'] = features_df['coverage_score'].values.round(2)
    
    # Add infrastructure counts
    results['total_parks'] = features_df['total_parks'].values
    results['total_schools'] = features_df['total_schools'].values
    results['total_hospitals'] = features_df['total_hospitals'].values
    results['total_facilities'] = features_df['total_facilities'].values
    results['total_population'] = features_df['total_population'].values
    
    return results


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution function."""
    print("="*60)
    print("City Infrastructure Intelligence Platform")
    print("Urban Coverage Analysis Model")
    print("="*60)
    print()
    
    # Step 1: Load data
    cells_df = load_urban_coverage_data(URBAN_COVERAGE_CSV)
    
    # Step 2: Aggregate to zones
    zone_agg_df = aggregate_cells_to_zones(cells_df)
    
    # Save zone aggregations
    zone_agg_df.to_csv(ZONE_AGGREGATIONS_CSV, index=False)
    print(f"Zone aggregations saved to {ZONE_AGGREGATIONS_CSV}\n")
    
    # Step 3: Create features
    features_df = create_features(zone_agg_df)
    
    # Step 4: Prepare model data
    X, y, feature_names = prepare_model_data(features_df)
    
    # Step 5: Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set size: {len(X_train)} zones")
    print(f"Test set size: {len(X_test)} zones\n")
    
    # Step 6: Train model
    model, scaler, metrics = train_model(X_train, y_train, X_test, y_test, feature_names)
    
    # Step 7: Save model and scaler
    print("Saving model and scaler...")
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}\n")
    
    # Step 8: Generate predictions for all zones
    predictions = predict_urban_coverage(zone_agg_df, model, scaler, feature_names)
    
    # Step 9: Save predictions
    predictions.to_csv(PREDICTIONS_CSV, index=False)
    print(f"Predictions saved to {PREDICTIONS_CSV}\n")
    
    # Step 10: Display summary statistics
    print("="*60)
    print("PREDICTION SUMMARY")
    print("="*60)
    
    # Display predictions
    display_cols = ['zone_id', 'zone_name', 'predicted_coverage_score', 
                   'coverage_label', 'status', 'total_facilities']
    if 'actual_coverage_score' in predictions.columns:
        display_cols.insert(3, 'actual_coverage_score')
    
    print("\nZone-level Predictions:")
    print(predictions[display_cols].to_string(index=False))
    print()
    
    # City-level statistics
    avg_coverage = predictions['predicted_coverage_score'].mean()
    total_parks = predictions['total_parks'].sum()
    total_schools = predictions['total_schools'].sum()
    total_hospitals = predictions['total_hospitals'].sum()
    total_facilities = predictions['total_facilities'].sum()
    
    print("City-level Statistics:")
    print(f"  Average Coverage: {avg_coverage:.2f}%")
    print(f"  Total Parks: {total_parks}")
    print(f"  Total Schools: {total_schools}")
    print(f"  Total Hospitals: {total_hospitals}")
    print(f"  Total Facilities: {total_facilities}")
    print()
    
    # Coverage distribution
    coverage_dist = predictions['coverage_label'].value_counts()
    print("Coverage Distribution:")
    for label, count in coverage_dist.items():
        pct = (count / len(predictions)) * 100
        print(f"  {label}: {count} zones ({pct:.1f}%)")
    print()
    
    print("="*60)
    print("Model training and prediction completed successfully!")
    print("="*60)


if __name__ == "__main__":
    main()


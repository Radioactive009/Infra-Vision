# Urban Coverage Analysis Model

## Overview

This machine learning model analyzes urban infrastructure coverage across administrative zones in Delhi NCR using cell-level data. The model aggregates cell-level infrastructure data (parks, schools, hospitals, roads) to zone-level statistics and predicts comprehensive coverage scores for each zone.

The model is designed to integrate with the City Infrastructure Intelligence Platform UI.

## Model Output Format

The model produces predictions that match the UI requirements:

### For Each Zone:
- **predicted_coverage_score**: Numeric score (0-100) representing infrastructure coverage quality
- **coverage_label**: Text label ("Excellent Coverage", "Good Coverage", or "Needs Improvement")
- **status**: UI status code ("excellent", "good", or "needs-improvement")
- **total_parks**: Total number of parks in the zone
- **total_schools**: Total number of schools in the zone
- **total_hospitals**: Total number of hospitals in the zone
- **total_facilities**: Sum of all facilities in the zone

### For UI Card Display:
The model provides aggregated statistics that match the InfrastructureCard component:

```typescript
{
  coverage: 60,              // Average coverage percentage
  totalFacilities: 24467,    // Total number of facilities
  status: 'good'             // 'excellent' | 'good' | 'needs-improvement'
}
```

## Coverage Score Thresholds

- **Excellent Coverage**: score ≥ 80
- **Good Coverage**: 60 ≤ score < 80
- **Needs Improvement**: score < 60

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### 1. Train the Model

```bash
python urban_coverage_model.py
```

This will:
- Load cell-level infrastructure data from `delhi_urban_coverage_realistic_2000cells.csv`
- Aggregate cell-level data to zone-level statistics
- Create engineered features
- Train a Random Forest model
- Evaluate the model and save it
- Generate predictions for all zones

### 2. Output Files

After training, the following files are created:

- `models/urban_coverage_model.pkl` - Trained Random Forest model
- `models/urban_coverage_scaler.pkl` - Feature scaler for normalization
- `urban_coverage_predictions.csv` - Zone-level predictions
- `urban_coverage_zone_aggregations.csv` - Zone-level aggregated statistics

### 3. Load Predictions for UI Integration

```python
import pandas as pd

# Load predictions
predictions = pd.read_csv('urban_coverage_predictions.csv')

# Calculate city-level statistics for UI
avg_coverage = predictions['predicted_coverage_score'].mean()
total_facilities = predictions['total_facilities'].sum()
status = 'excellent' if avg_coverage >= 80 else \
         'good' if avg_coverage >= 60 else \
         'needs-improvement'

# UI data format
ui_data = {
    'coverage': round(avg_coverage),
    'totalFacilities': int(total_facilities),
    'status': status
}
```

## File Structure

```
.
├── urban_coverage_model.py                  # Main model training script
├── delhi_urban_coverage_realistic_2000cells.csv  # Input cell-level data
├── models/                                   # Saved models (created after training)
│   ├── urban_coverage_model.pkl
│   └── urban_coverage_scaler.pkl
├── urban_coverage_predictions.csv           # Prediction results
└── urban_coverage_zone_aggregations.csv     # Zone-level aggregations
```

## Data Requirements

### Input CSV (`delhi_urban_coverage_realistic_2000cells.csv`)

Required columns:
- `cell_id`: Unique cell identifier
- `zone_name`: Zone name for aggregation
- `area_km2`: Cell area in square kilometers
- `population`: Population in cell
- `population_density_per_km2`: Population density
- `park_count`: Number of parks in cell
- `park_area_km2`: Total park area in cell
- `green_area_pct`: Percentage of green area
- `school_count`: Number of schools in cell
- `hospital_count`: Number of hospitals in cell
- `primary_roads_km`: Length of primary roads in cell
- `parks_per_10k_residents`: Parks per 10,000 residents
- `schools_per_10k_residents`: Schools per 10,000 residents
- `hospitals_per_100k_residents`: Hospitals per 100,000 residents
- `coverage_score`: Coverage score (0-100) - used as target variable
- `coverage_label`: Coverage label (Excellent/Good/Needs Improvement)

## Model Architecture

### Feature Engineering

The model creates the following features for each zone:

1. **Basic Aggregates**:
   - `total_area_km2`: Sum of cell areas
   - `total_population`: Sum of population
   - `total_parks`: Sum of park counts
   - `total_schools`: Sum of school counts
   - `total_hospitals`: Sum of hospital counts
   - `total_roads_km`: Sum of road lengths

2. **Averages**:
   - `avg_population_density`: Average population density
   - `avg_green_area_pct`: Average green area percentage
   - `avg_parks_per_10k`: Average parks per 10,000 residents
   - `avg_schools_per_10k`: Average schools per 10,000 residents
   - `avg_hospitals_per_100k`: Average hospitals per 100,000 residents

3. **Density Metrics**:
   - `parks_per_km2`: Park density
   - `schools_per_km2`: School density
   - `hospitals_per_km2`: Hospital density
   - `road_density_km_per_km2`: Road density

4. **Composite Features**:
   - `infrastructure_diversity`: Count of infrastructure types present
   - `green_infrastructure_ratio`: Ratio of park area to total area
   - `facilities_per_population`: Facilities per 10,000 residents

### Target Variable

The model uses the existing `coverage_score` from the cell-level data as the target variable. The coverage score is aggregated to zone level by taking the mean of cell-level scores within each zone.

### Model

- **Algorithm**: Random Forest Regressor
- **Hyperparameters**:
  - `n_estimators`: 200
  - `max_depth`: 15
  - `min_samples_split`: 5
  - `min_samples_leaf`: 2
- **Preprocessing**: StandardScaler for feature normalization

## Model Evaluation

The model is evaluated using:
- **R² Score**: Coefficient of determination
- **MAE**: Mean Absolute Error
- **RMSE**: Root Mean Squared Error

**Note**: With a small number of zones (9), the train/test split results in a very small test set (2 zones). For production, consider using cross-validation or collecting more data.

## Integration with UI

### Data Flow

1. **Model Training**: `urban_coverage_model.py` trains the model and saves it
2. **Prediction**: Model generates predictions for all zones
3. **Aggregation**: Predictions are aggregated to city-level statistics
4. **UI Display**: Statistics are formatted for the InfrastructureCard component

### Example Output for UI

```python
{
  "coverage": 60,              # Average coverage across all zones
  "totalFacilities": 24467,     # Total facilities in the city
  "status": "good",             # Derived from average coverage
  "label": "Good Coverage"       # Human-readable label
}
```

### Zone-Level Data

Each zone has detailed predictions:

```python
{
  "zone_id": "01",
  "zone_name": "Central",
  "predicted_coverage_score": 60.43,
  "coverage_label": "Good Coverage",
  "status": "good",
  "total_parks": 1516,
  "total_schools": 502,
  "total_hospitals": 43,
  "total_facilities": 2061
}
```

## Customization

### Adjusting Model Parameters

Edit the model initialization in `train_model()`:

```python
model = RandomForestRegressor(
    n_estimators=300,  # Increase for better performance
    max_depth=20,      # Adjust tree depth
    ...
)
```

### Using XGBoost Instead

Replace RandomForestRegressor with XGBRegressor:

```python
from xgboost import XGBRegressor

model = XGBRegressor(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42
)
```

### Changing Coverage Score Calculation

If you want to calculate coverage scores differently, modify the `calculate_coverage_score_from_features()` function:

```python
def calculate_coverage_score_from_features(features_df):
    # Modify the formula here
    score = ...
    return score
```

## Troubleshooting

### Missing Columns

If columns are missing from the input CSV:
- Check the column names in your CSV file
- Ensure all required columns are present
- The script will fail if critical columns are missing

### Small Dataset Warning

With only 9 zones, the train/test split results in very few test samples. For better validation:
- Consider using cross-validation instead of train/test split
- Collect more zone-level data
- Use cell-level data for training instead of zone-level aggregation

### Performance Issues

If model performance is poor:
- Check feature importance to identify important features
- Ensure feature scaling is working correctly
- Consider feature engineering or domain-specific features
- Try different algorithms (XGBoost, Gradient Boosting, etc.)

## Performance Notes

- Training time: ~1-5 seconds (small dataset)
- Prediction time: <1 second for typical city data
- Model size: ~100-500 KB (saved as .pkl files)

## Current Model Results

Based on the latest training:

- **Average Coverage**: 60.18%
- **Total Parks**: 18,200
- **Total Schools**: 5,728
- **Total Hospitals**: 539
- **Total Facilities**: 24,467
- **Zones**: 9 administrative zones
- **Coverage Distribution**: 8 zones with "Good Coverage" (88.9%), 1 zone "Needs Improvement" (11.1%)

## Future Enhancements

- Add support for time-series predictions for future coverage
- Implement spatial features (neighborhood effects, distance metrics)
- Add confidence intervals for predictions
- Create visualization outputs (maps, charts)
- Add API endpoint for real-time predictions
- Use cell-level data for training instead of zone-level aggregation
- Implement cross-validation for better model evaluation

## License

This model is part of the City Infrastructure Intelligence Platform.


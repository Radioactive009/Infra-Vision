# School Coverage Analysis Model

## Overview

This machine learning model analyzes school distribution across administrative zones in Delhi NCR and predicts coverage scores and labels for each zone. The model is designed to integrate with the City Infrastructure Intelligence Platform UI.

## Model Output Format

The model produces predictions that match the UI requirements:

### For Each Zone:
- **coverage_score**: Numeric score (0-100) representing school coverage quality
- **coverage_label**: Text label ("Excellent Coverage", "Good Coverage", or "Needs Improvement")
- **status**: UI status code ("excellent", "good", or "needs-improvement")
- **num_schools**: Total number of schools in the zone
- **total_enrolment**: Total student enrolment capacity

### For UI Card Display:
The model provides aggregated statistics that match the InfrastructureCard component:

```typescript
{
  coverage: 78,              // Average coverage percentage
  totalFacilities: 1247,     // Total number of schools
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
python school_coverage_model.py
```

This will:
- Load and clean school data from `delhi_schools_all.csv`
- Load administrative zones from `delhi_admin.geojson`
- Load or create population data from `delhi_population_zones.csv`
- Perform spatial joins to assign schools to zones
- Create engineered features
- Train a Random Forest model
- Evaluate the model and save it
- Generate predictions for all zones

### 2. Use Trained Model for Predictions

```bash
python predict_example.py
```

This demonstrates how to load a saved model and make predictions on new data.

## File Structure

```
.
├── school_coverage_model.py    # Main model training script
├── predict_example.py          # Example prediction script
├── requirements.txt            # Python dependencies
├── delhi_schools_all.csv       # School point data
├── delhi_admin.geojson         # Administrative zone boundaries
├── delhi_population_zones.csv  # Population data per zone (created if missing)
├── models/                     # Saved models (created after training)
│   ├── school_coverage_model.pkl
│   └── school_coverage_scaler.pkl
└── school_coverage_predictions.csv  # Prediction results
```

## Data Requirements

### Schools CSV (`delhi_schools_all.csv`)
Required columns (or similar):
- `school_id`: Unique identifier
- `name`: School name
- `latitude` / `longitude`: Coordinates (or columns with 'lat'/'lon' in name)
- `school_level`: Primary, Secondary, Senior Secondary
- `management_type`: Government, Private, Aided
- `enrolment_total`: Total student enrolment
- `student_teacher_ratio`: Student-to-teacher ratio

### Administrative Zones GeoJSON (`delhi_admin.geojson`)
Required properties:
- `zone_id`: Unique zone identifier
- `zone_name`: Zone name
- `geometry`: Polygon geometry

### Population CSV (`delhi_population_zones.csv`)
Required columns:
- `zone_id`: Matches zone_id in GeoJSON
- `population_total`: Total population
- `population_6_17`: School-age population (6-17 years)
- `literacy_rate`: Literacy rate (0-1)
- `urban_rural`: Urban or Rural classification

**Note**: If `delhi_population_zones.csv` doesn't exist, the script will create synthetic population data based on zone areas.

## Model Architecture

### Feature Engineering

The model creates the following features for each zone:

1. **Basic Counts**:
   - `num_schools`: Total number of schools
   - `num_primary_schools`, `num_secondary_schools`, `num_senior_secondary_schools`
   - `num_govt_schools`, `num_private_schools`

2. **Aggregated Metrics**:
   - `total_enrolment`: Sum of all school enrolments
   - `avg_enrolment`: Average enrolment per school
   - `avg_student_teacher_ratio`: Average student-teacher ratio

3. **Engineered Features**:
   - `schools_per_1000_children`: Schools per 1000 school-age children
   - `seat_capacity_per_100_children`: Enrolment capacity per 100 children
   - `school_level_diversity`: Diversity of school levels
   - `govt_school_ratio`: Proportion of government schools
   - `enrolment_per_school`: Average enrolment per school

4. **Demographic Features**:
   - `population_total`: Total population
   - `population_6_17`: School-age population
   - `literacy_rate`: Literacy rate

### Target Variable

The `coverage_score` is calculated using a rule-based formula:

```
coverage_score = 
  (schools_per_1000_children / 5 * 50) +           # 0-50 points
  (seat_capacity_per_100_children / 120 * 30) +    # 0-30 points
  (10 * (1 - (student_teacher_ratio - 20) / 30)) + # 0-10 points
  (literacy_rate * 10)                              # 0-10 points
```

This formula can be adjusted in the `calculate_coverage_score()` function.

### Model

- **Algorithm**: Random Forest Regressor
- **Hyperparameters**:
  - `n_estimators`: 100
  - `max_depth`: 10
  - `min_samples_split`: 5
  - `min_samples_leaf`: 2
- **Preprocessing**: StandardScaler for feature normalization

## Model Evaluation

The model is evaluated using:
- **R² Score**: Coefficient of determination
- **MAE**: Mean Absolute Error
- **RMSE**: Root Mean Squared Error

Results are displayed for both training and test sets.

## Integration with UI

### Data Flow

1. **Model Training**: `school_coverage_model.py` trains the model and saves it
2. **Prediction**: Model generates predictions for all zones
3. **Aggregation**: Predictions are aggregated to city-level statistics
4. **UI Display**: Statistics are formatted for the InfrastructureCard component

### Example Output for UI

```python
{
  "coverage": 78,              # Average coverage across all zones
  "totalFacilities": 1247,      # Total schools in the city
  "status": "good",             # Derived from average coverage
  "label": "Good Coverage"       # Human-readable label
}
```

### Zone-Level Data

Each zone has detailed predictions:

```python
{
  "zone_id": "01",
  "zone_name": "East Zone",
  "predicted_coverage_score": 78.5,
  "coverage_label": "Good Coverage",
  "status": "good",
  "num_schools": 45,
  "total_enrolment": 12500
}
```

## Customization

### Adjusting Coverage Score Formula

Edit the `calculate_coverage_score()` function in `school_coverage_model.py`:

```python
def calculate_coverage_score(features_df):
    # Modify the formula here
    score = ...
    return score
```

### Changing Model Parameters

Edit the model initialization in `train_model()`:

```python
model = RandomForestRegressor(
    n_estimators=200,  # Increase for better performance
    max_depth=15,      # Adjust tree depth
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

## Troubleshooting

### Missing Population Data

If `delhi_population_zones.csv` doesn't exist, the script will create synthetic data. For production, ensure you have real population data.

### Coordinate System Issues

The script automatically handles CRS conversion. If you encounter issues:
- Ensure school coordinates are in WGS84 (EPSG:4326)
- Check that zone boundaries are valid polygons

### Missing Columns

The script attempts to auto-detect column names. If columns are missing:
- Check the column names in your CSV files
- Add column mapping in the `load_schools_data()` function

## Performance Notes

- Training time: ~1-5 minutes depending on data size
- Prediction time: <1 second for typical city data
- Model size: ~1-5 MB (saved as .pkl files)

## Future Enhancements

- Add support for additional features (distance to nearest school, accessibility metrics)
- Implement time-series predictions for future coverage
- Add confidence intervals for predictions
- Create visualization outputs (maps, charts)
- Add API endpoint for real-time predictions

## License

This model is part of the City Infrastructure Intelligence Platform.










# Model to UI Connection Summary

## Overview

This document explains how the School Coverage Analysis Model connects to the City Infrastructure Intelligence Platform UI, specifically the `InfrastructureCard` component that displays school coverage information.

## UI Component Structure

The UI displays school coverage in a card component with:

1. **Coverage Percentage**: Large number (e.g., "78%")
2. **Coverage Label**: Badge text (e.g., "Good Coverage")
3. **Area Coverage**: Progress bar with facility count (e.g., "1247 facilities")

## Model Output Format

The model produces predictions for each administrative zone:

```python
{
    'zone_id': '01',
    'zone_name': 'East Zone',
    'predicted_coverage_score': 78.5,        # 0-100 score
    'coverage_label': 'Good Coverage',       # Text label
    'status': 'good',                         # UI status code
    'num_schools': 45,                        # Schools in zone
    'total_enrolment': 12500                  # Total capacity
}
```

## Mapping: Model → UI

### 1. Coverage Percentage (78%)

**Model Output**: `predicted_coverage_score` (0-100) for each zone

**UI Display**: Average coverage across all zones

**Code**:
```python
# From model predictions
avg_coverage = predictions['predicted_coverage_score'].mean()

# For UI
coverage = round(avg_coverage)  # e.g., 78
```

**Display**: Large bold text in top-right of card

### 2. Coverage Label ("Good Coverage")

**Model Output**: `coverage_label` ("Excellent Coverage", "Good Coverage", "Needs Improvement")

**UI Display**: Badge with colored background

**Code**:
```python
# From model predictions
label = predictions['coverage_label'].iloc[0]  # e.g., "Good Coverage"

# For UI status code
status = 'excellent' if avg_coverage >= 80 else \
         'good' if avg_coverage >= 60 else \
         'needs-improvement'
```

**Display**: Colored pill-shaped badge below percentage

**Color Mapping**:
- `excellent` (≥80) → Green gradient
- `good` (60-79) → Teal gradient
- `needs-improvement` (<60) → Orange gradient

### 3. Total Facilities ("1247 facilities")

**Model Output**: `num_schools` for each zone

**UI Display**: Sum of all schools across all zones

**Code**:
```python
# From model predictions
total_schools = predictions['num_schools'].sum()

# For UI
totalFacilities = int(total_schools)  # e.g., 1247
```

**Display**: Text on right side of "Area Coverage" bar

### 4. Area Coverage Bar

**Model Output**: `predicted_coverage_score` (0-100)

**UI Display**: Horizontal progress bar with width = coverage percentage

**Code**:
```python
# Bar width is percentage of coverage
bar_width = f"{coverage}%"  # e.g., "78%"
```

**Display**: Horizontal bar below description, filled to coverage percentage

## Complete Data Flow

### Step 1: Model Training

```bash
python school_coverage_model.py
```

**Outputs**:
- `models/school_coverage_model.pkl` - Trained model
- `models/school_coverage_scaler.pkl` - Feature scaler
- `school_coverage_predictions.csv` - Zone-level predictions

### Step 2: Load Predictions

```python
import pandas as pd

predictions = pd.read_csv('school_coverage_predictions.csv')
```

### Step 3: Aggregate for UI

```python
# Calculate city-level statistics
avg_coverage = predictions['predicted_coverage_score'].mean()
total_schools = predictions['num_schools'].sum()
status = 'excellent' if avg_coverage >= 80 else \
         'good' if avg_coverage >= 60 else \
         'needs-improvement'
```

### Step 4: Format for UI Component

```typescript
const schoolData = {
  title: "Analyze School Distribution in the City",
  description: "Comprehensive analysis of educational infrastructure...",
  Icon: GraduationCap,
  coverage: 78,              // From avg_coverage
  totalFacilities: 1247,     // From total_schools
  status: 'good'              // From status
};
```

## Coverage Score Thresholds

The model uses these thresholds to determine coverage labels:

- **Excellent Coverage**: score ≥ 80
- **Good Coverage**: 60 ≤ score < 80
- **Needs Improvement**: score < 60

These thresholds are implemented in the `score_to_label()` function:

```python
def score_to_label(score: float) -> str:
    if score >= 80:
        return "Excellent Coverage"
    elif score >= 60:
        return "Good Coverage"
    else:
        return "Needs Improvement"
```

## Example: Complete Integration

### Python Backend

```python
import pandas as pd
import joblib
from school_coverage_model import predict_school_coverage, get_feature_names

# Load model
model = joblib.load('models/school_coverage_model.pkl')
scaler = joblib.load('models/school_coverage_scaler.pkl')
feature_names = get_feature_names()

# Load data
schools_gdf = load_schools_data('delhi_schools_all.csv')
admin_gdf = load_admin_zones('delhi_admin.geojson')
population_df = load_or_create_population_data('delhi_population_zones.csv', admin_gdf)

# Generate predictions
predictions = predict_school_coverage(
    schools_gdf, admin_gdf, population_df, model, scaler, feature_names
)

# Aggregate for UI
avg_coverage = predictions['predicted_coverage_score'].mean()
total_schools = predictions['num_schools'].sum()
status = 'excellent' if avg_coverage >= 80 else \
         'good' if avg_coverage >= 60 else \
         'needs-improvement'

# Return to UI
ui_data = {
    'coverage': round(avg_coverage),
    'totalFacilities': int(total_schools),
    'status': status,
    'label': predictions['coverage_label'].iloc[0]
}
```

### React/TypeScript Frontend

```typescript
// API call
const response = await fetch('/api/school-coverage');
const data = await response.json();

// Use in InfrastructureCard
<InfrastructureCard
  title="Analyze School Distribution in the City"
  description="Comprehensive analysis of educational infrastructure..."
  Icon={GraduationCap}
  coverage={data.coverage}              // 78
  totalFacilities={data.totalFacilities} // 1247
  status={data.status}                   // 'good'
/>
```

## Zone-Level Visualization

The model also provides zone-level predictions for detailed visualization:

```python
# Zone-level data for grid visualization
zone_data = predictions[['zone_id', 'zone_name', 'predicted_coverage_score', 
                        'coverage_label', 'num_schools']].to_dict('records')
```

This can be used to create:
- Zone-level heatmaps
- Grid visualizations showing coverage by zone
- Detailed zone breakdowns

## Summary

The model provides three key outputs for the UI:

1. **Coverage Score (0-100)**: Converted to percentage for display
2. **Coverage Label**: Text label for the badge
3. **Total Facilities**: Count of schools for the "Area Coverage" text

These outputs directly map to the `InfrastructureCard` component:
- `coverage` → Coverage percentage
- `totalFacilities` → Total schools count
- `status` → Coverage status code

The model is designed to be easily integrated into any frontend framework through a simple API or data file.


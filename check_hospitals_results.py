"""
Quick script to check and verify hospital coverage model results.
Run this after training to verify everything is working correctly.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import joblib

BASE_DIR = Path(__file__).parent

print("="*60)
print("CHECKING HOSPITAL COVERAGE MODEL RESULTS")
print("="*60)

# Step 1: Check if predictions file exists
predictions_file = BASE_DIR / "hospital_coverage_predictions.csv"
if not predictions_file.exists():
    print("\n❌ ERROR: Predictions file not found!")
    print("   Run 'python hospital_coverage_model.py' first to generate predictions.")
    exit(1)

print("\n✅ Predictions file found")

# Step 2: Load and check predictions
predictions = pd.read_csv(predictions_file)
print(f"\n✅ Loaded {len(predictions)} zone predictions")

# Step 3: Verify data structure
print("\n" + "="*60)
print("DATA STRUCTURE CHECK")
print("="*60)
required_cols = ['zone_id', 'zone_name', 'predicted_coverage_score', 
                 'coverage_label', 'num_facilities']
missing_cols = [col for col in required_cols if col not in predictions.columns]
if missing_cols:
    print(f"❌ Missing columns: {missing_cols}")
else:
    print("✅ All required columns present")

# Step 4: Check coverage scores
print("\n" + "="*60)
print("COVERAGE SCORES CHECK")
print("="*60)
scores = predictions['predicted_coverage_score']
print(f"  Score range: {scores.min():.1f} - {scores.max():.1f}")
print(f"  Average score: {scores.mean():.1f}%")
print(f"  Scores in valid range (0-100): {(scores.between(0, 100)).all()}")

if (scores.between(0, 100)).all():
    print("✅ All scores are in valid range")
else:
    print("❌ Some scores are outside valid range (0-100)")

# Step 5: Check coverage labels
print("\n" + "="*60)
print("COVERAGE LABELS CHECK")
print("="*60)
valid_labels = ['Excellent Coverage', 'Good Coverage', 'Needs Improvement']
labels = predictions['coverage_label'].unique()
print(f"  Unique labels: {labels}")
print(f"  Label distribution:")
print(predictions['coverage_label'].value_counts())

if all(label in valid_labels for label in labels):
    print("✅ All labels are valid")
else:
    print("❌ Some labels are invalid")

# Step 6: Check facility counts
print("\n" + "="*60)
print("FACILITY COUNTS CHECK")
print("="*60)
total_facilities = predictions['num_facilities'].sum()
avg_facilities = predictions['num_facilities'].mean()
print(f"  Total facilities: {total_facilities}")
print(f"  Average facilities per zone: {avg_facilities:.1f}")
print(f"  Zones with facilities: {(predictions['num_facilities'] > 0).sum()}")
print(f"  Zones with 0 facilities: {(predictions['num_facilities'] == 0).sum()}")

if total_facilities > 0:
    print("✅ Facilities are assigned to zones")
else:
    print("❌ No facilities assigned to zones")

# Step 7: Check capacity data
print("\n" + "="*60)
print("CAPACITY DATA CHECK")
print("="*60)
if 'total_capacity' in predictions.columns:
    total_capacity = predictions['total_capacity'].sum()
    print(f"  Total capacity: {total_capacity:,.0f}")
    if total_capacity > 0:
        print("✅ Capacity data present")
    else:
        print("⚠️  WARNING: Capacity data is missing (all zeros)")
        print("   This will affect coverage scores. Check your CSV for capacity/bed columns.")
else:
    print("⚠️  WARNING: Capacity column not found")

# Step 8: Check model files
print("\n" + "="*60)
print("MODEL FILES CHECK")
print("="*60)
model_file = BASE_DIR / "models" / "hospital_coverage_model.pkl"
scaler_file = BASE_DIR / "models" / "hospital_coverage_scaler.pkl"

if model_file.exists():
    print("✅ Model file found")
    try:
        model = joblib.load(model_file)
        print(f"   Model type: {type(model).__name__}")
        print(f"   Number of features: {model.n_features_in_}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
else:
    print("❌ Model file not found")

if scaler_file.exists():
    print("✅ Scaler file found")
else:
    print("❌ Scaler file not found")

# Step 9: Calculate UI integration data
print("\n" + "="*60)
print("UI INTEGRATION DATA")
print("="*60)
avg_coverage = predictions['predicted_coverage_score'].mean()
total_facilities = predictions['num_facilities'].sum()
status = 'excellent' if avg_coverage >= 80 else \
         'good' if avg_coverage >= 60 else \
         'needs-improvement'

print(f"  coverage: {round(avg_coverage)}")
print(f"  totalFacilities: {total_facilities}")
print(f"  status: '{status}'")
print(f"  label: '{predictions['coverage_label'].iloc[0]}'")

# Step 10: Display sample predictions
print("\n" + "="*60)
print("SAMPLE PREDICTIONS")
print("="*60)
display_cols = ['zone_id', 'zone_name', 'predicted_coverage_score', 
               'coverage_label', 'num_facilities']
if 'total_capacity' in predictions.columns:
    display_cols.append('total_capacity')

print(predictions[display_cols].head(10).to_string(index=False))

# Step 11: Summary
print("\n" + "="*60)
print("SUMMARY")
print("="*60)

issues = []
warnings = []

if not (scores.between(0, 100)).all():
    issues.append("Some coverage scores are outside valid range")

if total_facilities == 0:
    issues.append("No facilities assigned to zones")

if 'total_capacity' in predictions.columns:
    if predictions['total_capacity'].sum() == 0:
        warnings.append("Capacity data is missing (affects coverage scores)")

if not model_file.exists():
    issues.append("Model file not found")

if issues:
    print("\n❌ ISSUES FOUND:")
    for issue in issues:
        print(f"   - {issue}")

if warnings:
    print("\n⚠️  WARNINGS:")
    for warning in warnings:
        print(f"   - {warning}")

if not issues and not warnings:
    print("\n✅ All checks passed! Model results look good.")
elif not issues:
    print("\n✅ No critical issues. Model is working, but check warnings above.")
else:
    print("\n❌ Some issues found. Please review and fix before using in production.")

print("\n" + "="*60)
print("NEXT STEPS")
print("="*60)
print("""
1. Review the predictions in hospital_coverage_predictions.csv
2. If capacity data is missing, check your CSV for capacity/bed columns
3. If only few facilities are assigned, consider:
   - Getting complete zone boundaries GeoJSON
   - Using use_nearest=True to assign facilities to nearest zones
4. Verify UI integration data matches your requirements
5. Copy predictions CSV to infra-vision/data/hospital_coverage_predictions.csv
""")

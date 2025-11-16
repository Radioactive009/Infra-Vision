# preprocess_parks.py
# Run: python3 preprocess_parks.py
# First time (if needed): pip install pandas openpyxl unidecode geopandas shapely pyproj fiona rtree tqdm

import os, re, glob, math, json
import pandas as pd
from tqdm import tqdm
from unidecode import unidecode

# ---- Config ----
INPUT_DIR = "."                      # run from the BDA folder
OUT_CSV   = "parks_preprocessed.csv"
OUT_GEO   = "parks_preprocessed.geojson"   # written only if coords exist
NEAR_DUP_RADIUS_M = 200.0            # merge duplicates <= 200 m apart

# ---- Helpers ----
def as_str(x): 
    return "" if pd.isna(x) else str(x)

def clean_text(x: str) -> str:
    x = unidecode(as_str(x)).strip()
    x = re.sub(r"\s+", " ", x)
    return x

def norm_key(name: str, locality: str="", zone: str="", city: str="") -> str:
    s = " | ".join([as_str(name), as_str(locality), as_str(zone), as_str(city)])
    s = unidecode(s.lower())
    s = re.sub(r"[^a-z0-9]+", " ", s)
    # remove synonyms that don’t help distinguish duplicates
    s = re.sub(r"\b(park|garden|bagh|udyan|udyaan|parkland|green|area)\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def to_float(x):
    try:
        return float(str(x).replace(",", "").strip())
    except Exception:
        return None

def valid_lat_lon(lat, lon):
    return lat is not None and lon is not None and -90 <= lat <= 90 and -180 <= lon <= 180

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlbd = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dlbd/2)**2
    return 2*R*math.asin(math.sqrt(a))

# Candidate header patterns
NAME_PATS      = [r"^name$", r"park.?name", r"^park$", r"^garden$", r"title", r"^place$", r"^site$"]
LOCALITY_PATS  = [r"locality", r"area", r"colony", r"sector", r"address", r"location"]
ZONE_PATS      = [r"zone", r"ward", r"circle"]
CITY_PATS      = [r"city", r"district", r"mcd", r"ndmc", r"delhi|gurugram"]
LAT_PATS       = [r"^lat", r"latitude"]
LON_PATS       = [r"^lon|^lng|long"]

def find_col(cols, patterns):
    for pat in patterns:
        rx = re.compile(pat, re.I)
        for c in cols:
            if rx.search(str(c)):
                return c
    return None

# ---- 1) Read all Excel/CSV (all sheets) ----
paths = glob.glob(os.path.join(INPUT_DIR, "*.xlsx")) + \
        glob.glob(os.path.join(INPUT_DIR, "*.xls"))  + \
        glob.glob(os.path.join(INPUT_DIR, "*.csv"))

frames = []
for p in paths:
    try:
        if p.lower().endswith(".csv"):
            df = pd.read_csv(p)
            dfs = [("sheet1", df)]
        else:
            xls = pd.ExcelFile(p)
            dfs = [(s, xls.parse(s)) for s in xls.sheet_names]
    except Exception as e:
        print(f"[skip] {p} -> {e}")
        continue

    for sheet_name, df in dfs:
        if df.empty: 
            continue
        cols = list(df.columns)

        c_name     = find_col(cols, NAME_PATS)     or find_col(cols, [r"name", r"park"])
        if not c_name: 
            continue
        c_locality = find_col(cols, LOCALITY_PATS)
        c_zone     = find_col(cols, ZONE_PATS)
        c_city     = find_col(cols, CITY_PATS)
        c_lat      = find_col(cols, LAT_PATS)
        c_lon      = find_col(cols, LON_PATS)

        keep = {"ParkName": df[c_name].map(clean_text)}
        keep["Locality"] = df[c_locality].map(clean_text) if c_locality else ""
        keep["Zone"]     = df[c_zone].map(clean_text)     if c_zone else ""
        keep["City"]     = df[c_city].map(clean_text)     if c_city else ""
        keep["Source"]   = os.path.basename(p) + (f"::{sheet_name}" if sheet_name else "")

        if c_lat: keep["Latitude_raw"]  = df[c_lat]
        if c_lon: keep["Longitude_raw"] = df[c_lon]

        frames.append(pd.DataFrame(keep))

raw = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=[
    "ParkName","Locality","Zone","City","Source","Latitude_raw","Longitude_raw"
])

if raw.empty:
    raise SystemExit("No usable data found. Check column names.")

# ---- 2) Clean text & initial filter ----
raw["ParkName"] = raw["ParkName"].astype(str)
raw["Locality"] = raw["Locality"].astype(str)
raw["Zone"]     = raw["Zone"].astype(str)
raw["City"]     = raw["City"].astype(str)

# Normalize case/spaces
for c in ["ParkName","Locality","Zone","City"]:
    raw[c] = raw[c].apply(clean_text)

# Drop rows with empty name
raw = raw[raw["ParkName"].str.len() > 0].copy()

# ---- 3) Standardize coordinates if present ----
lat = raw.get("Latitude_raw")
lon = raw.get("Longitude_raw")
if lat is not None and lon is not None:
    raw["Latitude"]  = lat.apply(to_float)
    raw["Longitude"] = lon.apply(to_float)
else:
    raw["Latitude"]  = None
    raw["Longitude"] = None

# Remove invalid coords; round good ones
raw.loc[~raw.apply(lambda r: valid_lat_lon(r["Latitude"], r["Longitude"]), axis=1), ["Latitude","Longitude"]] = [None, None]
raw["Latitude"]  = raw["Latitude"].round(6)
raw["Longitude"] = raw["Longitude"].round(6)

# ---- 4) Dedupe by normalized key ----
raw["NormKey"] = raw.apply(lambda r: norm_key(r["ParkName"], r["Locality"], r["Zone"], r["City"]), axis=1)
raw = raw.drop_duplicates(subset=["NormKey"]).reset_index(drop=True)

# ---- 5) Merge near-duplicates that still share the same key (<=200 m) ----
# keep first non-null coordinate; if multiple with coords within radius, keep the first
def merge_near_dups(df):
    df = df.sort_values(["NormKey"]).reset_index(drop=True)
    keep = []
    seen = {}  # key -> list of (lat,lon)
    for i, r in df.iterrows():
        k = r["NormKey"]
        lat, lon = r["Latitude"], r["Longitude"]
        if k not in seen:
            seen[k] = []
        drop = False
        if lat is not None and lon is not None:
            for (a,b) in seen[k]:
                if haversine(lat, lon, a, b) <= NEAR_DUP_RADIUS_M:
                    drop = True
                    break
            if not drop:
                seen[k].append((lat, lon))
        keep.append(not drop)
    return df[keep].reset_index(drop=True)

clean = merge_near_dups(raw)

# ---- 6) Final tidy columns ----
final_cols = ["ParkName","Locality","Zone","City","Latitude","Longitude","Source"]
final = clean[final_cols].copy()

# Report
total_in   = len(raw)
total_out  = len(final)
with_coords = final["Latitude"].notna().sum()
print(json.dumps({
    "input_rows": int(total_in),
    "output_rows": int(total_out),
    "with_coordinates": int(with_coords),
    "without_coordinates": int(total_out - with_coords)
}, indent=2))

# ---- 7) Save CSV ----
final.to_csv(OUT_CSV, index=False, encoding="utf-8")
print(f"Saved CSV -> {OUT_CSV}  (rows: {len(final)})")

# ---- 8) Save GeoJSON if any coords exist ----
try:
    if final["Latitude"].notna().any() and final["Longitude"].notna().any():
        import geopandas as gpd
        from shapely.geometry import Point
        gdf = gpd.GeoDataFrame(
            final,
            geometry=[Point(xy) if pd.notna(xy[0]) and pd.notna(xy[1]) else None
                      for xy in zip(final["Longitude"], final["Latitude"])],
            crs="EPSG:4326"
        ).dropna(subset=["geometry"])
        if not gdf.empty:
            gdf.to_file(OUT_GEO, driver="GeoJSON")
            print(f"Saved GeoJSON -> {OUT_GEO}  (features: {len(gdf)})")
except Exception as e:
    print("[geojson skipped]", e)

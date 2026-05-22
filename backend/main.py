import io
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Headless engine to prevent GUI crashes inside VM
import matplotlib.pyplot as plt
import seaborn as sns

app = FastAPI(title="🌲 ForestFireAI Advanced Analytics Node")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_clean_df():
    """Pulls data logs from MongoDB and ensures data types are flawless."""
    client = MongoClient("mongodb://localhost:27017/")
    db = client["forestfire_db"]
    collection = db["weather_telemetry"]
    
    cursor = list(collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(1000))
    if not cursor:
        return pd.DataFrame()
    
    df = pd.DataFrame(cursor)
    df = df.iloc[::-1].reset_index(drop=True)
    
    # Cast variables securely to handle potential calculation gaps
    for col in ['temperature_c', 'relative_humidity', 'wind_speed_kmh', 'fire_risk_index']:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(25.0)
    
    df['timestamp_dt'] = pd.to_datetime(df['timestamp'])
    return df

@app.get("/api/current-predictions")
def get_current_predictions():
    client = MongoClient("mongodb://localhost:27017/")
    collection = client["forestfire_db"]["weather_telemetry"]
    regions = [
        "Mudumalai National Park", "Bandipur Tiger Reserve", 
        "Anamalai Tiger Reserve", "Wayanad Wildlife Sanctuary", "Silent Valley National Park"
    ]
    snapshots = []
    for r in regions:
        last = collection.find_one({"region": r}, {"_id": 0}, sort=[("timestamp", -1)])
        if last:
            snapshots.append(last)
    return {"status": "success", "predictions": snapshots}

# --- 📊 VISUALIZATION ENDPOINT 1: DE-CONGESTED 1-MINUTE TREND CHART ---
@app.get("/api/charts/minute-trends")
def get_minute_trends():
    df = get_clean_df()
    if df.empty or len(df) < 10:
        raise HTTPException(status_code=404, detail="Insufficient data points.")
    
    # Mathematical aggregation step: Group timestamps into clear 1-minute buckets per region
    df['minute_bucket'] = df['timestamp_dt'].dt.strftime('%H:%M')
    minute_avg = df.groupby(['minute_bucket', 'region'])['fire_risk_index'].mean().reset_index()
    
    plt.clf()
    fig, ax = plt.subplots(figsize=(10, 4.8))
    fig.patch.set_facecolor('#fdfbf7')  # Matching corporate beige canvas
    ax.set_facecolor('#ffffff')
    
    # Dynamic styling matching your color scheme
    colors = ["#e67e22", "#d35400", "#5d4037", "#27ae60", "#2980b9"]
    
    for idx, region in enumerate(minute_avg['region'].unique()):
        reg_df = minute_avg[minute_avg['region'] == region].tail(10)  # Show latest 10 minutes max
        ax.plot(reg_df['minute_bucket'], reg_df['fire_risk_index'], 
                marker='o', linewidth=2.5, color=colors[idx % len(colors)], label=region)
    
    ax.set_title("Spacious 1-Minute Aggregated Threat Matrix (De-congested View)", fontsize=12, fontweight='bold', color='#3e2723', pad=12)
    ax.set_xlabel("Time Horizon (Hours:Minutes)", fontweight='bold', color='#5d4037')
    ax.set_ylabel("Mean Fire Risk Index (0-100)", fontweight='bold', color='#5d4037')
    ax.set_ylim(0, 105)
    ax.grid(True, linestyle='--', alpha=0.5, color='#d7ccc8')
    ax.legend(loc="upper left", frameon=True, facecolor='#ffffff', edgecolor='#d7ccc8', fontsize=9)
    
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', facecolor=fig.get_facecolor(), dpi=100)
    buf.seek(0)
    plt.close(fig)
    return Response(content=buf.getvalue(), media_type="image/png")

# --- 📊 VISUALIZATION ENDPOINT 2: DEEP-DIVE SEABORN HEATMAP MATRIX ---
@app.get("/api/charts/correlation-matrix")
def get_correlation_matrix():
    df = get_clean_df()
    if df.empty:
        raise HTTPException(status_code=404, detail="No active data lake available.")
        
    # 1. Translate engineering variables to everyday plain English labels
    matrix_df = df[['temperature_c', 'relative_humidity', 'wind_speed_kmh', 'fire_risk_index']].copy()
    matrix_df.columns = ['Air Temperature', 'Air Moisture', 'Wind Speed', 'Wildfire Threat']
    
    # Calculate the raw Pearson correlation coefficients
    corr_matrix = matrix_df.corr()
    
    # 2. Generate a mask to hide the redundant upper triangle (De-cluttering step)
    mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
    
    plt.clf()
    fig, ax = plt.subplots(figsize=(7, 5))
    fig.patch.set_facecolor('#fdfbf7')  # Blends into your custom dashboard beige canvas
    ax.set_facecolor('#ffffff')
    
    # 3. Create an intuitive custom palette: Green (Safe/Cooling) to Orange/Red (Fire Danger)
    # Neutral/Zero correlation maps to a soft gray
    custom_cmap = sns.diverging_palette(130, 25, s=95, l=45, center="light", as_cmap=True)
    
    # Draw the clean, user-focused heatmap
    sns.heatmap(
        corr_matrix, 
        mask=mask, 
        annot=True, 
        cmap=custom_cmap, 
        vmin=-1, 
        vmax=1, 
        fmt=".2f", 
        ax=ax,
        linewidths=2, 
        linecolor='#fdfbf7',
        cbar_kws={'label': 'Relationship Strength (Cooling Effect ➔ Danger Driver)'},
        annot_kws={"weight": "bold", "size": 12}
    )
    
    ax.set_title("How Environmental Elements Control Fire Risk", fontsize=12, fontweight='bold', color='#3e2723', pad=18)
    plt.xticks(rotation=15, fontweight='bold', color='#5d4037', ha='right')
    plt.yticks(rotation=0, fontweight='bold', color='#5d4037')
    
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', facecolor=fig.get_facecolor(), dpi=110)
    buf.seek(0)
    plt.close(fig)
    return Response(content=buf.getvalue(), media_type="image/png")

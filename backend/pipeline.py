import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pymongo import MongoClient
import io
import base64

def run_analytics_pipeline():
    print("Pulling time-series rows from local Docker MongoDB...")
    
    # 1. DATA EXTRACT LAYER (MongoDB to Pandas)
    client = MongoClient("mongodb://localhost:27017/")
    db = client["forest_fire_db"]
    collection = db["weather_telemetry"]
    
    cursor = collection.find({}, {"_id": 0})
    raw_data = list(cursor)
    
    if not raw_data:
        print(" Error: Data lake is empty. Run seed_data.py first.")
        return None, None

    # Load into a structural Pandas DataFrame
    df = pd.DataFrame(raw_data)
    
    # 2. DATA TRANSFORM & CLEANING LAYER (Pandas Timeline Management)
    # Convert string timestamps into a high-performance Pandas DatetimeIndex
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df.set_index('timestamp', inplace=True)
    df.sort_index(inplace=True)
    
    # The Core Pandas Feature: Compute a rolling 24-hour rainfall sum
    # If it has rained > 2mm in the past day, floor moisture drops fire risk
    df['rolling_rain_24h'] = df['rain_mm'].rolling(window=24, min_periods=1).sum()

    # 3. VECTOR MATHEMATICS ENGINE (NumPy Risk Score Generation)
    # Scale A: Temperature Component (Max weight 45 points)
    temp_score = (df['temperature_c'] / 43.0) * 45.0
    
    # Scale B: Relative Humidity Component (Max weight 20 points - Inverse relationship)
    humidity_score = ((100.0 - df['relative_humidity']) / 100.0) * 20.0
    
    # Scale C: Wind Component (Max weight 35 points)
    wind_score = (df['wind_speed_kmh'] / 45.0) * 35.0
    
    # Calculate initial aggregate index array
    df['fire_risk_index'] = temp_score + humidity_score + wind_score
    
    # Apply the Rain Suppression Rule: If rolling rain > 2mm, slash risk score by 80%
    df['fire_risk_index'] = np.where(df['rolling_rain_24h'] > 2.0, df['fire_risk_index'] * 0.2, df['fire_risk_index'])
    
    # Standardize results using clip to guarantee mathematical boundary limits between 0 and 100
    df['fire_risk_index'] = np.clip(df['fire_risk_index'], 0, 100).astype(int)

    # 4. DATA VISUALIZATION ENGINE (Matplotlib / Seaborn Reports)
    plt.figure(figsize=(11, 5))
    sns.set_theme(style="darkgrid")
    
    # Pull out a static 7-day analytical slice (168 hours) to chart cleanly
    weekly_slice = df.iloc[-168:]
    
    # Build a sophisticated multi-variable Matplotlib visualization
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
    
    # Plot 1: Environmental Stress Vectors
    sns.lineplot(data=weekly_slice, x=weekly_slice.index, y='temperature_c', ax=ax1, color='#ef4444', label='Temperature (°C)')
    ax1_twin = ax1.twinx()
    sns.lineplot(data=weekly_slice, x=weekly_slice.index, y='relative_humidity', ax=ax1_twin, color='#3b82f6', label='Humidity (%)')
    ax1.set_title('Atmospheric Telemetry vs. Calculated Fire Risk Index (7-Day Horizon)')
    ax1.set_ylabel('Temperature (°C)')
    ax1_twin.set_ylabel('Humidity (%)')
    
    # Plot 2: Our Computed Risk Output Line
    sns.lineplot(data=weekly_slice, x=weekly_slice.index, y='fire_risk_index', ax=ax2, color='#f97316', linewidth=2.5, label='Fire Risk Index (0-100)')
    # Visually fill the high alert threshold zones
    ax2.axhspan(85, 100, color='#fee2e2', alpha=0.5, label='Extreme Risk Zone')
    ax2.set_ylabel('Risk Index Scale')
    ax2.set_xlabel('Timeline Metrics')
    ax2.set_ylim(0, 100)
    
    plt.tight_layout()
    
    # Convert the chart directly into a binary byte stream 
    # This allows us to pipe the image to React over network ports without cluttering the local disk!
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png', bbox_inches='tight', dpi=150)
    img_buf.seek(0)
    chart_bytes = img_buf.getvalue()
    plt.close()
    
    print(" DataFrame analytical matrix compilation complete.")
    
    # Convert records to JSON-friendly layout for web transfer
    records = df.reset_index()
    records['timestamp'] = records['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
    return records.to_dict(orient="records"), chart_bytes

if __name__ == "__main__":
    run_analytics_pipeline()

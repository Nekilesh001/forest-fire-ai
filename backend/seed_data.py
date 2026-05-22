import pandas as pd
import numpy as np
from pymongo import MongoClient
import sys

def seed_forest_fire_data():
    print("---... Connecting to local Docker MongoDB instance...")
    try:
        # Connect to the local MongoDB container port
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        db = client["forest_fire_db"]
        collection = db["weather_telemetry"]
        
        # Clean up any old data before seeding a fresh batch
        collection.delete_many({})
        
        print("📅 Generating 30 days of hourly environmental time-series logs...")
        # Create a timeline window spanning 720 hourly rows (30 days * 24 hours)
        date_range = pd.date_range(start="2026-05-01", periods=720, freq="h")
        
        # Generate realistic fluctuating climate variables using NumPy distributions
        np.random.seed(42)  # For consistent mock results
        temperatures = np.random.uniform(15, 43, size=720)
        humidity = np.random.uniform(10, 95, size=720)
        wind_speed = np.random.uniform(5, 45, size=720)
        
        # Simulating occasional rain patterns (mostly 0, with occasional downpours)
        rain = np.random.choice([0.0, 0.0, 0.0, 0.0, 5.2, 12.0, 0.0], size=720)

        # Assemble everything cleanly into a list of document objects
        payload = []
        for i in range(720):
            document = {
                "timestamp": date_range[i].isoformat(),
                "temperature_c": float(temperatures[i]),
                "relative_humidity": float(humidity[i]),
                "wind_speed_kmh": float(wind_speed[i]),
                "rain_mm": float(rain[i])
            }
            payload.append(document)
            
        print(block := f" Bulk writing {len(payload)} tracking rows to the database...")
        collection.insert_many(payload)
        print(" Data Lake seeding execution successful!")
        
    except Exception as e:
        print(f" Database connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_forest_fire_data()

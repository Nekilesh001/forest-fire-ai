import time
import random
from datetime import datetime
from pymongo import MongoClient

def run_real_earth_simulator():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["forestfire_db"]
    collection = db["weather_telemetry"]
    
    print("🛰️ Real-Earth Multi-Region Sensor Ingestion Network Online...")
    print("🚀 Streaming live localized data packets every 3 seconds. Press Ctrl+C to stop.\n")
    
    # 1. Map out the 5 actual physical forest reserves with their real GPS positions
    real_locations = [
        {"name": "Mudumalai National Park", "lat": 11.5622, "lon": 76.5345, "temp_base": 28.0, "humid_base": 65.0},
        {"name": "Bandipur Tiger Reserve", "lat": 11.6640, "lon": 76.6291, "temp_base": 27.5, "humid_base": 60.0},
        {"name": "Anamalai Tiger Reserve", "lat": 10.3950, "lon": 76.9647, "temp_base": 24.0, "humid_base": 75.0},
        {"name": "Wayanad Wildlife Sanctuary", "lat": 11.6923, "lon": 76.2422, "temp_base": 26.0, "humid_base": 70.0},
        {"name": "Silent Valley National Park", "lat": 11.1300, "lon": 76.4300, "temp_base": 22.0, "humid_base": 85.0}
    ]
    
    try:
        while True:
            now = datetime.now()
            timestamp_str = now.strftime("%Y-%m-%d %H:%M:%S")
            hour = now.hour
            
            for loc in real_locations:
                # 2. Simulate realistic circadian day/night temperature cycles
                time_modifier = 5.0 if (11 <= hour <= 16) else (-4.0 if (0 <= hour <= 5) else 0.0)
                
                temp = loc["temp_base"] + time_modifier + random.uniform(-2.0, 2.0)
                humid = loc["humid_base"] - (time_modifier * 1.5) + random.uniform(-5.0, 5.0)
                wind = random.uniform(5.0, 35.0)
                
                # Dynamic risk formula calculation directly stored at packet baseline
                risk = int(temp * 1.2 + (wind * 0.4) - (humid * 0.3))
                if humid > 80: risk -= 20
                risk = max(0, min(100, risk))
                
                payload = {
                    "region": loc["name"],
                    "latitude": loc["lat"],
                    "longitude": loc["lon"],
                    "timestamp": timestamp_str,
                    "temperature_c": round(temp, 1),
                    "relative_humidity": round(max(5.0, min(95.0, humid)), 0),
                    "wind_speed_kmh": round(wind, 1),
                    "fire_risk_index": risk
                }
                
                collection.insert_one(payload)
                
            print(f"📡 [LIVE TRANSMISSION] Synchronized batch update dispatched for 5 Earth positions @ {timestamp_str.split(' ')[1]}")
            time.sleep(3)
            
    except KeyboardInterrupt:
        print("\n🛑 Disconnected data ingestion worker safely.")
        client.close()

if __name__ == "__main__":
    run_real_earth_simulator()

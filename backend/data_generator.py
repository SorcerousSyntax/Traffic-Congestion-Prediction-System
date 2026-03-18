"""
Synthetic Traffic Data Generator
Generates realistic traffic sensor data with realistic patterns:
- Morning peak (8-9 AM)
- Evening peak (5-7 PM)
- Weekend patterns
- 6 sensor locations
- 90 days of data at 5-min intervals
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

np.random.seed(42)

SENSOR_LOCATIONS = [
    {"id": "S1", "name": "Downtown Main", "lat": 40.7128, "lon": -74.0060, "base_congestion": 0.6},
    {"id": "S2", "name": "Highway 101 North", "lat": 40.7589, "lon": -73.9851, "base_congestion": 0.4},
    {"id": "S3", "name": "Bridge Entry", "lat": 40.7484, "lon": -73.9857, "base_congestion": 0.5},
    {"id": "S4", "name": "Business District", "lat": 40.7614, "lon": -73.9776, "base_congestion": 0.7},
    {"id": "S5", "name": "University Zone", "lat": 40.7295, "lon": -73.9965, "base_congestion": 0.3},
    {"id": "S6", "name": "Shopping Center", "lat": 40.7831, "lon": -73.9712, "base_congestion": 0.45},
]

def generate_time_features(timestamps):
    """Generate time-based features from timestamps."""
    features = []
    for ts in timestamps:
        hour = ts.hour
        minute = ts.minute
        day_of_week = ts.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        
        time_of_day = hour + minute / 60.0
        
        features.append({
            "time_of_day": time_of_day,
            "hour": hour,
            "minute": minute,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
        })
    return features

def calculate_congestion_pattern(hour, is_weekend, base_congestion):
    """Calculate congestion based on time patterns."""
    if is_weekend:
        if 11 <= hour <= 14:
            return base_congestion * 1.3
        elif 18 <= hour <= 21:
            return base_congestion * 1.2
        return base_congestion * 0.8
    else:
        if 8 <= hour <= 9:
            return base_congestion * 1.8
        elif 17 <= hour <= 19:
            return base_congestion * 2.0
        elif 7 <= hour <= 10 or 16 <= hour <= 20:
            return base_congestion * 1.4
        elif 0 <= hour <= 5:
            return base_congestion * 0.3
        return base_congestion

def generate_sensor_data(sensor, start_date, num_samples):
    """Generate data for a single sensor."""
    data = []
    current_time = start_date
    
    for i in range(num_samples):
        time_features = generate_time_features([current_time])[0]
        
        base_cong = calculate_congestion_pattern(
            time_features["hour"],
            time_features["is_weekend"],
            sensor["base_congestion"]
        )
        
        random_factor = np.random.normal(0, 0.1)
        congestion_level = np.clip(base_cong + random_factor, 0.1, 1.0)
        
        speed = 80 - (congestion_level * 60) + np.random.normal(0, 5)
        speed = np.clip(speed, 10, 80)
        
        volume = 500 + (congestion_level * 2000) + np.random.normal(0, 200)
        volume = np.clip(volume, 100, 3000)
        
        density = volume / max(speed, 1) * 10
        
        data.append({
            "timestamp": current_time.isoformat(),
            "sensor_id": sensor["id"],
            "speed": round(speed, 2),
            "volume": round(volume, 2),
            "density": round(density, 2),
            "congestion": round(congestion_level, 3),
            "time_of_day": time_features["time_of_day"],
            "is_weekend": time_features["is_weekend"],
        })
        
        current_time += timedelta(minutes=5)
    
    return data

def generate_all_sensors_data():
    """Generate data for all sensors."""
    start_date = datetime(2024, 1, 1, 0, 0, 0)
    num_days = 90
    samples_per_day = 288
    total_samples = num_days * samples_per_day
    
    all_data = []
    
    print(f"Generating {num_days} days of traffic data for {len(SENSOR_LOCATIONS)} sensors...")
    print(f"Total samples per sensor: {total_samples}")
    
    for sensor in SENSOR_LOCATIONS:
        print(f"  Generating data for {sensor['id']} - {sensor['name']}...")
        sensor_data = generate_sensor_data(sensor, start_date, total_samples)
        all_data.extend(sensor_data)
    
    df = pd.DataFrame(all_data)
    
    os.makedirs("models", exist_ok=True)
    df.to_csv("models/traffic_data.csv", index=False)
    print(f"\nData saved to models/traffic_data.csv")
    print(f"Total records: {len(df)}")
    print(f"\nData sample:")
    print(df.head(10))
    print(f"\nCongestion distribution:")
    print(df.groupby(pd.cut(df['congestion'], bins=[0, 0.3, 0.5, 0.7, 1.0], 
                           labels=['Low', 'Medium', 'High', 'Critical'])).size())
    
    return df

def get_live_readings():
    """Generate current live readings for all sensors."""
    current_hour = datetime.now().hour
    current_minute = datetime.now().minute
    is_weekend = 1 if datetime.now().weekday() >= 5 else 0
    
    readings = []
    for sensor in SENSOR_LOCATIONS:
        base_cong = calculate_congestion_pattern(current_hour, is_weekend, sensor["base_congestion"])
        random_factor = np.random.normal(0, 0.08)
        congestion = np.clip(base_cong + random_factor, 0.1, 1.0)
        
        speed = 80 - (congestion * 60) + np.random.normal(0, 3)
        speed = np.clip(speed, 10, 80)
        
        volume = 500 + (congestion * 2000) + np.random.normal(0, 150)
        volume = np.clip(volume, 100, 3000)
        
        readings.append({
            "sensor_id": sensor["id"],
            "name": sensor["name"],
            "lat": sensor["lat"],
            "lon": sensor["lon"],
            "congestion": round(congestion, 3),
            "speed": round(speed, 1),
            "volume": round(volume, 0),
            "status": get_status(congestion),
        })
    
    return readings

def get_status(congestion):
    """Get status label based on congestion level."""
    if congestion < 0.3:
        return "low"
    elif congestion < 0.5:
        return "medium"
    elif congestion < 0.7:
        return "high"
    else:
        return "critical"

if __name__ == "__main__":
    df = generate_all_sensors_data()
    print("\n=== Live Readings Test ===")
    print(get_live_readings())
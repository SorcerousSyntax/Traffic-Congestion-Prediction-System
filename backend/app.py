"""
Flask API for Real-Time Traffic Congestion Prediction System
=============================================================
Uses TomTom Traffic API for real-time data
Falls back to synthetic data if API is unavailable
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import os
import requests
from datetime import datetime
import time
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models")
SEQUENCE_LENGTH = 12
FEATURES = ['speed', 'volume', 'density', 'time_of_day', 'is_weekend']

SENSOR_LOCATIONS = [
    # Ring Roads & Circular Roads
    {"id": "R001", "name": "Inner Ring Road - Dhaula Kuan", "lat": 28.5892, "lon": 77.1710, "base_congestion": 0.65, "road_type": "Ring Road"},
    {"id": "R002", "name": "Outer Ring Road - Azadpur", "lat": 28.7150, "lon": 77.2078, "base_congestion": 0.7, "road_type": "Ring Road"},
    {"id": "R003", "name": "Ring Road - Punjabi Bagh", "lat": 28.6680, "lon": 77.1245, "base_congestion": 0.68, "road_type": "Ring Road"},
    {"id": "R004", "name": "Ring Road - Rajouri Garden", "lat": 28.6425, "lon": 77.1189, "base_congestion": 0.72, "road_type": "Ring Road"},
    
    # National Highways
    {"id": "NH01", "name": "NH-8 Toll Plaza", "lat": 28.5245, "lon": 77.0746, "base_congestion": 0.75, "road_type": "National Highway"},
    {"id": "NH02", "name": "NH-2 (Mathura Road)", "lat": 28.5678, "lon": 77.2890, "base_congestion": 0.7, "road_type": "National Highway"},
    {"id": "NH09", "name": "NH-9 (Rohtak Road)", "lat": 28.6812, "lon": 77.0567, "base_congestion": 0.68, "road_type": "National Highway"},
    {"id": "NH10", "name": "NH-10 (Delhi-Rohtak)", "lat": 28.7456, "lon": 77.1134, "base_congestion": 0.62, "road_type": "National Highway"},
    {"id": "NH24", "name": "NH-24 (GT Road)", "lat": 28.6234, "lon": 77.2890, "base_congestion": 0.78, "road_type": "National Highway"},
    
    # Expressways
    {"id": "EX01", "name": "DND Flyway", "lat": 28.5689, "lon": 77.2489, "base_congestion": 0.55, "road_type": "Expressway"},
    {"id": "EX02", "name": "Noida-Greater Noida Exp", "lat": 28.5645, "lon": 77.3890, "base_congestion": 0.58, "road_type": "Expressway"},
    {"id": "EX03", "name": "Gurgaon Expressway", "lat": 28.5678, "lon": 77.0567, "base_congestion": 0.72, "road_type": "Expressway"},
    {"id": "EX04", "name": "Dwarka Expressway", "lat": 28.6234, "lon": 76.9890, "base_congestion": 0.48, "road_type": "Expressway"},
    
    # Major Arterials - Central Delhi
    {"id": "A001", "name": "Connaught Place Inner Circle", "lat": 28.6315, "lon": 77.2167, "base_congestion": 0.8, "road_type": "Arterial"},
    {"id": "A002", "name": "Parliament Street", "lat": 28.6251, "lon": 77.2089, "base_congestion": 0.65, "road_type": "Arterial"},
    {"id": "A003", "name": "Janpath", "lat": 28.6289, "lon": 77.2145, "base_congestion": 0.7, "road_type": "Arterial"},
    {"id": "A004", "name": "Lok Marg", "lat": 28.6123, "lon": 77.2234, "base_congestion": 0.58, "road_type": "Arterial"},
    
    # Major Arterials - South Delhi
    {"id": "A005", "name": "Lajpat Nagar", "lat": 28.5677, "lon": 77.2437, "base_congestion": 0.82, "road_type": "Arterial"},
    {"id": "A006", "name": "Nehru Place", "lat": 28.5501, "lon": 77.2512, "base_congestion": 0.75, "road_type": "Arterial"},
    {"id": "A007", "name": "Saket", "lat": 28.5390, "lon": 77.2100, "base_congestion": 0.68, "road_type": "Arterial"},
    {"id": "A008", "name": "Hauz Khas", "lat": 28.5456, "lon": 77.1989, "base_congestion": 0.65, "road_type": "Arterial"},
    {"id": "A009", "name": "Greater Kailash", "lat": 28.5345, "lon": 77.2345, "base_congestion": 0.62, "road_type": "Arterial"},
    {"id": "A010", "name": "Chirag Delhi", "lat": 28.5398, "lon": 77.2256, "base_congestion": 0.58, "road_type": "Arterial"},
    
    # Major Arterials - North Delhi
    {"id": "A011", "name": "Civil Lines", "lat": 28.6812, "lon": 77.2256, "base_congestion": 0.55, "road_type": "Arterial"},
    {"id": "A012", "name": "Kashmere Gate", "lat": 28.6678, "lon": 77.2289, "base_congestion": 0.85, "road_type": "Arterial"},
    {"id": "A013", "name": "ISBT Kashmere Gate", "lat": 28.6689, "lon": 77.2267, "base_congestion": 0.78, "road_type": "Arterial"},
    {"id": "A014", "name": "Red Fort Area", "lat": 28.6562, "lon": 77.2410, "base_congestion": 0.72, "road_type": "Arterial"},
    
    # Major Arterials - East Delhi
    {"id": "A015", "name": "Anand Vihar", "lat": 28.6467, "lon": 77.3156, "base_congestion": 0.88, "road_type": "Arterial"},
    {"id": "A016", "name": "Mayur Vihar Phase 1", "lat": 28.5934, "lon": 77.2989, "base_congestion": 0.75, "road_type": "Arterial"},
    {"id": "A017", "name": "Preet Vihar", "lat": 28.6423, "lon": 77.2934, "base_congestion": 0.78, "road_type": "Arterial"},
    {"id": "A018", "name": "Karkarduma", "lat": 28.6512, "lon": 77.3112, "base_congestion": 0.72, "road_type": "Arterial"},
    
    # Major Arterials - West Delhi
    {"id": "A019", "name": "Rajouri Garden", "lat": 28.6425, "lon": 77.1189, "base_congestion": 0.82, "road_type": "Arterial"},
    {"id": "A020", "name": "Janakpuri", "lat": 28.6210, "lon": 77.0845, "base_congestion": 0.75, "road_type": "Arterial"},
    {"id": "A021", "name": "Dwarka Mor", "lat": 28.5970, "lon": 77.0588, "base_congestion": 0.7, "road_type": "Arterial"},
    {"id": "A022", "name": "Uttam Nagar", "lat": 28.6189, "lon": 77.0645, "base_congestion": 0.72, "road_type": "Arterial"},
    {"id": "A023", "name": "Tilak Nagar", "lat": 28.6356, "lon": 77.0923, "base_congestion": 0.68, "road_type": "Arterial"},
    {"id": "A024", "name": "Paschim Vihar", "lat": 28.6523, "lon": 77.0845, "base_congestion": 0.65, "road_type": "Arterial"},
    
    # Major Arterials - North-West Delhi
    {"id": "A025", "name": "Rohini Sector 10", "lat": 28.7041, "lon": 77.1025, "base_congestion": 0.68, "road_type": "Arterial"},
    {"id": "A026", "name": "Rohini Sector 15", "lat": 28.7156, "lon": 77.1123, "base_congestion": 0.62, "road_type": "Arterial"},
    {"id": "A027", "name": "Pitampura", "lat": 28.7023, "lon": 77.1367, "base_congestion": 0.65, "road_type": "Arterial"},
    {"id": "A028", "name": " Shalimar Bagh", "lat": 28.7156, "lon": 77.1589, "base_congestion": 0.58, "road_type": "Arterial"},
    
    # Noida Sectors
    {"id": "N001", "name": "Noida Sector 18", "lat": 28.5679, "lon": 77.3211, "base_congestion": 0.75, "road_type": "Noida"},
    {"id": "N002", "name": "Noida Sector 15", "lat": 28.5745, "lon": 77.3123, "base_congestion": 0.7, "road_type": "Noida"},
    {"id": "N003", "name": "Noida Sector 62", "lat": 28.6278, "lon": 77.3567, "base_congestion": 0.72, "road_type": "Noida"},
    {"id": "N004", "name": "Noida City Centre", "lat": 28.5823, "lon": 77.3298, "base_congestion": 0.68, "road_type": "Noida"},
    {"id": "N005", "name": "Film City", "lat": 28.5656, "lon": 77.3590, "base_congestion": 0.55, "road_type": "Noida"},
    
    # Greater Noida
    {"id": "GN01", "name": "Greater Noida Alpha 1", "lat": 28.4745, "lon": 77.4567, "base_congestion": 0.45, "road_type": "Greater Noida"},
    {"id": "GN02", "name": "Greater Noida Beta 1", "lat": 28.4890, "lon": 77.4356, "base_congestion": 0.42, "road_type": "Greater Noida"},
    {"id": "GN03", "name": "Yamuna Expressway", "lat": 28.4567, "lon": 77.5234, "base_congestion": 0.48, "road_type": "Greater Noida"},
    
    # Gurgaon / Gurugram
    {"id": "G001", "name": "MG Road Gurgaon", "lat": 28.4756, "lon": 77.0723, "base_congestion": 0.78, "road_type": "Gurgaon"},
    {"id": "G002", "name": "Cyber Hub", "lat": 28.4856, "lon": 77.0856, "base_congestion": 0.72, "road_type": "Gurgaon"},
    {"id": "G003", "name": "Udyog Vihar", "lat": 28.4956, "lon": 77.0689, "base_congestion": 0.65, "road_type": "Gurgaon"},
    {"id": "G004", "name": "Golf Course Road", "lat": 28.4312, "lon": 77.0967, "base_congestion": 0.62, "road_type": "Gurgaon"},
    {"id": "G005", "name": "Sohna Road", "lat": 28.4423, "lon": 77.0523, "base_congestion": 0.68, "road_type": "Gurgaon"},
    {"id": "G006", "name": "Gurgaon Faridabad Road", "lat": 28.4256, "lon": 77.0345, "base_congestion": 0.7, "road_type": "Gurgaon"},
    {"id": "G007", "name": "IFFCO Chowk", "lat": 28.4590, "lon": 77.0723, "base_congestion": 0.8, "road_type": "Gurgaon"},
    {"id": "G008", "name": "Rajiv Chowk Gurgaon", "lat": 28.4598, "lon": 77.0290, "base_congestion": 0.75, "road_type": "Gurgaon"},
    
    # Ghaziabad
    {"id": "GV01", "name": "Vasundhara", "lat": 28.5623, "lon": 77.3789, "base_congestion": 0.72, "road_type": "Ghaziabad"},
    {"id": "GV02", "name": "Indirapuram", "lat": 28.5512, "lon": 77.3589, "base_congestion": 0.75, "road_type": "Ghaziabad"},
    {"id": "GV03", "name": "Kaushambi", "lat": 28.5745, "lon": 77.3456, "base_congestion": 0.78, "road_type": "Ghaziabad"},
    {"id": "GV04", "name": "Ghaziabad Nehru Road", "lat": 28.5890, "lon": 77.4123, "base_congestion": 0.82, "road_type": "Ghaziabad"},
    {"id": "GV05", "name": "Modinagar Road", "lat": 28.6123, "lon": 77.4456, "base_congestion": 0.65, "road_type": "Ghaziabad"},
    
    # Faridabad
    {"id": "FD01", "name": "Faridabad Sector 15", "lat": 28.3989, "lon": 77.2789, "base_congestion": 0.72, "road_type": "Faridabad"},
    {"id": "FD02", "name": "Faridabad Sector 28", "lat": 28.3856, "lon": 77.3056, "base_congestion": 0.68, "road_type": "Faridabad"},
    {"id": "FD03", "name": "Ballabgarh", "lat": 28.3456, "lon": 77.3234, "base_congestion": 0.55, "road_type": "Faridabad"},
    {"id": "FD04", "name": "Faridabad Bypass", "lat": 28.4123, "lon": 77.2890, "base_congestion": 0.62, "road_type": "Faridabad"},
    
    # Key Intersections
    {"id": "INT01", "name": "AIIMS Crossing", "lat": 28.5667, "lon": 77.2100, "base_congestion": 0.85, "road_type": "Intersection"},
    {"id": "INT02", "name": "Moti Bagh", "lat": 28.5812, "lon": 77.1734, "base_congestion": 0.75, "road_type": "Intersection"},
    {"id": "INT03", "name": "Dhaula Kuan", "lat": 28.5892, "lon": 77.1710, "base_congestion": 0.8, "road_type": "Intersection"},
    {"id": "INT04", "name": "Mehrauli-Badarpur Rd", "lat": 28.5123, "lon": 77.2356, "base_congestion": 0.78, "road_type": "Intersection"},
    {"id": "INT05", "name": "Maharaja Surajmal Marg", "lat": 28.6789, "lon": 77.1423, "base_congestion": 0.65, "road_type": "Intersection"},
    {"id": "INT06", "name": "Wazirpur Industrial", "lat": 28.6998, "lon": 77.1634, "base_congestion": 0.7, "road_type": "Intersection"},
    {"id": "INT07", "name": "Vivekanand Marg", "lat": 28.6512, "lon": 77.2345, "base_congestion": 0.72, "road_type": "Intersection"},
    {"id": "INT08", "name": "ITO", "lat": 28.6289, "lon": 77.2434, "base_congestion": 0.88, "road_type": "Intersection"},
]

load_dotenv()
TOMTOM_API_KEY = os.environ.get('TOMTOM_API_KEY', '')
print(f"TomTom API Key loaded: {TOMTOM_API_KEY[:5] if TOMTOM_API_KEY else 'EMPTY'}")
TOMTOM_BASE_URL = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"

sensor_history = {s['id']: [] for s in SENSOR_LOCATIONS}
last_24h_predictions = []
prediction_history = []

def get_tomtom_traffic(lat, lon):
    """Fetch real traffic data from TomTom API."""
    global TOMTOM_API_KEY
    print(f"Checking key inside function: '{TOMTOM_API_KEY[:5] if TOMTOM_API_KEY else 'EMPTY'}'")
    if not TOMTOM_API_KEY:
        return None
    
    try:
        params = {
            'key': TOMTOM_API_KEY,
            'point': f'{lat},{lon}',
            'unit': 'KMPH'
        }
        response = requests.get(TOMTOM_BASE_URL, params=params, timeout=5)
        print(f"TomTom response status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if 'flowSegmentData' in data:
                segment = data['flowSegmentData']
                return {
                    'currentSpeed': segment.get('currentSpeed', 0),
                    'freeFlowSpeed': segment.get('freeFlowSpeed', 0),
                    'currentTravelTime': segment.get('currentTravelTime', 0),
                    'freeFlowTravelTime': segment.get('freeFlowTravelTime', 0),
                    'confidence': segment.get('confidence', 0),
                    'roadClosure': segment.get('roadClosure', False)
                }
    except Exception as e:
        import traceback
        print(f"TomTom API error: {e}")
        traceback.print_exc()
    
    return None

def calculate_congestion_from_tomtom(tomtom_data):
    """Calculate congestion level from TomTom data."""
    if not tomtom_data:
        return None
    
    current = tomtom_data.get('currentSpeed', 0)
    freeflow = tomtom_data.get('freeFlowSpeed', 1)
    
    if freeflow == 0:
        freeflow = 1
    
    speed_ratio = current / freeflow
    congestion = 1 - speed_ratio
    return max(0, min(1, congestion))

def generate_fallback_data(sensor):
    """Generate realistic fallback data if API fails."""
    now = datetime.now()
    hour = now.hour
    is_weekend = 1 if now.weekday() >= 5 else 0
    
    if is_weekend:
        if 11 <= hour <= 14:
            base = sensor['base_congestion'] * 1.3
        elif 18 <= hour <= 21:
            base = sensor['base_congestion'] * 1.2
        else:
            base = sensor['base_congestion'] * 0.8
    else:
        if 8 <= hour <= 9:
            base = sensor['base_congestion'] * 1.8
        elif 17 <= hour <= 19:
            base = sensor['base_congestion'] * 2.0
        elif 7 <= hour <= 10 or 16 <= hour <= 20:
            base = sensor['base_congestion'] * 1.4
        elif 0 <= hour <= 5:
            base = sensor['base_congestion'] * 0.3
        else:
            base = sensor['base_congestion']
    
    random_factor = np.random.normal(0, 0.08)
    congestion = np.clip(base + random_factor, 0.1, 1.0)
    
    speed = 80 - (congestion * 60) + np.random.normal(0, 3)
    speed = np.clip(speed, 10, 80)
    
    volume = 500 + (congestion * 2000) + np.random.normal(0, 150)
    volume = np.clip(volume, 100, 3000)
    
    return congestion, speed, volume

def get_live_sensor_readings():
    """Get live readings from TomTom API or fallback."""
    global last_24h_predictions, sensor_history
    readings = []
    now = datetime.now()
    
    for sensor in SENSOR_LOCATIONS:
        tomtom_data = get_tomtom_traffic(sensor['lat'], sensor['lon'])
        
        if tomtom_data:
            congestion = calculate_congestion_from_tomtom(tomtom_data)
            current_speed = tomtom_data.get('currentSpeed', 0)
            freeflow = tomtom_data.get('freeFlowSpeed', 1)
            volume = int(500 + (congestion * 2000)) if congestion else 1500
            confidence = tomtom_data.get('confidence', 0)
            source = "TomTom"
        else:
            congestion, current_speed, volume = generate_fallback_data(sensor)
            confidence = 0
            source = "Fallback"
        
        reading = {
            "sensor_id": sensor['id'],
            "name": sensor['name'],
            "lat": sensor['lat'],
            "lon": sensor['lon'],
            "congestion": round(float(congestion), 3),
            "speed": round(float(current_speed), 1),
            "volume": round(float(volume), 0),
            "status": get_status(congestion),
            "timestamp": now.isoformat(),
            "source": source,
            "confidence": confidence,
            "road_type": sensor.get('road_type', 'Unknown')
        }
        
        sensor_history[sensor['id']].append({
            'congestion': congestion,
            'speed': current_speed,
            'timestamp': now
        })
        
        if len(sensor_history[sensor['id']]) > 10:
            sensor_history[sensor['id']] = sensor_history[sensor['id']][-10:]
        
        readings.append(reading)
    
    last_24h_predictions.append({
        "timestamp": now.isoformat(),
        "sensors": readings,
        "avg_congestion": round(sum(s['congestion'] for s in readings) / len(readings), 3)
    })
    
    if len(last_24h_predictions) > 288:
        last_24h_predictions = last_24h_predictions[-288:]
    
    return readings

def get_status(congestion):
    """Get status label based on congestion level."""
    if congestion < 0.3:
        return "low"
    elif congestion < 0.6:
        return "medium"
    elif congestion < 0.8:
        return "high"
    else:
        return "critical"

def load_model_and_scaler():
    """Load trained models and scaler."""
    scaler = pickle.load(open(f"{MODEL_PATH}/scaler.pkl", "rb"))
    from tensorflow.keras.models import load_model
    cnn_lstm = load_model(f"{MODEL_PATH}/cnn_lstm_model.h5")
    lstm = load_model(f"{MODEL_PATH}/lstm_model.h5")
    linear = pickle.load(open(f"{MODEL_PATH}/linear_model.pkl", "rb"))
    metrics = pickle.load(open(f"{MODEL_PATH}/metrics.pkl", "rb"))
    
    return cnn_lstm, lstm, linear, scaler, metrics

@app.route('/predict', methods=['POST'])
def predict():
    """Predict congestion from sequence."""
    try:
        data = request.get_json()
        sequence = data.get('sequence')
        
        if not sequence or len(sequence) != SEQUENCE_LENGTH:
            return jsonify({"error": f"Expected {SEQUENCE_LENGTH} time steps"}), 400
        
        cnn_lstm, lstm, linear, scaler, metrics = load_model_and_scaler()
        
        seq_array = np.array([[s['speed'], s['volume'], s['density'], 
                              s.get('time_of_day', 12), s.get('is_weekend', 0)] 
                             for s in sequence])
        
        seq_scaled = scaler.transform(seq_array)
        seq_reshaped = seq_scaled.reshape(1, SEQUENCE_LENGTH, len(FEATURES))
        
        pred_cnn = cnn_lstm.predict(seq_reshaped, verbose=0)[0][0]
        pred_lstm = lstm.predict(seq_reshaped, verbose=0)[0][0]
        seq_flat = seq_reshaped.reshape(1, -1)
        pred_linear = linear.predict(seq_flat)[0][0]
        
        pred_cnn = np.clip(scaler.inverse_transform([[pred_cnn]])[0][0], 0, 1)
        pred_lstm = np.clip(scaler.inverse_transform([[pred_lstm]])[0][0], 0, 1)
        pred_linear = np.clip(scaler.inverse_transform([[pred_linear]])[0][0], 0, 1)
        
        avg_prediction = (pred_cnn * 0.5 + pred_lstm * 0.3 + pred_linear * 0.2)
        congestion = float(np.clip(avg_prediction, 0, 1))
        
        label = get_status(congestion)
        
        result = {
            "congestion": round(congestion, 3),
            "label": label,
            "predictions": {
                "cnn_lstm": round(float(pred_cnn), 3),
                "lstm": round(float(pred_lstm), 3),
                "linear": round(float(pred_linear), 3)
            },
            "timestamp": datetime.now().isoformat()
        }
        
        prediction_history.append(result)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/sensors', methods=['GET'])
def sensors():
    """Get live sensor readings."""
    try:
        readings = get_live_sensor_readings()
        
        return jsonify({
            "sensors": readings,
            "timestamp": datetime.now().isoformat(),
            "city": "Delhi/NCR",
            "country": "India"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    """Get prediction history."""
    return jsonify({
        "history": prediction_history[-288:] if len(prediction_history) > 0 else [],
        "count": min(len(prediction_history), 288)
    })

@app.route('/metrics', methods=['GET'])
def metrics():
    """Get model comparison results."""
    try:
        metrics_data = pickle.load(open(f"{MODEL_PATH}/metrics.pkl", "rb"))
        
        comparison = {
            "models": [],
            "best_model": None,
            "timestamp": datetime.now().isoformat()
        }
        
        best_r2 = -float('inf')
        for model_name, model_metrics in metrics_data.items():
            comparison["models"].append({
                "name": model_name,
                "mae": model_metrics["MAE"],
                "rmse": model_metrics["RMSE"],
                "r2": model_metrics["R2"]
            })
            if model_metrics["R2"] > best_r2:
                best_r2 = model_metrics["R2"]
                comparison["best_model"] = model_name
        
        return jsonify(comparison)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/sensor-history', methods=['GET'])
def sensor_history_endpoint():
    """Get sensor sparkline data."""
    return jsonify({
        "history": sensor_history,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "tomtom_api_configured": bool(TOMTOM_API_KEY),
        "model_loaded": os.path.exists(f"{MODEL_PATH}/cnn_lstm_model.h5")
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
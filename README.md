# Real-Time Traffic Congestion Prediction System

A CNN-LSTM based deep learning system for spatio-temporal traffic congestion prediction.

## Project Structure

```
Projexa/
├── backend/
│   ├── app.py              # Flask API with prediction endpoints
│   ├── data_generator.py  # Synthetic traffic data generation
│   ├── model.py           # CNN-LSTM model architecture
│   ├── train_quick.py     # Quick model training script
│   ├── requirements.txt   # Python dependencies
│   ├── render.yaml        # Render deployment config
│   └── models/
│       ├── cnn_lstm_model.h5
│       ├── lstm_model.h5
│       ├── linear_model.pkl
│       ├── scaler.pkl
│       ├── metrics.pkl
│       └── traffic_data.csv
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── vercel.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       └── components/
│           ├── SensorCard.jsx
│           ├── CongestionChart.jsx
│           ├── ModelComparison.jsx
│           └── CityMap.jsx
└── README.md
```

## Model Performance (Trained on 90 days synthetic data)

| Model    | MAE   | RMSE  | R²    |
|----------|-------|-------|-------|
| CNN-LSTM | 0.0996| 0.1256| 0.7632|
| LSTM     | 0.1001| 0.1266| 0.7592|
| Linear   | 0.1010| 0.1280| 0.7541|

## API Endpoints

- `POST /predict` - Predict congestion from sequence
- `GET /sensors` - Get live sensor readings
- `GET /history` - Get prediction history
- `GET /metrics` - Get model comparison metrics
- `GET /health` - Health check

## Deployment Instructions

### Backend (Render Free Tier)

1. Create GitHub repository and push all files
2. Go to [Render.com](https://render.com) and sign up
3. Create new Web Service:
   - Connect your GitHub repo
   - Select the backend folder
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1`
4. Set environment variables:
   - `PYTHON_VERSION`: 3.11
   - `TF_CPP_MIN_LOG_LEVEL`: 2
5. Deploy - Wait ~5 minutes for build

### Frontend (Vercel Free Tier)

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Import your GitHub repo (select frontend folder)
3. Set environment variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`)
4. Deploy

### Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev
```

## Tech Stack

- Backend: Python, Flask, TensorFlow/Keras
- Frontend: React, Vite, Recharts
- Deployment: Render (backend), Vercel (frontend)
"""
CNN-LSTM Traffic Congestion Prediction Model
=============================================
Deep learning model for spatio-temporal traffic prediction

Architecture:
- Conv1D layer for spatial pattern extraction
- MaxPooling1D for dimensionality reduction
- LSTM layers for temporal dependencies
- Dense output layer for congestion prediction

Also trains:
- Baseline LSTM model
- Linear Regression model
- Comparison metrics (MAE, RMSE, R2)
"""

import numpy as np
import pandas as pd
import pickle
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Conv1D, MaxPooling1D, LSTM, Dense, Dropout, BatchNormalization
)
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

tf.random.set_seed(42)
np.random.seed(42)

SEQUENCE_LENGTH = 12
FEATURES = ['speed', 'volume', 'density', 'time_of_day', 'is_weekend']
TARGET = 'congestion'

def load_and_preprocess_data():
    """Load and preprocess the traffic data."""
    print("Loading traffic data...")
    df = pd.read_csv("models/traffic_data.csv")
    
    print(f"Total records: {len(df)}")
    print(f"Sensors: {df['sensor_id'].unique()}")
    
    scaler = MinMaxScaler()
    scaled_features = scaler.fit_transform(df[FEATURES])
    scaled_target = scaler.fit_transform(df[[TARGET]])
    
    with open("models/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    print("Scaler saved to models/scaler.pkl")
    
    return df, scaled_features, scaled_target, scaler

def create_sequences(features, target, seq_length):
    """Create sequences for time series prediction."""
    X, y = [], []
    for i in range(len(features) - seq_length):
        X.append(features[i:i+seq_length])
        y.append(target[i+seq_length])
    return np.array(X), np.array(y)

def build_cnn_lstm_model(input_shape):
    """
    CNN-LSTM Model Architecture
    Conv1D extracts spatial patterns from traffic features
    LSTMs capture temporal dependencies
    """
    model = Sequential([
        Conv1D(filters=64, kernel_size=3, activation='relu', 
               input_shape=input_shape, padding='same'),
        BatchNormalization(),
        MaxPooling1D(pool_size=2),
        Dropout(0.2),
        
        Conv1D(filters=128, kernel_size=3, activation='relu', padding='same'),
        BatchNormalization(),
        Dropout(0.2),
        
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        
        Dense(32, activation='relu'),
        Dense(1)
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    
    return model

def build_lstm_model(input_shape):
    """
    Baseline LSTM Model
    Pure LSTM without CNN feature extraction
    """
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        
        Dense(32, activation='relu'),
        Dense(1)
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    
    return model

def train_models():
    """Train all three models and compute metrics."""
    df, scaled_features, scaled_target, scaler = load_and_preprocess_data()
    
    X, y = create_sequences(scaled_features, scaled_target, SEQUENCE_LENGTH)
    
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print(f"\nTraining data: {X_train.shape[0]} samples")
    print(f"Test data: {X_test.shape[0]} samples")
    print(f"Sequence length: {SEQUENCE_LENGTH}")
    print(f"Features: {len(FEATURES)}")
    
    input_shape = (SEQUENCE_LENGTH, len(FEATURES))
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6)
    ]
    
    print("\n" + "="*60)
    print("Training CNN-LSTM Model...")
    print("="*60)
    
    cnn_lstm = build_cnn_lstm_model(input_shape)
    cnn_lstm.summary()
    
    history = cnn_lstm.fit(
        X_train, y_train,
        epochs=30,
        batch_size=256,
        validation_split=0.2,
        callbacks=callbacks,
        verbose=1
    )
    
    cnn_lstm.save("models/cnn_lstm_model.h5")
    print("CNN-LSTM model saved to models/cnn_lstm_model.h5")
    
    print("\n" + "="*60)
    print("Training Baseline LSTM Model...")
    print("="*60)
    
    lstm = build_lstm_model(input_shape)
    lstm.summary()
    
    history = lstm.fit(
        X_train, y_train,
        epochs=30,
        batch_size=256,
        validation_split=0.2,
        callbacks=callbacks,
        verbose=1
    )
    
    lstm.save("models/lstm_model.h5")
    print("LSTM model saved to models/lstm_model.h5")
    
    print("\n" + "="*60)
    print("Training Linear Regression Model...")
    print("="*60)
    
    X_train_flat = X_train.reshape(X_train.shape[0], -1)
    X_test_flat = X_test.reshape(X_test.shape[0], -1)
    
    lr = LinearRegression()
    lr.fit(X_train_flat, y_train)
    
    with open("models/linear_model.pkl", "wb") as f:
        pickle.dump(lr, f)
    print("Linear model saved to models/linear_model.pkl")
    
    print("\n" + "="*60)
    print("Computing Model Comparison Metrics...")
    print("="*60)
    
    y_pred_cnn = cnn_lstm.predict(X_test, verbose=0)
    y_pred_lstm = lstm.predict(X_test, verbose=0)
    y_pred_lr = lr.predict(X_test_flat)
    
    metrics = {}
    
    for name, y_pred in [("CNN-LSTM", y_pred_cnn), ("LSTM", y_pred_lstm), ("Linear", y_pred_lr)]:
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        metrics[name] = {
            "MAE": float(mae),
            "RMSE": float(rmse),
            "R2": float(r2)
        }
        
        print(f"\n{name}:")
        print(f"  MAE:  {mae:.6f}")
        print(f"  RMSE: {rmse:.6f}")
        print(f"  R2:   {r2:.6f}")
    
    with open("models/metrics.pkl", "wb") as f:
        pickle.dump(metrics, f)
    print("\nMetrics saved to models/metrics.pkl")
    
    return metrics, history

def predict_congestion(model_type, sequence):
    """Make prediction using trained model."""
    scaler = pickle.load(open("models/scaler.pkl", "rb"))
    
    if model_type == "linear":
        model = pickle.load(open("models/linear_model.pkl", "rb"))
        sequence_flat = sequence.reshape(1, -1)
        prediction = model.predict(sequence_flat)
    else:
        from tensorflow.keras.models import load_model
        model = load_model(f"models/{model_type}_model.h5")
        prediction = model.predict(sequence, verbose=0)
    
    prediction_original = scaler.inverse_transform(prediction)
    return float(np.clip(prediction_original[0][0], 0, 1))

if __name__ == "__main__":
    metrics, history = train_models()
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print("\nFinal Metrics:")
    for model, m in metrics.items():
        print(f"  {model}: MAE={m['MAE']:.4f}, RMSE={m['RMSE']:.4f}, R2={m['R2']:.4f}")
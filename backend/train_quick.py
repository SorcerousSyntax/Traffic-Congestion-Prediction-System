"""
Quick Model Training - Reduced epochs for faster execution
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

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Dense, Dropout

tf.random.set_seed(42)
np.random.seed(42)

SEQUENCE_LENGTH = 12
FEATURES = ['speed', 'volume', 'density', 'time_of_day', 'is_weekend']
TARGET = 'congestion'

def load_and_preprocess_data():
    df = pd.read_csv("models/traffic_data.csv")
    scaler = MinMaxScaler()
    scaled_features = scaler.fit_transform(df[FEATURES])
    scaled_target = scaler.fit_transform(df[[TARGET]])
    with open("models/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    return scaled_features, scaled_target, scaler

def create_sequences(features, target, seq_length):
    X, y = [], []
    for i in range(len(features) - seq_length):
        X.append(features[i:i+seq_length])
        y.append(target[i+seq_length])
    return np.array(X), np.array(y)

def build_cnn_lstm(input_shape):
    model = Sequential([
        Conv1D(filters=32, kernel_size=3, activation='relu', input_shape=input_shape, padding='same'),
        MaxPooling1D(pool_size=2),
        LSTM(32, return_sequences=False),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

def build_lstm(input_shape):
    model = Sequential([
        LSTM(32, return_sequences=True, input_shape=input_shape),
        LSTM(16),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

print("Loading data...")
scaled_features, scaled_target, scaler = load_and_preprocess_data()

X, y = create_sequences(scaled_features, scaled_target, SEQUENCE_LENGTH)
split_idx = int(len(X) * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

print(f"Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

input_shape = (SEQUENCE_LENGTH, len(FEATURES))

print("\nTraining CNN-LSTM...")
cnn_lstm = build_cnn_lstm(input_shape)
cnn_lstm.fit(X_train, y_train, epochs=5, batch_size=512, verbose=1, validation_split=0.1)
cnn_lstm.save("models/cnn_lstm_model.h5")

print("\nTraining LSTM...")
lstm = build_lstm(input_shape)
lstm.fit(X_train, y_train, epochs=5, batch_size=512, verbose=1, validation_split=0.1)
lstm.save("models/lstm_model.h5")

print("\nTraining Linear...")
X_train_flat = X_train.reshape(X_train.shape[0], -1)
X_test_flat = X_test.reshape(X_test.shape[0], -1)
lr = LinearRegression()
lr.fit(X_train_flat, y_train)
with open("models/linear_model.pkl", "wb") as f:
    pickle.dump(lr, f)

print("\nComputing metrics...")
metrics = {}
for name, model, test_data in [
    ("CNN-LSTM", cnn_lstm, X_test),
    ("LSTM", lstm, X_test),
    ("Linear", lr, X_test_flat)
]:
    if name == "Linear":
        y_pred = model.predict(test_data)
    else:
        y_pred = model.predict(test_data, verbose=0)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    metrics[name] = {"MAE": float(mae), "RMSE": float(rmse), "R2": float(r2)}
    print(f"{name}: MAE={mae:.4f}, RMSE={rmse:.4f}, R2={r2:.4f}")

with open("models/metrics.pkl", "wb") as f:
    pickle.dump(metrics, f)

print("\n✓ Training complete!")
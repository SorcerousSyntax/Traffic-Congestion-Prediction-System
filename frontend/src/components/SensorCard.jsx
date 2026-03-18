import React from 'react'

function SensorCard({ sensor }) {
  const statusClass = sensor.status || 'low'
  
  return (
    <div className={`sensor-card ${statusClass}`}>
      <div className="sensor-id">{sensor.sensor_id}</div>
      <div className="sensor-name">{sensor.name}</div>
      <div className="sensor-congestion">
        {(sensor.congestion * 100).toFixed(0)}%
      </div>
      <div className="sensor-status">{sensor.status}</div>
      <div style={{marginTop: '8px', fontSize: '0.7rem', color: '#94a3b8'}}>
        Speed: {sensor.speed} km/h | Vol: {sensor.volume}
      </div>
    </div>
  )
}

export default SensorCard
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Polyline, Tooltip as MapTooltip } from 'react-leaflet'
import { Activity, MapPin, TrendingUp, AlertTriangle, Clock, Wifi, Car, Users, Zap, Award, ChevronUp, ChevronDown, RefreshCw, Filter, Radio, Gauge, Navigation, Layers, Wind, Route, Orbit, Cpu, Database, Signal } from 'lucide-react'
import axios from 'axios'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

const MOCK_SENSORS = [
  { sensor_id: "R001", name: "Inner Ring Road - Dhaula Kuan", lat: 28.5892, lon: 77.1710, congestion: 0.65, speed: 35, volume: 1800, status: "high", road_type: "Ring Road" },
  { sensor_id: "R002", name: "Outer Ring Road - Azadpur", lat: 28.7150, lon: 77.2078, congestion: 0.72, speed: 28, volume: 2200, status: "high", road_type: "Ring Road" },
  { sensor_id: "R003", name: "Ring Road - Punjabi Bagh", lat: 28.6680, lon: 77.1245, congestion: 0.68, speed: 30, volume: 1900, status: "high", road_type: "Ring Road" },
  { sensor_id: "R004", name: "Ring Road - Rajouri Garden", lat: 28.6425, lon: 77.1189, congestion: 0.70, speed: 32, volume: 2000, status: "high", road_type: "Ring Road" },
  { sensor_id: "NH01", name: "NH-8 Toll Plaza", lat: 28.5245, lon: 77.0746, congestion: 0.78, speed: 22, volume: 2500, status: "critical", road_type: "National Highway" },
  { sensor_id: "NH02", name: "NH-2 (Mathura Road)", lat: 28.5678, lon: 77.2890, congestion: 0.70, speed: 30, volume: 2000, status: "high", road_type: "National Highway" },
  { sensor_id: "NH09", name: "NH-9 (Rohtak Road)", lat: 28.6812, lon: 77.0567, congestion: 0.68, speed: 32, volume: 1850, status: "high", road_type: "National Highway" },
  { sensor_id: "NH10", name: "NH-10 (Delhi-Rohtak)", lat: 28.7456, lon: 77.1134, congestion: 0.62, speed: 38, volume: 1650, status: "medium", road_type: "National Highway" },
  { sensor_id: "NH24", name: "NH-24 (GT Road)", lat: 28.6234, lon: 77.2890, congestion: 0.75, speed: 25, volume: 2300, status: "high", road_type: "National Highway" },
  { sensor_id: "EX01", name: "DND Flyway", lat: 28.5689, lon: 77.2489, congestion: 0.55, speed: 45, volume: 1500, status: "medium", road_type: "Expressway" },
  { sensor_id: "EX02", name: "Noida-Greater Noida Exp", lat: 28.5645, lon: 77.3890, congestion: 0.58, speed: 42, volume: 1400, status: "medium", road_type: "Expressway" },
  { sensor_id: "EX03", name: "Gurgaon Expressway", lat: 28.5678, lon: 77.0567, congestion: 0.72, speed: 28, volume: 2100, status: "high", road_type: "Expressway" },
  { sensor_id: "EX04", name: "Dwarka Expressway", lat: 28.6234, lon: 76.9890, congestion: 0.48, speed: 50, volume: 1200, status: "low", road_type: "Expressway" },
  { sensor_id: "A001", name: "Connaught Place Inner Circle", lat: 28.6315, lon: 77.2167, congestion: 0.82, speed: 15, volume: 2800, status: "critical", road_type: "Arterial" },
  { sensor_id: "A002", name: "Parliament Street", lat: 28.6251, lon: 77.2089, congestion: 0.65, speed: 35, volume: 1750, status: "high", road_type: "Arterial" },
  { sensor_id: "A003", name: "Janpath", lat: 28.6289, lon: 77.2145, congestion: 0.70, speed: 30, volume: 1900, status: "high", road_type: "Arterial" },
  { sensor_id: "A004", name: "Lok Marg", lat: 28.6123, lon: 77.2234, congestion: 0.58, speed: 40, volume: 1450, status: "medium", road_type: "Arterial" },
  { sensor_id: "A005", name: "Lajpat Nagar", lat: 28.5677, lon: 77.2437, congestion: 0.85, speed: 12, volume: 3000, status: "critical", road_type: "Arterial" },
  { sensor_id: "A006", name: "Nehru Place", lat: 28.5501, lon: 77.2512, congestion: 0.75, speed: 25, volume: 2200, status: "high", road_type: "Arterial" },
  { sensor_id: "A007", name: "Saket", lat: 28.5390, lon: 77.2100, congestion: 0.68, speed: 32, volume: 1800, status: "high", road_type: "Arterial" },
  { sensor_id: "A008", name: "Hauz Khas", lat: 28.5456, lon: 77.1989, congestion: 0.65, speed: 35, volume: 1700, status: "high", road_type: "Arterial" },
  { sensor_id: "A009", name: "Greater Kailash", lat: 28.5345, lon: 77.2345, congestion: 0.62, speed: 38, volume: 1600, status: "medium", road_type: "Arterial" },
  { sensor_id: "A010", name: "Chirag Delhi", lat: 28.5398, lon: 77.2256, congestion: 0.58, speed: 42, volume: 1400, status: "medium", road_type: "Arterial" },
  { sensor_id: "A011", name: "Civil Lines", lat: 28.6812, lon: 77.2256, congestion: 0.55, speed: 45, volume: 1350, status: "medium", road_type: "Arterial" },
  { sensor_id: "A012", name: "Kashmere Gate", lat: 28.6678, lon: 77.2289, congestion: 0.88, speed: 10, volume: 3200, status: "critical", road_type: "Arterial" },
  { sensor_id: "A013", name: "ISBT Kashmere Gate", lat: 28.6689, lon: 77.2267, congestion: 0.82, speed: 15, volume: 2900, status: "critical", road_type: "Arterial" },
  { sensor_id: "A014", name: "Red Fort Area", lat: 28.6562, lon: 77.2410, congestion: 0.72, speed: 28, volume: 2050, status: "high", road_type: "Arterial" },
  { sensor_id: "A015", name: "Anand Vihar", lat: 28.6467, lon: 77.3156, congestion: 0.90, speed: 8, volume: 3400, status: "critical", road_type: "Arterial" },
  { sensor_id: "A016", name: "Mayur Vihar Phase 1", lat: 28.5934, lon: 77.2989, congestion: 0.75, speed: 25, volume: 2150, status: "high", road_type: "Arterial" },
  { sensor_id: "A017", name: "Preet Vihar", lat: 28.6423, lon: 77.2934, congestion: 0.78, speed: 22, volume: 2350, status: "critical", road_type: "Arterial" },
  { sensor_id: "A018", name: "Karkarduma", lat: 28.6512, lon: 77.3112, congestion: 0.72, speed: 28, volume: 2000, status: "high", road_type: "Arterial" },
  { sensor_id: "A019", name: "Rajouri Garden", lat: 28.6425, lon: 77.1189, congestion: 0.85, speed: 12, volume: 3100, status: "critical", road_type: "Arterial" },
  { sensor_id: "A020", name: "Janakpuri", lat: 28.6210, lon: 77.0845, congestion: 0.75, speed: 25, volume: 2200, status: "high", road_type: "Arterial" },
  { sensor_id: "A021", name: "Dwarka Mor", lat: 28.5970, lon: 77.0588, congestion: 0.70, speed: 30, volume: 1950, status: "high", road_type: "Arterial" },
  { sensor_id: "A022", name: "Uttam Nagar", lat: 28.6189, lon: 77.0645, congestion: 0.72, speed: 28, volume: 2050, status: "high", road_type: "Arterial" },
  { sensor_id: "A023", name: "Tilak Nagar", lat: 28.6356, lon: 77.0923, congestion: 0.68, speed: 32, volume: 1800, status: "high", road_type: "Arterial" },
  { sensor_id: "A024", name: "Paschim Vihar", lat: 28.6523, lon: 77.0845, congestion: 0.65, speed: 35, volume: 1700, status: "high", road_type: "Arterial" },
  { sensor_id: "A025", name: "Rohini Sector 10", lat: 28.7041, lon: 77.1025, congestion: 0.68, speed: 32, volume: 1800, status: "high", road_type: "Arterial" },
  { sensor_id: "A026", name: "Rohini Sector 15", lat: 28.7156, lon: 77.1123, congestion: 0.62, speed: 38, volume: 1600, status: "medium", road_type: "Arterial" },
  { sensor_id: "A027", name: "Pitampura", lat: 28.7023, lon: 77.1367, congestion: 0.65, speed: 35, volume: 1700, status: "high", road_type: "Arterial" },
  { sensor_id: "A028", name: "Shalimar Bagh", lat: 28.7156, lon: 77.1589, congestion: 0.58, speed: 42, volume: 1400, status: "medium", road_type: "Arterial" },
  { sensor_id: "N001", name: "Noida Sector 18", lat: 28.5679, lon: 77.3211, congestion: 0.78, speed: 22, volume: 2400, status: "critical", road_type: "Noida" },
  { sensor_id: "N002", name: "Noida Sector 15", lat: 28.5745, lon: 77.3123, congestion: 0.70, speed: 30, volume: 1950, status: "high", road_type: "Noida" },
  { sensor_id: "N003", name: "Noida Sector 62", lat: 28.6278, lon: 77.3567, congestion: 0.72, speed: 28, volume: 2050, status: "high", road_type: "Noida" },
  { sensor_id: "N004", name: "Noida City Centre", lat: 28.5823, lon: 77.3298, congestion: 0.68, speed: 32, volume: 1850, status: "high", road_type: "Noida" },
  { sensor_id: "N005", name: "Film City", lat: 28.5656, lon: 77.3590, congestion: 0.55, speed: 45, volume: 1300, status: "medium", road_type: "Noida" },
  { sensor_id: "GN01", name: "Greater Noida Alpha 1", lat: 28.4745, lon: 77.4567, congestion: 0.45, speed: 52, volume: 1100, status: "low", road_type: "Greater Noida" },
  { sensor_id: "GN02", name: "Greater Noida Beta 1", lat: 28.4890, lon: 77.4356, congestion: 0.42, speed: 55, volume: 1000, status: "low", road_type: "Greater Noida" },
  { sensor_id: "GN03", name: "Yamuna Expressway", lat: 28.4567, lon: 77.5234, congestion: 0.48, speed: 50, volume: 1150, status: "low", road_type: "Greater Noida" },
  { sensor_id: "G001", name: "MG Road Gurgaon", lat: 28.4756, lon: 77.0723, congestion: 0.80, speed: 18, volume: 2750, status: "critical", road_type: "Gurgaon" },
  { sensor_id: "G002", name: "Cyber Hub", lat: 28.4856, lon: 77.0856, congestion: 0.72, speed: 28, volume: 2100, status: "high", road_type: "Gurgaon" },
  { sensor_id: "G003", name: "Udyog Vihar", lat: 28.4956, lon: 77.0689, congestion: 0.65, speed: 35, volume: 1700, status: "high", road_type: "Gurgaon" },
  { sensor_id: "G004", name: "Golf Course Road", lat: 28.4312, lon: 77.0967, congestion: 0.62, speed: 38, volume: 1600, status: "medium", road_type: "Gurgaon" },
  { sensor_id: "G005", name: "Sohna Road", lat: 28.4423, lon: 77.0523, congestion: 0.68, speed: 32, volume: 1800, status: "high", road_type: "Gurgaon" },
  { sensor_id: "G006", name: "Gurgaon Faridabad Road", lat: 28.4256, lon: 77.0345, congestion: 0.70, speed: 30, volume: 1950, status: "high", road_type: "Gurgaon" },
  { sensor_id: "G007", name: "IFFCO Chowk", lat: 28.4590, lon: 77.0723, congestion: 0.85, speed: 12, volume: 3100, status: "critical", road_type: "Gurgaon" },
  { sensor_id: "G008", name: "Rajiv Chowk Gurgaon", lat: 28.4598, lon: 77.0290, congestion: 0.78, speed: 22, volume: 2400, status: "critical", road_type: "Gurgaon" },
  { sensor_id: "GV01", name: "Vasundhara", lat: 28.5623, lon: 77.3789, congestion: 0.72, speed: 28, volume: 2050, status: "high", road_type: "Ghaziabad" },
  { sensor_id: "GV02", name: "Indirapuram", lat: 28.5512, lon: 77.3589, congestion: 0.75, speed: 25, volume: 2200, status: "high", road_type: "Ghaziabad" },
  { sensor_id: "GV03", name: "Kaushambi", lat: 28.5745, lon: 77.3456, congestion: 0.78, speed: 22, volume: 2350, status: "critical", road_type: "Ghaziabad" },
  { sensor_id: "GV04", name: "Ghaziabad Nehru Road", lat: 28.5890, lon: 77.4123, congestion: 0.82, speed: 18, volume: 2800, status: "critical", road_type: "Ghaziabad" },
  { sensor_id: "GV05", name: "Modinagar Road", lat: 28.6123, lon: 77.4456, congestion: 0.65, speed: 35, volume: 1700, status: "high", road_type: "Ghaziabad" },
  { sensor_id: "FD01", name: "Faridabad Sector 15", lat: 28.3989, lon: 77.2789, congestion: 0.72, speed: 28, volume: 2050, status: "high", road_type: "Faridabad" },
  { sensor_id: "FD02", name: "Faridabad Sector 28", lat: 28.3856, lon: 77.3056, congestion: 0.68, speed: 32, volume: 1800, status: "high", road_type: "Faridabad" },
  { sensor_id: "FD03", name: "Ballabgarh", lat: 28.3456, lon: 77.3234, congestion: 0.55, speed: 45, volume: 1350, status: "medium", road_type: "Faridabad" },
  { sensor_id: "FD04", name: "Faridabad Bypass", lat: 28.4123, lon: 77.2890, congestion: 0.62, speed: 38, volume: 1600, status: "medium", road_type: "Faridabad" },
  { sensor_id: "INT01", name: "AIIMS Crossing", lat: 28.5667, lon: 77.2100, congestion: 0.88, speed: 10, volume: 3300, status: "critical", road_type: "Intersection" },
  { sensor_id: "INT02", name: "Moti Bagh", lat: 28.5812, lon: 77.1734, congestion: 0.75, speed: 25, volume: 2250, status: "high", road_type: "Intersection" },
  { sensor_id: "INT03", name: "Dhaula Kuan", lat: 28.5892, lon: 77.1710, congestion: 0.80, speed: 18, volume: 2700, status: "critical", road_type: "Intersection" },
  { sensor_id: "INT04", name: "Mehrauli-Badarpur Rd", lat: 28.5123, lon: 77.2356, congestion: 0.78, speed: 22, volume: 2400, status: "critical", road_type: "Intersection" },
  { sensor_id: "INT05", name: "Maharaja Surajmal Marg", lat: 28.6789, lon: 77.1423, congestion: 0.65, speed: 35, volume: 1700, status: "high", road_type: "Intersection" },
  { sensor_id: "INT06", name: "Wazirpur Industrial", lat: 28.6998, lon: 77.1634, congestion: 0.70, speed: 30, volume: 1950, status: "high", road_type: "Intersection" },
  { sensor_id: "INT07", name: "Vivekanand Marg", lat: 28.6512, lon: 77.2345, congestion: 0.72, speed: 28, volume: 2050, status: "high", road_type: "Intersection" },
  { sensor_id: "INT08", name: "ITO", lat: 28.6289, lon: 77.2434, congestion: 0.88, speed: 10, volume: 3200, status: "critical", road_type: "Intersection" },
]

const MOCK_METRICS = {
  models: [
    { name: "CNN-LSTM", mae: 0.0996, rmse: 0.1256, r2: 0.7632 },
    { name: "LSTM", mae: 0.1001, rmse: 0.1266, r2: 0.7592 },
    { name: "Linear", mae: 0.1010, rmse: 0.1280, r2: 0.7541 }
  ],
  best_model: "CNN-LSTM"
}

const API_URL = ''

const PARTICLE_COUNT = 50
const BUBBLE_COUNT = 15

const ROAD_SEGMENTS = {
  "R001": { name: "Inner Ring Road", coords: [[28.5892, 77.1710], [28.6023, 77.1890], [28.6156, 77.2012], [28.6315, 77.2167], [28.6456, 77.2289], [28.6680, 77.2356], [28.6890, 77.2245], [28.7023, 77.2134], [28.7150, 77.2078]], type: "Ring Road" },
  "R002": { name: "Outer Ring Road", coords: [[28.7150, 77.2078], [28.7289, 77.1856], [28.7389, 77.1567], [28.7456, 77.1134], [28.7389, 77.0890], [28.7156, 77.0589], [28.6890, 77.0423], [28.6523, 77.0845], [28.6425, 77.1189], [28.6680, 77.1245], [28.7023, 77.1567]], type: "Ring Road" },
  "NH01": { name: "NH-8 (Delhi-Jaipur)", coords: [[28.6612, 77.1123], [28.6245, 77.0923], [28.5823, 77.0789], [28.5456, 77.0723], [28.5245, 77.0746]], type: "National Highway" },
  "NH02": { name: "NH-2 (Mathura Road)", coords: [[28.6315, 77.2167], [28.6012, 77.2456], [28.5678, 77.2890], [28.5356, 77.3156], [28.5012, 77.3489]], type: "National Highway" },
  "NH09": { name: "NH-9 (Rohtak Road)", coords: [[28.6315, 77.2167], [28.6612, 77.1890], [28.6812, 77.1456], [28.6812, 77.0567], [28.6890, 77.0123]], type: "National Highway" },
  "NH24": { name: "NH-24 (GT Road)", coords: [[28.6234, 77.2890], [28.6134, 77.3156], [28.6012, 77.3489], [28.5890, 77.3890], [28.5745, 77.4123]], type: "National Highway" },
  "EX01": { name: "DND Flyway", coords: [[28.5689, 77.2489], [28.5823, 77.2890], [28.5967, 77.3156]], type: "Expressway" },
  "EX02": { name: "Noida Expressway", coords: [[28.5679, 77.3211], [28.5578, 77.3567], [28.5489, 77.3890], [28.5356, 77.4234]], type: "Expressway" },
  "EX03": { name: "Gurgaon Expressway", coords: [[28.6315, 77.2167], [28.6012, 77.1789], [28.5678, 77.1245], [28.5456, 77.0856], [28.5102, 77.0589]], type: "Expressway" },
  "A001": { name: "Connaught Place", coords: [[28.6315, 77.2167], [28.6323, 77.2201], [28.6312, 77.2245], [28.6289, 77.2167]], type: "Arterial" },
  "A005": { name: "Lajpat Nagar", coords: [[28.5677, 77.2437], [28.5745, 77.2356], [28.5823, 77.2289], [28.5892, 77.2201]], type: "Arterial" },
  "A012": { name: "Kashmere Gate", coords: [[28.6678, 77.2289], [28.6723, 77.2234], [28.6767, 77.2189]], type: "Arterial" },
  "A015": { name: "Anand Vihar", coords: [[28.6467, 77.3156], [28.6423, 77.3089], [28.6378, 77.3012]], type: "Arterial" },
  "A019": { name: "Rajouri Garden", coords: [[28.6425, 77.1189], [28.6389, 77.1256], [28.6356, 77.1312]], type: "Arterial" },
  "A021": { name: "Dwarka Mor", coords: [[28.5970, 77.0588], [28.6012, 77.0656], [28.6056, 77.0723]], type: "Arterial" },
  "A025": { name: "Rohini Sector 10", coords: [[28.7041, 77.1025], [28.7089, 77.1090], [28.7134, 77.1156]], type: "Arterial" },
  "N001": { name: "Noida Sector 18", coords: [[28.5679, 77.3211], [28.5645, 77.3289], [28.5612, 77.3356]], type: "Noida" },
  "G001": { name: "MG Road Gurgaon", coords: [[28.4756, 77.0723], [28.4789, 77.0656], [28.4823, 77.0589]], type: "Gurgaon" },
  "G007": { name: "IFFCO Chowk", coords: [[28.4590, 77.0723], [28.4623, 77.0656], [28.4656, 77.0589]], type: "Gurgaon" },
  "GV01": { name: "Vasundhara", coords: [[28.5623, 77.3789], [28.5678, 77.3856], [28.5734, 77.3923]], type: "Ghaziabad" },
  "FD01": { name: "Faridabad Sector 15", coords: [[28.3989, 77.2789], [28.3923, 77.2856], [28.3856, 77.2923]], type: "Faridabad" },
  "INT01": { name: "AIIMS Crossing", coords: [[28.5667, 77.2100], [28.5623, 77.2056], [28.5578, 77.2012]], type: "Intersection" },
  "INT08": { name: "ITO", coords: [[28.6289, 77.2434], [28.6245, 77.2378], [28.6201, 77.2323]], type: "Intersection" },
}

const getCongestionColor = (congestion) => {
  if (congestion < 0.3) return '#10b981'
  if (congestion < 0.5) return '#84cc16'
  if (congestion < 0.65) return '#f59e0b'
  if (congestion < 0.8) return '#f97316'
  return '#ef4444'
}

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
  }))
}

function generateBubbles() {
  return Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 60 + 20,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    color: ['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)', 'rgba(6, 182, 212, 0.1)'][Math.floor(Math.random() * 3)]
  }))
}

const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {generateParticles().map((particle) => (
      <motion.div
        key={particle.id}
        className="absolute rounded-full"
        style={{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
        }}
        animate={{
          y: [-100, 100, -100],
          x: [-50, 50, -50],
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1]
        }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ))}
  </div>
)

const FloatingBubbles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {generateBubbles().map((bubble) => (
      <motion.div
        key={bubble.id}
        className="absolute rounded-full backdrop-blur-sm"
        style={{
          left: `${bubble.x}%`,
          bottom: '-100px',
          width: bubble.size,
          height: bubble.size,
          background: bubble.color,
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        animate={{
          y: [-1200, 0],
          rotate: [0, 360],
          opacity: [0, 0.5, 0]
        }}
        transition={{
          duration: bubble.duration,
          delay: bubble.delay,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ))}
  </div>
)

const AnimatedGrid = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
      animation: 'gridMove 20s linear infinite'
    }} />
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px',
      animation: 'gridMove 40s linear infinite reverse'
    }} />
  </div>
)

const MorphingShape = ({ className, color }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      borderRadius: ['40% 60% 70% 30% / 40% 50% 60% 50%', '60% 40% 30% 70% / 60% 30% 70% 40%', '40% 60% 70% 30% / 40% 50% 60% 50%'],
      rotate: [0, 360]
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }}
    style={{
      width: 400,
      height: 400,
      background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`,
      border: `1px solid ${color}30`
    }}
  />
)

const TiltCard = ({ children, className, intensity = 15 }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = useRef(null)

  const rotateX = useTransform(y, [-100, 100], [intensity, -intensity])
  const rotateY = useTransform(x, [-100, 100], [-intensity, intensity])
  const springX = useSpring(rotateX, { stiffness: 200, damping: 30 })
  const springY = useSpring(rotateY, { stiffness: 200, damping: 30 })

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      x.set(e.clientX - rect.left - rect.width / 2)
      y.set(e.clientY - rect.top - rect.height / 2)
    }
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
}

const CircularProgress = ({ value, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const PulsingRing = ({ size = 200, color = '#3b82f6' }) => (
  <div className="relative" style={{ width: size, height: size }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full"
        style={{ border: `2px solid ${color}` }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 3,
          delay: i * 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
)

const AnimatedCounter = ({ value, duration = 2 }) => {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setDisplayValue(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{displayValue}</span>
}

const GlowingBorder = ({ children, color = '#3b82f6' }) => (
  <motion.div
    className="relative rounded-2xl overflow-hidden"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <div className="absolute inset-0" style={{
      background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
      animation: 'shimmer 3s infinite',
      backgroundSize: '200% 100%'
    }} />
    <div className="relative z-10">{children}</div>
  </motion.div>
)

const RadarChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <RadarChart data={data}>
      <PolarGrid stroke="rgba(255,255,255,0.1)" />
      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
      <PolarRadiusAxis tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 100]} />
      <Radar
        name="Performance"
        dataKey="A"
        stroke="#3b82f6"
        fill="#3b82f6"
        fillOpacity={0.3}
        strokeWidth={2}
      />
      <Radar
        name="Efficiency"
        dataKey="B"
        stroke="#8b5cf6"
        fill="#8b5cf6"
        fillOpacity={0.2}
        strokeWidth={2}
      />
    </RadarChart>
  </ResponsiveContainer>
)

function App() {
  const [sensors, setSensors] = useState([])
  const [metrics, setMetrics] = useState({ models: [], best_model: null })
  const [history, setHistory] = useState([
    ...Array.from({ length: 15 }, (_, i) => ({
      time: new Date(Date.now() - (15 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actual: 0.5 + (Math.random() - 0.5) * 0.2,
      predicted: 0.5 + (Math.random() - 0.5) * 0.2,
      lstm: 0.5 + (Math.random() - 0.5) * 0.2
    }))
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedRoadType, setSelectedRoadType] = useState('All')
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles] = useState(generateParticles)
  const heroRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const parallaxX = useTransform(mouseX, [-500, 500], [-20, 20])
  const parallaxY = useTransform(mouseY, [-500, 500], [-20, 20])

  const fetchData = async () => {
    try {
      const [sensorsRes, metricsRes] = await Promise.all([
        axios.get(`${API_URL}/sensors`, { timeout: 5000 }),
        axios.get(`${API_URL}/metrics`, { timeout: 5000 })
      ])
      
      setSensors(sensorsRes.data.sensors || generateMockData())
      setMetrics(metricsRes.data || MOCK_METRICS)
      setLastUpdate(new Date())
      setError(null)
      
      const sensorData = sensorsRes.data.sensors || generateMockData()
      const avgCongestion = sensorData.length > 0 
        ? sensorData.reduce((sum, s) => sum + s.congestion, 0) / sensorData.length 
        : 0.5
      
      setHistory(prev => {
        const newHistory = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actual: avgCongestion,
          predicted: avgCongestion + (Math.random() - 0.5) * 0.05,
          lstm: avgCongestion + (Math.random() - 0.5) * 0.08
        }]
        return newHistory.slice(-30)
      })
    } catch (err) {
      console.error('API Error:', err.message || err)
      const mockData = generateMockData()
      setSensors(mockData)
      setMetrics(MOCK_METRICS)
      setLastUpdate(new Date())
      const avgCongestion = mockData.reduce((sum, s) => sum + s.congestion, 0) / mockData.length
      setHistory(prev => {
        const newEntry = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actual: avgCongestion,
          predicted: avgCongestion + (Math.random() - 0.5) * 0.05,
          lstm: avgCongestion + (Math.random() - 0.5) * 0.08
        }
        return [...prev, newEntry].slice(-30)
      })
    } finally {
      setLoading(false)
    }
  }
  
  const generateMockData = () => {
    return MOCK_SENSORS.map(sensor => ({
      ...sensor,
      congestion: Math.max(0.2, Math.min(0.95, sensor.congestion + (Math.random() - 0.5) * 0.1)),
      speed: Math.max(10, Math.min(60, sensor.speed + (Math.random() - 0.5) * 10)),
      volume: Math.max(500, Math.min(4000, sensor.volume + (Math.random() - 0.5) * 200))
    }))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000)
    
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const roadTypes = useMemo(() => {
    const types = ['All', ...new Set(sensors.map(s => s.road_type || 'Unknown'))]
    return types
  }, [sensors])

  const filteredSensors = useMemo(() => {
    if (selectedRoadType === 'All') return sensors
    return sensors.filter(s => s.road_type === selectedRoadType)
  }, [sensors, selectedRoadType])

  const avgCongestion = sensors.length > 0 
    ? (sensors.reduce((sum, s) => sum + s.congestion, 0) / sensors.length)
    : 0

  const getCongestionLevel = (value) => {
    if (value < 0.3) return { label: 'Smooth', color: '#10b981', glow: 'shadow-emerald-500/50' }
    if (value < 0.5) return { label: 'Light', color: '#84cc16', glow: 'shadow-lime-500/50' }
    if (value < 0.65) return { label: 'Moderate', color: '#f59e0b', glow: 'shadow-yellow-500/50' }
    if (value < 0.8) return { label: 'Heavy', color: '#f97316', glow: 'shadow-orange-500/50' }
    return { label: 'Severe', color: '#ef4444', glow: 'shadow-red-500/50' }
  }

  const level = getCongestionLevel(avgCongestion)

  const congestionDistribution = useMemo(() => {
    const dist = { smooth: 0, light: 0, moderate: 0, heavy: 0, severe: 0 }
    sensors.forEach(s => {
      if (s.congestion < 0.3) dist.smooth++
      else if (s.congestion < 0.5) dist.light++
      else if (s.congestion < 0.65) dist.moderate++
      else if (s.congestion < 0.8) dist.heavy++
      else dist.severe++
    })
    return [
      { name: 'Smooth', value: dist.smooth, color: '#10b981' },
      { name: 'Light', value: dist.light, color: '#84cc16' },
      { name: 'Moderate', value: dist.moderate, color: '#f59e0b' },
      { name: 'Heavy', value: dist.heavy, color: '#f97316' },
      { name: 'Severe', value: dist.severe, color: '#ef4444' }
    ]
  }, [sensors])

  const radarData = useMemo(() => [
    { subject: 'Speed', A: 78, B: 65 },
    { subject: 'Flow', A: 85, B: 70 },
    { subject: 'Safety', A: 72, B: 80 },
    { subject: 'Efficiency', A: 90, B: 75 },
    { subject: 'Coverage', A: 95, B: 88 },
    { subject: 'Accuracy', A: 88, B: 92 },
  ], [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 animate-pulse" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center z-10 relative"
        >
          <div className="relative mb-8">
            <PulsingRing size={150} color="#3b82f6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl text-white font-light tracking-widest mb-4"
          >
            TRAFFIC<span className="text-blue-400 font-bold">IQ</span>
          </motion.p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto"
          />
        </motion.div>
      </div>
    )
  }

  if (error || sensors.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-10 relative glass-card p-12 rounded-3xl max-w-lg mx-4"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-gray-400 mb-6">
            {error || 'Unable to load traffic data. Please ensure the backend server is running on port 5000.'}
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry Connection
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 font-inter relative overflow-hidden">
      <AnimatedGrid />
      <FloatingParticles />
      <FloatingBubbles />
      
      <motion.div
        className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          x: parallaxX,
          y: parallaxY,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />
      
      <MorphingShape className="top-20 -left-48" color="#3b82f6" />
      <MorphingShape className="bottom-20 -right-48" color="#8b5cf6" />

      <nav className="glass-card border-b border-white/10 px-6 py-4 sticky top-0 z-50 bg-dark-900/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <motion.div
              className="relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Navigation className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-40 -z-10" />
            </motion.div>
            <div>
              <motion.h1 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
              >
                TrafficIQ
              </motion.h1>
              <p className="text-xs text-gray-500">Real-Time Traffic Intelligence</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-6"
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <motion.span 
                className="relative flex h-3 w-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </motion.span>
              <span className="text-emerald-400 text-sm font-medium">LIVE</span>
            </motion.div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm text-white font-mono">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}
              </p>
            </div>
            <motion.button 
              onClick={fetchData}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </motion.button>
          </motion.div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
          <TiltCard className="relative glass-card p-10 rounded-3xl overflow-hidden" intensity={10}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative">
              <div>
                <motion.div 
                  className="flex items-center gap-3 mb-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </motion.div>
                  <motion.h2 
                    className="text-4xl font-bold text-white"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Delhi/NCR
                  </motion.h2>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-4 text-gray-400"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <motion.span 
                    className="font-mono text-xl text-white"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </motion.span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-4 mt-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-gray-400 border border-white/10 backdrop-blur-sm">
                    {sensors.length} Roads Monitored
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-gray-400 border border-white/10 backdrop-blur-sm">
                    {sensors.length > 0 ? (sensors.reduce((sum, s) => sum + s.speed, 0) / sensors.length).toFixed(0) : 0} km/h Avg
                  </span>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex items-center gap-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <CircularProgress value={avgCongestion * 100} size={160} strokeWidth={10} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      className="text-5xl font-bold"
                      style={{ color: level.color }}
                      key={avgCongestion}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                    >
                      {(avgCongestion * 100).toFixed(0)}%
                    </motion.span>
                    <span className="text-sm text-gray-400">Congestion</span>
                  </div>
                </div>
                
                <motion.div 
                  className="px-8 py-4 rounded-2xl backdrop-blur-xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${level.color}20, ${level.color}05)`,
                    border: `1px solid ${level.color}40`,
                    boxShadow: `0 0 40px ${level.color}30, inset 0 0 20px ${level.color}10`
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="relative flex h-4 w-4 mb-3 mx-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: level.color }} />
                    <span className="relative inline-flex rounded-full h-4 w-4" style={{ backgroundColor: level.color }} />
                  </span>
                  <motion.span 
                    className="text-2xl font-bold block text-center"
                    style={{ color: level.color, textShadow: `0 0 20px ${level.color}50` }}
                  >
                    {level.label}
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </TiltCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TiltCard className="glass-card p-6 rounded-2xl" intensity={5}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Congestion Distribution</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={congestionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {congestionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {congestionDistribution.slice(0, 3).map(item => (
                <motion.div 
                  key={item.name} 
                  className="text-center p-2 rounded-lg bg-white/5"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}50` }} />
                  <span className="text-xs text-gray-400">{item.name}</span>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </TiltCard>

          <TiltCard className="lg:col-span-2 glass-card p-6 rounded-2xl" intensity={5}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Traffic Flow Analysis</h3>
              </div>
              <motion.span 
                className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Last 30 min
              </motion.span>
            </div>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorActual3D" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted3D" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    fill="url(#colorActual3D)" 
                    strokeWidth={3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    fill="url(#colorPredicted3D)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TiltCard>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <BarChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Road-wise Congestion Levels</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={sensors.slice().sort((a, b) => b.congestion - a.congestion).slice(0, 10).map(s => ({
                  name: s.name.length > 18 ? s.name.substring(0, 18) + '...' : s.name,
                  fullName: s.name,
                  congestion: (s.congestion * 100).toFixed(0),
                  fill: getCongestionColor(s.congestion)
                }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  stroke="#6b7280" 
                  fontSize={10}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={9}
                  width={95}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px'
                  }}
                  formatter={(value, name, props) => [`${value}%`, props.payload.fullName]}
                />
                <Bar 
                  dataKey="congestion" 
                  radius={[0, 4, 4, 0]}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))' }}
                >
                  {sensors.slice().sort((a, b) => b.congestion - a.congestion).slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCongestionColor(entry.congestion)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <h3 className="text-2xl font-bold text-white">Delhi NCR Roads</h3>
            <motion.span 
              className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {filteredSensors.length} of {sensors.length}
            </motion.span>
          </motion.div>
          
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative"
          >
            <motion.button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Filter</span>
              <motion.div
                animate={{ rotate: filterOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute right-0 mt-3 w-64 glass-card rounded-2xl p-3 z-50"
                >
                  {roadTypes.map(type => (
                    <motion.button
                      key={type}
                      onClick={() => {
                        setSelectedRoadType(type)
                        setFilterOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                        selectedRoadType === type 
                          ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border border-blue-500/30' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      {type}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"
          layout
        >
          {filteredSensors.slice(0, 24).map((sensor, index) => (
            <RoadCard3D 
              key={sensor.sensor_id} 
              sensor={sensor} 
              index={index}
              isSelected={selectedSensor?.sensor_id === sensor.sensor_id}
              onClick={() => setSelectedSensor(sensor)}
            />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TiltCard className="glass-card p-6 rounded-2xl" intensity={8}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Orbit className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Performance Radar</h3>
              </div>
            </div>
            <RadarChartComponent data={radarData} />
          </TiltCard>

          <TiltCard className="glass-card p-6 rounded-2xl" intensity={8}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Live Alerts</h3>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {sensors
                .filter(s => s.congestion > 0.65)
                .sort((a, b) => b.congestion - a.congestion)
                .slice(0, 6)
                .map((sensor, idx) => {
                  const level = getCongestionLevel(sensor.congestion)
                  return (
                    <motion.div
                      key={sensor.sensor_id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl border backdrop-blur-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${level.color}10, transparent)`,
                        borderColor: `${level.color}30`
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{sensor.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{sensor.road_type}</p>
                        </div>
                        <motion.span 
                          className="text-2xl font-bold"
                          style={{ color: level.color }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {(sensor.congestion * 100).toFixed(0)}%
                        </motion.span>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </TiltCard>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delhi/NCR Traffic Map</h3>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/10">
                {sensors.length} roads
              </span>
            </div>
          </div>
          
          <div className="h-[500px] rounded-xl overflow-hidden relative">
            <MapContainer 
              center={[28.6139, 77.2090]} 
              zoom={11} 
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {Object.entries(ROAD_SEGMENTS).map(([id, road]) => {
                const sensor = sensors.find(s => s.sensor_id === id)
                const congestion = sensor?.congestion || 0.5
                const color = getCongestionColor(congestion)
                const opacity = 0.4 + (congestion * 0.5)
                const isSelected = selectedSensor?.sensor_id === id
                
                return (
                  <React.Fragment key={id}>
                    <Polyline
                      positions={road.coords}
                      pathOptions={{
                        color: color,
                        weight: isSelected ? 8 : 5,
                        opacity: opacity,
                        lineCap: 'round',
                        lineJoin: 'round'
                      }}
                      eventHandlers={{
                        mouseover: (e) => {
                          e.target.setStyle({ weight: 8, opacity: 1 })
                        },
                        mouseout: (e) => {
                          e.target.setStyle({ weight: isSelected ? 8 : 5, opacity })
                        },
                        click: () => setSelectedSensor(sensor)
                      }}
                    >
                      <MapTooltip sticky>
                        <div className="p-2 min-w-[180px]">
                          <h4 className="font-bold text-white mb-2 text-sm">{road.name}</h4>
                          {sensor && (
                            <div className="space-y-1 text-xs">
                              <p>
                                <span className="text-gray-500">Congestion:</span>{' '}
                                <span style={{ color }}>{(congestion * 100).toFixed(0)}%</span>
                              </p>
                              <p>
                                <span className="text-gray-500">Speed:</span> {sensor.speed} km/h
                              </p>
                              <p>
                                <span className="text-gray-500">Type:</span> {road.type}
                              </p>
                            </div>
                          )}
                        </div>
                      </MapTooltip>
                    </Polyline>
                    
                    <CircleMarker
                      center={road.coords[Math.floor(road.coords.length / 2)]}
                      radius={5}
                      pathOptions={{
                        color: '#fff',
                        fillColor: color,
                        fillOpacity: 1,
                        weight: 2
                      }}
                    />
                  </React.Fragment>
                )
              })}
            </MapContainer>
            
            <motion.div 
              className="absolute top-4 right-4 z-[1000] glass-card rounded-xl p-4"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-400 mb-3 font-medium">Congestion Level</p>
              <div className="space-y-2">
                {[
                  { label: 'Smooth (<30%)', color: '#10b981' },
                  { label: 'Light (30-50%)', color: '#84cc16' },
                  { label: 'Moderate (50-65%)', color: '#f59e0b' },
                  { label: 'Heavy (65-80%)', color: '#f97316' },
                  { label: 'Severe (>80%)', color: '#ef4444' }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <motion.div 
                      className="w-8 h-3 rounded-sm"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}50` }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Model Performance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics?.models?.map((model, idx) => {
              const isWinner = model.name === metrics.best_model
              return (
                <motion.div 
                  key={model.name}
                  className={`p-6 rounded-2xl border transition-all ${
                    isWinner 
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/40 shadow-lg shadow-blue-500/20' 
                      : 'bg-dark-800/50 border-white/5'
                  }`}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">{model.name}</h4>
                    {isWinner && (
                      <motion.div 
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Zap className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white">BEST</span>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'MAE', value: model.mae, color: 'from-blue-500 to-cyan-500' },
                      { label: 'RMSE', value: model.rmse, color: 'from-emerald-500 to-teal-500' },
                      { label: 'R²', value: model.r2, color: 'from-amber-500 to-orange-500' }
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">{metric.label}</span>
                          <span className="text-white font-medium font-mono">{metric.value.toFixed(4)}</span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(1 - metric.value) * 100}%` }}
                            transition={{ delay: 0.5 + idx * 0.2, duration: 1 }}
                            className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                            style={{ boxShadow: `0 0 10px ${metric.color.includes('blue') ? '#3b82f6' : metric.color.includes('emerald') ? '#10b981' : '#f59e0b'}50` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 border-t border-white/5"
        >
          <motion.div 
            className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-4"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-medium">TrafficIQ</span>
            </span>
            <span className="text-gray-700">•</span>
            <span>CNN-LSTM Deep Learning</span>
            <span className="text-gray-700">•</span>
            <span>TomTom Traffic API</span>
          </motion.div>
          <p className="text-xs text-gray-600">
            Real-Time Traffic Intelligence for Delhi NCR
          </p>
        </motion.footer>
      </main>
    </div>
  )
}

function RoadCard3D({ sensor, index, isSelected, onClick }) {
  const level = getCongestionLevel(sensor.congestion)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const cardRef = useRef(null)

  const rotateX = useTransform(y, [-100, 100], [5, -5])
  const rotateY = useTransform(x, [-100, 100], [-5, 5])

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      x.set(e.clientX - rect.left - rect.width / 2)
      y.set(e.clientY - rect.top - rect.height / 2)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const sparklineData = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      value: Math.max(0, Math.min(1, sensor.congestion + (Math.sin(i * 0.5) * 0.15)))
    })), 
  [sensor.congestion])

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="relative cursor-pointer"
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03, z: 50 }}
    >
      <div 
        className="glass-card p-5 rounded-2xl transition-all duration-300"
        style={{ 
          borderColor: isSelected ? '#3b82f6' : `${level.color}30`,
          boxShadow: isSelected 
            ? `0 0 40px ${level.color}40` 
            : `0 10px 40px ${level.color}15`,
          transform: 'translateZ(20px)'
        }}
      >
        <div className="flex items-start justify-between mb-4" style={{ transform: 'translateZ(30px)' }}>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">{sensor.name}</h4>
            <span className="px-2 py-1 rounded text-[10px] font-medium bg-white/5 text-gray-400 border border-white/10 mt-1 inline-block">
              {sensor.road_type}
            </span>
          </div>
          <motion.div 
            className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ 
              backgroundColor: `${level.color}20`, 
              color: level.color,
              boxShadow: `0 0 15px ${level.color}30`
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level.label}
          </motion.div>
        </div>

        <div className="mb-4" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Congestion</span>
            <span className="font-bold" style={{ color: level.color }}>
              {(sensor.congestion * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${sensor.congestion * 100}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ 
                backgroundColor: level.color,
                boxShadow: `0 0 15px ${level.color}80`
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4" style={{ transform: 'translateZ(15px)' }}>
          <div className="bg-dark-800/50 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
              <Car className="w-3 h-3" />
              Speed
            </p>
            <p className="text-lg font-bold text-white">
              {sensor.speed.toFixed(0)} 
              <span className="text-[10px] font-normal text-gray-500 ml-1">km/h</span>
            </p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
              <Users className="w-3 h-3" />
              Volume
            </p>
            <p className="text-lg font-bold text-white">
              {sensor.volume >= 1000 ? (sensor.volume / 1000).toFixed(1) : sensor.volume.toFixed(0)}
              <span className="text-[10px] font-normal text-gray-500 ml-1">{sensor.volume >= 1000 ? 'K' : ''}/hr</span>
            </p>
          </div>
        </div>

        <div className="h-12" style={{ transform: 'translateZ(10px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`gradient3d-${sensor.sensor_id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={level.color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={level.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={level.color} 
                fill={`url(#gradient3d-${sensor.sensor_id})`}
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 5px ${level.color}80)` }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5" style={{ transform: 'translateZ(10px)' }}>
          <span className="text-[10px] text-gray-500">{sensor.sensor_id}</span>
          <div className="flex items-center gap-1">
            {Math.random() > 0.5 ? (
              <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity }}>
                <ChevronUp className="w-3 h-3 text-red-400" />
              </motion.div>
            ) : (
              <motion.div animate={{ y: [2, -2, 2] }} transition={{ duration: 1, repeat: Infinity }}>
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              </motion.div>
            )}
            <span className="text-[10px] text-gray-500">vs 1h ago</span>
          </div>
        </div>
      </div>
      
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${level.color}20, transparent 50%)`,
          transform: 'translateZ(-10px)'
        }}
      />
    </motion.div>
  )
}

function getCongestionLevel(value) {
  if (value < 0.3) return { label: 'Smooth', color: '#10b981' }
  if (value < 0.5) return { label: 'Light', color: '#84cc16' }
  if (value < 0.65) return { label: 'Moderate', color: '#f59e0b' }
  if (value < 0.8) return { label: 'Heavy', color: '#f97316' }
  return { label: 'Severe', color: '#ef4444' }
}

export default App

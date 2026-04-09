import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Polyline, Tooltip as MapTooltip, useMap } from 'react-leaflet'
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

const API_URL = import.meta.env.VITE_API_URL || ''

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

const TILE_STYLES = {
  night: {
    label: 'Night Grid',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  terrain: {
    label: 'Terrain Light',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
}

const MapAutoFocus = ({ sensor }) => {
  const map = useMap()

  useEffect(() => {
    if (sensor?.lat && sensor?.lon) {
      map.flyTo([sensor.lat, sensor.lon], 12, { duration: 1.2 })
    }
  }, [map, sensor])

  return null
}

const getCongestionColor = (congestion) => {
  if (congestion < 0.3) return '#2a9d8f' // Teal
  if (congestion < 0.5) return '#e9c46a' // Sand
  if (congestion < 0.65) return '#f4a261' // Clay
  if (congestion < 0.8) return '#e76f51' // Burnt Orange
  return '#c1121f' // Crimson
}

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    color: ['#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#c1121f'][Math.floor(Math.random() * 5)]
  }))
}

function generateBubbles() {
  return Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 60 + 20,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    color: ['rgba(42, 157, 143, 0.08)', 'rgba(233, 196, 106, 0.08)', 'rgba(231, 111, 81, 0.08)'][Math.floor(Math.random() * 3)]
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
        linear-gradient(rgba(233, 196, 106, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(233, 196, 106, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
      animation: 'gridMove 20s linear infinite'
    }} />
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(42, 157, 143, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(42, 157, 143, 0.025) 1px, transparent 1px)
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
        style={{ filter: 'drop-shadow(0 0 10px rgba(244, 162, 97, 0.45))' }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4a261" />
          <stop offset="100%" stopColor="#2a9d8f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const PulsingRing = ({ size = 200, color = '#f4a261' }) => (
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

const GlowingBorder = ({ children, color = '#f4a261' }) => (
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
        stroke="#f4a261"
        fill="#f4a261"
        fillOpacity={0.3}
        strokeWidth={3}
      />
      <Radar
        name="Efficiency"
        dataKey="B"
        stroke="#2a9d8f"
        fill="#2a9d8f"
        fillOpacity={0.2}
        strokeWidth={3}
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
  const [mapStyle, setMapStyle] = useState('night')
  const [flowTick, setFlowTick] = useState(0)
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
    const flowInterval = setInterval(() => setFlowTick(prev => (prev + 1) % 300), 120)
    
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
      clearInterval(flowInterval)
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
    if (value < 0.3) return { label: 'Smooth', color: '#2a9d8f', glow: 'shadow-emerald-500/50' }
    if (value < 0.5) return { label: 'Light', color: '#e9c46a', glow: 'shadow-amber-500/50' }
    if (value < 0.65) return { label: 'Moderate', color: '#f4a261', glow: 'shadow-orange-500/50' }
    if (value < 0.8) return { label: 'Heavy', color: '#e76f51', glow: 'shadow-red-500/50' }
    return { label: 'Severe', color: '#c1121f', glow: 'shadow-red-700/50' }
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
      { name: 'Smooth', value: dist.smooth, color: '#2a9d8f' },
      { name: 'Light', value: dist.light, color: '#e9c46a' },
      { name: 'Moderate', value: dist.moderate, color: '#f4a261' },
      { name: 'Heavy', value: dist.heavy, color: '#e76f51' },
      { name: 'Severe', value: dist.severe, color: '#c1121f' }
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
      <div className="min-h-screen bg-dark-950 flex items-center justify-center relative overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-emerald-900/20 to-pink-900/20 animate-pulse" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center z-10 relative"
        >
          <div className="relative mb-8">
            <PulsingRing size={150} color="#f4a261" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full"
              />
            </div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl text-white font-space font-light tracking-[0.2em] mb-4"
          >
            TRAFFIC<span className="text-amber-400 font-bold">IQ</span>
          </motion.p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 240 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="h-0.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-pink-500 rounded-full mx-auto"
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
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-500 rounded-xl text-white font-medium"
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
    <div className="min-h-screen bg-dark-950 font-inter relative overflow-hidden">
      <div className="scanline" />
      <div className="noise-bg" />
      <div className="topo-overlay" />
      <AnimatedGrid />
      <FloatingParticles />
      <FloatingBubbles />
      
      <motion.div
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          x: parallaxX,
          y: parallaxY,
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />
      
      <MorphingShape className="top-20 -left-48" color="#f4a261" />
      <MorphingShape className="bottom-20 -right-48" color="#2a9d8f" />

      <nav className="glass-card border-b border-white/5 px-6 py-4 sticky top-0 z-50 bg-dark-950/40 backdrop-blur-3xl">
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
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-emerald-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Navigation className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur-lg opacity-20 -z-10" />
            </motion.div>
            <div>
              <motion.h1 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-space font-bold bg-gradient-to-r from-white via-amber-100 to-emerald-100 bg-clip-text text-transparent"
              >
                TrafficIQ
              </motion.h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">Urban Flow Intelligence</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-8"
          >
            <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-tighter text-gray-500">System Pulse</p>
                <p className="text-sm text-amber-400 font-mono font-bold tracking-tighter">SYNCHRONIZED</p>
              </div>
              <motion.div 
                className="w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Cpu className="w-4 h-4 text-amber-400" />
              </motion.div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-tighter text-gray-500">Live Timestamp</p>
              <p className="text-sm text-white font-mono">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}
              </p>
            </div>
            <motion.button 
              onClick={fetchData}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw className="w-5 h-5 text-amber-400" />
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
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
          <TiltCard className="relative glass-card p-12 rounded-[32px] overflow-hidden" intensity={5}>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-[80px]" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 relative">
              <div className="flex-1">
                <motion.div 
                  className="flex items-center gap-4 mb-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <motion.h2 
                    className="text-5xl font-space font-bold text-white tracking-tight"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Delhi / NCR
                  </motion.h2>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-6 text-gray-400"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">{currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-700" />
                  <motion.span 
                    className="font-mono text-2xl text-white font-bold tracking-tighter"
                  >
                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </motion.span>
                </motion.div>
                
                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
                      {sensors.length} Active Nodes
                    </span>
                  </div>
                  <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
                      {(sensors.reduce((sum, s) => sum + s.speed, 0) / sensors.length).toFixed(0)} KM/H NOMINAL
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-12 bg-white/[0.02] p-8 rounded-[40px] border border-white/5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all duration-500" />
                  <CircularProgress value={avgCongestion * 100} size={180} strokeWidth={12} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      className="text-6xl font-space font-bold tracking-tighter"
                      style={{ color: level.color }}
                      key={avgCongestion}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {(avgCongestion * 100).toFixed(0)}%
                    </motion.span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Congestion</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Flow Status</p>
                  <motion.div 
                    className="px-10 py-5 rounded-3xl backdrop-blur-3xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${level.color}20, ${level.color}05)`,
                      border: `1px solid ${level.color}30`,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span 
                      className="text-3xl font-space font-black block text-center uppercase italic tracking-tighter"
                      style={{ color: level.color, textShadow: `0 0 20px ${level.color}40` }}
                    >
                      {level.label}
                    </motion.span>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: level.color }} />
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Verified</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TiltCard className="glass-card p-8 rounded-3xl" intensity={3}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-space font-bold text-white tracking-tight">Congestion Distribution</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Live Breakdown</p>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={congestionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {congestionDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-6">
              {congestionDistribution.map(item => (
                <div key={item.name} className="text-center">
                  <div className="w-1.5 h-1.5 rounded-full mx-auto mb-2" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                  <p className="text-[10px] font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </TiltCard>

          <TiltCard className="lg:col-span-2 glass-card p-8 rounded-3xl" intensity={2}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-space font-bold text-white tracking-tight">Traffic Flow Analysis</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Real-Time Predictive Modeling</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Stream</span>
              </div>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorActual3D" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f4a261" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f4a261" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted3D" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#f4a261" 
                    fill="url(#colorActual3D)" 
                    strokeWidth={4}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(244, 162, 97, 0.35))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#2a9d8f" 
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
          className="glass-card p-8 rounded-3xl mb-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-space font-bold text-white tracking-tight">Road-wise Congestion Index</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Top 10 High-Traffic Sectors</p>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={sensors.slice().sort((a, b) => b.congestion - a.congestion).slice(0, 10).map(s => ({
                  name: s.name.length > 22 ? s.name.substring(0, 22) + '...' : s.name,
                  fullName: s.name,
                  congestion: (s.congestion * 100).toFixed(0),
                  fill: getCongestionColor(s.congestion)
                }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                barSize={12}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  stroke="#475569" 
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#f8fafc" 
                  fontSize={11}
                  width={130}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px'
                  }}
                  formatter={(value, name, props) => [`${value}%`, props.payload.fullName]}
                />
                <Bar 
                  dataKey="congestion" 
                  radius={[0, 10, 10, 0]}
                >
                  {sensors.slice().sort((a, b) => b.congestion - a.congestion).slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCongestionColor(entry.congestion)} 
                      style={{ filter: `drop-shadow(0 0 10px ${getCongestionColor(entry.congestion)}60)` }}
                    />
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
              className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500/20 to-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm"
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
                          ? 'bg-gradient-to-r from-amber-500/30 to-amber-500/30 text-white border border-amber-500/30' 
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
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <TiltCard className="glass-card p-8 rounded-3xl" intensity={4}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Orbit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-space font-bold text-white tracking-tight">System Performance Radar</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Multi-dimensional Analysis</p>
                </div>
              </div>
            </div>
            <RadarChartComponent data={radarData} />
          </TiltCard>

          <TiltCard className="glass-card p-8 rounded-3xl" intensity={4}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-space font-bold text-white tracking-tight">Real-Time Traffic Alerts</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Critical Flow Disruptions</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {sensors
                .filter(s => s.congestion > 0.65)
                .sort((a, b) => b.congestion - a.congestion)
                .slice(0, 8)
                .map((sensor, idx) => {
                  const level = getCongestionLevel(sensor.congestion)
                  return (
                    <motion.div
                      key={sensor.sensor_id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl border backdrop-blur-3xl group hover:bg-white/[0.02] transition-colors"
                      style={{ 
                        background: `linear-gradient(90deg, ${level.color}10, transparent)`,
                        borderColor: `${level.color}20`
                      }}
                      whileHover={{ x: 8 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${level.color}20` }}>
                            <Signal className="w-5 h-5" style={{ color: level.color }} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm tracking-tight">{sensor.name}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{sensor.road_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.span 
                            className="text-xl font-space font-black block tracking-tighter"
                            style={{ color: level.color }}
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            {(sensor.congestion * 100).toFixed(0)}%
                          </motion.span>
                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter">Congestion</p>
                        </div>
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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delhi/NCR Traffic Map</h3>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/10">
                {sensors.length} roads
              </span>
            </div>

            <div className="flex items-center gap-2">
              {Object.entries(TILE_STYLES).map(([key, style]) => (
                <motion.button
                  key={key}
                  onClick={() => setMapStyle(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mapStyle === key
                      ? 'bg-gradient-to-r from-amber-500/30 to-emerald-500/30 text-white border border-amber-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {style.label}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="h-[500px] rounded-xl overflow-hidden relative map-shell">
            <MapContainer 
              center={[28.6139, 77.2090]} 
              zoom={11} 
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              className="z-0"
            >
              <MapAutoFocus sensor={selectedSensor} />
              <TileLayer
                attribution={TILE_STYLES[mapStyle].attribution}
                url={TILE_STYLES[mapStyle].url}
              />
              
              {Object.entries(ROAD_SEGMENTS).map(([id, road]) => {
                const sensor = sensors.find(s => s.sensor_id === id)
                const congestion = sensor?.congestion || 0.5
                const color = getCongestionColor(congestion)
                const opacity = 0.4 + (congestion * 0.5)
                const isSelected = selectedSensor?.sensor_id === id
                const beaconRadius = (isSelected ? 9 : 6) + ((flowTick % 24) / 12)
                const pulseOpacity = isSelected ? 0.4 : 0.22
                
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

                    <Polyline
                      positions={road.coords}
                      pathOptions={{
                        color: '#f8fafc',
                        weight: isSelected ? 4 : 2,
                        opacity: isSelected ? 0.45 : 0.25,
                        dashArray: isSelected ? '14 10' : '10 14',
                        dashOffset: `${flowTick * 3}`
                      }}
                    />
                    
                    <CircleMarker
                      center={road.coords[Math.floor(road.coords.length / 2)]}
                      radius={beaconRadius + 5}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: pulseOpacity,
                        opacity: 0.5,
                        weight: 1
                      }}
                    />

                    <CircleMarker
                      center={road.coords[Math.floor(road.coords.length / 2)]}
                      radius={beaconRadius}
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
              className="absolute left-4 bottom-4 z-[1000] glass-card rounded-xl p-4"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-amber-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <p className="text-xs text-gray-300 font-semibold">Live Route Flow</p>
              </div>
              <p className="text-[11px] text-gray-400">Animated vectors are synced to congestion intensity.</p>
            </motion.div>
            
            <motion.div 
              className="absolute top-4 right-4 z-[1000] glass-card rounded-xl p-4"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-400 mb-3 font-medium">Congestion Level</p>
                <div className="space-y-2">
                {[
                  { label: 'Smooth (<30%)', color: '#2a9d8f' },
                  { label: 'Light (30-50%)', color: '#e9c46a' },
                  { label: 'Moderate (50-65%)', color: '#f4a261' },
                  { label: 'Heavy (65-80%)', color: '#e76f51' },
                  { label: 'Severe (>80%)', color: '#c1121f' }
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
          className="glass-card p-10 rounded-[32px] mb-12"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-space font-bold text-white tracking-tight">AI Model Benchmark Matrix</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Deep Learning Accuracy Report</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {metrics?.models?.map((model, idx) => {
              const isWinner = model.name === metrics.best_model
              return (
                <motion.div 
                  key={model.name}
                  className={`p-8 rounded-[24px] border transition-all duration-500 ${
                    isWinner 
                      ? 'bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border-amber-500/40 shadow-2xl shadow-amber-500/10' 
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-space font-bold text-white tracking-tight">{model.name}</h4>
                    {isWinner && (
                      <motion.div 
                        className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Zap className="w-3 h-3 text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Optimal</span>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { label: 'MAE', value: model.mae, color: 'from-amber-400 to-emerald-500' },
                      { label: 'RMSE', value: model.rmse, color: 'from-emerald-400 to-amber-500' },
                      { label: 'R-Squared', value: model.r2, color: 'from-pink-400 to-rose-500' }
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-[10px] mb-2">
                          <span className="text-gray-500 font-bold uppercase tracking-widest">{metric.label}</span>
                          <span className="text-white font-mono font-bold">{metric.value.toFixed(4)}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(1 - metric.value) * 100}%` }}
                            transition={{ delay: 0.5 + idx * 0.2, duration: 1.5, ease: "circOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
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
          className="text-center py-12 border-t border-white/5 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <motion.div 
            className="flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600 mb-6"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-gray-300">TrafficIQ Core</span>
            </span>
            <span>CNN-LSTM Architecture</span>
            <span>Temporal-Spatial Analysis</span>
          </motion.div>
          <p className="text-[10px] text-gray-700 font-medium max-w-md mx-auto leading-relaxed">
            Proprietary Real-Time Urban Mobility Intelligence for Delhi National Capital Region.
            Data Powered by TomTom Flow APIs.
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

  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

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
      className="relative cursor-pointer group"
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, z: 50 }}
    >
      <div 
        className="glass-card p-6 rounded-[24px] transition-all duration-500 overflow-hidden"
        style={{ 
          borderColor: isSelected ? '#f4a261' : 'rgba(255,255,255,0.05)',
          background: isSelected ? 'rgba(244, 162, 97, 0.06)' : 'rgba(15, 23, 42, 0.4)',
          boxShadow: isSelected 
            ? `0 0 40px ${level.color}30` 
            : `0 20px 40px rgba(0,0,0,0.3)`,
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: `${level.color}40` }} />
        <div className="absolute top-0 left-0 w-1/3 h-1" style={{ backgroundColor: level.color }} />

        <div className="flex items-start justify-between mb-6" style={{ transform: 'translateZ(40px)' }}>
          <div className="flex-1 min-w-0">
            <h4 className="font-space font-bold text-white text-base truncate tracking-tight">{sensor.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-white/5 text-gray-400 border border-white/5">
                {sensor.road_type}
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{sensor.sensor_id}</span>
            </div>
          </div>
          <motion.div 
            className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic"
            style={{ 
              backgroundColor: `${level.color}15`, 
              color: level.color,
              border: `1px solid ${level.color}30`
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level.label}
          </motion.div>
        </div>

        <div className="space-y-4" style={{ transform: 'translateZ(30px)' }}>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Congestion Index</span>
              <span className="text-xl font-space font-black tracking-tighter" style={{ color: level.color }}>
                {(sensor.congestion * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sensor.congestion * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full relative"
                style={{ backgroundColor: level.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 group-hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Velocity</span>
              </div>
              <p className="text-xl font-space font-bold text-white tracking-tighter">
                {sensor.speed.toFixed(0)} 
                <span className="text-[10px] font-normal text-gray-500 ml-1 uppercase">kmh</span>
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 group-hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Volume</span>
              </div>
              <p className="text-xl font-space font-bold text-white tracking-tighter">
                {sensor.volume >= 1000 ? (sensor.volume / 1000).toFixed(1) : sensor.volume.toFixed(0)}
                <span className="text-[10px] font-normal text-gray-500 ml-1 uppercase">{sensor.volume >= 1000 ? 'K' : ''}/h</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-10 opacity-40 group-hover:opacity-100 transition-opacity" style={{ transform: 'translateZ(20px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`cardGradient-${sensor.sensor_id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={level.color} stopOpacity={0.4}/>
                  <stop offset="100%" stopColor={level.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={level.color} 
                fill={`url(#cardGradient-${sensor.sensor_id})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-transparent to-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>
    </motion.div>
  )
}

function getCongestionLevel(value) {
  if (value < 0.3) return { label: 'Smooth', color: '#2a9d8f' }
  if (value < 0.5) return { label: 'Light', color: '#e9c46a' }
  if (value < 0.65) return { label: 'Moderate', color: '#f4a261' }
  if (value < 0.8) return { label: 'Heavy', color: '#e76f51' }
  return { label: 'Severe', color: '#c1121f' }
}

export default App


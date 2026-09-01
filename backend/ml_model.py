"""
Machine Learning module for Prayana (CityFlow).
Trains a scikit-learn regression model at startup on synthetic urban traffic patterns.
Predicts real-time congestion scores and dynamic ETA multipliers for road corridors.
"""

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from typing import Dict, Any, List
import datetime

class CongestionMLModel:
    def __init__(self):
        self.model = None
        self._train_startup_model()

    def _generate_synthetic_training_data(self, n_samples: int = 6000):
        np.random.seed(42)
        
        # Features:
        # 1. hour_of_day (0.0 - 23.9)
        # 2. is_weekend (0 or 1)
        # 3. base_edge_capacity (1500 - 3500 vehicles/hr)
        # 4. current_vehicle_count (100 - 3800)
        # 5. weather_severity (0.0 = clear, 1.0 = heavy downpour)
        # 6. incident_flag (0 = normal, 1 = active roadblock/breakdown)
        
        hours = np.random.uniform(0, 24, n_samples)
        is_weekend = np.random.binomial(1, 0.28, n_samples)
        capacity = np.random.uniform(1500, 3500, n_samples)
        vehicle_count = np.random.uniform(100, 4000, n_samples)
        weather = np.random.beta(1.5, 5.0, n_samples) # mostly low, occasional storms
        incidents = np.random.binomial(1, 0.08, n_samples)
        
        # Calculate realistic congestion score (0.0 to 1.0)
        # Peak rush hours: 8:30-10:30 (morning) and 17:30-20:30 (evening)
        morning_peak = np.exp(-((hours - 9.25) ** 2) / 2.5) * (1.0 - 0.4 * is_weekend)
        evening_peak = np.exp(-((hours - 18.5) ** 2) / 3.0) * (1.0 - 0.3 * is_weekend)
        rush_intensity = 0.55 * np.maximum(morning_peak, evening_peak)
        
        volume_capacity_ratio = vehicle_count / capacity
        base_vcr_impact = np.clip(volume_capacity_ratio * 0.45, 0.0, 0.6)
        weather_impact = weather * 0.25
        incident_impact = incidents * 0.35
        
        noise = np.random.normal(0, 0.04, n_samples)
        
        raw_congestion = (
            0.15 + 
            rush_intensity + 
            base_vcr_impact + 
            weather_impact + 
            incident_impact + 
            noise
        )
        
        target_congestion = np.clip(raw_congestion, 0.05, 0.98)
        
        X = np.column_stack([
            hours,
            is_weekend,
            capacity,
            vehicle_count,
            weather,
            incidents
        ])
        
        return X, target_congestion

    def _train_startup_model(self):
        """Train regression pipeline at startup in <1 second."""
        X, y = self._generate_synthetic_training_data()
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('regressor', RandomForestRegressor(n_estimators=45, max_depth=10, random_state=42, n_jobs=-1))
        ])
        self.model.fit(X, y)
        print(f"[Prayana AI] ML Congestion model trained successfully on {len(X)} synthetic urban data points.")

    def predict_congestion(
        self, 
        hour: float, 
        is_weekend: int, 
        capacity: float, 
        vehicle_count: float, 
        weather_severity: float = 0.1, 
        incident_flag: int = 0
    ) -> Dict[str, Any]:
        """Predict congestion score and calculate speed/ETA multiplier."""
        input_data = np.array([[hour, is_weekend, capacity, vehicle_count, weather_severity, incident_flag]])
        score = float(np.clip(self.model.predict(input_data)[0], 0.05, 0.98))
        
        # Calculate impact metrics
        # score < 0.35 -> Smooth (1.0x ETA)
        # 0.35 - 0.60 -> Moderate (1.15x - 1.35x ETA)
        # 0.60 - 0.80 -> Heavy (1.4x - 1.8x ETA)
        # > 0.80 -> Severe gridlock (1.9x - 2.5x ETA)
        if score < 0.35:
            severity = "Low"
            color = "#2DB88C" # Green
            eta_multiplier = 1.0 + (score * 0.3)
            recommendation = "Optimal route. Minimal delays expected."
        elif score < 0.65:
            severity = "Moderate"
            color = "#4C8DFF" # Blue
            eta_multiplier = 1.15 + ((score - 0.35) * 0.8)
            recommendation = "Steady traffic flow. Standard transit time."
        elif score < 0.82:
            severity = "High"
            color = "#E8A33D" # Amber
            eta_multiplier = 1.45 + ((score - 0.65) * 1.5)
            recommendation = "Heavy bottleneck detected. CityFlow suggests eco-corridor reroute."
        else:
            severity = "Severe"
            color = "#E2574C" # Red
            eta_multiplier = 1.85 + ((score - 0.82) * 2.2)
            recommendation = "Gridlock alert! Multi-modal Metro transit highly advised."
            
        return {
            "congestion_score": round(score, 3),
            "severity": severity,
            "color": color,
            "eta_multiplier": round(eta_multiplier, 2),
            "estimated_speed_kmh": round(max(10.0, 50.0 * (1.0 - (score * 0.75))), 1),
            "recommendation": recommendation
        }

# Global singleton
ml_engine = CongestionMLModel()

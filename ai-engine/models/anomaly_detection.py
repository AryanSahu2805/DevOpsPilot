import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from scipy import stats
import logging

logger = logging.getLogger(__name__)

class AnomalyDetectionModel:
    """
    AI-powered anomaly detection model for system metrics
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.models = {}
        self.scalers = {}
        self.thresholds = {}
        self.is_trained = False
        self.last_training = None
        
        # Default configuration
        self.default_config = {
            'isolation_forest': {
                'contamination': 0.1,
                'random_state': 42,
                'n_estimators': 100
            },
            'dbscan': {
                'eps': 0.5,
                'min_samples': 5
            },
            'statistical': {
                'z_score_threshold': 3.0,
                'iqr_multiplier': 1.5
            },
            'window_size': 24,  # hours
            'min_anomalies': 3,
            'confidence_threshold': 0.7
        }
        
        # Merge with provided config
        self.config = {**self.default_config, **self.config}
    
    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess input data for anomaly detection
        """
        try:
            # Handle missing values
            data = data.fillna(method='ffill').fillna(method='bfill')
            
            # Remove outliers using IQR method
            for column in data.select_dtypes(include=[np.number]).columns:
                Q1 = data[column].quantile(0.25)
                Q3 = data[column].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - self.config['statistical']['iqr_multiplier'] * IQR
                upper_bound = Q3 + self.config['statistical']['iqr_multiplier'] * IQR
                data = data[(data[column] >= lower_bound) & (data[column] <= upper_bound)]
            
            # Normalize numerical columns
            numerical_columns = data.select_dtypes(include=[np.number]).columns
            if len(numerical_columns) > 0:
                scaler = StandardScaler()
                data[numerical_columns] = scaler.fit_transform(data[numerical_columns])
                self.scalers['standard'] = scaler
            
            return data
            
        except Exception as e:
            logger.error(f"Error preprocessing data: {e}")
            return data
    
    def train_isolation_forest(self, data: pd.DataFrame, metric_name: str):
        """
        Train Isolation Forest model for a specific metric
        """
        try:
            if len(data) < 10:
                logger.warning(f"Insufficient data for training Isolation Forest on {metric_name}")
                return
            
            # Prepare data
            X = data.select_dtypes(include=[np.number]).values
            
            # Train model
            model = IsolationForest(
                contamination=self.config['isolation_forest']['contamination'],
                random_state=self.config['isolation_forest']['random_state'],
                n_estimators=self.config['isolation_forest']['n_estimators']
            )
            
            model.fit(X)
            self.models[f'isolation_forest_{metric_name}'] = model
            
            logger.info(f"Trained Isolation Forest model for {metric_name}")
            
        except Exception as e:
            logger.error(f"Error training Isolation Forest for {metric_name}: {e}")
    
    def train_dbscan(self, data: pd.DataFrame, metric_name: str):
        """
        Train DBSCAN model for clustering-based anomaly detection
        """
        try:
            if len(data) < 10:
                logger.warning(f"Insufficient data for training DBSCAN on {metric_name}")
                return
            
            # Prepare data
            X = data.select_dtypes(include=[np.number]).values
            
            # Train model
            model = DBSCAN(
                eps=self.config['dbscan']['eps'],
                min_samples=self.config['dbscan']['min_samples']
            )
            
            model.fit(X)
            self.models[f'dbscan_{metric_name}'] = model
            
            logger.info(f"Trained DBSCAN model for {metric_name}")
            
        except Exception as e:
            logger.error(f"Error training DBSCAN for {metric_name}: {e}")
    
    def train_models(self, training_data: Dict[str, pd.DataFrame]):
        """
        Train all anomaly detection models
        """
        try:
            logger.info("Starting model training...")
            
            for metric_name, data in training_data.items():
                if len(data) > 0:
                    # Preprocess data
                    processed_data = self.preprocess_data(data.copy())
                    
                    # Train different models
                    self.train_isolation_forest(processed_data, metric_name)
                    self.train_dbscan(processed_data, metric_name)
                    
                    # Calculate statistical thresholds
                    self._calculate_statistical_thresholds(processed_data, metric_name)
            
            self.is_trained = True
            self.last_training = datetime.now()
            
            logger.info("Model training completed successfully")
            
        except Exception as e:
            logger.error(f"Error during model training: {e}")
            self.is_trained = False
    
    def _calculate_statistical_thresholds(self, data: pd.DataFrame, metric_name: str):
        """
        Calculate statistical thresholds for anomaly detection
        """
        try:
            numerical_columns = data.select_dtypes(include=[np.number]).columns
            
            for column in numerical_columns:
                values = data[column].values
                
                # Z-score threshold
                z_scores = np.abs(stats.zscore(values))
                z_threshold = np.percentile(z_scores, 95)
                
                # IQR threshold
                Q1 = np.percentile(values, 25)
                Q3 = np.percentile(values, 75)
                IQR = Q3 - Q1
                iqr_threshold = Q3 + self.config['statistical']['iqr_multiplier'] * IQR
                
                self.thresholds[f'{metric_name}_{column}_z_score'] = z_threshold
                self.thresholds[f'{metric_name}_{column}_iqr'] = iqr_threshold
                
        except Exception as e:
            logger.error(f"Error calculating statistical thresholds for {metric_name}: {e}")
    
    def detect_anomalies(self, data: pd.DataFrame, metric_name: str) -> Dict[str, Any]:
        """
        Detect anomalies using multiple methods
        """
        if not self.is_trained:
            logger.warning("Models not trained. Please train models first.")
            return {
                'anomalies': [],
                'confidence': 0.0,
                'method': 'none',
                'error': 'Models not trained'
            }
        
        try:
            anomalies = []
            confidence_scores = []
            
            # Preprocess data
            processed_data = self.preprocess_data(data.copy())
            X = processed_data.select_dtypes(include=[np.number]).values
            
            # Isolation Forest detection
            if f'isolation_forest_{metric_name}' in self.models:
                model = self.models[f'isolation_forest_{metric_name}']
                predictions = model.predict(X)
                anomaly_indices = np.where(predictions == -1)[0]
                
                for idx in anomaly_indices:
                    anomalies.append({
                        'index': int(idx),
                        'timestamp': data.iloc[idx].get('timestamp', None),
                        'method': 'isolation_forest',
                        'confidence': 0.8,
                        'metric_values': data.iloc[idx].to_dict()
                    })
                    confidence_scores.append(0.8)
            
            # DBSCAN detection
            if f'dbscan_{metric_name}' in self.models:
                model = self.models[f'dbscan_{metric_name}']
                labels = model.fit_predict(X)
                noise_indices = np.where(labels == -1)[0]
                
                for idx in noise_indices:
                    # Check if this anomaly wasn't already detected
                    if not any(a['index'] == idx for a in anomalies):
                        anomalies.append({
                            'index': int(idx),
                            'timestamp': data.iloc[idx].get('timestamp', None),
                            'method': 'dbscan',
                            'confidence': 0.7,
                            'metric_values': data.iloc[idx].to_dict()
                        })
                        confidence_scores.append(0.7)
            
            # Statistical detection
            statistical_anomalies = self._detect_statistical_anomalies(data, metric_name)
            for anomaly in statistical_anomalies:
                if not any(a['index'] == anomaly['index'] for a in anomalies):
                    anomalies.append(anomaly)
                    confidence_scores.append(anomaly['confidence'])
            
            # Calculate overall confidence
            overall_confidence = np.mean(confidence_scores) if confidence_scores else 0.0
            
            # Filter by confidence threshold
            filtered_anomalies = [
                a for a in anomalies 
                if a['confidence'] >= self.config['confidence_threshold']
            ]
            
            return {
                'anomalies': filtered_anomalies,
                'confidence': overall_confidence,
                'method': 'ensemble',
                'total_detected': len(anomalies),
                'filtered_count': len(filtered_anomalies)
            }
            
        except Exception as e:
            logger.error(f"Error detecting anomalies for {metric_name}: {e}")
            return {
                'anomalies': [],
                'confidence': 0.0,
                'method': 'error',
                'error': str(e)
            }
    
    def _detect_statistical_anomalies(self, data: pd.DataFrame, metric_name: str) -> List[Dict[str, Any]]:
        """
        Detect anomalies using statistical methods
        """
        anomalies = []
        
        try:
            numerical_columns = data.select_dtypes(include=[np.number]).columns
            
            for column in numerical_columns:
                if column == 'timestamp':
                    continue
                    
                values = data[column].values
                
                # Z-score method
                z_scores = np.abs(stats.zscore(values))
                z_threshold = self.thresholds.get(f'{metric_name}_{column}_z_score', 3.0)
                z_anomalies = np.where(z_scores > z_threshold)[0]
                
                for idx in z_anomalies:
                    anomalies.append({
                        'index': int(idx),
                        'timestamp': data.iloc[idx].get('timestamp', None),
                        'method': 'z_score',
                        'confidence': min(0.9, z_scores[idx] / z_threshold),
                        'metric_values': data.iloc[idx].to_dict(),
                        'anomaly_details': {
                            'column': column,
                            'value': values[idx],
                            'z_score': z_scores[idx],
                            'threshold': z_threshold
                        }
                    })
                
                # IQR method
                Q1 = np.percentile(values, 25)
                Q3 = np.percentile(values, 75)
                IQR = Q3 - Q1
                iqr_threshold = Q3 + self.config['statistical']['iqr_multiplier'] * IQR
                
                iqr_anomalies = np.where(values > iqr_threshold)[0]
                
                for idx in iqr_anomalies:
                    if not any(a['index'] == idx for a in anomalies):
                        anomalies.append({
                            'index': int(idx),
                            'timestamp': data.iloc[idx].get('timestamp', None),
                            'method': 'iqr',
                            'confidence': 0.75,
                            'metric_values': data.iloc[idx].to_dict(),
                            'anomaly_details': {
                                'column': column,
                                'value': values[idx],
                                'threshold': iqr_threshold
                            }
                        })
            
        except Exception as e:
            logger.error(f"Error in statistical anomaly detection: {e}")
        
        return anomalies
    
    def get_model_status(self) -> Dict[str, Any]:
        """
        Get the current status of all models
        """
        return {
            'is_trained': self.is_trained,
            'last_training': self.last_training.isoformat() if self.last_training else None,
            'models_count': len(self.models),
            'scalers_count': len(self.scalers),
            'thresholds_count': len(self.thresholds),
            'config': self.config
        }
    
    def save_models(self, filepath: str):
        """
        Save trained models to disk
        """
        try:
            import joblib
            model_data = {
                'models': self.models,
                'scalers': self.scalers,
                'thresholds': self.thresholds,
                'config': self.config,
                'is_trained': self.is_trained,
                'last_training': self.last_training
            }
            joblib.dump(model_data, filepath)
            logger.info(f"Models saved to {filepath}")
        except Exception as e:
            logger.error(f"Error saving models: {e}")
    
    def load_models(self, filepath: str):
        """
        Load trained models from disk
        """
        try:
            import joblib
            model_data = joblib.load(filepath)
            
            self.models = model_data['models']
            self.scalers = model_data['scalers']
            self.thresholds = model_data['thresholds']
            self.config = model_data['config']
            self.is_trained = model_data['is_trained']
            self.last_training = model_data['last_training']
            
            logger.info(f"Models loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.is_trained = False

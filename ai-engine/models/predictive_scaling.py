import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import logging

logger = logging.getLogger(__name__)

class PredictiveScalingModel:
    """
    AI-powered predictive scaling model for resource optimization
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
        self.is_trained = False
        self.last_training = None
        self.performance_metrics = {}
        
        # Default configuration
        self.default_config = {
            'prediction_horizon': 24,  # hours
            'feature_window': 168,  # hours (1 week)
            'min_training_samples': 100,
            'test_size': 0.2,
            'random_state': 42,
            'models': {
                'random_forest': {
                    'n_estimators': 100,
                    'max_depth': 10,
                    'random_state': 42
                },
                'gradient_boosting': {
                    'n_estimators': 100,
                    'max_depth': 6,
                    'learning_rate': 0.1,
                    'random_state': 42
                },
                'linear_regression': {
                    'fit_intercept': True
                }
            },
            'scaling_thresholds': {
                'cpu_high': 80.0,
                'cpu_low': 20.0,
                'memory_high': 85.0,
                'memory_low': 25.0,
                'response_time_high': 1000.0,  # ms
                'response_time_low': 100.0,    # ms
                'throughput_low': 100.0        # requests/sec
            }
        }
        
        # Merge with provided config
        self.config = {**self.default_config, **self.config}
    
    def prepare_features(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Prepare features and targets for predictive scaling
        """
        try:
            # Ensure timestamp column exists and is datetime
            if 'timestamp' not in data.columns:
                raise ValueError("Data must contain 'timestamp' column")
            
            data['timestamp'] = pd.to_datetime(data['timestamp'])
            data = data.sort_values('timestamp')
            
            # Create time-based features
            data['hour'] = data['timestamp'].dt.hour
            data['day_of_week'] = data['timestamp'].dt.dayofweek
            data['day_of_month'] = data['timestamp'].dt.day
            data['month'] = data['timestamp'].dt.month
            data['is_weekend'] = data['timestamp'].dt.dayofweek.isin([5, 6]).astype(int)
            data['is_business_hour'] = ((data['timestamp'].dt.hour >= 9) & 
                                      (data['timestamp'].dt.hour <= 17)).astype(int)
            
            # Create lag features for time series
            lag_features = ['cpu_usage', 'memory_usage', 'response_time', 'throughput']
            for feature in lag_features:
                if feature in data.columns:
                    for lag in [1, 2, 3, 6, 12, 24]:  # hours
                        data[f'{feature}_lag_{lag}h'] = data[feature].shift(lag)
            
            # Create rolling statistics
            for feature in lag_features:
                if feature in data.columns:
                    # Rolling means
                    data[f'{feature}_rolling_1h_mean'] = data[feature].rolling(window=4).mean()
                    data[f'{feature}_rolling_6h_mean'] = data[feature].rolling(window=24).mean()
                    data[f'{feature}_rolling_24h_mean'] = data[feature].rolling(window=96).mean()
                    
                    # Rolling std
                    data[f'{feature}_rolling_6h_std'] = data[feature].rolling(window=24).std()
                    data[f'{feature}_rolling_24h_std'] = data[feature].rolling(window=96).std()
                    
                    # Rolling min/max
                    data[f'{feature}_rolling_6h_min'] = data[feature].rolling(window=24).min()
                    data[f'{feature}_rolling_6h_max'] = data[feature].rolling(window=24).max()
            
            # Create trend features
            for feature in lag_features:
                if feature in data.columns:
                    data[f'{feature}_trend_6h'] = data[feature] - data[feature].shift(24)
                    data[f'{feature}_trend_24h'] = data[feature] - data[feature].shift(96)
            
            # Create cyclical features
            data['hour_sin'] = np.sin(2 * np.pi * data['hour'] / 24)
            data['hour_cos'] = np.cos(2 * np.pi * data['hour'] / 24)
            data['day_sin'] = np.sin(2 * np.pi * data['day_of_week'] / 7)
            data['day_cos'] = np.cos(2 * np.pi * data['day_of_week'] / 7)
            data['month_sin'] = np.sin(2 * np.pi * data['month'] / 12)
            data['month_cos'] = np.cos(2 * np.pi * data['month'] / 12)
            
            # Remove rows with NaN values (from lag features)
            data = data.dropna()
            
            # Separate features and targets
            feature_columns = [col for col in data.columns if col not in ['timestamp'] + lag_features]
            target_columns = lag_features
            
            X = data[feature_columns]
            y = data[target_columns]
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing features: {e}")
            raise
    
    def train_models(self, training_data: pd.DataFrame):
        """
        Train predictive scaling models
        """
        try:
            logger.info("Starting predictive scaling model training...")
            
            if len(training_data) < self.config['min_training_samples']:
                raise ValueError(f"Insufficient training data. Need at least {self.config['min_training_samples']} samples.")
            
            # Prepare features and targets
            X, y = self.prepare_features(training_data)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=self.config['test_size'], 
                random_state=self.config['random_state']
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            self.scalers['feature_scaler'] = scaler
            
            # Train models for each target
            for target in y.columns:
                logger.info(f"Training models for target: {target}")
                
                y_train_target = y_train[target]
                y_test_target = y_test[target]
                
                # Remove NaN values
                valid_indices = ~(y_train_target.isna() | y_test_target.isna())
                X_train_valid = X_train_scaled[valid_indices]
                y_train_valid = y_train_target[valid_indices]
                X_test_valid = X_test_scaled[valid_indices]
                y_test_valid = y_test_target[valid_indices]
                
                if len(X_train_valid) == 0:
                    logger.warning(f"No valid data for target {target}")
                    continue
                
                # Train Random Forest
                rf_model = RandomForestRegressor(
                    **self.config['models']['random_forest']
                )
                rf_model.fit(X_train_valid, y_train_valid)
                self.models[f'random_forest_{target}'] = rf_model
                
                # Train Gradient Boosting
                gb_model = GradientBoostingRegressor(
                    **self.config['models']['gradient_boosting']
                )
                gb_model.fit(X_train_valid, y_train_valid)
                self.models[f'gradient_boosting_{target}'] = gb_model
                
                # Train Linear Regression
                lr_model = LinearRegression(**self.config['models']['linear_regression'])
                lr_model.fit(X_train_valid, y_train_valid)
                self.models[f'linear_regression_{target}'] = lr_model
                
                # Evaluate models
                self._evaluate_models(
                    target, X_test_valid, y_test_valid,
                    rf_model, gb_model, lr_model
                )
                
                # Store feature importance
                self.feature_importance[target] = {
                    'random_forest': dict(zip(X.columns, rf_model.feature_importances_)),
                    'gradient_boosting': dict(zip(X.columns, gb_model.feature_importances_))
                }
            
            self.is_trained = True
            self.last_training = datetime.now()
            
            logger.info("Predictive scaling model training completed successfully")
            
        except Exception as e:
            logger.error(f"Error during model training: {e}")
            self.is_trained = False
            raise
    
    def _evaluate_models(self, target: str, X_test: np.ndarray, y_test: np.ndarray,
                        rf_model, gb_model, lr_model):
        """
        Evaluate model performance
        """
        try:
            models = {
                'random_forest': rf_model,
                'gradient_boosting': gb_model,
                'linear_regression': lr_model
            }
            
            self.performance_metrics[target] = {}
            
            for name, model in models.items():
                y_pred = model.predict(X_test)
                
                mse = mean_squared_error(y_test, y_pred)
                mae = mean_absolute_error(y_test, y_pred)
                r2 = r2_score(y_test, y_pred)
                
                self.performance_metrics[target][name] = {
                    'mse': mse,
                    'mae': mae,
                    'r2': r2,
                    'rmse': np.sqrt(mse)
                }
                
                logger.info(f"{name} - {target}: R²={r2:.4f}, RMSE={np.sqrt(mse):.4f}")
                
        except Exception as e:
            logger.error(f"Error evaluating models for {target}: {e}")
    
    def predict_scaling_needs(self, current_data: pd.DataFrame, 
                            prediction_horizon: int = None) -> Dict[str, Any]:
        """
        Predict scaling needs for the next N hours
        """
        if not self.is_trained:
            logger.warning("Models not trained. Please train models first.")
            return {
                'predictions': {},
                'scaling_recommendations': [],
                'confidence': 0.0,
                'error': 'Models not trained'
            }
        
        try:
            if prediction_horizon is None:
                prediction_horizon = self.config['prediction_horizon']
            
            # Prepare features for prediction
            X_pred, _ = self.prepare_features(current_data)
            
            # Scale features
            if 'feature_scaler' in self.scalers:
                X_pred_scaled = self.scalers['feature_scaler'].transform(X_pred)
            else:
                X_pred_scaled = X_pred
            
            predictions = {}
            scaling_recommendations = []
            
            # Make predictions for each target
            for target in ['cpu_usage', 'memory_usage', 'response_time', 'throughput']:
                if target not in [col.split('_')[0] for col in current_data.columns]:
                    continue
                
                target_predictions = []
                
                # Get predictions from all models
                for model_name in ['random_forest', 'gradient_boosting', 'linear_regression']:
                    model_key = f'{model_name}_{target}'
                    if model_key in self.models:
                        model = self.models[model_key]
                        pred = model.predict(X_pred_scaled)
                        target_predictions.append(pred)
                
                if target_predictions:
                    # Ensemble prediction (average)
                    ensemble_pred = np.mean(target_predictions, axis=0)
                    predictions[target] = ensemble_pred.tolist()
                    
                    # Generate scaling recommendations
                    recommendations = self._generate_scaling_recommendations(
                        target, ensemble_pred, prediction_horizon
                    )
                    scaling_recommendations.extend(recommendations)
            
            # Calculate overall confidence
            confidence = self._calculate_prediction_confidence(predictions)
            
            return {
                'predictions': predictions,
                'scaling_recommendations': scaling_recommendations,
                'confidence': confidence,
                'prediction_horizon': prediction_horizon,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting scaling needs: {e}")
            return {
                'predictions': {},
                'scaling_recommendations': [],
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _generate_scaling_recommendations(self, target: str, predictions: np.ndarray,
                                        horizon: int) -> List[Dict[str, Any]]:
        """
        Generate scaling recommendations based on predictions
        """
        recommendations = []
        
        try:
            thresholds = self.config['scaling_thresholds']
            
            for i, pred_value in enumerate(predictions[:horizon]):
                hour = i + 1
                recommendation = {
                    'target': target,
                    'hour': hour,
                    'predicted_value': float(pred_value),
                    'threshold': None,
                    'action': None,
                    'priority': 'low',
                    'reasoning': []
                }
                
                # CPU scaling recommendations
                if target == 'cpu_usage':
                    if pred_value > thresholds['cpu_high']:
                        recommendation['action'] = 'scale_up'
                        recommendation['priority'] = 'high'
                        recommendation['threshold'] = thresholds['cpu_high']
                        recommendation['reasoning'].append(f"CPU usage predicted to exceed {thresholds['cpu_high']}%")
                    elif pred_value < thresholds['cpu_low']:
                        recommendation['action'] = 'scale_down'
                        recommendation['priority'] = 'medium'
                        recommendation['threshold'] = thresholds['cpu_low']
                        recommendation['reasoning'].append(f"CPU usage predicted to be below {thresholds['cpu_low']}%")
                
                # Memory scaling recommendations
                elif target == 'memory_usage':
                    if pred_value > thresholds['memory_high']:
                        recommendation['action'] = 'scale_up'
                        recommendation['priority'] = 'high'
                        recommendation['threshold'] = thresholds['memory_high']
                        recommendation['reasoning'].append(f"Memory usage predicted to exceed {thresholds['memory_high']}%")
                    elif pred_value < thresholds['memory_low']:
                        recommendation['action'] = 'scale_down'
                        recommendation['priority'] = 'medium'
                        recommendation['threshold'] = thresholds['memory_low']
                        recommendation['reasoning'].append(f"Memory usage predicted to be below {thresholds['memory_low']}%")
                
                # Response time scaling recommendations
                elif target == 'response_time':
                    if pred_value > thresholds['response_time_high']:
                        recommendation['action'] = 'scale_up'
                        recommendation['priority'] = 'high'
                        recommendation['threshold'] = thresholds['response_time_high']
                        recommendation['reasoning'].append(f"Response time predicted to exceed {thresholds['response_time_high']}ms")
                    elif pred_value < thresholds['response_time_low']:
                        recommendation['action'] = 'scale_down'
                        recommendation['priority'] = 'low'
                        recommendation['threshold'] = thresholds['response_time_low']
                        recommendation['reasoning'].append(f"Response time predicted to be below {thresholds['response_time_low']}ms")
                
                # Throughput scaling recommendations
                elif target == 'throughput':
                    if pred_value < thresholds['throughput_low']:
                        recommendation['action'] = 'scale_up'
                        recommendation['priority'] = 'medium'
                        recommendation['threshold'] = thresholds['throughput_low']
                        recommendation['reasoning'].append(f"Throughput predicted to be below {thresholds['throughput_low']} req/sec")
                
                if recommendation['action']:
                    recommendations.append(recommendation)
            
        except Exception as e:
            logger.error(f"Error generating scaling recommendations: {e}")
        
        return recommendations
    
    def _calculate_prediction_confidence(self, predictions: Dict[str, List[float]]) -> float:
        """
        Calculate overall prediction confidence
        """
        try:
            if not predictions:
                return 0.0
            
            # Calculate confidence based on model performance and prediction consistency
            confidence_scores = []
            
            for target, pred_values in predictions.items():
                if target in self.performance_metrics:
                    # Use best model's R² score
                    best_r2 = max(
                        metrics['r2'] 
                        for metrics in self.performance_metrics[target].values()
                    )
                    confidence_scores.append(best_r2)
                
                # Check prediction consistency (lower variance = higher confidence)
                if len(pred_values) > 1:
                    variance = np.var(pred_values)
                    consistency_score = max(0, 1 - variance / 100)  # Normalize
                    confidence_scores.append(consistency_score)
            
            return np.mean(confidence_scores) if confidence_scores else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating prediction confidence: {e}")
            return 0.0
    
    def get_model_status(self) -> Dict[str, Any]:
        """
        Get the current status of predictive scaling models
        """
        return {
            'is_trained': self.is_trained,
            'last_training': self.last_training.isoformat() if self.last_training else None,
            'models_count': len(self.models),
            'scalers_count': len(self.scalers),
            'performance_metrics': self.performance_metrics,
            'feature_importance': self.feature_importance,
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
                'feature_importance': self.feature_importance,
                'performance_metrics': self.performance_metrics,
                'config': self.config,
                'is_trained': self.is_trained,
                'last_training': self.last_training
            }
            joblib.dump(model_data, filepath)
            logger.info(f"Predictive scaling models saved to {filepath}")
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
            self.feature_importance = model_data['feature_importance']
            self.performance_metrics = model_data['performance_metrics']
            self.config = model_data['config']
            self.is_trained = model_data['is_trained']
            self.last_training = model_data['last_training']
            
            logger.info(f"Predictive scaling models loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.is_trained = False

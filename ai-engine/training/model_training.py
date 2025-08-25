import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
from sklearn.model_selection import (
    train_test_split, cross_val_score, GridSearchCV, RandomizedSearchCV,
    StratifiedKFold, TimeSeriesSplit
)
from sklearn.ensemble import (
    RandomForestRegressor, RandomForestClassifier,
    GradientBoostingRegressor, GradientBoostingClassifier,
    ExtraTreesRegressor, ExtraTreesClassifier
)
from sklearn.linear_model import (
    LinearRegression, LogisticRegression, Ridge, Lasso, ElasticNet
)
from sklearn.svm import SVR, SVC
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import logging
import os

logger = logging.getLogger(__name__)

class ModelTrainer:
    """
    Comprehensive model training pipeline for AI/ML models
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.models = {}
        self.best_models = {}
        self.training_history = []
        self.feature_importance = {}
        self.model_performance = {}
        
        # Default configuration
        self.default_config = {
            'data_splitting': {
                'test_size': 0.2,
                'validation_size': 0.2,
                'random_state': 42,
                'stratify': True,
                'time_series': False
            },
            'cross_validation': {
                'use_cv': True,
                'cv_folds': 5,
                'cv_strategy': 'stratified'  # 'stratified', 'time_series', 'kfold'
            },
            'hyperparameter_tuning': {
                'use_tuning': True,
                'method': 'grid',  # 'grid', 'random', 'bayesian'
                'n_iter': 100,
                'cv_folds': 3
            },
            'model_selection': {
                'regression_models': ['random_forest', 'gradient_boosting', 'linear_regression'],
                'classification_models': ['random_forest', 'gradient_boosting', 'logistic_regression'],
                'ensemble_methods': ['voting', 'stacking']
            },
            'evaluation': {
                'regression_metrics': ['mse', 'rmse', 'mae', 'r2'],
                'classification_metrics': ['accuracy', 'precision', 'recall', 'f1', 'roc_auc'],
                'cross_validation_metrics': ['mean', 'std']
            },
            'output': {
                'save_models': True,
                'save_predictions': True,
                'model_format': 'joblib',
                'output_dir': './models'
            }
        }
        
        # Merge with provided config
        self.config = {**self.default_config, **self.config}
        
        # Initialize model definitions
        self._initialize_model_definitions()
    
    def _initialize_model_definitions(self):
        """
        Initialize model definitions with hyperparameter grids
        """
        self.model_definitions = {
            'regression': {
                'random_forest': {
                    'model': RandomForestRegressor,
                    'params': {
                        'n_estimators': [50, 100, 200],
                        'max_depth': [10, 20, None],
                        'min_samples_split': [2, 5, 10],
                        'min_samples_leaf': [1, 2, 4],
                        'random_state': [42]
                    }
                },
                'gradient_boosting': {
                    'model': GradientBoostingRegressor,
                    'params': {
                        'n_estimators': [50, 100, 200],
                        'learning_rate': [0.01, 0.1, 0.2],
                        'max_depth': [3, 5, 7],
                        'min_samples_split': [2, 5, 10],
                        'random_state': [42]
                    }
                },
                'linear_regression': {
                    'model': LinearRegression,
                    'params': {
                        'fit_intercept': [True, False]
                    }
                },
                'ridge': {
                    'model': Ridge,
                    'params': {
                        'alpha': [0.1, 1.0, 10.0, 100.0],
                        'fit_intercept': [True, False]
                    }
                },
                'lasso': {
                    'model': Lasso,
                    'params': {
                        'alpha': [0.1, 1.0, 10.0, 100.0],
                        'fit_intercept': [True, False]
                    }
                },
                'elastic_net': {
                    'model': ElasticNet,
                    'params': {
                        'alpha': [0.1, 1.0, 10.0],
                        'l1_ratio': [0.1, 0.5, 0.9],
                        'fit_intercept': [True, False]
                    }
                },
                'svr': {
                    'model': SVR,
                    'params': {
                        'C': [0.1, 1.0, 10.0],
                        'kernel': ['rbf', 'linear'],
                        'gamma': ['scale', 'auto', 0.1, 0.01]
                    }
                },
                'knn': {
                    'model': KNeighborsRegressor,
                    'params': {
                        'n_neighbors': [3, 5, 7, 9],
                        'weights': ['uniform', 'distance'],
                        'metric': ['euclidean', 'manhattan']
                    }
                }
            },
            'classification': {
                'random_forest': {
                    'model': RandomForestClassifier,
                    'params': {
                        'n_estimators': [50, 100, 200],
                        'max_depth': [10, 20, None],
                        'min_samples_split': [2, 5, 10],
                        'min_samples_leaf': [1, 2, 4],
                        'class_weight': ['balanced', None],
                        'random_state': [42]
                    }
                },
                'gradient_boosting': {
                    'model': GradientBoostingClassifier,
                    'params': {
                        'n_estimators': [50, 100, 200],
                        'learning_rate': [0.01, 0.1, 0.2],
                        'max_depth': [3, 5, 7],
                        'min_samples_split': [2, 5, 10],
                        'random_state': [42]
                    }
                },
                'logistic_regression': {
                    'model': LogisticRegression,
                    'params': {
                        'C': [0.1, 1.0, 10.0],
                        'penalty': ['l1', 'l2'],
                        'solver': ['liblinear', 'saga'],
                        'class_weight': ['balanced', None],
                        'random_state': [42]
                    }
                },
                'svc': {
                    'model': SVC,
                    'params': {
                        'C': [0.1, 1.0, 10.0],
                        'kernel': ['rbf', 'linear'],
                        'gamma': ['scale', 'auto', 0.1, 0.01],
                        'class_weight': ['balanced', None],
                        'probability': [True]
                    }
                },
                'knn': {
                    'model': KNeighborsClassifier,
                    'params': {
                        'n_neighbors': [3, 5, 7, 9],
                        'weights': ['uniform', 'distance'],
                        'metric': ['euclidean', 'manhattan']
                    }
                }
            }
        }
    
    def train_models(self, X: pd.DataFrame, y: pd.Series, 
                     problem_type: str = 'auto',
                     target_columns: List[str] = None) -> Dict[str, Any]:
        """
        Main training pipeline
        """
        try:
            logger.info("Starting model training pipeline...")
            
            # Determine problem type if auto
            if problem_type == 'auto':
                problem_type = self._detect_problem_type(y)
            
            logger.info(f"Detected problem type: {problem_type}")
            
            # Prepare data
            X_train, X_test, y_train, y_test = self._prepare_data(X, y, problem_type)
            
            # Get model definitions
            models_to_train = self.model_definitions[problem_type]
            
            # Train individual models
            trained_models = {}
            model_performance = {}
            
            for model_name, model_config in models_to_train.items():
                if model_name in self.config['model_selection'][f'{problem_type}_models']:
                    logger.info(f"Training {model_name}...")
                    
                    # Train model with hyperparameter tuning
                    model, performance = self._train_single_model(
                        model_name, model_config, X_train, y_train, X_test, y_test
                    )
                    
                    trained_models[model_name] = model
                    model_performance[model_name] = performance
            
            # Train ensemble models if specified
            if self.config['model_selection']['ensemble_methods']:
                ensemble_models = self._train_ensemble_models(
                    trained_models, X_train, y_train, X_test, y_test, problem_type
                )
                trained_models.update(ensemble_models)
            
            # Store results
            self.models = trained_models
            self.model_performance = model_performance
            
            # Find best model
            best_model_name = self._select_best_model(model_performance, problem_type)
            self.best_models[problem_type] = {
                'name': best_model_name,
                'model': trained_models[best_model_name],
                'performance': model_performance[best_model_name]
            }
            
            # Save models if configured
            if self.config['output']['save_models']:
                self._save_models(problem_type)
            
            # Generate training summary
            training_summary = self._generate_training_summary(problem_type)
            
            logger.info("Model training pipeline completed successfully")
            return training_summary
            
        except Exception as e:
            logger.error(f"Error in training pipeline: {e}")
            raise
    
    def _detect_problem_type(self, y: pd.Series) -> str:
        """
        Automatically detect if it's a regression or classification problem
        """
        try:
            # Check if target is numeric
            if pd.api.types.is_numeric_dtype(y):
                # Check if it's binary classification (2 unique values)
                unique_values = y.nunique()
                if unique_values == 2:
                    return 'classification'
                elif unique_values > 2:
                    # Check if values are integers (likely classification)
                    if y.dtype in ['int64', 'int32'] and unique_values < 20:
                        return 'classification'
                    else:
                        return 'regression'
                else:
                    return 'regression'
            else:
                return 'classification'
        except Exception as e:
            logger.error(f"Error detecting problem type: {e}")
            return 'regression'  # Default fallback
    
    def _prepare_data(self, X: pd.DataFrame, y: pd.Series, problem_type: str) -> Tuple:
        """
        Prepare data for training
        """
        try:
            # Handle categorical target for classification
            if problem_type == 'classification' and y.dtype == 'object':
                le = LabelEncoder()
                y = le.fit_transform(y)
                self.label_encoders = {'target': le}
            
            # Split data
            if self.config['data_splitting']['time_series']:
                # Time series split
                split_point = int(len(X) * (1 - self.config['data_splitting']['test_size']))
                X_train, X_test = X[:split_point], X[split_point:]
                y_train, y_test = y[:split_point], y[split_point:]
            else:
                # Random split
                if self.config['data_splitting']['stratify'] and problem_type == 'classification':
                    X_train, X_test, y_train, y_test = train_test_split(
                        X, y,
                        test_size=self.config['data_splitting']['test_size'],
                        random_state=self.config['data_splitting']['random_state'],
                        stratify=y
                    )
                else:
                    X_train, X_test, y_train, y_test = train_test_split(
                        X, y,
                        test_size=self.config['data_splitting']['test_size'],
                        random_state=self.config['data_splitting']['random_state']
                    )
            
            logger.info(f"Data split: Train={X_train.shape}, Test={X_test.shape}")
            return X_train, X_test, y_train, y_test
            
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            raise
    
    def _train_single_model(self, model_name: str, model_config: Dict,
                           X_train: pd.DataFrame, y_train: pd.Series,
                           X_test: pd.DataFrame, y_test: pd.Series) -> Tuple:
        """
        Train a single model with hyperparameter tuning
        """
        try:
            # Initialize model
            model_class = model_config['model']
            base_params = {k: v[0] if isinstance(v, list) else v for k, v in model_config['params'].items()}
            model = model_class(**base_params)
            
            # Hyperparameter tuning
            if self.config['hyperparameter_tuning']['use_tuning']:
                tuned_model, best_params = self._tune_hyperparameters(
                    model, model_config['params'], X_train, y_train
                )
                model = tuned_model
                logger.info(f"Best parameters for {model_name}: {best_params}")
            
            # Train final model
            model.fit(X_train, y_train)
            
            # Evaluate model
            performance = self._evaluate_model(model, X_train, y_train, X_test, y_test)
            
            # Store feature importance if available
            if hasattr(model, 'feature_importances_'):
                self.feature_importance[model_name] = dict(zip(X_train.columns, model.feature_importances_))
            
            return model, performance
            
        except Exception as e:
            logger.error(f"Error training {model_name}: {e}")
            return None, {}
    
    def _tune_hyperparameters(self, model, param_grid: Dict,
                             X_train: pd.DataFrame, y_train: pd.Series) -> Tuple:
        """
        Perform hyperparameter tuning
        """
        try:
            method = self.config['hyperparameter_tuning']['method']
            cv_folds = self.config['hyperparameter_tuning']['cv_folds']
            
            # Setup cross-validation
            if self.config['cross_validation']['cv_strategy'] == 'stratified':
                cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
            elif self.config['cross_validation']['cv_strategy'] == 'time_series':
                cv = TimeSeriesSplit(n_splits=cv_folds)
            else:
                cv = cv_folds
            
            if method == 'grid':
                tuner = GridSearchCV(
                    model, param_grid, cv=cv, scoring='neg_mean_squared_error' if 'regression' in str(type(model)) else 'accuracy',
                    n_jobs=-1, verbose=1
                )
            elif method == 'random':
                tuner = RandomizedSearchCV(
                    model, param_grid, n_iter=self.config['hyperparameter_tuning']['n_iter'],
                    cv=cv, scoring='neg_mean_squared_error' if 'regression' in str(type(model)) else 'accuracy',
                    n_jobs=-1, verbose=1, random_state=42
                )
            else:
                # Default to grid search
                tuner = GridSearchCV(
                    model, param_grid, cv=cv, scoring='neg_mean_squared_error' if 'regression' in str(type(model)) else 'accuracy',
                    n_jobs=-1, verbose=1
                )
            
            # Perform tuning
            tuner.fit(X_train, y_train)
            
            return tuner.best_estimator_, tuner.best_params_
            
        except Exception as e:
            logger.error(f"Error in hyperparameter tuning: {e}")
            return model, {}
    
    def _evaluate_model(self, model, X_train: pd.DataFrame, y_train: pd.Series,
                        X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        """
        Evaluate model performance
        """
        try:
            # Make predictions
            y_train_pred = model.predict(X_train)
            y_test_pred = model.predict(X_test)
            
            # Determine problem type
            if hasattr(model, 'predict_proba'):
                problem_type = 'classification'
                y_test_proba = model.predict_proba(X_test)
            else:
                problem_type = 'regression'
            
            # Calculate metrics
            performance = {}
            
            if problem_type == 'regression':
                # Regression metrics
                performance['train_mse'] = mean_squared_error(y_train, y_train_pred)
                performance['train_rmse'] = np.sqrt(performance['train_mse'])
                performance['train_mae'] = mean_absolute_error(y_train, y_train_pred)
                performance['train_r2'] = r2_score(y_train, y_train_pred)
                
                performance['test_mse'] = mean_squared_error(y_test, y_test_pred)
                performance['test_rmse'] = np.sqrt(performance['test_mse'])
                performance['test_mae'] = mean_absolute_error(y_test, y_test_pred)
                performance['test_r2'] = r2_score(y_test, y_test_pred)
                
            else:
                # Classification metrics
                performance['train_accuracy'] = accuracy_score(y_train, y_train_pred)
                performance['test_accuracy'] = accuracy_score(y_test, y_test_pred)
                
                # Multi-class vs binary classification
                if len(np.unique(y_test)) == 2:
                    # Binary classification
                    performance['test_precision'] = precision_score(y_test, y_test_pred, average='binary')
                    performance['test_recall'] = recall_score(y_test, y_test_pred, average='binary')
                    performance['test_f1'] = f1_score(y_test, y_test_pred, average='binary')
                    performance['test_roc_auc'] = roc_auc_score(y_test, y_test_proba[:, 1])
                else:
                    # Multi-class classification
                    performance['test_precision'] = precision_score(y_test, y_test_pred, average='weighted')
                    performance['test_recall'] = recall_score(y_test, y_test_pred, average='weighted')
                    performance['test_f1'] = f1_score(y_test, y_test_pred, average='weighted')
                    performance['test_roc_auc'] = roc_auc_score(y_test, y_test_proba, multi_class='ovr')
            
            # Cross-validation if enabled
            if self.config['cross_validation']['use_cv']:
                cv_scores = self._perform_cross_validation(model, X_train, y_train, problem_type)
                performance['cv_scores'] = cv_scores
            
            return performance
            
        except Exception as e:
            logger.error(f"Error evaluating model: {e}")
            return {}
    
    def _perform_cross_validation(self, model, X: pd.DataFrame, y: pd.Series, problem_type: str) -> Dict[str, Any]:
        """
        Perform cross-validation
        """
        try:
            cv_folds = self.config['cross_validation']['cv_folds']
            cv_strategy = self.config['cross_validation']['cv_strategy']
            
            # Setup cross-validation
            if cv_strategy == 'stratified' and problem_type == 'classification':
                cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
            elif cv_strategy == 'time_series':
                cv = TimeSeriesSplit(n_splits=cv_folds)
            else:
                cv = cv_folds
            
            # Choose scoring metric
            if problem_type == 'regression':
                scoring = 'neg_mean_squared_error'
            else:
                scoring = 'accuracy'
            
            # Perform cross-validation
            cv_scores = cross_val_score(model, X, y, cv=cv, scoring=scoring, n_jobs=-1)
            
            # Convert negative MSE to positive for regression
            if problem_type == 'regression':
                cv_scores = -cv_scores  # Convert back to positive MSE
            
            return {
                'scores': cv_scores.tolist(),
                'mean': float(np.mean(cv_scores)),
                'std': float(np.std(cv_scores)),
                'min': float(np.min(cv_scores)),
                'max': float(np.max(cv_scores))
            }
            
        except Exception as e:
            logger.error(f"Error in cross-validation: {e}")
            return {}
    
    def _train_ensemble_models(self, base_models: Dict, X_train: pd.DataFrame, y_train: pd.Series,
                               X_test: pd.DataFrame, y_test: pd.Series, problem_type: str) -> Dict:
        """
        Train ensemble models
        """
        ensemble_models = {}
        
        try:
            if 'voting' in self.config['model_selection']['ensemble_methods']:
                # Voting ensemble
                if problem_type == 'regression':
                    from sklearn.ensemble import VotingRegressor
                    estimators = [(name, model) for name, model in base_models.items()]
                    voting_model = VotingRegressor(estimators=estimators)
                else:
                    from sklearn.ensemble import VotingClassifier
                    estimators = [(name, model) for name, model in base_models.items()]
                    voting_model = VotingClassifier(estimators=estimators, voting='soft')
                
                voting_model.fit(X_train, y_train)
                performance = self._evaluate_model(voting_model, X_train, y_train, X_test, y_test)
                
                ensemble_models['voting_ensemble'] = voting_model
                self.model_performance['voting_ensemble'] = performance
            
            if 'stacking' in self.config['model_selection']['ensemble_methods']:
                # Stacking ensemble
                if problem_type == 'regression':
                    from sklearn.ensemble import StackingRegressor
                    estimators = [(name, model) for name, model in base_models.items()]
                    meta_model = LinearRegression()
                    stacking_model = StackingRegressor(estimators=estimators, final_estimator=meta_model)
                else:
                    from sklearn.ensemble import StackingClassifier
                    estimators = [(name, model) for name, model in base_models.items()]
                    meta_model = LogisticRegression()
                    stacking_model = StackingClassifier(estimators=estimators, final_estimator=meta_model)
                
                stacking_model.fit(X_train, y_train)
                performance = self._evaluate_model(stacking_model, X_train, y_train, X_test, y_test)
                
                ensemble_models['stacking_ensemble'] = stacking_model
                self.model_performance['stacking_ensemble'] = performance
            
            logger.info(f"Trained {len(ensemble_models)} ensemble models")
            
        except Exception as e:
            logger.error(f"Error training ensemble models: {e}")
        
        return ensemble_models
    
    def _select_best_model(self, model_performance: Dict[str, Dict], problem_type: str) -> str:
        """
        Select the best model based on performance
        """
        try:
            if not model_performance:
                return None
            
            # Choose primary metric for comparison
            if problem_type == 'regression':
                primary_metric = 'test_r2'  # Higher is better
                reverse = True
            else:
                primary_metric = 'test_accuracy'  # Higher is better
                reverse = True
            
            # Find best model
            best_model = None
            best_score = -np.inf if reverse else np.inf
            
            for model_name, performance in model_performance.items():
                if primary_metric in performance:
                    score = performance[primary_metric]
                    if reverse:
                        if score > best_score:
                            best_score = score
                            best_model = model_name
                    else:
                        if score < best_score:
                            best_score = score
                            best_model = model_name
            
            logger.info(f"Best model: {best_model} with {primary_metric}: {best_score:.4f}")
            return best_model
            
        except Exception as e:
            logger.error(f"Error selecting best model: {e}")
            return list(model_performance.keys())[0] if model_performance else None
    
    def _save_models(self, problem_type: str):
        """
        Save trained models to disk
        """
        try:
            output_dir = self.config['output']['output_dir']
            os.makedirs(output_dir, exist_ok=True)
            
            # Save individual models
            for model_name, model in self.models.items():
                model_path = os.path.join(output_dir, f"{model_name}_{problem_type}.joblib")
                joblib.dump(model, model_path)
                logger.info(f"Saved model: {model_path}")
            
            # Save best model
            if problem_type in self.best_models:
                best_model = self.best_models[problem_type]
                best_model_path = os.path.join(output_dir, f"best_{problem_type}_model.joblib")
                joblib.dump(best_model, best_model_path)
                logger.info(f"Saved best model: {best_model_path}")
            
            # Save training metadata
            metadata = {
                'problem_type': problem_type,
                'model_performance': self.model_performance,
                'feature_importance': self.feature_importance,
                'best_models': self.best_models,
                'training_timestamp': datetime.now().isoformat(),
                'config': self.config
            }
            
            metadata_path = os.path.join(output_dir, f"training_metadata_{problem_type}.joblib")
            joblib.dump(metadata, metadata_path)
            logger.info(f"Saved training metadata: {metadata_path}")
            
        except Exception as e:
            logger.error(f"Error saving models: {e}")
    
    def _generate_training_summary(self, problem_type: str) -> Dict[str, Any]:
        """
        Generate comprehensive training summary
        """
        try:
            summary = {
                'problem_type': problem_type,
                'models_trained': len(self.models),
                'best_model': self.best_models.get(problem_type, {}),
                'model_performance': self.model_performance,
                'feature_importance': self.feature_importance,
                'training_timestamp': datetime.now().isoformat(),
                'config': self.config
            }
            
            # Add performance comparison
            if self.model_performance:
                performance_comparison = {}
                for model_name, performance in self.model_performance.items():
                    if problem_type == 'regression':
                        performance_comparison[model_name] = {
                            'test_r2': performance.get('test_r2', 0),
                            'test_rmse': performance.get('test_rmse', 0),
                            'test_mae': performance.get('test_mae', 0)
                        }
                    else:
                        performance_comparison[model_name] = {
                            'test_accuracy': performance.get('test_accuracy', 0),
                            'test_f1': performance.get('test_f1', 0),
                            'test_roc_auc': performance.get('test_roc_auc', 0)
                        }
                
                summary['performance_comparison'] = performance_comparison
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating training summary: {e}")
            return {}
    
    def predict(self, X: pd.DataFrame, model_name: str = None) -> np.ndarray:
        """
        Make predictions using a trained model
        """
        try:
            if model_name is None:
                # Use best model
                if not self.best_models:
                    raise ValueError("No models trained. Please train models first.")
                problem_type = list(self.best_models.keys())[0]
                model = self.best_models[problem_type]['model']
            else:
                if model_name not in self.models:
                    raise ValueError(f"Model {model_name} not found")
                model = self.models[model_name]
            
            return model.predict(X)
            
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            raise
    
    def get_model_info(self, model_name: str = None) -> Dict[str, Any]:
        """
        Get information about trained models
        """
        try:
            if model_name is None:
                return {
                    'models': list(self.models.keys()),
                    'best_models': self.best_models,
                    'model_performance': self.model_performance,
                    'feature_importance': self.feature_importance
                }
            else:
                if model_name not in self.models:
                    raise ValueError(f"Model {model_name} not found")
                
                return {
                    'model_name': model_name,
                    'model_type': type(self.models[model_name]).__name__,
                    'performance': self.model_performance.get(model_name, {}),
                    'feature_importance': self.feature_importance.get(model_name, {})
                }
                
        except Exception as e:
            logger.error(f"Error getting model info: {e}")
            return {}

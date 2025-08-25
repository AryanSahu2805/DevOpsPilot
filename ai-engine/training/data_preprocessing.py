import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.feature_selection import SelectKBest, f_regression, f_classif, mutual_info_regression
from sklearn.decomposition import PCA
import logging

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """
    Comprehensive data preprocessing pipeline for AI/ML models
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.scalers = {}
        self.imputers = {}
        self.encoders = {}
        self.feature_selectors = {}
        self.pca_models = {}
        self.feature_names = []
        self.preprocessing_pipeline = []
        
        # Default configuration
        self.default_config = {
            'imputation': {
                'strategy': 'knn',  # 'mean', 'median', 'most_frequent', 'knn'
                'knn_neighbors': 5
            },
            'scaling': {
                'method': 'standard',  # 'standard', 'minmax', 'robust'
                'with_mean': True,
                'with_std': True
            },
            'encoding': {
                'categorical_strategy': 'label',  # 'label', 'onehot', 'target'
                'handle_unknown': 'ignore'
            },
            'feature_selection': {
                'method': 'mutual_info',  # 'f_regression', 'f_classif', 'mutual_info'
                'k_features': 'all',
                'threshold': 0.01
            },
            'dimensionality_reduction': {
                'use_pca': False,
                'n_components': 0.95,  # float for variance, int for components
                'min_components': 2
            },
            'outlier_detection': {
                'method': 'iqr',  # 'iqr', 'zscore', 'isolation_forest'
                'iqr_multiplier': 1.5,
                'zscore_threshold': 3.0
            },
            'temporal_features': {
                'extract_time': True,
                'extract_cyclical': True,
                'extract_lags': True,
                'lag_windows': [1, 2, 3, 6, 12, 24],  # hours
                'rolling_windows': [4, 24, 96]  # hours
            }
        }
        
        # Merge with provided config
        self.config = {**self.default_config, **self.config}
    
    def preprocess_dataset(self, data: pd.DataFrame, target_column: str = None,
                          is_training: bool = True) -> pd.DataFrame:
        """
        Main preprocessing pipeline
        """
        try:
            logger.info("Starting data preprocessing pipeline...")
            
            # Store original data info
            original_shape = data.shape
            original_columns = data.columns.tolist()
            
            # Step 1: Data cleaning
            cleaned_data = self._clean_data(data)
            
            # Step 2: Handle missing values
            imputed_data = self._handle_missing_values(cleaned_data, is_training)
            
            # Step 3: Handle outliers
            outlier_handled_data = self._handle_outliers(imputed_data, is_training)
            
            # Step 4: Feature engineering
            engineered_data = self._engineer_features(outlier_handled_data, is_training)
            
            # Step 5: Encode categorical variables
            encoded_data = self._encode_categorical_variables(engineered_data, is_training)
            
            # Step 6: Scale numerical features
            scaled_data = self._scale_features(encoded_data, is_training)
            
            # Step 7: Feature selection
            selected_data = self._select_features(scaled_data, target_column, is_training)
            
            # Step 8: Dimensionality reduction (optional)
            final_data = self._reduce_dimensions(selected_data, is_training)
            
            # Store preprocessing info
            self.preprocessing_pipeline.append({
                'step': 'complete_pipeline',
                'original_shape': original_shape,
                'final_shape': final_data.shape,
                'columns_removed': len(original_columns) - len(final_data.columns),
                'timestamp': datetime.now().isoformat()
            })
            
            logger.info(f"Preprocessing completed. Shape: {original_shape} -> {final_data.shape}")
            
            return final_data
            
        except Exception as e:
            logger.error(f"Error in preprocessing pipeline: {e}")
            raise
    
    def _clean_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Clean the dataset
        """
        try:
            cleaned_data = data.copy()
            
            # Remove duplicate rows
            initial_rows = len(cleaned_data)
            cleaned_data = cleaned_data.drop_duplicates()
            if len(cleaned_data) < initial_rows:
                logger.info(f"Removed {initial_rows - len(cleaned_data)} duplicate rows")
            
            # Remove columns with too many missing values (>80%)
            missing_threshold = 0.8
            columns_to_drop = []
            for col in cleaned_data.columns:
                missing_ratio = cleaned_data[col].isnull().sum() / len(cleaned_data)
                if missing_ratio > missing_threshold:
                    columns_to_drop.append(col)
            
            if columns_to_drop:
                cleaned_data = cleaned_data.drop(columns=columns_to_drop)
                logger.info(f"Removed {len(columns_to_drop)} columns with >{missing_threshold*100}% missing values")
            
            # Remove rows with too many missing values (>50%)
            row_missing_threshold = 0.5
            initial_rows = len(cleaned_data)
            cleaned_data = cleaned_data.dropna(thresh=int(len(cleaned_data.columns) * (1 - row_missing_threshold)))
            if len(cleaned_data) < initial_rows:
                logger.info(f"Removed {initial_rows - len(cleaned_data)} rows with >{row_missing_threshold*100}% missing values")
            
            # Convert timestamp columns
            timestamp_columns = [col for col in cleaned_data.columns if 'time' in col.lower() or 'date' in col.lower()]
            for col in timestamp_columns:
                try:
                    cleaned_data[col] = pd.to_datetime(cleaned_data[col], errors='coerce')
                except:
                    pass
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Error cleaning data: {e}")
            return data
    
    def _handle_missing_values(self, data: pd.DataFrame, is_training: bool) -> pd.DataFrame:
        """
        Handle missing values using various strategies
        """
        try:
            imputed_data = data.copy()
            
            # Separate numerical and categorical columns
            numerical_columns = imputed_data.select_dtypes(include=[np.number]).columns
            categorical_columns = imputed_data.select_dtypes(include=['object', 'category']).columns
            
            # Handle numerical missing values
            if len(numerical_columns) > 0:
                if self.config['imputation']['strategy'] == 'knn':
                    if is_training:
                        imputer = KNNImputer(n_neighbors=self.config['imputation']['knn_neighbors'])
                        imputed_data[numerical_columns] = imputer.fit_transform(imputed_data[numerical_columns])
                        self.imputers['numerical'] = imputer
                    else:
                        if 'numerical' in self.imputers:
                            imputed_data[numerical_columns] = self.imputers['numerical'].transform(imputed_data[numerical_columns])
                else:
                    strategy = self.config['imputation']['strategy']
                    if is_training:
                        imputer = SimpleImputer(strategy=strategy)
                        imputed_data[numerical_columns] = imputer.fit_transform(imputed_data[numerical_columns])
                        self.imputers['numerical'] = imputer
                    else:
                        if 'numerical' in self.imputers:
                            imputed_data[numerical_columns] = self.imputers['numerical'].transform(imputed_data[numerical_columns])
            
            # Handle categorical missing values
            if len(categorical_columns) > 0:
                if is_training:
                    imputer = SimpleImputer(strategy='most_frequent')
                    imputed_data[categorical_columns] = imputer.fit_transform(imputed_data[categorical_columns])
                    self.imputers['categorical'] = imputer
                else:
                    if 'categorical' in self.imputers:
                        imputed_data[categorical_columns] = self.imputers['categorical'].transform(imputed_data[categorical_columns])
            
            logger.info(f"Handled missing values using {self.config['imputation']['strategy']} strategy")
            return imputed_data
            
        except Exception as e:
            logger.error(f"Error handling missing values: {e}")
            return data
    
    def _handle_outliers(self, data: pd.DataFrame, is_training: bool) -> pd.DataFrame:
        """
        Handle outliers using various methods
        """
        try:
            outlier_handled_data = data.copy()
            numerical_columns = outlier_handled_data.select_dtypes(include=[np.number]).columns
            
            if len(numerical_columns) == 0:
                return outlier_handled_data
            
            method = self.config['outlier_detection']['method']
            outliers_removed = 0
            
            for col in numerical_columns:
                if col == 'timestamp':
                    continue
                    
                values = outlier_handled_data[col].values
                
                if method == 'iqr':
                    Q1 = np.percentile(values, 25)
                    Q3 = np.percentile(values, 75)
                    IQR = Q3 - Q1
                    lower_bound = Q1 - self.config['outlier_detection']['iqr_multiplier'] * IQR
                    upper_bound = Q3 + self.config['outlier_detection']['iqr_multiplier'] * IQR
                    
                    outlier_mask = (values >= lower_bound) & (values <= upper_bound)
                    outliers_removed += (~outlier_mask).sum()
                    
                    # Cap outliers instead of removing
                    outlier_handled_data.loc[outlier_handled_data[col] < lower_bound, col] = lower_bound
                    outlier_handled_data.loc[outlier_handled_data[col] > upper_bound, col] = upper_bound
                
                elif method == 'zscore':
                    z_scores = np.abs(stats.zscore(values))
                    threshold = self.config['outlier_detection']['zscore_threshold']
                    outlier_mask = z_scores <= threshold
                    outliers_removed += (~outlier_mask).sum()
                    
                    # Cap outliers
                    outlier_handled_data.loc[z_scores > threshold, col] = np.median(values)
            
            if outliers_removed > 0:
                logger.info(f"Handled {outliers_removed} outliers using {method} method")
            
            return outlier_handled_data
            
        except Exception as e:
            logger.error(f"Error handling outliers: {e}")
            return data
    
    def _engineer_features(self, data: pd.DataFrame, is_training: bool) -> pd.DataFrame:
        """
        Engineer new features
        """
        try:
            engineered_data = data.copy()
            
            # Extract temporal features
            if self.config['temporal_features']['extract_time']:
                engineered_data = self._extract_temporal_features(engineered_data)
            
            # Extract cyclical features
            if self.config['temporal_features']['extract_cyclical']:
                engineered_data = self._extract_cyclical_features(engineered_data)
            
            # Extract lag features
            if self.config['temporal_features']['extract_lags']:
                engineered_data = self._extract_lag_features(engineered_data)
            
            # Extract rolling statistics
            if self.config['temporal_features']['extract_lags']:
                engineered_data = self._extract_rolling_features(engineered_data)
            
            # Create interaction features
            engineered_data = self._create_interaction_features(engineered_data)
            
            return engineered_data
            
        except Exception as e:
            logger.error(f"Error engineering features: {e}")
            return data
    
    def _extract_temporal_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract temporal features from timestamp columns
        """
        try:
            temporal_data = data.copy()
            timestamp_columns = [col for col in temporal_data.columns if temporal_data[col].dtype == 'datetime64[ns]']
            
            for col in timestamp_columns:
                temporal_data[f'{col}_hour'] = temporal_data[col].dt.hour
                temporal_data[f'{col}_day'] = temporal_data[col].dt.day
                temporal_data[f'{col}_month'] = temporal_data[col].dt.month
                temporal_data[f'{col}_year'] = temporal_data[col].dt.year
                temporal_data[f'{col}_dayofweek'] = temporal_data[col].dt.dayofweek
                temporal_data[f'{col}_quarter'] = temporal_data[col].dt.quarter
                temporal_data[f'{col}_is_weekend'] = temporal_data[col].dt.dayofweek.isin([5, 6]).astype(int)
                temporal_data[f'{col}_is_business_hour'] = ((temporal_data[col].dt.hour >= 9) & 
                                                          (temporal_data[col].dt.hour <= 17)).astype(int)
            
            return temporal_data
            
        except Exception as e:
            logger.error(f"Error extracting temporal features: {e}")
            return data
    
    def _extract_cyclical_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract cyclical features for temporal data
        """
        try:
            cyclical_data = data.copy()
            
            # Hour cyclical features
            if 'hour' in cyclical_data.columns:
                cyclical_data['hour_sin'] = np.sin(2 * np.pi * cyclical_data['hour'] / 24)
                cyclical_data['hour_cos'] = np.cos(2 * np.pi * cyclical_data['hour'] / 24)
            
            # Day of week cyclical features
            if 'dayofweek' in cyclical_data.columns:
                cyclical_data['day_sin'] = np.sin(2 * np.pi * cyclical_data['dayofweek'] / 7)
                cyclical_data['day_cos'] = np.cos(2 * np.pi * cyclical_data['dayofweek'] / 7)
            
            # Month cyclical features
            if 'month' in cyclical_data.columns:
                cyclical_data['month_sin'] = np.sin(2 * np.pi * cyclical_data['month'] / 12)
                cyclical_data['month_cos'] = np.cos(2 * np.pi * cyclical_data['month'] / 12)
            
            return cyclical_data
            
        except Exception as e:
            logger.error(f"Error extracting cyclical features: {e}")
            return data
    
    def _extract_lag_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract lag features for time series
        """
        try:
            lag_data = data.copy()
            numerical_columns = lag_data.select_dtypes(include=[np.number]).columns
            
            # Remove temporal and cyclical features from lag calculation
            exclude_columns = ['hour', 'day', 'month', 'year', 'dayofweek', 'quarter', 
                             'is_weekend', 'is_business_hour', 'hour_sin', 'hour_cos', 
                             'day_sin', 'day_cos', 'month_sin', 'month_cos']
            
            lag_columns = [col for col in numerical_columns if col not in exclude_columns]
            
            for col in lag_columns:
                for lag in self.config['temporal_features']['lag_windows']:
                    lag_data[f'{col}_lag_{lag}h'] = lag_data[col].shift(lag)
            
            return lag_data
            
        except Exception as e:
            logger.error(f"Error extracting lag features: {e}")
            return data
    
    def _extract_rolling_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract rolling statistics features
        """
        try:
            rolling_data = data.copy()
            numerical_columns = rolling_data.select_dtypes(include=[np.number]).columns
            
            # Remove temporal and cyclical features from rolling calculation
            exclude_columns = ['hour', 'day', 'month', 'year', 'dayofweek', 'quarter', 
                             'is_weekend', 'is_business_hour', 'hour_sin', 'hour_cos', 
                             'day_sin', 'day_cos', 'month_sin', 'month_cos']
            
            rolling_columns = [col for col in numerical_columns if col not in exclude_columns]
            
            for col in rolling_columns:
                for window in self.config['temporal_features']['rolling_windows']:
                    rolling_data[f'{col}_rolling_{window}h_mean'] = rolling_data[col].rolling(window=window).mean()
                    rolling_data[f'{col}_rolling_{window}h_std'] = rolling_data[col].rolling(window=window).std()
                    rolling_data[f'{col}_rolling_{window}h_min'] = rolling_data[col].rolling(window=window).min()
                    rolling_data[f'{col}_rolling_{window}h_max'] = rolling_data[col].rolling(window=window).max()
            
            return rolling_data
            
        except Exception as e:
            logger.error(f"Error extracting rolling features: {e}")
            return data
    
    def _create_interaction_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Create interaction features between numerical variables
        """
        try:
            interaction_data = data.copy()
            numerical_columns = interaction_data.select_dtypes(include=[np.number]).columns
            
            # Limit to avoid too many features
            if len(numerical_columns) > 10:
                numerical_columns = numerical_columns[:10]
            
            # Create pairwise interactions for top features
            for i, col1 in enumerate(numerical_columns):
                for j, col2 in enumerate(numerical_columns):
                    if i < j:
                        # Multiplication
                        interaction_data[f'{col1}_x_{col2}'] = interaction_data[col1] * interaction_data[col2]
                        
                        # Division (with safety check)
                        if (interaction_data[col2] != 0).all():
                            interaction_data[f'{col1}_div_{col2}'] = interaction_data[col1] / interaction_data[col2]
                        
                        # Sum and difference
                        interaction_data[f'{col1}_plus_{col2}'] = interaction_data[col1] + interaction_data[col2]
                        interaction_data[f'{col1}_minus_{col2}'] = interaction_data[col1] - interaction_data[col2]
            
            return interaction_data
            
        except Exception as e:
            logger.error(f"Error creating interaction features: {e}")
            return data
    
    def _encode_categorical_variables(self, data: pd.DataFrame, is_training: bool) -> pd.DataFrame:
        """
        Encode categorical variables
        """
        try:
            encoded_data = data.copy()
            categorical_columns = encoded_data.select_dtypes(include=['object', 'category']).columns
            
            if len(categorical_columns) == 0:
                return encoded_data
            
            strategy = self.config['encoding']['categorical_strategy']
            
            if strategy == 'label':
                for col in categorical_columns:
                    if is_training:
                        le = LabelEncoder()
                        encoded_data[col] = le.fit_transform(encoded_data[col].astype(str))
                        self.encoders[col] = le
                    else:
                        if col in self.encoders:
                            # Handle unknown categories
                            unknown_mask = ~encoded_data[col].isin(self.encoders[col].classes_)
                            if unknown_mask.any():
                                encoded_data.loc[unknown_mask, col] = 'unknown'
                            encoded_data[col] = self.encoders[col].transform(encoded_data[col].astype(str))
            
            elif strategy == 'onehot':
                # For one-hot encoding, you might want to use pandas get_dummies
                # or sklearn's OneHotEncoder for more control
                pass
            
            logger.info(f"Encoded {len(categorical_columns)} categorical variables using {strategy} strategy")
            return encoded_data
            
        except Exception as e:
            logger.error(f"Error encoding categorical variables: {e}")
            return data
    
    def _scale_features(self, data: pd.DataFrame, is_training: bool) -> pd.DataFrame:
        """
        Scale numerical features
        """
        try:
            scaled_data = data.copy()
            numerical_columns = scaled_data.select_dtypes(include=[np.number]).columns
            
            if len(numerical_columns) == 0:
                return scaled_data
            
            method = self.config['scaling']['method']
            
            if method == 'standard':
                if is_training:
                    scaler = StandardScaler(
                        with_mean=self.config['scaling']['with_mean'],
                        with_std=self.config['scaling']['with_std']
                    )
                    scaled_data[numerical_columns] = scaler.fit_transform(scaled_data[numerical_columns])
                    self.scalers['feature_scaler'] = scaler
                else:
                    if 'feature_scaler' in self.scalers:
                        scaled_data[numerical_columns] = self.scalers['feature_scaler'].transform(scaled_data[numerical_columns])
            
            elif method == 'minmax':
                if is_training:
                    scaler = MinMaxScaler()
                    scaled_data[numerical_columns] = scaler.fit_transform(scaled_data[numerical_columns])
                    self.scalers['feature_scaler'] = scaler
                else:
                    if 'feature_scaler' in self.scalers:
                        scaled_data[numerical_columns] = self.scalers['feature_scaler'].transform(scaled_data[numerical_columns])
            
            elif method == 'robust':
                if is_training:
                    scaler = RobustScaler()
                    scaled_data[numerical_columns] = scaler.fit_transform(scaled_data[numerical_columns])
                    self.scalers['feature_scaler'] = scaler
                else:
                    if 'feature_scaler' in self.scalers:
                        scaled_data[numerical_columns] = self.scalers['feature_scaler'].transform(scaled_data[numerical_columns])
            
            logger.info(f"Scaled {len(numerical_columns)} numerical features using {method} method")
            return scaled_data
            
        except Exception as e:
            logger.error(f"Error scaling features: {e}")
            return data
    
    def _select_features(self, data: pd.DataFrame, target_column: str, is_training: bool) -> pd.DataFrame:
        """
        Select most important features
        """
        try:
            if target_column is None or target_column not in data.columns:
                logger.warning("No target column specified for feature selection, skipping...")
                return data
            
            selected_data = data.copy()
            feature_columns = [col for col in data.columns if col != target_column]
            
            if len(feature_columns) == 0:
                return selected_data
            
            method = self.config['feature_selection']['method']
            k_features = self.config['feature_selection']['k_features']
            threshold = self.config['feature_selection']['threshold']
            
            if is_training:
                if method == 'f_regression':
                    selector = SelectKBest(score_func=f_regression, k=k_features)
                elif method == 'f_classif':
                    selector = SelectKBest(score_func=f_classif, k=k_features)
                elif method == 'mutual_info':
                    selector = SelectKBest(score_func=mutual_info_regression, k=k_features)
                else:
                    return selected_data
                
                X = selected_data[feature_columns]
                y = selected_data[target_column]
                
                # Handle categorical target
                if y.dtype == 'object':
                    le = LabelEncoder()
                    y = le.fit_transform(y)
                
                selector.fit(X, y)
                self.feature_selectors['main'] = selector
                
                # Get selected feature names
                selected_features = [feature_columns[i] for i in selector.get_support(indices=True)]
                self.feature_names = selected_features
                
                logger.info(f"Selected {len(selected_features)} features using {method} method")
                
                # Return data with only selected features plus target
                return selected_data[selected_features + [target_column]]
            else:
                if 'main' in self.feature_selectors:
                    # Use stored feature names
                    if self.feature_names:
                        return selected_data[self.feature_names + [target_column]]
            
            return selected_data
            
        except Exception as e:
            logger.error(f"Error selecting features: {e}")
            return data
    
    def _reduce_dimensions(self, data: pd.DataFrame, is_training: bool) -> pd.DataFrame:
        """
        Reduce dimensions using PCA (optional)
        """
        try:
            if not self.config['dimensionality_reduction']['use_pca']:
                return data
            
            reduced_data = data.copy()
            feature_columns = [col for col in data.columns if col != 'target']  # Adjust based on your target column name
            
            if len(feature_columns) < 2:
                return reduced_data
            
            n_components = self.config['dimensionality_reduction']['n_components']
            min_components = self.config['dimensionality_reduction']['min_components']
            
            if is_training:
                if isinstance(n_components, float):
                    pca = PCA(n_components=n_components)
                else:
                    pca = PCA(n_components=max(n_components, min_components))
                
                X = reduced_data[feature_columns]
                pca.fit(X)
                self.pca_models['main'] = pca
                
                # Transform data
                transformed_features = pca.transform(X)
                
                # Create new column names
                pca_columns = [f'pca_component_{i}' for i in range(transformed_features.shape[1])]
                
                # Replace original features with PCA components
                reduced_data = reduced_data.drop(columns=feature_columns)
                for i, col in enumerate(pca_columns):
                    reduced_data[col] = transformed_features[:, i]
                
                logger.info(f"Reduced dimensions from {len(feature_columns)} to {len(pca_columns)} using PCA")
            else:
                if 'main' in self.pca_models:
                    pca = self.pca_models['main']
                    X = reduced_data[feature_columns]
                    transformed_features = pca.transform(X)
                    
                    # Create new column names
                    pca_columns = [f'pca_component_{i}' for i in range(transformed_features.shape[1])]
                    
                    # Replace original features with PCA components
                    reduced_data = reduced_data.drop(columns=feature_columns)
                    for i, col in enumerate(pca_columns):
                        reduced_data[col] = transformed_features[:, i]
            
            return reduced_data
            
        except Exception as e:
            logger.error(f"Error reducing dimensions: {e}")
            return data
    
    def get_preprocessing_summary(self) -> Dict[str, Any]:
        """
        Get summary of preprocessing operations
        """
        return {
            'scalers': list(self.scalers.keys()),
            'imputers': list(self.imputers.keys()),
            'encoders': list(self.encoders.keys()),
            'feature_selectors': list(self.feature_selectors.keys()),
            'pca_models': list(self.pca_models.keys()),
            'feature_names': self.feature_names,
            'preprocessing_pipeline': self.preprocessing_pipeline,
            'config': self.config
        }
    
    def save_preprocessor(self, filepath: str):
        """
        Save preprocessor to disk
        """
        try:
            import joblib
            preprocessor_data = {
                'scalers': self.scalers,
                'imputers': self.imputers,
                'encoders': self.encoders,
                'feature_selectors': self.feature_selectors,
                'pca_models': self.pca_models,
                'feature_names': self.feature_names,
                'preprocessing_pipeline': self.preprocessing_pipeline,
                'config': self.config
            }
            joblib.dump(preprocessor_data, filepath)
            logger.info(f"Preprocessor saved to {filepath}")
        except Exception as e:
            logger.error(f"Error saving preprocessor: {e}")
    
    def load_preprocessor(self, filepath: str):
        """
        Load preprocessor from disk
        """
        try:
            import joblib
            preprocessor_data = joblib.load(filepath)
            
            self.scalers = preprocessor_data['scalers']
            self.imputers = preprocessor_data['imputers']
            self.encoders = preprocessor_data['encoders']
            self.feature_selectors = preprocessor_data['feature_selectors']
            self.pca_models = preprocessor_data['pca_models']
            self.feature_names = preprocessor_data['feature_names']
            self.preprocessing_pipeline = preprocessor_data['preprocessing_pipeline']
            self.config = preprocessor_data['config']
            
            logger.info(f"Preprocessor loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading preprocessor: {e}")

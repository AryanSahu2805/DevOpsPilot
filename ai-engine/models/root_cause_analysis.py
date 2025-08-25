import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score, calinski_harabasz_score
from scipy import stats
from scipy.spatial.distance import pdist, squareform
import networkx as nx
import logging

logger = logging.getLogger(__name__)

class RootCauseAnalysisModel:
    """
    AI-powered root cause analysis model for incident investigation
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.correlation_graph = None
        self.is_trained = False
        self.last_training = None
        self.analysis_history = []
        
        # Default configuration
        self.default_config = {
            'correlation_threshold': 0.7,
            'min_cluster_size': 3,
            'max_clusters': 10,
            'anomaly_contamination': 0.1,
            'feature_importance_threshold': 0.05,
            'temporal_window': 24,  # hours
            'confidence_threshold': 0.6,
            'max_root_causes': 5,
            'analysis_depth': 3  # levels of investigation
        }
        
        # Merge with provided config
        self.config = {**self.default_config, **self.config}
    
    def preprocess_incident_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess incident data for root cause analysis
        """
        try:
            # Handle missing values
            data = data.fillna(method='ffill').fillna(method='bfill')
            
            # Convert categorical variables
            categorical_columns = data.select_dtypes(include=['object']).columns
            for col in categorical_columns:
                if col != 'timestamp':
                    le = LabelEncoder()
                    data[f'{col}_encoded'] = le.fit_transform(data[col].astype(str))
                    self.encoders[col] = le
            
            # Create temporal features
            if 'timestamp' in data.columns:
                data['timestamp'] = pd.to_datetime(data['timestamp'])
                data['hour'] = data['timestamp'].dt.hour
                data['day_of_week'] = data['timestamp'].dt.dayofweek
                data['is_business_hour'] = ((data['timestamp'].dt.hour >= 9) & 
                                          (data['timestamp'].dt.hour <= 17)).astype(int)
            
            # Create lag features for time series
            numerical_columns = data.select_dtypes(include=[np.number]).columns
            lag_features = [col for col in numerical_columns if col not in ['hour', 'day_of_week', 'is_business_hour']]
            
            for feature in lag_features:
                for lag in [1, 2, 3, 6, 12]:  # hours
                    data[f'{feature}_lag_{lag}h'] = data[feature].shift(lag)
            
            # Create rolling statistics
            for feature in lag_features:
                data[f'{feature}_rolling_1h_mean'] = data[feature].rolling(window=4).mean()
                data[f'{feature}_rolling_6h_mean'] = data[feature].rolling(window=24).mean()
                data[f'{feature}_rolling_1h_std'] = data[feature].rolling(window=4).std()
                data[f'{feature}_rolling_6h_std'] = data[feature].rolling(window=24).std()
            
            # Remove rows with NaN values
            data = data.dropna()
            
            return data
            
        except Exception as e:
            logger.error(f"Error preprocessing incident data: {e}")
            return data
    
    def build_correlation_graph(self, data: pd.DataFrame) -> nx.Graph:
        """
        Build correlation graph for dependency analysis
        """
        try:
            numerical_columns = data.select_dtypes(include=[np.number]).columns
            
            # Calculate correlation matrix
            correlation_matrix = data[numerical_columns].corr()
            
            # Create graph
            G = nx.Graph()
            
            # Add nodes
            for col in numerical_columns:
                G.add_node(col, type='metric')
            
            # Add edges based on correlation
            for i, col1 in enumerate(numerical_columns):
                for j, col2 in enumerate(numerical_columns):
                    if i < j:  # Avoid duplicate edges
                        correlation = abs(correlation_matrix.loc[col1, col2])
                        if correlation >= self.config['correlation_threshold']:
                            G.add_edge(col1, col2, weight=correlation, type='correlation')
            
            # Add service dependency edges (if available)
            if 'service' in data.columns:
                service_dependencies = self._extract_service_dependencies(data)
                for dep in service_dependencies:
                    G.add_edge(dep['source'], dep['target'], 
                              weight=dep['strength'], type='dependency')
            
            self.correlation_graph = G
            logger.info(f"Built correlation graph with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")
            
            return G
            
        except Exception as e:
            logger.error(f"Error building correlation graph: {e}")
            return nx.Graph()
    
    def _extract_service_dependencies(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Extract service dependencies from data
        """
        dependencies = []
        
        try:
            if 'service' not in data.columns:
                return dependencies
            
            # Group by service and analyze interactions
            service_groups = data.groupby('service')
            services = list(service_groups.groups.keys())
            
            for i, service1 in enumerate(services):
                for j, service2 in enumerate(services):
                    if i < j:
                        # Calculate dependency strength based on correlation
                        service1_data = service_groups.get_group(service1)
                        service2_data = service_groups.get_group(service2)
                        
                        # Find common metrics
                        common_metrics = set(service1_data.columns) & set(service2_data.columns)
                        if len(common_metrics) > 0:
                            # Calculate average correlation
                            correlations = []
                            for metric in common_metrics:
                                if metric in service1_data.columns and metric in service2_data.columns:
                                    corr = service1_data[metric].corr(service2_data[metric])
                                    if not pd.isna(corr):
                                        correlations.append(abs(corr))
                            
                            if correlations:
                                avg_correlation = np.mean(correlations)
                                if avg_correlation >= self.config['correlation_threshold']:
                                    dependencies.append({
                                        'source': service1,
                                        'target': service2,
                                        'strength': avg_correlation,
                                        'common_metrics': list(common_metrics)
                                    })
            
        except Exception as e:
            logger.error(f"Error extracting service dependencies: {e}")
        
        return dependencies
    
    def train_models(self, training_data: pd.DataFrame):
        """
        Train root cause analysis models
        """
        try:
            logger.info("Starting root cause analysis model training...")
            
            if len(training_data) < 50:
                raise ValueError("Insufficient training data for root cause analysis")
            
            # Preprocess data
            processed_data = self.preprocess_incident_data(training_data.copy())
            
            # Build correlation graph
            self.build_correlation_graph(processed_data)
            
            # Prepare features for classification
            X, y = self._prepare_classification_features(processed_data)
            
            if len(X) == 0:
                raise ValueError("No valid features for training")
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            self.scalers['feature_scaler'] = scaler
            
            # Train Random Forest classifier
            rf_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            )
            rf_model.fit(X_scaled, y)
            self.models['random_forest'] = rf_model
            
            # Train Isolation Forest for anomaly detection
            iso_model = IsolationForest(
                contamination=self.config['anomaly_contamination'],
                random_state=42
            )
            iso_model.fit(X_scaled)
            self.models['isolation_forest'] = iso_model
            
            # Train clustering models
            self._train_clustering_models(X_scaled)
            
            self.is_trained = True
            self.last_training = datetime.now()
            
            logger.info("Root cause analysis model training completed successfully")
            
        except Exception as e:
            logger.error(f"Error during model training: {e}")
            self.is_trained = False
            raise
    
    def _prepare_classification_features(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare features for classification
        """
        try:
            # Select numerical features
            feature_columns = [col for col in data.columns 
                             if col not in ['timestamp', 'service', 'incident_id'] and 
                             not col.endswith('_encoded')]
            
            X = data[feature_columns].values
            
            # Create labels (simplified - you might want to use actual incident labels)
            # For now, we'll use anomaly detection to create labels
            if len(X) > 0:
                # Use statistical outlier detection to create labels
                z_scores = np.abs(stats.zscore(X, axis=0))
                outlier_mask = np.any(z_scores > 3, axis=1)
                y = outlier_mask.astype(int)
            else:
                y = np.array([])
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing classification features: {e}")
            return np.array([]), np.array([])
    
    def _train_clustering_models(self, X_scaled: np.ndarray):
        """
        Train clustering models for pattern discovery
        """
        try:
            # K-means clustering
            kmeans = KMeans(
                n_clusters=min(self.config['max_clusters'], len(X_scaled) // 10),
                random_state=42
            )
            kmeans.fit(X_scaled)
            self.models['kmeans'] = kmeans
            
            # DBSCAN clustering
            dbscan = DBSCAN(
                eps=0.5,
                min_samples=self.config['min_cluster_size']
            )
            dbscan.fit(X_scaled)
            self.models['dbscan'] = dbscan
            
            logger.info("Clustering models trained successfully")
            
        except Exception as e:
            logger.error(f"Error training clustering models: {e}")
    
    def analyze_root_cause(self, incident_data: pd.DataFrame, 
                          incident_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze root cause of an incident
        """
        if not self.is_trained:
            logger.warning("Models not trained. Please train models first.")
            return {
                'root_causes': [],
                'confidence': 0.0,
                'analysis_path': [],
                'error': 'Models not trained'
            }
        
        try:
            logger.info("Starting root cause analysis...")
            
            # Preprocess incident data
            processed_data = self.preprocess_incident_data(incident_data.copy())
            
            # Perform multi-level analysis
            analysis_results = self._perform_multi_level_analysis(processed_data, incident_metrics)
            
            # Generate root cause hypotheses
            root_causes = self._generate_root_cause_hypotheses(analysis_results)
            
            # Rank root causes by confidence
            ranked_causes = self._rank_root_causes(root_causes)
            
            # Store analysis history
            analysis_record = {
                'timestamp': datetime.now().isoformat(),
                'incident_metrics': incident_metrics,
                'root_causes': ranked_causes,
                'analysis_path': analysis_results['analysis_path']
            }
            self.analysis_history.append(analysis_record)
            
            return {
                'root_causes': ranked_causes[:self.config['max_root_causes']],
                'confidence': np.mean([rc['confidence'] for rc in ranked_causes]),
                'analysis_path': analysis_results['analysis_path'],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing root cause: {e}")
            return {
                'root_causes': [],
                'confidence': 0.0,
                'analysis_path': [],
                'error': str(e)
            }
    
    def _perform_multi_level_analysis(self, data: pd.DataFrame, 
                                     incident_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform multi-level analysis of the incident
        """
        analysis_results = {
            'level_1': {},
            'level_2': {},
            'level_3': {},
            'analysis_path': []
        }
        
        try:
            # Level 1: Statistical Analysis
            analysis_results['level_1'] = self._statistical_analysis(data, incident_metrics)
            analysis_results['analysis_path'].append('statistical_analysis')
            
            # Level 2: Pattern Recognition
            analysis_results['level_2'] = self._pattern_recognition(data, incident_metrics)
            analysis_results['analysis_path'].append('pattern_recognition')
            
            # Level 3: Dependency Analysis
            analysis_results['level_3'] = self._dependency_analysis(data, incident_metrics)
            analysis_results['analysis_path'].append('dependency_analysis')
            
        except Exception as e:
            logger.error(f"Error in multi-level analysis: {e}")
        
        return analysis_results
    
    def _statistical_analysis(self, data: pd.DataFrame, 
                             incident_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform statistical analysis of incident data
        """
        results = {}
        
        try:
            numerical_columns = data.select_dtypes(include=[np.number]).columns
            
            for col in numerical_columns:
                values = data[col].values
                
                # Basic statistics
                results[col] = {
                    'mean': float(np.mean(values)),
                    'std': float(np.std(values)),
                    'min': float(np.min(values)),
                    'max': float(np.max(values)),
                    'median': float(np.median(values)),
                    'iqr': float(np.percentile(values, 75) - np.percentile(values, 25))
                }
                
                # Outlier detection
                z_scores = np.abs(stats.zscore(values))
                outliers = np.where(z_scores > 3)[0]
                results[col]['outliers_count'] = len(outliers)
                results[col]['outlier_indices'] = outliers.tolist()
                
                # Trend analysis
                if len(values) > 10:
                    x = np.arange(len(values))
                    slope, intercept, r_value, p_value, std_err = stats.linregress(x, values)
                    results[col]['trend'] = {
                        'slope': float(slope),
                        'r_squared': float(r_value ** 2),
                        'p_value': float(p_value)
                    }
            
        except Exception as e:
            logger.error(f"Error in statistical analysis: {e}")
        
        return results
    
    def _pattern_recognition(self, data: pd.DataFrame, 
                            incident_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform pattern recognition analysis
        """
        results = {}
        
        try:
            # Use clustering models to identify patterns
            X = data.select_dtypes(include=[np.number]).values
            
            if len(X) > 0 and 'feature_scaler' in self.scalers:
                X_scaled = self.scalers['feature_scaler'].transform(X)
                
                # K-means clustering
                if 'kmeans' in self.models:
                    kmeans_labels = self.models['kmeans'].predict(X_scaled)
                    results['kmeans_clusters'] = {
                        'labels': kmeans_labels.tolist(),
                        'n_clusters': len(np.unique(kmeans_labels)),
                        'silhouette_score': float(silhouette_score(X_scaled, kmeans_labels))
                    }
                
                # DBSCAN clustering
                if 'dbscan' in self.models:
                    dbscan_labels = self.models['dbscan'].fit_predict(X_scaled)
                    results['dbscan_clusters'] = {
                        'labels': dbscan_labels.tolist(),
                        'n_clusters': len(np.unique(dbscan_labels[dbscan_labels != -1])),
                        'noise_points': int(np.sum(dbscan_labels == -1))
                    }
                
                # Anomaly detection
                if 'isolation_forest' in self.models:
                    anomaly_scores = self.models['isolation_forest'].score_samples(X_scaled)
                    anomaly_predictions = self.models['isolation_forest'].predict(X_scaled)
                    
                    results['anomaly_detection'] = {
                        'scores': anomaly_scores.tolist(),
                        'predictions': anomaly_predictions.tolist(),
                        'anomaly_count': int(np.sum(anomaly_predictions == -1))
                    }
            
        except Exception as e:
            logger.error(f"Error in pattern recognition: {e}")
        
        return results
    
    def _dependency_analysis(self, data: pd.DataFrame, 
                            incident_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform dependency analysis using correlation graph
        """
        results = {}
        
        try:
            if self.correlation_graph is None:
                return results
            
            # Analyze graph structure
            results['graph_analysis'] = {
                'nodes_count': self.correlation_graph.number_of_nodes(),
                'edges_count': self.correlation_graph.number_of_edges(),
                'density': nx.density(self.correlation_graph),
                'average_clustering': nx.average_clustering(self.correlation_graph)
            }
            
            # Find central nodes (most connected)
            degree_centrality = nx.degree_centrality(self.correlation_graph)
            betweenness_centrality = nx.betweenness_centrality(self.correlation_graph)
            
            # Sort by centrality
            sorted_degree = sorted(degree_centrality.items(), key=lambda x: x[1], reverse=True)
            sorted_betweenness = sorted(betweenness_centrality.items(), key=lambda x: x[1], reverse=True)
            
            results['central_metrics'] = {
                'by_degree': sorted_degree[:5],
                'by_betweenness': sorted_betweenness[:5]
            }
            
            # Find communities
            communities = nx.community.greedy_modularity_communities(self.correlation_graph)
            results['communities'] = {
                'count': len(communities),
                'sizes': [len(comm) for comm in communities]
            }
            
            # Analyze paths to incident metrics
            if incident_metrics and 'affected_metrics' in incident_metrics:
                affected_metrics = incident_metrics['affected_metrics']
                path_analysis = {}
                
                for metric in affected_metrics:
                    if metric in self.correlation_graph:
                        # Find shortest paths to other metrics
                        paths = {}
                        for other_metric in self.correlation_graph.nodes():
                            if other_metric != metric:
                                try:
                                    path = nx.shortest_path(self.correlation_graph, metric, other_metric)
                                    paths[other_metric] = {
                                        'path': path,
                                        'length': len(path) - 1
                                    }
                                except nx.NetworkXNoPath:
                                    continue
                        
                        path_analysis[metric] = paths
                
                results['path_analysis'] = path_analysis
            
        except Exception as e:
            logger.error(f"Error in dependency analysis: {e}")
        
        return results
    
    def _generate_root_cause_hypotheses(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate root cause hypotheses based on analysis results
        """
        hypotheses = []
        
        try:
            # Generate hypotheses from statistical analysis
            if 'level_1' in analysis_results:
                for metric, stats in analysis_results['level_1'].items():
                    if stats.get('outliers_count', 0) > 0:
                        hypotheses.append({
                            'type': 'statistical_outlier',
                            'metric': metric,
                            'confidence': min(0.8, stats['outliers_count'] / 10),
                            'evidence': f"Found {stats['outliers_count']} outliers in {metric}",
                            'severity': 'medium'
                        })
                    
                    if 'trend' in stats and stats['trend']['p_value'] < 0.05:
                        hypotheses.append({
                            'type': 'trend_anomaly',
                            'metric': metric,
                            'confidence': min(0.7, abs(stats['trend']['slope'])),
                            'evidence': f"Significant trend detected in {metric}",
                            'severity': 'low'
                        })
            
            # Generate hypotheses from pattern recognition
            if 'level_2' in analysis_results:
                level2 = analysis_results['level_2']
                
                if 'anomaly_detection' in level2:
                    anomaly_count = level2['anomaly_detection']['anomaly_count']
                    if anomaly_count > 0:
                        hypotheses.append({
                            'type': 'ai_anomaly',
                            'metric': 'multiple',
                            'confidence': min(0.9, anomaly_count / 20),
                            'evidence': f"AI detected {anomaly_count} anomalies",
                            'severity': 'high'
                        })
                
                if 'kmeans_clusters' in level2:
                    cluster_info = level2['kmeans_clusters']
                    if cluster_info['silhouette_score'] < 0.3:
                        hypotheses.append({
                            'type': 'pattern_instability',
                            'metric': 'clustering',
                            'confidence': 0.6,
                            'evidence': "Low clustering stability detected",
                            'severity': 'medium'
                        })
            
            # Generate hypotheses from dependency analysis
            if 'level_3' in analysis_results:
                level3 = analysis_results['level_3']
                
                if 'central_metrics' in level3:
                    central_metrics = level3['central_metrics']['by_degree'][:3]
                    for metric, centrality in central_metrics:
                        if centrality > 0.8:
                            hypotheses.append({
                                'type': 'dependency_bottleneck',
                                'metric': metric,
                                'confidence': min(0.8, centrality),
                                'evidence': f"High dependency on {metric} (centrality: {centrality:.3f})",
                                'severity': 'high'
                            })
            
        except Exception as e:
            logger.error(f"Error generating root cause hypotheses: {e}")
        
        return hypotheses
    
    def _rank_root_causes(self, root_causes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank root causes by confidence and severity
        """
        try:
            # Define severity weights
            severity_weights = {
                'high': 3.0,
                'medium': 2.0,
                'low': 1.0
            }
            
            # Calculate weighted scores
            for cause in root_causes:
                severity_weight = severity_weights.get(cause.get('severity', 'medium'), 2.0)
                cause['weighted_score'] = cause['confidence'] * severity_weight
            
            # Sort by weighted score
            ranked_causes = sorted(root_causes, key=lambda x: x['weighted_score'], reverse=True)
            
            return ranked_causes
            
        except Exception as e:
            logger.error(f"Error ranking root causes: {e}")
            return root_causes
    
    def get_model_status(self) -> Dict[str, Any]:
        """
        Get the current status of root cause analysis models
        """
        return {
            'is_trained': self.is_trained,
            'last_training': self.last_training.isoformat() if self.last_training else None,
            'models_count': len(self.models),
            'scalers_count': len(self.scalers),
            'encoders_count': len(self.encoders),
            'correlation_graph_nodes': self.correlation_graph.number_of_nodes() if self.correlation_graph else 0,
            'analysis_history_count': len(self.analysis_history),
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
                'encoders': self.encoders,
                'correlation_graph': self.correlation_graph,
                'config': self.config,
                'is_trained': self.is_trained,
                'last_training': self.last_training,
                'analysis_history': self.analysis_history
            }
            joblib.dump(model_data, filepath)
            logger.info(f"Root cause analysis models saved to {filepath}")
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
            self.encoders = model_data['encoders']
            self.correlation_graph = model_data['correlation_graph']
            self.config = model_data['config']
            self.is_trained = model_data['is_trained']
            self.last_training = model_data['last_training']
            self.analysis_history = model_data.get('analysis_history', [])
            
            logger.info(f"Root cause analysis models loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.is_trained = False

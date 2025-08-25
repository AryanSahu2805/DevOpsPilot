import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  Zap, 
  Brain, 
  Monitor, 
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Users,
  Globe,
  Clock,
  TrendingUp,
  Play,
  X
} from 'lucide-react';

const Landing: React.FC = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const features = [
    {
      icon: <Monitor className="w-8 h-8 text-emerald-500" />,
      title: "Real-time Monitoring",
      description: "Monitor your infrastructure in real-time with advanced metrics and visualizations."
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "AI-Powered Insights",
      description: "Get intelligent predictions and anomaly detection powered by machine learning."
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-orange-500" />,
      title: "Smart Alerts",
      description: "Receive intelligent alerts and notifications before issues impact your users."
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "Automated Scaling",
      description: "Automatically scale your infrastructure based on demand and performance metrics."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Security First",
      description: "Enterprise-grade security with role-based access control and audit trails."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-500" />,
      title: "Advanced Analytics",
      description: "Deep insights into performance, usage patterns, and optimization opportunities."
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "10K+", label: "Active Users" },
    { icon: <Globe className="w-6 h-6" />, value: "50+", label: "Countries" },
    { icon: <Clock className="w-6 h-6" />, value: "99.9%", label: "Uptime" },
    { icon: <TrendingUp className="w-6 h-6" />, value: "40%", label: "Cost Reduction" }
  ];

  const benefits = [
    "Real-time infrastructure monitoring",
    "AI-powered anomaly detection",
    "Automated scaling and optimization",
    "Comprehensive security controls",
    "Advanced analytics and reporting",
    "24/7 support and maintenance"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DevOps Pilot</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <Link 
              to="/login" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Intelligent
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent"> DevOps</span>
              <br />
              Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Revolutionize your DevOps workflow with AI-powered monitoring, automated scaling, and intelligent insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setIsDemoOpen(true)}
                className="border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-emerald-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to build, deploy, and monitor your applications at scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Why Choose DevOps Pilot?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link 
                  to="/login" 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">System Health</span>
                    <span className="text-emerald-400">98%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">2.3ms</div>
                      <div className="text-gray-400 text-sm">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">99.9%</div>
                      <div className="text-gray-400 text-sm">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your DevOps?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of teams who trust DevOps Pilot for their infrastructure monitoring and automation needs.
          </p>
          <Link 
            to="/login" 
            className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DevOps Pilot</span>
              </div>
              <p className="text-gray-400">
                Intelligent DevOps platform for modern teams.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DevOps Pilot. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {isDemoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">DevOps Pilot Demo</h3>
                <p className="text-gray-600 mt-1">See how our platform revolutionizes DevOps workflows</p>
              </div>
              <button
                onClick={() => setIsDemoOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Demo Content */}
            <div className="p-6">
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Demo Video Placeholder */}
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Interactive Demo</h4>
                  <p className="text-gray-300 max-w-md">
                    Experience the full power of DevOps Pilot with our interactive demo
                  </p>
                </div>

                {/* Animated Elements */}
                <div className="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-sm rounded-lg p-3 border border-emerald-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-sm font-medium">Live Monitoring</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-blue-500/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 text-sm font-medium">AI Insights</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-orange-500/20 backdrop-blur-sm rounded-lg p-3 border border-orange-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-orange-400 text-sm font-medium">Smart Alerts</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-purple-500/20 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-400 text-sm font-medium">Auto Scaling</span>
                  </div>
                </div>
              </div>

              {/* Demo Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Monitor className="w-5 h-5 text-emerald-500" />
                    <h5 className="font-semibold text-gray-900">Real-time Monitoring</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Watch as we monitor infrastructure metrics in real-time
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    <h5 className="font-semibold text-gray-900">AI Predictions</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    See AI-powered predictions and anomaly detection in action
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <h5 className="font-semibold text-gray-900">Auto Scaling</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Witness intelligent scaling based on demand patterns
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link
                  to="/login"
                  onClick={() => setIsDemoOpen(false)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
                >
                  Start Free Trial
                </Link>
                <button
                  onClick={() => setIsDemoOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Close Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;

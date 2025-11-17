// src/components/AiInsights.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  X,
  Zap,
  Info
} from 'lucide-react';

// Map insight types to professional colors
const insightConfig = {
  Warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  Suggestion: {
    icon: Lightbulb,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  Insight: {
    icon: Info,
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
  },
};

const InsightCard = ({ insight, onDismiss }) => {
  const config = insightConfig[insight.type] || insightConfig.Insight;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative p-4 rounded-lg border ${config.bg} group`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${config.bg} border ${config.bg.split(' ')[1]}`}>
          <Icon className={config.color} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold mb-1 ${config.color}`}>
            {insight.title}
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {insight.message}
          </p>
        </div>
        <button
          onClick={() => onDismiss(insight._id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const AiInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndGenerateInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/insights');
        setInsights(res.data);
      } catch (err) {
        setError('Failed to load AI insights');
      }
      setLoading(false);
    };

    fetchAndGenerateInsights();
  }, []);

  const handleDismiss = async (id) => {
    setInsights(prev => prev.filter(i => i._id !== id));
    try {
      await api.put(`/insights/${id}/read`);
    } catch (err) {
      console.error("Failed to dismiss insight:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
        <Loader2 className="animate-spin text-gray-400" size={18} />
        <span className="text-sm font-medium text-gray-600">Analyzing your account...</span>
      </div>
    );
  }

  if (error) {
    return null; // Fail silently
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
        <CheckCircle className="text-green-500" size={18} />
        <span className="text-sm font-medium text-gray-700">All caught up! No new insights.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Zap size={18} className="text-gray-600" />
        <h3 className="text-base font-semibold text-gray-900">AI Insights</h3>
      </div>
      <AnimatePresence mode="popLayout">
        {insights.map(insight => (
          <InsightCard
            key={insight._id}
            insight={insight}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AiInsights;

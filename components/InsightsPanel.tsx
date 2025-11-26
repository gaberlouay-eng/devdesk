"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BarChart3, Bug, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Insights {
  stats: {
    total: number;
    tasks: number;
    bugs: number;
    todo: number;
    inProgress: number;
    done: number;
    highPriority: number;
    bugsInProgress: number;
    highPriorityTasks: number;
  };
  suggestion: string;
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/ai/insights");
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 shadow-lg mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Insights</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Tasks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{insights.stats.tasks}</p>
        </div>

        <div className="bg-white/50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Bugs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{insights.stats.bugs}</p>
        </div>

        <div className="bg-white/50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{insights.stats.inProgress}</p>
        </div>

        <div className="bg-white/50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">High Priority</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{insights.stats.highPriority}</p>
        </div>
      </div>

      {insights.suggestion && (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800/50">
          <p className="text-sm text-indigo-900 dark:text-indigo-200">{insights.suggestion}</p>
        </div>
      )}
    </motion.div>
  );
}


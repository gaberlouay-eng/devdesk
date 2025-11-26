"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";

interface ActualTimeModalProps {
  isOpen: boolean;
  itemTitle: string;
  estimatedHours: number | null;
  onClose: () => void;
  onConfirm: (hours: number) => void;
}

export default function ActualTimeModal({
  isOpen,
  itemTitle,
  estimatedHours,
  onClose,
  onConfirm,
}: ActualTimeModalProps) {
  const [hours, setHours] = useState<string>("");
  const [useEstimated, setUseEstimated] = useState(false);

  useEffect(() => {
    if (isOpen && estimatedHours) {
      setHours(estimatedHours.toString());
      setUseEstimated(true);
    } else {
      setHours("");
      setUseEstimated(false);
    }
  }, [isOpen, estimatedHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(hours);
    if (hoursNum > 0) {
      onConfirm(hoursNum);
      onClose();
    }
  };

  const handleUseEstimated = () => {
    if (estimatedHours) {
      setHours(estimatedHours.toString());
      setUseEstimated(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Track Actual Time
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Task: {itemTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Actual Hours Spent
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={hours}
                onChange={(e) => {
                  setHours(e.target.value);
                  setUseEstimated(false);
                }}
                placeholder="e.g., 3.5"
                required
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
              />
              {estimatedHours && !useEstimated && (
                <button
                  type="button"
                  onClick={handleUseEstimated}
                  className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Use estimated ({estimatedHours}h)
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


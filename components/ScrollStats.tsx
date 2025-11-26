"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Clock, Database } from "lucide-react";

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

export default function ScrollStats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      setVisible(true);
    }
  }, [isInView]);

  const stats: Stat[] = [
    {
      icon: <Zap className="w-5 h-5" />,
      value: "99.9%",
      label: "Read Time Savings",
      color: "text-yellow-500",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      value: "< 50ms",
      label: "Average Load Time",
      color: "text-green-500",
    },
    {
      icon: <Database className="w-5 h-5" />,
      value: "0ms",
      label: "Network Latency",
      color: "text-blue-500",
    },
  ];

  return (
    <div ref={ref} className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={
              visible
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: 20 }
            }
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="glass rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.color}`}>{stat.icon}</div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}


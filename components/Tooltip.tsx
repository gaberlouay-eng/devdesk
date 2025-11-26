"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  text,
  children,
  position = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === "top" ? 5 : -5 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
          >
            <div className="glass-strong rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap shadow-xl border border-gray-200/50 dark:border-gray-800/50">
              {text}
              <div
                className={`absolute w-2 h-2 bg-white dark:bg-gray-900 border-r border-b border-gray-200/50 dark:border-gray-800/50 transform rotate-45 ${
                  position === "top"
                    ? "top-full left-1/2 -translate-x-1/2 -translate-y-1/2"
                    : position === "bottom"
                    ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2"
                    : position === "left"
                    ? "left-full top-1/2 -translate-y-1/2 -translate-x-1/2"
                    : "right-full top-1/2 -translate-y-1/2 translate-x-1/2"
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


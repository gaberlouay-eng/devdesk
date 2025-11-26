"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface MicroStoryProps {
  quote: string;
  author: string;
  role: string;
  delay?: number;
}

export default function MicroStory({
  quote,
  author,
  role,
  delay = 0,
}: MicroStoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="glass rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50"
    >
      <Quote className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {author.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {author}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {role}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


"use client";

import { motion } from "framer-motion";
import { Item, ItemType, ItemStatus, ItemPriority } from "@/lib/types";
import { format } from "date-fns";
import { Bug, CheckCircle2, Circle, Clock, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

interface ItemCardProps {
  item: Item;
  index: number;
}

const statusConfig = {
  TODO: { label: "To Do", icon: Circle, color: "text-gray-500" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-500" },
  DONE: { label: "Done", icon: CheckCircle2, color: "text-green-500" },
};

const priorityConfig = {
  LOW: { label: "Low", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" },
  MEDIUM: { label: "Medium", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" },
  HIGH: { label: "High", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
};

export default function ItemCard({ item, index }: ItemCardProps) {
  const StatusIcon = statusConfig[item.status].icon;
  const statusColor = statusConfig[item.status].color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/items/${item.id}`}>
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 dark:group-hover:from-indigo-950/20 dark:group-hover:to-purple-950/20 transition-all duration-300" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {item.type === "BUG" ? (
                  <Bug className="w-5 h-5 text-red-500" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-500" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {item.type}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[item.priority].color}`}>
                {priorityConfig[item.priority].label}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Project & Duration */}
            {(item.project || item.estimatedHours || item.actualHours) && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {item.project && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
                    style={item.project.color ? { backgroundColor: `${item.project.color}20`, color: item.project.color } : {}}
                  >
                    {item.project.name}
                  </span>
                )}
                {item.estimatedHours && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Est: {item.estimatedHours}h
                  </span>
                )}
                {item.actualHours && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Actual: {item.actualHours}h
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                <span className={`text-xs font-medium ${statusColor}`}>
                  {statusConfig[item.status].label}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(item.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


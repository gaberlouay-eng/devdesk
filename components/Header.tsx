"use client";

import { motion } from "framer-motion";
import { Moon, Sun, Plus, Download, BarChart3 } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useState } from "react";
import CreateItemModal from "./CreateItemModal";
import { ItemType } from "@/lib/types";

interface HeaderProps {
  onRefresh: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ItemType | undefined>();

  const handleExport = async () => {
    try {
      const response = await fetch("/api/items/export");
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devdesk-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                DevDesk
              </h1>
           
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setModalType(undefined);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Item
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setModalType("TASK");
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Task
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setModalType("BUG");
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Bug
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                title="Export all items"
              >
                <Download className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <CreateItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        defaultType={modalType}
      />
    </>
  );
}


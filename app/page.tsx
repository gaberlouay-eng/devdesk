"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Item, FilterOptions, ItemStatus } from "@/lib/types";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import ItemCard from "@/components/ItemCard";
import InsightsPanel from "@/components/InsightsPanel";
import KanbanBoard from "@/components/KanbanBoard";
import Sidebar from "@/components/Sidebar";
import { Inbox, Grid3x3, Columns } from "lucide-react";

type ViewMode = "grid" | "board";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.projectId) params.append("projectId", filters.projectId);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/items?${params.toString()}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus, actualHours?: number) => {
    try {
      const updateData: any = { status: newStatus };
      if (actualHours !== undefined) {
        updateData.actualHours = actualHours;
      }

      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Update local state optimistically
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId
              ? { ...item, status: newStatus, actualHours: actualHours ?? item.actualHours }
              : item
          )
        );
        // Refresh to ensure consistency
        fetchItems();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Refresh on error to revert optimistic update
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="ml-64">
        <Header onRefresh={fetchItems} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InsightsPanel />

        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <FilterBar onFilterChange={setFilters} />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === "grid"
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("board")}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === "board"
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="Board View (Kanban)"
              >
                <Columns className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse"
                />
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters"
                : "Create your first task or bug to get started"}
            </p>
          </motion.div>
        ) : viewMode === "board" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key="board"
          >
            <KanbanBoard items={items} onStatusChange={handleStatusChange} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key="grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item, index) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        )}
        </main>
      </div>
    </div>
  );
}

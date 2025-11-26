"use client";

import { motion } from "framer-motion";
import { ItemType, ItemStatus, ItemPriority, Project } from "@/lib/types";
import { Filter, X } from "lucide-react";
import { useState, useEffect } from "react";

interface FilterBarProps {
  onFilterChange: (filters: {
    type?: ItemType;
    status?: ItemStatus;
    priority?: ItemPriority;
    projectId?: string;
    search?: string;
  }) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ItemType | "">("");
  const [status, setStatus] = useState<ItemStatus | "">("");
  const [priority, setPriority] = useState<ItemPriority | "">("");
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({
      type: type || undefined,
      status: status || undefined,
      priority: priority || undefined,
      projectId: projectId || undefined,
      search: value || undefined,
    });
  };

  const handleTypeChange = (value: ItemType | "") => {
    setType(value);
    onFilterChange({
      type: value || undefined,
      status: status || undefined,
      priority: priority || undefined,
      projectId: projectId || undefined,
      search: search || undefined,
    });
  };

  const handleStatusChange = (value: ItemStatus | "") => {
    setStatus(value);
    onFilterChange({
      type: type || undefined,
      status: value || undefined,
      priority: priority || undefined,
      projectId: projectId || undefined,
      search: search || undefined,
    });
  };

  const handlePriorityChange = (value: ItemPriority | "") => {
    setPriority(value);
    onFilterChange({
      type: type || undefined,
      status: status || undefined,
      priority: value || undefined,
      projectId: projectId || undefined,
      search: search || undefined,
    });
  };

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    onFilterChange({
      type: type || undefined,
      status: status || undefined,
      priority: priority || undefined,
      projectId: value || undefined,
      search: search || undefined,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setType("");
    setStatus("");
    setPriority("");
    setProjectId("");
    onFilterChange({});
  };

  const hasFilters = search || type || status || priority || projectId;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 z-10 mb-6"
    >
      <div className="glass rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ItemType | "")}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm font-medium cursor-pointer transition-all text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="TASK">Task</option>
              <option value="BUG">Bug</option>
            </select>

            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ItemStatus | "")}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm font-medium cursor-pointer transition-all text-gray-900 dark:text-gray-100"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>

            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as ItemPriority | "")}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm font-medium cursor-pointer transition-all text-gray-900 dark:text-gray-100"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm font-medium cursor-pointer transition-all text-gray-900 dark:text-gray-100"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {hasFilters && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


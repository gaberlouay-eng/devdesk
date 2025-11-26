"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Item, ItemStatus, ItemPriority, Project } from "@/lib/types";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Save,
  X,
  Bug,
  FileText,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

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

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO" as ItemStatus,
    priority: "MEDIUM" as ItemPriority,
    projectId: "",
    estimatedHours: "",
    actualHours: "",
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchItem();
    fetchProjects();
  }, [id]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
        setFormData({
          title: data.title,
          description: data.description || "",
          status: data.status,
          priority: data.priority,
          projectId: data.projectId || "",
          estimatedHours: data.estimatedHours?.toString() || "",
          actualHours: data.actualHours?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectId: formData.projectId || null,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
          actualHours: formData.actualHours ? parseFloat(formData.actualHours) : null,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItem(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setDeleting(false);
    }
  };

  const generateSteps = async () => {
    if (!item) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, description: item.description }),
      });
      const data = await response.json();
      if (response.ok && data.steps) {
        setFormData((prev) => ({
          ...prev,
          description: prev.description ? `${prev.description}\n\n${data.steps}` : data.steps,
        }));
      } else {
        alert(data.message || data.error || "AI feature is not available. Please configure OPENAI_API_KEY in your .env file.");
      }
    } catch (error) {
      console.error("Error generating steps:", error);
      alert("Failed to generate steps. Please check your OpenAI API key configuration.");
    } finally {
      setGenerating(false);
    }
  };

  const generateSubtasks = async () => {
    if (!item) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/suggest-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, description: item.description }),
      });
      const data = await response.json();
      if (response.ok && data.subtasks) {
        setFormData((prev) => ({
          ...prev,
          description: prev.description ? `${prev.description}\n\n${data.subtasks}` : data.subtasks,
        }));
      } else {
        alert(data.message || data.error || "AI feature is not available. Please configure OPENAI_API_KEY in your .env file.");
      }
    } catch (error) {
      console.error("Error generating subtasks:", error);
      alert("Failed to generate subtasks. Please check your OpenAI API key configuration.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Item not found</h2>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[item.status].icon;
  const statusColor = statusConfig[item.status].color;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="ml-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        title: item.title,
                        description: item.description || "",
                        status: item.status,
                        priority: item.priority,
                        projectId: item.projectId || "",
                        estimatedHours: item.estimatedHours?.toString() || "",
                        actualHours: item.actualHours?.toString() || "",
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-8">
            {/* Type & Priority */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {item.type === "BUG" ? (
                  <Bug className="w-6 h-6 text-red-500" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-500" />
                )}
                <span className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {item.type}
                </span>
              </div>
              {!editing && (
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${priorityConfig[item.priority].color}`}>
                  {priorityConfig[item.priority].label}
                </span>
              )}
              {editing && (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as ItemPriority })}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              )}
            </div>

            {/* Title */}
            {editing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {item.title}
              </h1>
            )}

            {/* Status */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              {editing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                  className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                  <span className={`font-medium ${statusColor}`}>
                    {statusConfig[item.status].label}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>

            {/* Project & Duration */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project
                  </label>
                  {editing ? (
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">No Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div>
                      {item.project ? (
                        <span
                          className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 inline-block"
                          style={item.project.color ? { backgroundColor: `${item.project.color}20`, color: item.project.color } : {}}
                        >
                          {item.project.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No project assigned</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Hours
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                      placeholder="e.g., 2.5"
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {item.estimatedHours ? `${item.estimatedHours}h` : "—"}
                    </div>
                  )}
                </div>

                {/* Actual Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Actual Hours
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.actualHours}
                      onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
                      placeholder="e.g., 3.0"
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {item.actualHours ? `${item.actualHours}h` : "—"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Description</h2>
                {editing && item.type === "BUG" && (
                  <button
                    onClick={generateSteps}
                    disabled={generating}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 transition-colors"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate Steps
                  </button>
                )}
                {editing && item.type === "TASK" && (
                  <button
                    onClick={generateSubtasks}
                    disabled={generating}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 transition-colors"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Suggest Subtasks
                  </button>
                )}
              </div>
              {editing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none font-mono text-sm text-gray-900 dark:text-gray-100"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    {item.description || "No description provided."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { motion } from "framer-motion";
import { Code, ArrowLeft, Book, Zap, Shield, GitBranch, Brain, Lock, Download, Terminal, Settings, Database } from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Code className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                DevDesk
              </span>
            </Link>
            <Link
              href="/"
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Back to App
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16 sm:pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link
              href="/landing"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Landing
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Book className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                Documentation
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Complete guide to using DevDesk for task and bug management
            </p>
          </motion.div>

          {/* Table of Contents */}
          <div className="glass rounded-2xl p-6 mb-12 border border-gray-200/50 dark:border-gray-800/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Table of Contents
            </h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#getting-started" className="text-indigo-600 dark:text-indigo-400 hover:underline">Getting Started</a></li>
              <li><a href="#features" className="text-indigo-600 dark:text-indigo-400 hover:underline">Core Features</a></li>
              <li><a href="#git-integration" className="text-indigo-600 dark:text-indigo-400 hover:underline">Git Integration</a></li>
              <li><a href="#ai-features" className="text-indigo-600 dark:text-indigo-400 hover:underline">AI Features</a></li>
              <li><a href="#cli" className="text-indigo-600 dark:text-indigo-400 hover:underline">CLI Usage</a></li>
              <li><a href="#api" className="text-indigo-600 dark:text-indigo-400 hover:underline">API Reference</a></li>
              <li><a href="#troubleshooting" className="text-indigo-600 dark:text-indigo-400 hover:underline">Troubleshooting</a></li>
            </ul>
          </div>

          {/* Getting Started */}
          <section id="getting-started" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Getting Started
            </h2>
            
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Installation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  DevDesk is a Next.js application that runs locally. Follow these steps to get started:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Clone the repository</li>
                  <li>Install dependencies: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm install</code></li>
                  <li>Set up your database (MySQL) and configure <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">DATABASE_URL</code></li>
                  <li>Run migrations: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run db:push</code></li>
                  <li>Start the development server: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run dev</code></li>
                </ol>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  First Steps
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Create your first project from the Projects page</li>
                  <li>• Add tasks or bugs using the "New Item" button</li>
                  <li>• Organize items using the Kanban board or grid view</li>
                  <li>• Use filters to find specific items quickly</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Core Features */}
          <section id="features" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Core Features
            </h2>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Task & Bug Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create, organize, and track tasks and bugs with ease:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Types:</strong> Tasks for work items, Bugs for issues</li>
                  <li>• <strong>Status:</strong> TODO, IN_PROGRESS, DONE</li>
                  <li>• <strong>Priority:</strong> LOW, MEDIUM, HIGH</li>
                  <li>• <strong>Time Tracking:</strong> Set estimated hours and track actual time</li>
                </ul>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Views
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  DevDesk offers two view modes:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Grid View:</strong> Card-based layout for browsing items</li>
                  <li>• <strong>Kanban Board:</strong> Drag-and-drop interface organized by status</li>
                </ul>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Filtering & Search
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Quickly find what you need:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Filter by type (Task/Bug), status, priority, or project</li>
                  <li>• Search items by title</li>
                  <li>• Combine multiple filters for precise results</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Git Integration */}
          <section id="git-integration" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <GitBranch className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Git Integration
            </h2>

            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                DevDesk automatically integrates with your Git repository:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Automatic Linking:</strong> Commits are automatically linked to tasks when you include task IDs in commit messages</li>
                <li>• <strong>Branch Awareness:</strong> DevDesk can suggest task names based on branch names</li>
                <li>• <strong>Repository Linking:</strong> Link projects to GitHub/Bitbucket repositories</li>
                <li>• <strong>Zero Configuration:</strong> Works automatically when Git is detected in your workspace</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Example commit message:</strong><br />
                  <code className="text-indigo-600 dark:text-indigo-400">
                    [TASK-abc123] Fix authentication bug
                  </code>
                </p>
              </div>
            </div>
          </section>

          {/* AI Features */}
          <section id="ai-features" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Brain className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              AI Features (Pro)
            </h2>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Bug Reproduction Steps
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  When creating or editing a bug, click "Generate Steps" to have AI generate step-by-step reproduction instructions based on your bug description.
                </p>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Task Breakdown
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get AI-generated subtask suggestions for complex tasks. The AI analyzes your task description and suggests logical subtasks.
                </p>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Productivity Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The insights panel provides AI-generated suggestions based on your work patterns and productivity metrics.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> AI features require an OpenAI API key. Add <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">OPENAI_API_KEY</code> to your <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">.env</code> file.
                </p>
              </div>
            </div>
          </section>

          {/* CLI Usage */}
          <section id="cli" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Terminal className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              CLI Usage
            </h2>

            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                DevDesk CLI allows you to manage tasks and bugs from the terminal:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Installation</h4>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
                    npm install -g devdesk-cli
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Configuration</h4>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
                    devdesk config --set-api-key YOUR_API_KEY<br />
                    devdesk config --set-api-url http://localhost:3000
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Commands</h4>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
                    devdesk create --type task --title "Fix bug"<br />
                    devdesk list --status IN_PROGRESS<br />
                    devdesk update STATUS_ID --status DONE
                  </code>
                </div>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section id="api" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Database className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              API Reference
            </h2>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Items API
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="text-indigo-600 dark:text-indigo-400">GET /api/items</code>
                    <p className="text-gray-600 dark:text-gray-400">List all items with optional filters</p>
                  </div>
                  <div>
                    <code className="text-indigo-600 dark:text-indigo-400">POST /api/items</code>
                    <p className="text-gray-600 dark:text-gray-400">Create a new item</p>
                  </div>
                  <div>
                    <code className="text-indigo-600 dark:text-indigo-400">PATCH /api/items/[id]</code>
                    <p className="text-gray-600 dark:text-gray-400">Update an item</p>
                  </div>
                  <div>
                    <code className="text-indigo-600 dark:text-indigo-400">DELETE /api/items/[id]</code>
                    <p className="text-gray-600 dark:text-gray-400">Delete an item</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Projects API
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="text-indigo-600 dark:text-indigo-400">GET /api/projects</code>
                    <p className="text-gray-600 dark:text-gray-400">List all projects</p>
                  </div>
                  <div>
                    <code className="text-indigo-600 dark:text-indigo-400">POST /api/projects</code>
                    <p className="text-gray-600 dark:text-gray-400">Create a new project</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Troubleshooting
            </h2>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Database Connection Issues
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Ensure MySQL is running</li>
                  <li>• Verify your <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">DATABASE_URL</code> in <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code></li>
                  <li>• Check that the database exists: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">CREATE DATABASE devdesk;</code></li>
                </ul>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Prisma Issues
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run db:generate</code> after schema changes</li>
                  <li>• If tables don't exist, run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run db:push</code></li>
                </ul>
              </div>

              <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Build Errors
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Ensure Prisma Client is generated: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run db:generate</code></li>
                  <li>• Clear <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.next</code> folder and rebuild</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need more help? <Link href="https://github.com/gaberlouay-eng/devdesk" className="text-indigo-600 dark:text-indigo-400 hover:underline">Visit our GitHub</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


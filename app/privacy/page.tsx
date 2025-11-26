"use client";

import { motion } from "framer-motion";
import { Code, ArrowLeft, Shield, Lock, Database, Eye, EyeOff, Server, Key } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
              <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                Privacy Policy
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your data. Your machine. Period.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>

          {/* Privacy Promise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-8 mb-12 border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20"
          >
            <div className="flex items-start gap-4">
              <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  The DevDesk Privacy Promise
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Your Data. Your Machine. Period.</strong> DevDesk is built on the principle
                  of absolute privacy. All your tasks, bugs, and project data are stored locally on
                  your machine. We cannot access your data. We don't track you. We don't sell your information.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Data Storage */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Database className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Data Storage
            </h2>
            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Local-First Architecture
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                DevDesk uses a local-first architecture, meaning:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>All data is stored locally</strong> in your MySQL database on your machine</span>
                </li>
                <li className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No cloud storage required</strong> - your data never leaves your machine unless you explicitly sync it</span>
                </li>
                <li className="flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>We cannot see your data</strong> - DevDesk has no access to your local database</span>
                </li>
                <li className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>You control everything</strong> - export, backup, or delete your data at any time</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Sync & Encryption */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Lock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Sync & Encryption (Pro/Team)
            </h2>
            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                End-to-End Encryption
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                For Pro and Team users who choose to sync data across devices:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>AES-256 encryption</strong> - All synced data is encrypted before leaving your device</span>
                </li>
                <li className="flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero-knowledge architecture</strong> - We cannot decrypt or read your synced data</span>
                </li>
                <li className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No unencrypted storage</strong> - Encrypted data is only stored temporarily during sync</span>
                </li>
                <li className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Optional sync</strong> - Sync is completely optional and can be disabled at any time</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                  <strong>Important:</strong> All cloud data is end-to-end encrypted. No unencrypted task data is ever stored on our servers. DevDesk cannot read your work.
                </p>
              </div>
            </div>
          </section>

          {/* Data Collection */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Eye className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Data Collection
            </h2>
            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What We Don't Collect
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                DevDesk is designed with privacy in mind. We do not:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Track your usage or behavior</li>
                <li>• Collect analytics or telemetry</li>
                <li>• Store your personal information</li>
                <li>• Share data with third parties</li>
                <li>• Use cookies for tracking</li>
                <li>• Monitor your application usage</li>
              </ul>
            </div>
          </section>

          {/* AI Features */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Key className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              AI Features Privacy
            </h2>
            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                OpenAI Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                When using AI features (Pro tier), DevDesk uses OpenAI's API:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Opt-in only</strong> - AI features are disabled by default and require your OpenAI API key</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Direct API calls</strong> - Your API key is stored locally and never shared with us</span>
                </li>
                <li className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Data handling</strong> - Task descriptions sent to OpenAI are subject to OpenAI's privacy policy</span>
                </li>
                <li className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No storage</strong> - We don't store or log AI requests or responses</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> When using AI features, your task descriptions are sent to OpenAI. Review OpenAI's privacy policy for details on how they handle your data.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Your Rights
            </h2>
            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Since all data is stored locally, you have complete control:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Access:</strong> All your data is accessible through the application or database</li>
                <li>• <strong>Export:</strong> Export all data as JSON at any time using the export feature</li>
                <li>• <strong>Delete:</strong> Delete any item, project, or all data at any time</li>
                <li>• <strong>Backup:</strong> Create backups of your database whenever you want</li>
                <li>• <strong>Portability:</strong> Your data is stored in a standard MySQL database format</li>
              </ul>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Changes to This Policy
            </h2>
            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-gray-600 dark:text-gray-400">
                We may update this privacy policy from time to time. Any changes will be posted on this page
                with an updated "Last updated" date. Since DevDesk is local-first, policy changes don't affect
                your existing data or how it's stored.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Questions?
            </h2>
            <div className="glass rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions about this privacy policy or how DevDesk handles your data, please contact us:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <Link href="https://github.com/gaberlouay-eng/devdesk" className="text-indigo-600 dark:text-indigo-400 hover:underline">GitHub Issues</Link></li>
                <li>• <Link href="/docs" className="text-indigo-600 dark:text-indigo-400 hover:underline">Documentation</Link></li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Remember:</strong> Your data. Your machine. Period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


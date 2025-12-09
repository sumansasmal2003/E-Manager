import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Key, Eye, Server, FileCheck,
  CheckCircle, AlertCircle, Fingerprint, Database,
  Globe, ShieldCheck, RefreshCw, Smartphone
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, duration: 0.6 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// --- COMPONENTS ---

const SecurityCard = ({ icon: Icon, title, description, color = "bg-blue-50 text-blue-600" }) => (
  <motion.div
    variants={itemVariants}
    className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
  >
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const ComplianceBadge = ({ label }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium">
    <ShieldCheck size={16} className="text-green-600" />
    {label} Compliant
  </div>
);

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide mb-8 shadow-sm"
          >
            <Lock size={12} className="text-blue-600" />
            Security & Trust Center
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-zinc-900 mb-8 tracking-tight"
          >
            Uncompromising <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Data Protection.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Security isn't just a feature; it's the foundation of E-Manager.
            We secure your data with the same standards used by banks and governments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <ComplianceBadge label="SOC 2 Type II" />
            <ComplianceBadge label="GDPR" />
            <ComplianceBadge label="CCPA" />
            <ComplianceBadge label="ISO 27001" />
          </motion.div>
        </div>
      </section>

      {/* --- INFRASTRUCTURE GRID --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900">Defense in Depth</h2>
            <p className="text-slate-500 mt-2">Multiple layers of security to protect your organization.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Identity */}
            <SecurityCard
              icon={Smartphone}
              title="Two-Factor Authentication"
              description="Mandatory 2FA support for all accounts. We utilize Time-based One-Time Passwords (TOTP) compatible with Google Authenticator and Authy."
              color="bg-purple-50 text-purple-600"
            />
            {/* Encryption */}
            <SecurityCard
              icon={Lock}
              title="End-to-End Encryption"
              description="Data is encrypted in transit via TLS 1.3 and at rest using AES-256 GCM. Your sensitive information is never stored in plain text."
              color="bg-blue-50 text-blue-600"
            />
            {/* Access */}
            <SecurityCard
              icon={Key}
              title="Role-Based Access (RBAC)"
              description="Strict permission models ensure Managers only access data relevant to their teams. Owners retain global administrative control."
              color="bg-green-50 text-green-600"
            />
            {/* Infrastructure */}
            <SecurityCard
              icon={Server}
              title="Cloud Infrastructure"
              description="Hosted on AWS/GCP data centers with 24/7 physical security, biometric entry, and redundant power systems."
              color="bg-orange-50 text-orange-600"
            />
            {/* Reliability */}
            <SecurityCard
              icon={RefreshCw}
              title="Automated Backups"
              description="Point-in-time recovery ensures your data is never lost. Backups are encrypted and stored in geographically distributed locations."
              color="bg-indigo-50 text-indigo-600"
            />
            {/* Privacy */}
            <SecurityCard
              icon={Eye}
              title="Audit Logs"
              description="Every critical action (login, deletion, role change) is immutable and logged. Owners can export audit trails for compliance."
              color="bg-rose-50 text-rose-600"
            />
          </motion.div>
        </div>
      </section>

      {/* --- DEEP DIVE SECTION --- */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Designed for Privacy</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              We believe your data belongs to you. Our business model is based on software subscriptions (and ads for free tiers), not selling user data.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Data Isolation</h4>
                  <p className="text-slate-400 text-sm">Every organization's data is logically isolated in our database, preventing cross-tenant access.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Data Sovereignty</h4>
                  <p className="text-slate-400 text-sm">We comply with local data residency laws and offer EU-hosted options for enterprise clients.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Ownership</h4>
                  <p className="text-slate-400 text-sm">You retain full ownership of all data entered into E-Manager. Export your data at any time.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Representation */}
          <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
             <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>

             <div className="flex flex-col gap-4">
               {/* Status Check Item */}
               <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="text-green-500" size={20} />
                     <span className="text-sm font-medium text-slate-200">System Integrity</span>
                  </div>
                  <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">VERIFIED</span>
               </div>

               {/* Status Check Item */}
               <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                     <Lock className="text-blue-500" size={20} />
                     <span className="text-sm font-medium text-slate-200">Encryption Status</span>
                  </div>
                  <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-1 rounded">AES-256 ACTIVE</span>
               </div>

               {/* Status Check Item */}
               <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="text-yellow-500" size={20} />
                     <span className="text-sm font-medium text-slate-200">Intrusion Detection</span>
                  </div>
                  <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">MONITORING</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- REPORT VULNERABILITY --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Responsible Disclosure</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Security is a community effort. If you believe you have found a security vulnerability in E-Manager, please let us know right away.
          </p>
          <a
            href="mailto:security@e-manager.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <AlertCircle size={18} />
            Report a Vulnerability
          </a>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white text-zinc-500 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-zinc-900 font-bold text-2xl mb-4">E-Manager</div>
          <p className="text-sm mb-8">Secure. Reliable. Trusted.</p>
          <div className="flex justify-center gap-6 mb-8 text-sm font-medium">
             <Link to="/features" className="hover:text-zinc-900">Features</Link>
             <Link to="/pricing" className="hover:text-zinc-900">Pricing</Link>
             <Link to="/register" className="hover:text-zinc-900">Sign Up</Link>
          </div>
          <div className="text-xs border-t border-slate-100 pt-8">
            © {new Date().getFullYear()} E-Manager Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default SecurityPage;

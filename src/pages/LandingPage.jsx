import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Calendar,
  Users,
  Brain,
  ArrowRight,
  CheckCircle,
  Play,
  Shield,
  Zap,
  Building,
  Briefcase,
  Layers,
  BarChart3,
  Lock,
  Globe,
  ShieldCheck,
  TrendingUp,
  Clock,
  FileText,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import image1 from '../assets/img1.png';
import image2 from '../assets/img2.png';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, duration: 0.8 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 }
  }
};

// --- COMPONENTS ---

// 1. Professional Image Component
const ProfessionalImage = ({ img, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={`relative ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100/20 to-slate-200/20 rounded-2xl transform rotate-1"></div>
    <img
      src={img}
      alt="E-Manager Dashboard Interface"
      className="relative rounded-xl shadow-lg w-full h-auto border border-slate-200/80"
    />
  </motion.div>
);

// 2. Feature Card
const FeatureCard = ({ icon, title, description, color }) => (
  <motion.div
    variants={itemVariants}
    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
  >
    <div className={`w-14 h-14 ${color} text-white rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-md`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-primary mb-3 group-hover:text-gray-800 transition-colors">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

// 3. Use Case Card
const UseCaseCard = ({ title, role, description, icon: Icon }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary text-white rounded-lg">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-semibold text-primary">{title}</h4>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{role}</span>
      </div>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// 4. Stat Number
const StatNumber = ({ value, label, icon: Icon }) => (
  <div className="text-center px-4 py-6">
    <div className="flex items-center justify-center gap-3 mb-3">
      {Icon && <Icon size={24} className="text-gray-400" />}
      <div className="text-3xl md:text-4xl font-bold text-primary">
        {value}
      </div>
    </div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-primary overflow-x-hidden font-sans">

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-slate-50 -z-20"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 -z-10"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-slate-100 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 mb-6 shadow-sm"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-gray-700">v2.0 Released • Multi-Manager Support</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
                Streamline Team Management with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gray-700">
                  Intelligent Hierarchy
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                The enterprise-grade platform that combines hierarchical management, real-time analytics, and AI assistance to optimize your organization's workflow.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary border border-slate-300 font-semibold rounded-lg hover:border-primary transition-all hover:shadow-md"
                >
                  <Play size={16} className="fill-current" />
                  Watch Demo
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-6 border-t border-slate-200">
                <p className="text-sm text-gray-500 mb-4">Trusted by forward-thinking organizations</p>
                <div className="flex flex-wrap items-center gap-6 opacity-70">
                  {['StartupCo', 'TechCorp', 'InnovateLabs', 'ScaleInc'].map((company) => (
                    <div key={company} className="text-sm font-medium text-gray-700">{company}</div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src={image1}
                  alt="E-Manager Dashboard Preview"
                  className="w-full h-auto"
                />
                {/* Floating Elements */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute left-4 bottom-4 bg-white p-3 rounded-lg shadow-lg border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-md text-green-600">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Task Status</p>
                      <p className="text-sm font-semibold text-primary">Complete</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 2. STATS SECTION --- */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <StatNumber value="10K+" label="Tasks Automated" icon={Zap} />
            <div className="hidden md:block border-r border-slate-200"></div>
            <StatNumber value="500+" label="Organizations" icon={Building} />
            <div className="hidden md:block border-r border-slate-200"></div>
            <StatNumber value="99.9%" label="Uptime SLA" icon={Shield} />
            <div className="hidden md:block border-r border-slate-200"></div>
            <StatNumber value="24/7" label="AI Support" icon={Brain} />
          </div>
        </div>
      </section>

      {/* --- 3. PROBLEM / SOLUTION --- */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                <Clock size={14} />
                The Traditional Approach
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6 leading-tight">
                Scattered tools create fragmented workflows
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Managing teams across multiple platforms leads to communication gaps, missed deadlines, and decreased productivity.
              </p>
              <ul className="space-y-4">
                {[
                  { text: "Manual attendance tracking across spreadsheets", icon: "✕" },
                  { text: "Limited visibility into manager performance", icon: "✕" },
                  { text: "Files scattered across different platforms", icon: "✕" },
                  { text: "No centralized insights or reporting", icon: "✕" }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 mt-0.5 flex-shrink-0">
                      <span className="font-bold text-sm">{item.icon}</span>
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200">
                <ProfessionalImage img={image2} />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-60 -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-slate-200 rounded-full blur-2xl opacity-50 -z-10"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- 4. CORE FEATURES GRID --- */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              <Sparkles size={14} />
              Platform Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6">
              Everything you need to manage effectively
            </h2>
            <p className="text-gray-600 text-lg">
              A comprehensive suite of tools designed for modern organizational management
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<Layers size={24} />}
              title="Hierarchical Management"
              description="Create and manage multiple organizational levels with clear reporting structures and delegated authority."
              color="bg-primary"
            />
            <FeatureCard
              icon={<Brain size={24} />}
              title="AI Executive Assistant"
              description="Intelligent assistant that provides insights, automates reports, and helps with decision-making."
              color="bg-gray-800"
            />
            <FeatureCard
              icon={<BarChart3 size={24} />}
              title="Advanced Analytics"
              description="Comprehensive dashboards with real-time metrics on performance, productivity, and team health."
              color="bg-primary"
            />
            <FeatureCard
              icon={<ShieldCheck size={24} />}
              title="Granular Permissions"
              description="Fine-grained access controls with role-based permissions and audit trails."
              color="bg-gray-800"
            />
            <FeatureCard
              icon={<Globe size={24} />}
              title="Centralized Resources"
              description="Unified repository for all documents, files, and resources with version control."
              color="bg-primary"
            />
            <FeatureCard
              icon={<Lock size={24} />}
              title="Enterprise Security"
              description="Bank-level security with 2FA, encryption, and compliance certifications."
              color="bg-gray-800"
            />
          </motion.div>
        </div>
      </section>

      {/* --- 5. ORGANIZATION STRUCTURE --- */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                <Building size={14} />
                Organizational Design
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6 leading-tight">
                Structure that mirrors your organization
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                E-Manager replicates your real-world hierarchy with precision, ensuring everyone has the right level of access and visibility.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white flex-shrink-0 shadow">
                    <Users size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">Organization Owners</h4>
                    <p className="text-gray-600">
                      Complete oversight with full administrative control, audit capabilities, and strategic decision-making tools.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-white flex-shrink-0 shadow">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">Team Managers</h4>
                    <p className="text-gray-600">
                      Operational control with team-specific management tools, task assignment, and performance monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                <div className="flex flex-col items-center">
                  {/* Owner Level */}
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg mb-3">
                      <Building size={24} />
                    </div>
                    <p className="text-center text-sm font-medium text-primary">Owner</p>
                  </div>

                  {/* Connector */}
                  <div className="h-8 w-0.5 bg-gray-300 mb-6"></div>

                  {/* Manager Level */}
                  <div className="flex gap-8 mb-8">
                    {['Manager A', 'Manager B'].map((manager, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white shadow mb-2">
                          {manager[0]}
                        </div>
                        <p className="text-center text-xs font-medium text-gray-700">{manager}</p>
                      </div>
                    ))}
                  </div>

                  {/* Connectors to Teams */}
                  <div className="flex gap-16 mb-4">
                    <div className="h-6 w-0.5 bg-gray-300"></div>
                    <div className="h-6 w-0.5 bg-gray-300"></div>
                  </div>

                  {/* Team Level */}
                  <div className="flex gap-12">
                    {[2, 3].map((teamSize, idx) => (
                      <div key={idx} className="flex gap-2">
                        {Array.from({ length: teamSize }).map((_, i) => (
                          <div key={i} className="w-8 h-8 bg-slate-200 rounded-full"></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 6. PRICING --- */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600">
              Start free and upgrade as your organization grows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
              <h3 className="text-lg font-semibold text-primary mb-2">Starter</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-primary">$0</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">For small teams getting started</p>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Up to 10 team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Basic task management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Email support
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 rounded-lg border border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="p-6 rounded-xl border-2 border-primary bg-white shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">Professional</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-primary">$29</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">For growing organizations</p>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Up to 50 team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Multiple managers support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Priority support
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 rounded-lg bg-primary text-white font-medium hover:bg-gray-800 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
              <h3 className="text-lg font-semibold text-primary mb-2">Enterprise</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-primary">$99</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">For large organizations</p>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Unlimited members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Custom onboarding
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Dedicated support
                </li>
              </ul>
              <Link
                to="/contact"
                className="block w-full text-center py-3 rounded-lg border border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- 7. USE CASES --- */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              Trusted by industry leaders
            </h2>
            <p className="text-gray-600">
              See how different organizations leverage E-Manager
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <UseCaseCard
              title="Digital Agencies"
              role="Creative Directors"
              description="Manage multiple client projects simultaneously while maintaining quality control and meeting deadlines."
              icon={Target}
            />
            <UseCaseCard
              title="Tech Startups"
              role="Engineering Leads"
              description="Coordinate cross-functional teams with agile workflows and real-time progress tracking."
              icon={TrendingUp}
            />
            <UseCaseCard
              title="Consulting Firms"
              role="Project Managers"
              description="Streamline client engagements with centralized documentation and team collaboration tools."
              icon={FileText}
            />
          </motion.div>
        </div>
      </section>

      {/* --- 8. FINAL CTA --- */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-gray-800 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <Award size={16} />
              <span className="text-sm font-medium">Industry Leader 2024</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to transform your team management?
            </h2>

            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of organizations that have streamlined their operations with E-Manager.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start 30-Day Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-white border border-white/30 font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Schedule a Demo
              </Link>
            </div>

            <p className="mt-6 text-gray-400 text-sm">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-zinc-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-xl mb-4">E-Manager</div>
              <p className="text-sm text-gray-300">
                The intelligent platform for modern organizational management.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} E-Manager Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers, Brain, ShieldCheck, Globe, BarChart3, Users,
  CheckCircle, ArrowRight, Zap, Lock, Command, Calendar,
  FileText, MessageSquare, Layout
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

const FeatureBlock = ({ icon: Icon, title, description, benefits }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-100">
      <Icon size={24} className="text-zinc-800" />
    </div>
    <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
    <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
    <ul className="space-y-3">
      {benefits.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700">
          <CheckCircle size={16} className="text-zinc-900 mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const DeepDiveSection = ({ title, subtitle, features, imageSide = "right", src }) => (
  <div className="py-20 lg:py-32 border-b border-slate-100 last:border-0">
    <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
      <div className={`order-2 ${imageSide === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-zinc-700 text-xs font-bold uppercase tracking-wide mb-6">
          <Zap size={12} className="text-zinc-900" />
          Core Capability
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          {subtitle}
        </p>
        <div className="grid gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-200">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Placeholder (Replace with screenshots later) */}
      <div className={`order-1 ${imageSide === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="relative rounded-2xl bg-slate-50 border border-slate-200 aspect-auto overflow-hidden shadow-2xl">
          <img src={src} alt="" />
        </div>
      </div>
    </div>
  </div>
);

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-zinc-900 mb-8 tracking-tight"
          >
            Powering the Modern <br/>
            <span className="text-slate-500">Organization.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Explore the tools that enable leaders to manage hierarchy, automate workflows, and secure their data—all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link to="/register" className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl">
              Start Free Trial
            </Link>
            <Link to="/pricing" className="px-8 py-4 bg-white text-zinc-900 border border-slate-300 font-bold rounded-xl hover:bg-slate-50 transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900">Comprehensive Capabilities</h2>
            <p className="text-slate-500 mt-2">Everything you need to run your team effectively.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureBlock
              icon={Layers}
              title="Hierarchical Structure"
              description="Mirror your real-world org chart. Owners oversee Managers, and Managers lead Teams."
              benefits={["Owner Super-Admin Access", "Manager Autonomy", "Team-Specific Isolation"]}
            />
            <FeatureBlock
              icon={Brain}
              title="AI Intelligence"
              description="A built-in AI agent that understands your data. Ask it to summarize, create, or analyze anything."
              benefits={["Context-Aware Chat", "Automated Daily Briefings", "One-Click Report Generation"]}
            />
            <FeatureBlock
              icon={ShieldCheck}
              title="Granular Permissions"
              description="Define exactly what your managers can and cannot do with a robust permission system."
              benefits={["Toggle Deletion Rights", "Restrict Report Exports", "Custom Resource Access"]}
            />
            <FeatureBlock
              icon={Globe}
              title="Centralized Resources"
              description="Stop hunting for links. Keep all your project assets in one unified dashboard."
              benefits={["Figma & GitHub Integrations", "Live Project Links", "Team-Specific Notes"]}
            />
            <FeatureBlock
              icon={BarChart3}
              title="Deep Analytics"
              description="Track productivity velocity and attendance trends across your entire organization."
              benefits={["Workload Distribution", "Activity Heatmaps", "Attendance Reports"]}
            />
            <FeatureBlock
              icon={Lock}
              title="Enterprise Security"
              description="Bank-grade security features ensure your proprietary data stays private."
              benefits={["Two-Factor Authentication", "Session Management", "Encrypted Data at Rest"]}
            />
          </motion.div>
        </div>
      </section>

      {/* --- DEEP DIVE 1: AI --- */}
      <DeepDiveSection
        title="Your AI Executive Assistant"
        subtitle="Stop doing busy work. Let E-Manager's AI handle the administrative burden so you can focus on leadership."
        imageSide="right"
        src='https://cdn.prod.website-files.com/67827d5590d93108bf6dd2fa/6797607f173376c621faaf63_67975fa52ea3e09cfa925b45_image2.png'
        features={[
          {
            icon: <MessageSquare size={20} className="text-zinc-700" />,
            title: "Natural Language Actions",
            desc: "Just type 'Schedule a meeting with Design team at 2 PM' and it's done."
          },
          {
            icon: <FileText size={20} className="text-zinc-700" />,
            title: "Smart Summaries",
            desc: "Get instant daily briefings on overdue tasks and upcoming deadlines."
          },
          {
            icon: <Command size={20} className="text-zinc-700" />,
            title: "Contextual Awareness",
            desc: "The AI knows your team structure and project history."
          }
        ]}
      />

      {/* --- DEEP DIVE 2: RESOURCES --- */}
      <DeepDiveSection
        title="A Single Source of Truth"
        subtitle="No more 'Can you send me that link?' messages. Every file, repo, and design mock is pinned exactly where it belongs."
        imageSide="left"
        src='https://entrinsik.com/wp-content/uploads/2023/05/Single-Source-of-Truth.png'
        features={[
          {
            icon: <Layout size={20} className="text-zinc-700" />,
            title: "Figma Integration",
            desc: "Embed design files directly into team dashboards for easy access."
          },
          {
            icon: <Globe size={20} className="text-zinc-700" />,
            title: "Live Project Tracking",
            desc: "Keep staging and production links visible for every stakeholder."
          },
          {
            icon: <Users size={20} className="text-zinc-700" />,
            title: "Team Notes",
            desc: "Shared documentation and SOPs that live alongside your tasks."
          }
        ]}
      />

      {/* --- DEEP DIVE 3: PEOPLE --- */}
      <DeepDiveSection
        title="People Management, Solved"
        subtitle="From daily attendance to performance reviews, manage the entire employee lifecycle without leaving the app."
        imageSide="right"
        src='https://snapfix.com/hs-fs/hubfs/peoplemgmt2.png'
        features={[
          {
            icon: <Calendar size={20} className="text-zinc-700" />,
            title: "Daily Roll Call",
            desc: "Simple, one-click attendance tracking for managers."
          },
          {
            icon: <FileText size={20} className="text-zinc-700" />,
            title: "Performance Reports",
            desc: "Generate professional PDF reports for 1-on-1s and reviews."
          },
          {
            icon: <ShieldCheck size={20} className="text-zinc-700" />,
            title: "RBAC Controls",
            desc: "Ensure managers only see what they need to see."
          }
        ]}
      />

      {/* --- CTA --- */}
      <section className="py-24 bg-zinc-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to streamline your operations?</h2>
          <p className="text-zinc-400 text-lg mb-10">
            Join forward-thinking leaders who are building better teams with E-Manager.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-10 py-4 bg-white text-zinc-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
              Create Organization
            </Link>
            <Link to="/demo" className="px-10 py-4 border border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">
              Talk to Sales
            </Link>
          </div>
          <p className="mt-8 text-sm text-zinc-500">No credit card required for free tier.</p>
        </div>
      </section>

    </div>
  );
};

export default FeaturesPage;

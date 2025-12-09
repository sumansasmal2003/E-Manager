import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Heart, Globe, Zap, Coffee, Monitor,
  ArrowRight, CheckCircle, MapPin, Clock, DollarSign
} from 'lucide-react';

import ApplyModal from '../components/ApplyModal';
import { useState } from 'react';

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

const BenefitCard = ({ icon: Icon, title, description }) => (
  <motion.div
    variants={itemVariants}
    className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
      <Icon size={20} />
    </div>
    <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const JobCard = ({ title, department, location, type, onApply }) => (
  <motion.div
    variants={itemVariants}
    onClick={() => onApply(title)}
    className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
  >
    <div className="mb-4 md:mb-0">
      <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
        <span className="flex items-center gap-1"><Briefcase size={14} /> {department}</span>
        <span className="flex items-center gap-1"><MapPin size={14} /> {location}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {type}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
      Apply Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);

const CareersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const handleApplyClick = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">

      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
      />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-200 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[80px] -z-10"></div>

        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide mb-6 shadow-sm"
          >
            <Briefcase size={12} className="text-blue-600" />
            We are hiring
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 tracking-tight"
          >
            Build the future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Work with us.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join a team of builders, dreamers, and doers. We're on a mission to simplify management for organizations worldwide.
          </motion.p>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
          >
            <a href="#openings" className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl">
              View Open Roles
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Why E-Manager?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We believe people do their best work when they are supported, challenged, and given the freedom to innovate.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <BenefitCard
              icon={Globe}
              title="Remote-First"
              description="Work from anywhere. We care about your output, not your time zone or desk location."
            />
            <BenefitCard
              icon={DollarSign}
              title="Competitive Pay"
              description="Top-tier salary packages plus equity. When the company wins, everyone wins."
            />
            <BenefitCard
              icon={Heart}
              title="Health & Wellness"
              description="Comprehensive health insurance for you and your family, plus a monthly wellness stipend."
            />
            <BenefitCard
              icon={Monitor}
              title="Best Equipment"
              description="Latest MacBook Pro, 4K monitor, and a budget for your home office setup."
            />
            <BenefitCard
              icon={Zap}
              title="Fast Growth"
              description="We are scaling rapidly. There is endless opportunity for career advancement and learning."
            />
            <BenefitCard
              icon={Coffee}
              title="Flexible Hours"
              description="You own your schedule. We trust you to manage your time and deliver great results."
            />
          </motion.div>
        </div>
      </section>

      {/* --- OPEN ROLES --- */}
      <section id="openings" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-2">Open Positions</h2>
              <p className="text-slate-500">Come help us build the operating system for modern teams.</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-zinc-600">Engineering</span>
               <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-zinc-600">Product</span>
               <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-zinc-600">Sales</span>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            <JobCard
              title="Senior Full Stack Engineer"
              department="Engineering"
              location="Remote (Global)"
              type="Full-time"
              onApply={handleApplyClick}
            />
            <JobCard
              title="Founding Product Designer"
              department="Design"
              location="Remote (US/EU)"
              type="Full-time"
              onApply={handleApplyClick}
            />
            <JobCard
              title="Head of Growth Marketing"
              department="Marketing"
              location="Remote (Global)"
              type="Full-time"
              onApply={handleApplyClick}
            />
            <JobCard
              title="Customer Success Manager"
              department="Sales"
              location="Remote (US)"
              type="Full-time"
              onApply={handleApplyClick}
            />
            <JobCard
              title="AI Research Scientist"
              department="Engineering"
              location="Remote (Global)"
              type="Full-time"
              onApply={handleApplyClick}
            />
          </motion.div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Don't see a role that fits?</p>
            <a href="mailto:careers@e-manager.com" className="text-zinc-900 font-bold border-b-2 border-zinc-900 hover:text-blue-600 hover:border-blue-600 transition-all">
              Email us your resume anyway
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white text-zinc-500 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-zinc-900 font-bold text-2xl mb-4">E-Manager</div>
          <div className="flex justify-center gap-6 mb-8 text-sm font-medium">
             <Link to="/features" className="hover:text-zinc-900">Features</Link>
             <Link to="/pricing" className="hover:text-zinc-900">Pricing</Link>
             <Link to="/about" className="hover:text-zinc-900">About</Link>
          </div>
          <div className="text-xs border-t border-slate-100 pt-8">
            © {new Date().getFullYear()} E-Manager Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CareersPage;

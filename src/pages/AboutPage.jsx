import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Target, Heart, Globe, Sparkles,
  Linkedin, Twitter, Github, Code
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

const ValueCard = ({ icon: Icon, title, description }) => (
  <motion.div
    variants={itemVariants}
    className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
  >
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
      <Icon size={24} className="text-zinc-800" />
    </div>
    <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
);

const TeamMember = ({ name, role, bio }) => (
  <motion.div variants={itemVariants} className="group max-w-sm mx-auto">
    <div className="aspect-square bg-slate-200 rounded-2xl mb-4 overflow-hidden relative">
      {/* Placeholder for real image */}
      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500">
        <div className="text-center">
            <Users size={64} className="mx-auto mb-2 text-slate-300" />
        </div>
      </div>
    </div>
    <h3 className="text-lg font-bold text-zinc-900">{name}</h3>
    <p className="text-blue-600 text-sm font-medium mb-2">{role}</p>
    <p className="text-slate-500 text-sm leading-relaxed mb-4">{bio}</p>
    <div className="flex gap-3">
      <a href="#" className="text-slate-400 hover:text-zinc-900 transition-colors"><Linkedin size={18} /></a>
      <a href="#" className="text-slate-400 hover:text-zinc-900 transition-colors"><Twitter size={18} /></a>
      <a href="#" className="text-slate-400 hover:text-zinc-900 transition-colors"><Github size={18} /></a>
    </div>
  </motion.div>
);

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide mb-6"
          >
            <Sparkles size={12} className="text-amber-500" />
            Our Story
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-zinc-900 mb-8 tracking-tight leading-[1.1]"
          >
            Building the Operating System for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Modern Leadership.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            E-Manager exists to bridge the gap between "Project Management" and "People Leadership".
            We use AI to handle the busy work so you can focus on your team.
          </motion.p>
        </div>
      </section>

      {/* --- MISSION IMAGE --- */}
      <section className="px-4 sm:px-6 mb-24">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true, amount: 0.3 }}
    className="max-w-6xl mx-auto rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-gray-800 to-primary relative shadow-xl lg:shadow-2xl"
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]"></div>

    {/* Grid Overlay */}
    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>

    {/* Animated Orbits */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/4 top-1/4 w-64 h-64 border border-white/5 rounded-full animate-[spin_40s_linear_infinite]"></div>
      <div className="absolute right-1/3 bottom-1/3 w-96 h-96 border border-white/5 rounded-full animate-[spin_50s_linear_infinite_reverse]"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full animate-[spin_30s_linear_infinite]"></div>

      {/* Floating Dots */}
      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
      <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white/15 rounded-full animate-[float_8s_ease-in-out_infinite_1s]"></div>
      <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-white/25 rounded-full animate-[float_7s_ease-in-out_infinite_2s]"></div>
    </div>

    {/* Content */}
    <div className="relative z-10 p-8 md:p-12 lg:p-16 min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex items-center">
      <div className="max-w-3xl">
        {/* Opening Quote Mark */}
        <div className="mb-6 md:mb-8">
          <svg className="w-10 h-10 md:w-12 md:h-12 text-white/20" fill="currentColor" viewBox="0 0 32 32">
            <path d="M10 8C5.6 8 2 11.6 2 16s3.6 8 8 8 8-3.6 8-8l-2 0c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6V8zM22 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8l-2 0c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6V8z"/>
          </svg>
        </div>

        {/* Quote Text */}
        <blockquote className="mb-8 md:mb-10">
          <p className="text-white text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed md:leading-relaxed lg:leading-relaxed">
            "We believe that great management isn't about tracking hours—it's about removing obstacles. Technology should be an accelerator, not a burden."
          </p>
        </blockquote>

        {/* Author/Company Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Suman Sasmal</p>
              <p className="text-white/60 text-sm">Founder & Developer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">E-Manager Leadership</span>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Gradient Fade */}
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary to-transparent pointer-events-none"></div>

    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-white/5 rounded-tl-2xl"></div>
    <div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-white/5 rounded-br-2xl"></div>
  </motion.div>

  <style jsx>{`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); }
      25% { transform: translateY(-20px) translateX(10px); }
      50% { transform: translateY(0) translateX(20px); }
      75% { transform: translateY(10px) translateX(10px); }
    }

    @keyframes spin_reverse {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }
  `}</style>
</section>

      {/* --- OUR VALUES --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900">What Drives Us</h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <ValueCard
              icon={Target}
              title="Focus on Impact"
              description="We design features that save time, not consume it. If a tool doesn't help you lead better, it doesn't belong in E-Manager."
            />
            <ValueCard
              icon={Heart}
              title="Human-Centric AI"
              description="We use Artificial Intelligence to enhance human connection, providing insights that help you support your team's growth."
            />
            <ValueCard
              icon={Code}
              title="Engineering Excellence"
              description="Built with precision and care. We prioritize clean code, scalability, and security in every line we write."
            />
          </motion.div>
        </div>
      </section>

      {/* --- STATS ROW --- */}
      <section className="py-20 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">2024</div>
              <div className="text-sm text-zinc-400">Founded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10k+</div>
              <div className="text-sm text-zinc-400">Lines of Code</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">1</div>
              <div className="text-sm text-zinc-400">Unified Vision</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-400 mb-2">∞</div>
              <div className="text-sm text-zinc-400">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Meet the Builder</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Driven by a passion for creating efficient, scalable systems for modern leadership.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <TeamMember
              name="Suman Sasmal"
              role="Founder & Full Stack Developer"
              bio="The architect behind E-Manager. Combining technical expertise with product vision to redefine how organizations operate."
            />
          </motion.div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-white text-center border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-zinc-900 mb-6">Join the movement.</h2>
          <p className="text-xl text-slate-600 mb-10">
            We are just getting started. Be part of the future of work.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-all">
              Start Free Trial
            </Link>
            <Link to="/contact" className="px-8 py-4 border border-slate-300 text-zinc-900 font-bold rounded-xl hover:bg-slate-50 transition-all">
              Contact Founder
            </Link>
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
             <Link to="/security" className="hover:text-zinc-900">Security</Link>
          </div>
          <div className="text-xs border-t border-slate-100 pt-8">
            © {new Date().getFullYear()} E-Manager Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AboutPage;

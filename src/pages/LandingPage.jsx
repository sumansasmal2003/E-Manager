import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Calendar,
  Users,
  FilePieChart,
  ArrowRight,
  CheckCircle,
  Star,
  HelpCircle,
  Play,
  Shield,
  Zap,
  User,
  User2Icon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import image1 from '../assets/img1.png';
import image2 from '../assets/img2.png';

// Professional Feature Card Component with original colors
const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5, delay }}
    className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
  >
    <div className="w-14 h-14 bg-gray-900 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

// Professional Testimonial Card with original colors
const TestimonialCard = ({ quote, name, title, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gray-50 border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex space-x-1 text-yellow-500 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={18} fill="currentColor" />
      ))}
    </div>
    <p className="text-gray-700 text-lg leading-relaxed italic mb-6">"{quote}"</p>
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
        <User2Icon className='text-gray-900' />
      </div>
      <div className="ml-4">
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  </motion.div>
);

// Professional Image Component
const ProfessionalImage = ({ img, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay }}
    className="relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-600/10 rounded-3xl transform rotate-1"></div>
    <img
      src={img}
      alt="E-Manager dashboard interface"
      className="relative rounded-2xl shadow-2xl w-full h-auto"
    />
  </motion.div>
);

// FAQ Item Component
const FAQItem = ({ question, answer, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <div className="flex items-start space-x-4">
      <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
        <HelpCircle size={16} />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-lg">{question}</h4>
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  </motion.div>
);

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-36 md:pb-28 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-8"
            >
              <Zap size={16} className="mr-2" />
              Trusted by 500+ team leaders worldwide
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Manage Your Teams.
              <span className="block text-gray-700">
                Master Your Work.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              E-Manager is the all-in-one platform for team leaders to track tasks,
              schedule meetings, and monitor progress, all in one place.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center space-x-3 bg-gray-900 text-white font-semibold py-4 px-10 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 text-lg shadow-lg hover:shadow-xl"
              >
                <span>Get Started for Free</span>
                <ArrowRight size={20} />
              </Link>

              <button className="inline-flex items-center justify-center space-x-3 bg-white text-gray-700 font-semibold py-4 px-10 rounded-xl border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/10 transition-all duration-200 text-lg shadow-sm hover:shadow-md">
                <Play size={20} />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <Shield size={18} className="text-gray-600" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-gray-600" />
                <span>Unlimited team members</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={18} className="text-gray-600" />
                <span>No credit card required</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need, nothing you don't.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for modern team leadership, designed for clarity and efficiency.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ClipboardList size={28} />}
              title="Smart Task Management"
              description="Assign, track, and manage all your team's tasks in one central hub. Never miss a deadline."
              delay={0.1}
            />
            <FeatureCard
              icon={<Calendar size={28} />}
              title="Effortless Scheduling"
              description="Schedule team meetings, generate Zoom links, and view your entire calendar at a glance."
              delay={0.2}
            />
            <FeatureCard
              icon={<Users size={28} />}
              title="Member Overview"
              description="Keep detailed profiles, track 1-on-1s, and manage attendance with a powerful, simple interface."
              delay={0.3}
            />
            <FeatureCard
              icon={<FilePieChart size={28} />}
              title="AI-Powered Reports"
              description="Generate insightful, professional reports on team productivity and task completion with a single click."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mb-6">
                A workflow that just... works.
              </motion.h2>
              <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-12 leading-relaxed">
                Get up and running in minutes. E-Manager simplifies your workflow, so you can focus on what truly matters: leading your team.
              </motion.p>

              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Create Your Teams",
                    description: "Instantly set up teams and add members by name. No complex invites needed."
                  },
                  {
                    step: "02",
                    title: "Assign Tasks & Schedule",
                    description: "Use bulk-add to assign tasks quickly and schedule meetings with your team."
                  },
                  {
                    step: "03",
                    title: "Manage & Report",
                    description: "Track daily progress on your 'Today' dashboard and generate AI-powered reports."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    variants={itemVariants}
                    className="flex items-start space-x-6 group"
                  >
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-gray-900 transition-colors duration-300">
                      <span className="text-2xl font-bold text-gray-400 group-hover:text-gray-900 transition-colors duration-300">
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <ProfessionalImage img={image1} delay={0.3} />
          </motion.div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className="lg:order-last">
              <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mb-6">
                Go beyond simple task tracking.
              </motion.h2>
              <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8 leading-relaxed">
                E-Manager provides tools for genuine team leadership, not just project management.
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "Track 1-on-1s and private leader notes",
                  "Manage daily attendance with ease",
                  "Keep team notes and resource links centralized",
                  "Export professional PDF reports for stakeholders",
                  "Real-time progress tracking",
                  "Customizable team dashboards"
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    variants={itemVariants}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle size={20} className="text-gray-900 shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <ProfessionalImage img={image2} delay={0.3} />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by modern team leaders
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of team leaders who have transformed their workflow with E-Manager.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="E-Manager replaced three of our tools. The 'Today' dashboard and AI reports are game-changers for my productivity."
              name="Sarah J."
              title="Project Manager, Tech Startup"
              delay={0.1}
            />
            <TestimonialCard
              quote="Finally, a simple tool that lets me track my team's tasks and their attendance in one place. The 1-on-1 feature is brilliant."
              name="Mark R."
              title="Founder, Design Agency"
              delay={0.2}
            />
            <TestimonialCard
              quote="I love how I can see everything from a 30,000-foot view on the dashboard or dive deep into a single member's activity."
              name="Emily K."
              title="Engineering Lead, SaaS Co."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about getting started with E-Manager.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FAQItem
              question="Is this a collaborative tool?"
              answer="Currently, E-Manager is designed as a 'command center' for a single leader to manage their teams. Members do not have their own logins. This simplifies setup and management."
              delay={0.1}
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. Your data is protected. All team information, tasks, and notes are tied directly to your account and are not accessible by anyone else."
              delay={0.2}
            />
            <FAQItem
              question="What kind of reports can I generate?"
              answer="You can generate AI-powered summaries of your team's activity over any date range, as well as professional PDF or CSV exports of your attendance data."
              delay={0.3}
            />
            <FAQItem
              question="How many teams or members can I add?"
              answer="As many as you need. There are no limits on the number of teams, members, tasks, or notes you can create."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Take control of your team today.
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop juggling spreadsheets and docs. Start managing with clarity.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center space-x-3 bg-white text-gray-900 font-semibold py-4 px-12 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-200 text-lg shadow-lg hover:shadow-xl"
              >
                <span>Sign Up Now</span>
                <ArrowRight size={20} />
              </Link>

              <button className="inline-flex items-center justify-center space-x-3 bg-transparent text-gray-800 font-semibold py-4 px-12 rounded-xl border-2 border-gray-600 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-200 text-lg">
                <Play size={20} />
                <span>Watch Demo</span>
              </button>
            </div>

            <p className="text-gray-600 text-sm mt-6">
              No credit card required • Setup in 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-2xl font-bold text-gray-900">E-Manager</p>
              <p className="text-gray-600 text-sm mt-2">
                Streamlining team leadership for the modern workplace.
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              <p>© {new Date().getFullYear()} E-Manager. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

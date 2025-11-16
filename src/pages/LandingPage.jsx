import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Calendar,
  Users,
  Brain, // Changed from FilePieChart to Brain for AI
  ArrowRight,
  CheckCircle,
  Star,
  HelpCircle,
  Play,
  Shield,
  Zap,
  User,
  User2Icon,
  FilePieChart // We'll use this in the features list
} from 'lucide-react';
import Navbar from '../components/Navbar';
import image1 from '../assets/img1.png'; // This is the abstract flow chart
import image2 from '../assets/img2.png'; // This is the futuristic meeting table

// Professional Feature Card Component (Style from your file)
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

// Professional Testimonial Card (Style from your file)
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

// Professional Image Component (Style from your file)
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

// FAQ Item Component (Style from your file)
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

      {/* Hero Section - UPDATED */}
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
              className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-8 border border-gray-200"
            >
              <Zap size={16} className="text-gray-900 mr-2" />
              Introducing E-Manager AI: Your new co-pilot
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              The All-in-One Command Center,
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                Now With a Brain.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              E-Manager unifies your tasks, meetings, and member data,
              now supercharged by an AI agent that understands (and acts on) your entire workflow.
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

      {/* Features Section - UPDATED */}
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
              Your Complete Leadership Toolkit
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto">
              One platform to manage projects, people, and performance—all powered by AI.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ClipboardList size={28} />}
              title="Smart Task Management"
              description="Assign, track, and manage all your team's tasks. Use AI to break down complex goals into sub-tasks instantly."
              delay={0.1}
            />
            <FeatureCard
              icon={<Calendar size={28} />}
              title="Effortless Scheduling"
              description="Schedule team meetings, generate Zoom links instantly, and sync everything with your Google Calendar."
              delay={0.2}
            />
            <FeatureCard
              icon={<Users size={28} />}
              title="Member & Team Hub"
              description="Keep detailed profiles, track 1-on-1s, manage daily attendance, and get AI-generated talking points for meetings."
              delay={0.3}
            />
            <FeatureCard
              icon={<Brain size={28} />}
              title="Your Personal AI Agent"
              description="Go beyond search. Tell your AI to create, update, delete, or find anything in your account using plain English."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section - UPDATED */}
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
                    description: "Use bulk-add to assign tasks quickly or let your AI create them for you."
                  },
                  {
                    step: "03",
                    title: "Manage & Report",
                    description: "Track daily progress on your 'Today' dashboard and generate AI-powered reports."
                  },
                  { // --- NEW STEP ---
                    step: "04",
                    title: "Delegate to Your AI",
                    description: "Hit Ctrl+J and tell your AI what to do. 'Mark all 'Fixspire' tasks from last week as completed.' Done."
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

      {/* Advanced Features Section - UPDATED */}
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
                  "Track 1-on-1s & private leader notes",
                  "Manage daily attendance with a roll call",
                  "Google Calendar two-way sync",
                  "Generate professional PDF & CSV reports",
                  "Centralized team notes & resources",
                  "AI-Generated reports & talking points",
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

      {/* Testimonials Section - UPDATED */}
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
              quote="The new AI agent is a game-changer. I just *tell* it to create tasks and meetings. It replaced three of our tools."
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
              quote="I love how I can ask the AI 'Am I missing anything for this week?' and it *knows*. It checks my tasks, my meetings, everything."
              name="Emily K."
              title="Engineering Lead, SaaS Co."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section - UPDATED */}
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
              question="Is this a collaborative tool or just for me?"
              answer="Currently, E-Manager is designed as a 'command center' for a single leader to manage their teams. Members do not have their own logins. This simplifies setup and management."
              delay={0.1}
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. Your data is protected. All team information, tasks, and notes are tied directly to your account. We use industry-standard encryption and never sell your data."
              delay={0.2}
            />
            <FAQItem
              question="How does the AI work?"
              answer="Our AI is a two-part system. It has a 'router' to understand if you want to read or write data, and a 'talker' to answer questions. All actions are based *only* on your account data, which is sent securely to the AI for processing."
              delay={0.3}
            />
            <FAQItem
              question="What can the AI do?"
              answer="The AI can read all your data to answer questions (e.g., 'How many tasks are pending?'). It can also create, update, and delete tasks, meetings, and personal notes. Just ask it in plain English."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section - UPDATED */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Take control with your new AI assistant.
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop juggling spreadsheets and docs. Start managing with an AI co-pilot that does the work for you.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center space-x-3 bg-gray-900 text-white font-semibold py-4 px-12 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900/20 transition-all duration-200 text-lg shadow-lg hover:shadow-xl"
              >
                <span>Sign Up Now</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            <p className="text-gray-600 text-sm mt-6">
              No credit card required • Setup in 2 minutes
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
                The AI-Powered Team Command Center.
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

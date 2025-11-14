import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Video,
  BookOpen,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const SupportPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by going to Settings > Account > Change Password. A reset link will be sent to your registered email address."
    },
    {
      question: "Can I export my notes and data?",
      answer: "Yes, you can export your data in multiple formats including PDF, CSV, and JSON. Go to Settings > Data Management > Export Data to get started."
    },
    {
      question: "How do I create a new team?",
      answer: "Navigate to the 'My Teams' section and click the 'Create New Team' button. You can then add members and set permissions."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, E Manager is available on both iOS and Android. You can download it from the App Store or Google Play Store."
    },
    {
      question: "How do I integrate with Google Calendar?",
      answer: "Go to Settings > Integrations > Calendar and connect your Google account. Your events will automatically sync with E Manager."
    },
    {
      question: "What's the difference between teams and members?",
      answer: "Teams are groups of members working together on projects. Members are individual users who can be part of multiple teams."
    }
  ];

  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Available 24/7",
      action: "Start Chat",
      color: "bg-blue-500"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our experts",
      availability: "Mon-Fri, 9AM-6PM EST",
      action: "Call Now",
      color: "bg-green-500"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 4 hours",
      action: "Send Email",
      color: "bg-purple-500"
    }
  ];

  const resources = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Knowledge Base",
      description: "Detailed articles and guides",
      count: "250+ Articles"
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      count: "50+ Videos"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Documentation",
      description: "Technical documentation & API",
      count: "Complete Docs"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Forum",
      description: "Connect with other users",
      count: "10K+ Members"
    }
  ];

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get answers to your questions, connect with our support team, and discover resources to make the most of E Manager.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Availability</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">15min</div>
            <div className="text-gray-600">Average Response Time</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16"
        >
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className={`${method.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4`}>
                {method.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 mb-4">{method.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="w-4 h-4 mr-2" />
                {method.availability}
              </div>
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                {method.action}
              </button>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <span className="text-gray-500">{filteredFaqs.length} questions</span>
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                    {activeFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
                <p className="text-gray-400 text-sm mt-2">Try different keywords or contact support</p>
              </div>
            )}
          </motion.div>

          {/* Resources & Updates */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Helpful Resources</h2>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {resources.map((resource, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{resource.count}</div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mt-1">
                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">All Systems Operational</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Application</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">File Storage</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
              </div>

              <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Status History <ExternalLink className="w-4 h-4 inline ml-1" />
              </button>
            </div>

            {/* Quick Tip */}
            <div className="bg-blue-50 rounded-2xl p-6 mt-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Quick Tip</h4>
                  <p className="text-blue-800 text-sm">
                    Use keyboard shortcuts to navigate faster. Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs font-mono">?</kbd> to see all available shortcuts.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 rounded-3xl p-8 text-center mt-16"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Still need help?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our dedicated support team is here to help you get the most out of E Manager. We're committed to providing you with the best possible experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Schedule a Demo
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-colors">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportPage;

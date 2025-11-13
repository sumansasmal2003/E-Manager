import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Shield, ChevronRight, Mail, Clock, UserCheck, AlertTriangle, Scale } from 'lucide-react';
import Navbar from '../components/Navbar';

const TermsOfServicePage = () => {
  const lastUpdated = "November 13, 2025";

  const sections = [
    { id: 'accounts', title: 'Accounts' },
    { id: 'service', title: 'The Service' },
    { id: 'integrations', title: 'Third-Party Integrations' },
    { id: 'acceptable-use', title: 'Acceptable Use' },
    { id: 'termination', title: 'Termination' },
    { id: 'liability', title: 'Disclaimers & Liability' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Information' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* Header Section */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <div className="flex items-center justify-center space-x-4 text-lg text-gray-600">
              <Clock size={20} />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileText size={18} className="mr-2" />
                Contents
              </h3>
              <nav className="space-y-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center justify-between text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {section.title}
                    </span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Introduction */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Scale size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to E-Manager</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      These Terms of Service ("Terms") govern your access to and use of our web application
                      (the "Service"). Please read these Terms carefully before using the Service.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-blue-800 text-sm font-medium">
                        By accessing, registering for, or using the Service, you agree to be bound by these
                        Terms and our Privacy Policy. If you do not agree to these Terms, do not use the Service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Sections */}
              <div className="divide-y divide-gray-200">
                {/* Accounts Section */}
                <section id="accounts" className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                      <UserCheck size={16} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">1. Accounts</h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">1.1. Account Creation</h4>
                      <p>
                        To use the Service, you must register for an account. You agree to provide
                        accurate, current, and complete information during the registration process.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">1.2. Account Responsibility</h4>
                      <p>
                        You are responsible for safeguarding your password and for all activities that
                        occur under your account. You must notify us immediately of any unauthorized use of your account.
                      </p>
                    </div>
                  </div>
                </section>

                {/* The Service Section */}
                <section id="service" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">2. The Service</h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">2.1. Description</h4>
                      <p>
                        The Service is a personal and team management tool designed for leaders. It allows
                        you to create teams, manage members (as text entries), assign tasks, schedule meetings,
                        track attendance, manage 1-on-1s, and take personal and team notes.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">2.2. User Content</h4>
                      <p>
                        You own all data, information, and content you submit to the Service ("User Content").
                        This includes, but is not limited to, team names, member names, task details, note
                        content, and any other data you enter. We do not claim any ownership over your User Content.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">2.3. Responsibility for Content</h4>
                      <p>
                        You are solely responsible for the accuracy, legality, and appropriateness of all
                        User Content you create or store using the Service. E-Manager is a tool for your use,
                        and we have no liability for the User Content you manage.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Third-Party Integrations */}
                <section id="integrations" className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle size={16} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">3. Third-Party Integrations</h3>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <p>
                      The Service utilizes third-party APIs to provide certain features. Your use of these
                      features is also subject to the terms of those third parties.
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="font-semibold text-amber-900 mb-2">3.1. Zoom Meeting Generation</h4>
                      <p className="text-amber-800">
                        The Service allows you to generate Zoom meeting links by providing a title and time.
                        This feature sends data to the Zoom API. Your use of Zoom is subject to Zoom's own
                        Terms of Service and Privacy Policy.
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="font-semibold text-amber-900 mb-2">3.2. AI Report Generation</h4>
                      <p className="text-amber-800">
                        The "Generate Report" feature sends portions of your User Content (such as task titles,
                        member names, and team statistics) to a third-party generative AI service (Google) to
                        create a summary.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Important Notice</h4>
                      <p className="text-red-800">
                        You agree not to include any highly sensitive, personal, financial, or confidential
                        information in the data fields that are used for AI report generation. Your use of
                        this feature is at your own risk, and you agree to hold E-Manager harmless from any
                        data exposure resulting from your inclusion of sensitive information.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Acceptable Use */}
                <section id="acceptable-use" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">4. Acceptable Use</h3>
                  <p className="text-gray-700 mb-4">You agree not to use the Service to:</p>
                  <ul className="space-y-3 text-gray-700">
                    {[
                      "Upload or store any User Content that is unlawful, harmful, threatening, or otherwise objectionable",
                      "Impersonate any person or entity or falsely state your affiliation",
                      "Attempt to gain unauthorized access to the Service, other accounts, or computer systems",
                      "Interfere with or disrupt the integrity or performance of the Service or its data",
                      "Use the Service for any purpose other than its intended use as a management tool"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Termination */}
                <section id="termination" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">5. Termination</h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">5.1. By You</h4>
                      <p>
                        You can stop using the Service and request account deletion at any time by contacting us.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">5.2. By Us</h4>
                      <p>
                        We reserve the right to suspend or terminate your account and access to the Service
                        at our sole discretion, without notice, if you breach these Terms.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Liability */}
                <section id="liability" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">6. Disclaimers and Limitation of Liability</h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">6.1. "AS IS" Service</h4>
                      <p>
                        The Service is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind,
                        express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">6.2. Limitation of Liability</h4>
                      <p>
                        To the fullest extent permitted by law, E-Manager shall not be liable for any indirect,
                        incidental, special, consequential, or punitive damages, or any loss of profits or
                        revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill,
                        or other intangible losses, resulting from your use of the Service.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Changes to Terms */}
                <section id="changes" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">7. Changes to Terms</h3>
                  <p className="text-gray-700">
                    We reserve the right to modify these Terms at any time. If we make changes, we will
                    provide notice by updating the "Last Updated" date at the top of these Terms. Your
                    continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                  </p>
                </section>

                {/* Contact Information */}
                <section id="contact" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Information</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail size={20} className="text-gray-600" />
                      <p className="text-gray-700">
                        If you have any questions about these Terms, please contact us at{' '}
                        <a
                          href="mailto:support@e-manager.com"
                          className="font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          support@e-manager.com
                        </a>
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;

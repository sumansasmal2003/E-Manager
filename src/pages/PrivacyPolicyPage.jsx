import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Shield, ChevronRight, Mail, Clock, Database, Eye, Server, Users, Key } from 'lucide-react';
import Navbar from '../components/Navbar';

const PrivacyPolicyPage = () => {
  const lastUpdated = "November 13, 2025";

  const sections = [
    { id: 'information-collected', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'data-sharing', title: 'Data Sharing & Third Parties' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Data Rights' },
    { id: 'children-privacy', title: "Children's Privacy" },
    { id: 'policy-changes', title: 'Policy Changes' },
    { id: 'contact', title: 'Contact Us' }
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="flex items-center justify-center space-x-4 text-lg text-gray-600">
              <Clock size={20} />
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed"
            >
              We are committed to protecting your privacy and being transparent about how we handle your data.
            </motion.p>
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
              <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to E-Manager</h2>
                    <p className="text-gray-700 leading-relaxed">
                      This Privacy Policy explains how we collect, use, disclose, and safeguard your
                      information when you use our web application (the "Service"). We are committed
                      to protecting your privacy and being transparent about our practices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Policy Sections */}
              <div className="divide-y divide-gray-200">
                {/* Information We Collect */}
                <section id="information-collected" className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Database size={16} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">1. Information We Collect</h3>
                  </div>

                  <div className="space-y-6 text-gray-700">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <Users size={18} className="mr-2" />
                        A. Information You Provide to Us
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <div>
                            <strong className="text-blue-900">Account Information:</strong> When you register for an account,
                            we collect personal information such as your username, email address, and a hashed version
                            of your password.
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <div>
                            <strong className="text-blue-900">User Content:</strong> We collect and store the data you create and upload to
                            the Service. This includes team names, member names, task descriptions, meeting agendas,
                            1-on-1 notes, personal notes, attendance records, and any links or text you add.
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Eye size={18} className="mr-2" />
                        B. Information We Collect Automatically
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <div>
                            <strong className="text-gray-900">Cookies and Local Storage:</strong> We use local storage to keep you
                            logged in and to store your session information (like your authentication token).
                            We do not use tracking cookies for third-party advertising.
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <div>
                            <strong className="text-gray-900">Usage Data:</strong> We may collect generic, non-personal information about
                            how you interact with our Service (such as features used or buttons clicked) to
                            help us improve the application.
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How We Use Your Information */}
                <section id="how-we-use" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700 mb-4">We use the information we collect for the following purposes:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                      {[
                        "To provide, operate, and maintain the Service",
                        "To manage your account and provide customer support",
                        "To send administrative communications and security alerts",
                        "To analyze usage and improve functionality",
                        "To provide specific features you choose to use",
                        "To ensure the security and integrity of our platform"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Data Sharing and Third Parties */}
                <section id="data-sharing" className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Server size={16} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">3. Data Sharing and Third-Party Services</h3>
                  </div>

                  <div className="space-y-6 text-gray-700">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <p className="text-blue-800 font-medium">
                        We do not sell your personal information or User Content. We only share your
                        information with third-party service providers in specific, limited circumstances
                        required to provide features of the Service to you.
                      </p>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-3">A. AI Report Generation</h4>
                      <p className="text-amber-800 mb-3">
                        The "Generate Report" feature is powered by a third-party generative AI service (Google).
                        To provide this feature, we send certain User Content (such as team statistics, member names,
                        and task titles) to this service to generate a report.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-amber-300">
                        <p className="text-amber-900 font-semibold text-sm">
                          🛡️ We do not send your private notes or 1-on-1 discussion points. By using this feature,
                          you acknowledge and agree to this data processing.
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-3">B. Zoom Meeting Generation</h4>
                      <p className="text-amber-800">
                        When you use the "Generate Zoom" feature for a meeting, we send the meeting's title and
                        start time to the Zoom API to create a meeting link. This data is subject to Zoom's own Privacy Policy.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Security */}
                <section id="data-security" className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <Key size={16} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">4. Data Security</h3>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="space-y-4 text-gray-700">
                      <p>
                        We implement robust security measures to protect your information. Your password
                        is stored in a hashed format using <code className="bg-green-100 px-1 rounded">bcryptjs</code>, and your
                        session is secured using JSON Web Tokens (JWT).
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-green-300">
                        <p className="text-green-800 text-sm font-medium">
                          🔒 While we implement industry-standard security measures, no electronic transmission
                          or storage is 100% secure. We cannot guarantee absolute security but we are committed
                          to protecting your data with the highest standards.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Your Data Rights */}
                <section id="your-rights" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">5. Your Data Rights</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700 mb-6">You have complete control over your personal information and User Content:</p>

                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-300">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Eye size={16} className="mr-2 text-blue-600" />
                          Access and Update
                        </h4>
                        <p className="text-gray-700 text-sm">
                          You can access and update your profile information (username and email) at any time
                          through the "Settings" page.
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-300">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Database size={16} className="mr-2 text-green-600" />
                          Data Deletion
                        </h4>
                        <p className="text-gray-700 text-sm">
                          You have the right to delete your User Content. You can delete teams, tasks, notes,
                          and other items directly through the Service's interface. Deleting a team will
                          cascade and delete all associated tasks, meetings, and notes for that team.
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-300">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Users size={16} className="mr-2 text-amber-600" />
                          Account Deletion
                        </h4>
                        <p className="text-gray-700 text-sm">
                          If you wish to delete your entire account and all associated data, please contact
                          us at the email address below.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Children's Privacy */}
                <section id="children-privacy" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">6. Children's Privacy</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700">
                      The Service is not intended for or directed at children under the age of 13.
                      We do not knowingly collect personal information from children under 13.
                    </p>
                  </div>
                </section>

                {/* Policy Changes */}
                <section id="policy-changes" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">7. Changes to This Privacy Policy</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700">
                      We may update this Privacy Policy from time to time. We will notify you of
                      any changes by posting the new policy on this page and updating the "Last Updated"
                      date at the top. Your continued use of the Service after any changes constitutes
                      your acceptance of the updated policy.
                    </p>
                  </div>
                </section>

                {/* Contact Us */}
                <section id="contact" className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Us</h3>
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-gray-700">
                          If you have any questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <a
                          href="mailto:privacy@e-manager.com"
                          className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-2 inline-block"
                        >
                          privacy@e-manager.com
                        </a>
                      </div>
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

export default PrivacyPolicyPage;

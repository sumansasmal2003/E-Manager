import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, MapPin, Phone, Send, Loader2, MessageSquare,
  HelpCircle, AlertCircle, CheckCircle2, Building
} from 'lucide-react';
import api from '../api/axiosConfig';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await api.post('/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', reason: 'General Inquiry', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
    setLoading(false);
  };

  const contactReasons = [
    "General Inquiry",
    "Sales & Enterprise",
    "Technical Support",
    "Bug Report",
    "Billing Issue",
    "Partnership"
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-zinc-900 mb-6 tracking-tight"
          >
            Get in touch.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you have a question about features, pricing, or enterprise solutions, our team is ready to help.
          </motion.p>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* LEFT: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Contact Information</h2>
              <p className="text-slate-600 mb-10 leading-relaxed">
                Fill out the form and our team will get back to you within 24 hours.
                For immediate assistance, check out our Help Center.
              </p>

              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Email Us</h3>
                    <p className="text-slate-500 text-sm mb-1">For general inquiries</p>
                    <a href="mailto:hello@e-manager.com" className="text-blue-600 font-medium hover:underline">hello@e-manager.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Building size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Headquarters</h3>
                    <p className="text-slate-500 text-sm">
                      123 Innovation Drive, Suite 400<br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Live Chat</h3>
                    <p className="text-slate-500 text-sm mb-1">Available Mon-Fri, 9am-5pm EST</p>
                    <button className="text-blue-600 font-medium hover:underline">Start a conversation</button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-2xl text-white">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <HelpCircle size={18} className="text-blue-400" /> Need Technical Help?
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                  If you are already a customer and facing issues, please log in and use the support portal for priority service.
                </p>
                <Link to="/login" className="text-sm font-bold text-white border-b border-white hover:text-blue-200 hover:border-blue-200 transition-colors">
                  Log in to Support
                </Link>
              </div>
            </motion.div>

            {/* RIGHT: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
            >
              {status === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 max-w-xs mx-auto mb-8">
                    Thank you for reaching out. We've sent a confirmation email to <strong>{formData.email}</strong>.
                  </p>
                  <button
                    onClick={() => setStatus(null)}
                    className="px-6 py-2 bg-slate-100 text-zinc-900 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">Topic</label>
                    <div className="relative">
                      <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none appearance-none transition-all cursor-pointer"
                      >
                        {contactReasons.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm">
                      <AlertCircle size={18} />
                      Something went wrong. Please try again later.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    <span>Send Message</span>
                  </button>

                  <p className="text-xs text-center text-slate-500">
                    By contacting us, you agree to our <Link to="/privacy" className="underline hover:text-zinc-900">Privacy Policy</Link>.
                  </p>
                </form>
              )}
            </motion.div>
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

export default ContactPage;

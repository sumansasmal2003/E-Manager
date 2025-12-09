import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Play, X, HelpCircle, Zap, Shield, Crown } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-zinc-900 mb-6 tracking-tight"
          >
            Premium Power. <br/>
            <span className="text-blue-600">Zero Cost.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            We've revolutionized SaaS pricing. Unlock enterprise-grade features simply by engaging with our ad partners. No credit card required.
          </motion.p>
        </div>
      </section>

      {/* --- PRICING CARDS --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* FREE TIER */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition-all flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-zinc-900">Starter</h3>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-black text-zinc-900">$0</span>
                  <span className="text-slate-500 ml-2 font-medium">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">For solo founders</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "1 Team Limit",
                  "Up to 5 Members",
                  "Basic Attendance",
                  "10 AI Requests / day",
                  "7-Day History"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle size={18} className="text-green-600" /> {feat}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center py-4 rounded-xl border-2 border-zinc-900 text-zinc-900 font-bold hover:bg-zinc-50 transition-colors">
                Sign Up Free
              </Link>
            </motion.div>

            {/* PROFESSIONAL TIER */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-zinc-900 text-white shadow-2xl relative flex flex-col transform md:-translate-y-4 border border-zinc-800"
            >
              <div className="absolute top-0 right-0 bg-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl tracking-wider">POPULAR</div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-blue-400" size={20} />
                  <h3 className="text-xl font-bold">Professional</h3>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-bold text-blue-400 uppercase tracking-wide block mb-1">Price</span>
                  <span className="text-3xl font-black text-white">Watch 20 Ads</span>
                  <span className="text-slate-400 text-sm ml-2">/month</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">No money. Just 5 minutes of your time.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "5 Teams",
                  "Up to 50 Members",
                  "Hire 3 Managers",
                  "100 AI Requests / day",
                  "Google Calendar Sync",
                  "30-Day History"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={18} className="text-blue-500" /> {feat}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50">
                Start Earning
              </Link>
            </motion.div>

            {/* PREMIUM TIER */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-purple-200 hover:shadow-xl transition-all flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="text-purple-600" size={20} />
                  <h3 className="text-xl font-bold text-zinc-900">Enterprise</h3>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-bold text-purple-600 uppercase tracking-wide block mb-1">Price</span>
                  <span className="text-3xl font-black text-zinc-900">Watch 50 Ads</span>
                  <span className="text-slate-500 text-sm ml-2">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Unlimited power for scaling orgs.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Unlimited Teams",
                  "Unlimited Members",
                  "Unlimited Managers",
                  "Unlimited AI Usage",
                  "Priority 24/7 Support",
                  "Advanced Exports (CSV)"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle size={18} className="text-purple-500" /> {feat}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center py-4 rounded-xl border-2 border-purple-100 text-purple-700 font-bold hover:bg-purple-50 transition-colors">
                Start Earning
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900">Common Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is it really free?", a: "Yes. Instead of charging your credit card, we show you video ads from our partners. Revenue from these ads covers your server costs." },
              { q: "How long does a plan last?", a: "Each upgrade lasts for 30 days. After 30 days, your account reverts to the Free tier until you watch ads again to renew." },
              { q: "Can I pay with money instead?", a: "Currently, we are exclusively ad-supported to keep our platform accessible to everyone globally without banking restrictions." },
              { q: "What happens to my data if I downgrade?", a: "Your data is safe. You will just lose access to creating *new* items beyond the free limits until you renew." }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
                  <HelpCircle size={18} className="text-slate-400" /> {faq.q}
                </h4>
                <p className="text-slate-600 text-sm pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-zinc-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-white font-bold text-2xl mb-4">E-Manager</div>
          <p className="text-sm mb-8">Redefining SaaS pricing with the power of attention economy.</p>
          <div className="text-xs border-t border-zinc-800 pt-8">
            © {new Date().getFullYear()} E-Manager Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;

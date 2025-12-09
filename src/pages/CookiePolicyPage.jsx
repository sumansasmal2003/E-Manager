import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Shield, CheckCircle, Info, Lock } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-zinc-900 mb-4">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

const CookieTypeCard = ({ title, description, required }) => (
  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-bold text-zinc-900">{title}</h3>
      {required ? (
        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Required</span>
      ) : (
        <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-full">Optional</span>
      )}
    </div>
    <p className="text-sm text-slate-600">{description}</p>
  </div>
);

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">

      <main className="max-w-4xl mx-auto px-4 py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide mb-6"
          >
            <Cookie size={12} className="text-amber-600" />
            Legal Compliance
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-zinc-900 mb-6"
          >
            Cookie Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </motion.p>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose prose-slate max-w-none"
        >
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl mb-12 flex gap-4">
            <Info className="text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-blue-900 font-bold mb-2">What are cookies?</h3>
              <p className="text-blue-800 text-sm m-0">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to the owners of the site.
              </p>
            </div>
          </div>

          <Section title="1. How We Use Cookies">
            <p>
              We use cookies to improve your experience on our platform, analyze how our services are used, and ensure security.
              Specifically, we use cookies for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Authentication and security (keeping you logged in).</li>
              <li>Preferences (remembering your language or region).</li>
              <li>Analytics (understanding how you navigate our dashboard).</li>
            </ul>
          </Section>

          <Section title="2. Types of Cookies We Use">
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              <CookieTypeCard
                title="Strictly Necessary"
                description="Essential for the website to function properly. You cannot switch these off."
                required={true}
              />
              <CookieTypeCard
                title="Performance & Analytics"
                description="Allow us to count visits and traffic sources so we can improve performance."
                required={false}
              />
              <CookieTypeCard
                title="Functional"
                description="Enable enhanced functionality and personalization, such as live chat."
                required={false}
              />
              <CookieTypeCard
                title="Targeting"
                description="Used to build a profile of your interests and show relevant ads on other sites."
                required={false}
              />
            </div>
          </Section>

          <Section title="3. Managing Cookies">
            <p>
              You have the right to decide whether to accept or reject cookies. You can set your browser controls to refuse all or some cookies.
              However, if you disable cookies, some parts of our website may become inaccessible or not function properly.
            </p>
            <p>
              To manage your preferences, please visit your browser's settings menu (usually found under "Tools" or "Preferences").
            </p>
          </Section>

          <Section title="4. Third-Party Cookies">
            <p>
              In some special cases, we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Google Analytics:</strong> Helps us understand how you use the site and ways that we can improve your experience.</li>
              <li><strong>Stripe:</strong> Used for fraud prevention and payment processing.</li>
              <li><strong>Google Ad Manager:</strong> Used to display video ads for our Free Tier users.</li>
            </ul>
          </Section>

          <div className="mt-16 pt-8 border-t border-slate-200 text-center">
            <h3 className="font-bold text-zinc-900 mb-2">Have Questions?</h3>
            <p className="text-slate-600 mb-6">
              If you have any questions about our use of cookies, please contact us.
            </p>
            <a
              href="mailto:privacy@e-manager.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              <Shield size={18} />
              Contact Privacy Team
            </a>
          </div>

        </motion.div>
      </main>
    </div>
  );
};

export default CookiePolicyPage;

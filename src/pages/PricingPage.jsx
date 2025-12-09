import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { Check, Loader2, Zap, Shield, AlertCircle } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';
import AdWatchModal from '../components/AdWatchModal';

// ... (PricingCard component remains exactly the same) ...
const PricingCard = ({
  planKey,
  title,
  price,
  description,
  features,
  currentPlan,
  onUpgrade,
  loading,
  recommended = false
}) => {
  const isCurrent = currentPlan === planKey;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative p-8 rounded-2xl border flex flex-col h-full ${
        recommended
          ? 'border-primary shadow-xl bg-white'
          : 'border-gray-200 shadow-sm bg-white'
      } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      {recommended && (
        <div className="absolute top-0 right-0 -mt-3 mr-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Recommended
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-primary">{title}</h3>
        <p className="text-gray-500 text-sm mt-2">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-primary">{price}</span>
        {price !== 'Free' && <span className="text-gray-500 font-medium"></span>}
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-600">
            <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onUpgrade(planKey)}
        disabled={isCurrent || loading}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
          isCurrent
            ? 'bg-gray-100 text-gray-400 cursor-default'
            : recommended
              ? 'bg-primary text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
              : 'bg-white border-2 border-gray-200 text-primary hover:border-primary'
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin mx-auto" size={20} />
        ) : isCurrent ? (
          'Current Plan'
        ) : (
          planKey === 'free' ? 'Downgrade' : 'Upgrade'
        )}
      </button>
    </motion.div>
  );
};

const PricingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Global loading for downgrades

  // --- ACCESS CONTROL: Kick out Managers ---
  useEffect(() => {
    if (user && user.role !== 'owner') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'owner') return null;
  // ----------------------------------------

  const currentPlan = user?.subscription?.plan || 'free';

  // --- HANDLER: Upgrade OR Downgrade ---
  const handleUpgradeClick = async (planKey) => {

    // CASE 1: Downgrade to Free
    if (planKey === 'free') {
      const confirmed = await confirm({
        title: 'Downgrade to Free?',
        description: 'You will lose all Professional/Premium features (Unlimited AI, Managers, Reports) immediately. Are you sure?',
        confirmText: 'Yes, Downgrade',
        danger: true
      });

      if (confirmed) {
        setLoading(true);
        try {
          // Call Backend to set plan to 'free'
          const res = await api.put('/user/subscription', { plan: 'free' });

          // Update Context
          login({ ...user, subscription: res.data.subscription });

          alert("Plan downgraded to Free.");
        } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || "Failed to downgrade.");
        }
        setLoading(false);
      }
      return;
    }

    // CASE 2: Upgrade (Open Ad Modal)
    setSelectedPlan(planKey);
    setIsAdModalOpen(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">

      {/* --- AD MODAL --- */}
      {selectedPlan && (
        <AdWatchModal
          isOpen={isAdModalOpen}
          onClose={() => setIsAdModalOpen(false)}
          targetPlan={selectedPlan}
        />
      )}

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">
            Upgrade your Workspace
          </p>
          <p className="mt-4 text-xl text-gray-500">
            Watch video ads to unlock premium features for free. Support our platform while you scale.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* FREE TIER */}
          <PricingCard
            planKey="free"
            title="Solo Leader"
            price="Free"
            description="Perfect for individuals getting organized."
            currentPlan={currentPlan}
            onUpgrade={handleUpgradeClick}
            loading={loading}
            features={[
              '1 Team limit',
              'Up to 5 Members',
              'Basic Attendance (Today only)',
              '10 AI Requests / day',
              '7-day Activity Log'
            ]}
          />

          {/* PROFESSIONAL TIER */}
          <PricingCard
            planKey="professional"
            title="Professional"
            price="Watch 20 Ads"
            description="For growing teams that need better tools."
            currentPlan={currentPlan}
            onUpgrade={handleUpgradeClick}
            loading={loading}
            recommended={true}
            features={[
              'Up to 5 Teams',
              'Up to 50 Members',
              'Hire 3 Managers',
              'Attendance Export (PDF)',
              'Google Calendar Sync',
              '100 AI Requests / day',
              '30-day Activity Log'
            ]}
          />

          {/* PREMIUM TIER */}
          <PricingCard
            planKey="premium"
            title="Enterprise"
            price="Watch 50 Ads"
            description="Unlimited power for scaling organizations."
            currentPlan={currentPlan}
            onUpgrade={handleUpgradeClick}
            loading={loading}
            features={[
              'Unlimited Teams',
              'Unlimited Members',
              'Unlimited Managers',
              'Advanced Exports (CSV + PDF)',
              'Unlimited AI Usage',
              'Proactive AI Insights',
              'Full History Access'
            ]}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Plans automatically expire after 30 days. Watch ads again to renew.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

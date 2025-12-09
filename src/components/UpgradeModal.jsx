import React from 'react';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';
import { Crown, Rocket, ArrowRight, ShieldAlert } from 'lucide-react'; // Added ShieldAlert
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Import Auth Context

const UpgradeModal = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user

  const isOwner = user?.role === 'owner';

  const handleUpgradeClick = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center p-4">
        {/* Animated Icon Background */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${
            isOwner
              ? 'bg-gradient-to-br from-yellow-100 to-amber-100'
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}
        >
          {isOwner ? (
            <Crown size={36} className="text-amber-600" />
          ) : (
            <ShieldAlert size={36} className="text-gray-600" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-primary mb-3">
          {isOwner ? 'Unlock Full Potential' : 'Limit Reached'}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
          {message || (isOwner
            ? "You've reached the limit of your current plan. Upgrade to remove limits and scale your organization."
            : "You have reached your assigned limit for this action."
          )}
        </p>

        <div className="w-full space-y-3">
          {isOwner ? (
            // --- OWNER VIEW: Upgrade Button ---
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpgradeClick}
              className="w-full bg-primary text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Rocket size={18} />
              <span>View Upgrade Plans</span>
              <ArrowRight size={18} className="opacity-70" />
            </motion.button>
          ) : (
            // --- MANAGER VIEW: Contact Message ---
            <div className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-medium py-3.5 px-6 rounded-xl text-sm">
              Please contact your Organization Owner to request more access or an increased limit.
            </div>
          )}

          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal;

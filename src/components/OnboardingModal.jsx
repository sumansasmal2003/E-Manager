// src/components/OnboardingModal.jsx
import React from 'react';
import Modal from './Modal';
import { Brain, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const OnboardingModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
          className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl"
        >
          <Zap size={32} className="text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-primary mb-3">
          Welcome to E-Manager!
        </h2>
        <p className="text-gray-600 mb-8 max-w-sm">
          You're all set up. Here are two "pro-tips" to get you started instantly.
        </p>

        <div className="space-y-5 w-full text-left">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center space-x-4">
            <Search size={24} className="text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">Open the Command Palette</h3>
              <p className="text-sm text-gray-600">
                Press{' '}
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-md">
                  Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-md">
                  K
                </kbd>{' '}
                to search or create anything.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center space-x-4">
            <Brain size={24} className="text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">Chat with your AI</h3>
              <p className="text-sm text-gray-600">
                Press{' '}
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-md">
                  Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-md">
                  J
                </kbd>{' '}
                to ask your AI assistant to do work for you.
              </p>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full mt-10 bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
        >
          Got It, Let's Go!
        </motion.button>
      </div>
    </Modal>
  );
};

export default OnboardingModal;

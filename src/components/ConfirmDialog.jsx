import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Modal from './Modal'; // We'll re-use your existing Modal component

const ConfirmDialog = ({ isOpen, onClose, onConfirm, options }) => {
  const {
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = true,
  } = options;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          danger ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <AlertTriangle size={32} className={danger ? 'text-red-600' : 'text-gray-600'} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mt-6">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mt-2">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8 w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
          >
            {cancelText}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className={`flex-1 font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
                : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900'
            }`}
          >
            {confirmText}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

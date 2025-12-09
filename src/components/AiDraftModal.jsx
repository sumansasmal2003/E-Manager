// src/components/AiDraftModal.jsx
import React, { useState } from 'react';
import Modal from './Modal';
import { Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AiDraftModal = ({ isOpen, onClose, onDraft }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // onDraft is an async function passed from the parent
    await onDraft(prompt);
    setLoading(false);
    onClose();
    setPrompt('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Draft Email with AI">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What is this email about?
          </label>
          <textarea
            placeholder="e.g., 'Draft a warning to all members of the Fixspire team about overdue tasks.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
          />
        </div>
        <motion.button
          type="button"
          disabled={loading || !prompt.trim()}
          onClick={handleSubmit}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
          <span>{loading ? 'Drafting...' : 'Generate Draft'}</span>
        </motion.button>
      </div>
    </Modal>
  );
};

export default AiDraftModal;

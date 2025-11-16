import React from 'react';
import { useModal } from '../context/ModalContext';
import Modal from './Modal';
import { Command, Search, Plus, User, Settings, Calendar, HelpCircle } from 'lucide-react';

// Helper component for styling
const ShortcutItem = ({ keys, description }) => (
  <div className="flex items-center justify-between py-3">
    <p className="text-sm text-gray-700">{description}</p>
    <div className="flex items-center space-x-1.5">
      {keys.map((key) => (
        <kbd
          key={key}
          className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded-md"
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

const ShortcutsModal = () => {
  const { modalState, closeModal } = useModal();

  return (
    <Modal
      isOpen={modalState.shortcuts}
      onClose={() => closeModal('shortcuts')}
      title="Keyboard Shortcuts"
    >
      <div className="divide-y divide-gray-200">
        <ShortcutItem
          keys={['?', '/']}
          description="Open this shortcuts guide"
        />
        <ShortcutItem
          keys={['Ctrl', 'K']}
          description="Open Command Palette"
        />
        {/* --- ADDED THIS LINE --- */}
        <ShortcutItem
          keys={['Ctrl', 'J']}
          description="Open AI Chat"
        />
        {/* --- END OF ADDITION --- */}
        <ShortcutItem
          keys={['N']}
          description="Create a new Note (from Notes page)"
        />
        <ShortcutItem
          keys={['T']}
          description="Create a new Team (from Teams page)"
        />
        <ShortcutItem
          keys={['C']}
          description="Create a new Task (from Team page)"
        />
      </div>
    </Modal>
  );
};

export default ShortcutsModal;

import React, { createContext, useContext, useState, useCallback } from 'react';

// 1. Create the Context
const ModalContext = createContext();

// 2. Create the Provider component
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    commandPalette: false,
    createTask: false,
    createTeam: false,
    addNote: false,
    createMeeting: false,
    addMember: false,
    shortcuts: false,
    aiChat: false,
    upgradeModal: false,
    createEmployee: false,
    // Add other modals here if needed
  });

  // This holds data passed to the modal (e.g., onTeamCreated function)
  const [modalContext, setModalContextState] = useState({});

  // --- FIX: Accept contextData ---
  const openModal = useCallback((modalName, contextData = {}) => {
    setModalState(prev => ({ ...prev, [modalName]: true }));

    // If context data is provided (e.g., { onTeamCreated: ... }), save it
    if (Object.keys(contextData).length > 0) {
      setModalContextState(prev => ({ ...prev, ...contextData }));
    }
  }, []);

  const closeModal = useCallback((modalName) => {
    setModalState(prev => ({ ...prev, [modalName]: false }));
    // We don't clear context immediately to avoid UI flickering during close animation
    // The next openModal call will merge/overwrite needed context
  }, []);

  // Helper to manually set context if needed (used in TeamDetailPage)
  const setModalContext = useCallback((newContext) => {
    setModalContextState(prev => ({ ...prev, ...newContext }));
  }, []);

  const value = {
    modalState,
    modalContext,
    openModal,
    closeModal,
    setModalContext,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// 3. Create a custom hook to use the context
export const useModal = () => {
  return useContext(ModalContext);
};

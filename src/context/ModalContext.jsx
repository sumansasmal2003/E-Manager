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
  });

  // This state is fine
  const [modalContext, setModalContext] = useState({});

  // --- THIS IS THE FIX ---
  // We remove the 'context' argument. openModal should *only* open.
  // The context is set *independently* by the page (e.g., TeamDetailPage).
  const openModal = useCallback((modalName) => {
    setModalState(prev => ({ ...prev, [modalName]: true }));
    // We NO LONGER set or clear context here
  }, []);

  // --- THIS IS THE SECOND FIX ---
  // closeModal should *only* close the modal.
  // The context will be cleared by the page's cleanup effect.
  const closeModal = useCallback((modalName) => {
    setModalState(prev => ({ ...prev, [modalName]: false }));
    // We NO LONGER clear the context here
  }, []);
  // --- END OF FIX ---

  const value = {
    modalState,
    modalContext,
    openModal,
    closeModal,
    setModalContext, // This is what pages use to set context
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

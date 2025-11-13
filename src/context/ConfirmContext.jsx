import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

// 1. Create the context
const ConfirmContext = createContext();

// 2. Create the provider component
export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});
  const [promiseResolvers, setPromiseResolvers] = useState(null);

  // This is the function you'll call from your components
  const confirm = useCallback((options) => {
    setOptions(options || {});
    setIsOpen(true);

    // Return a promise that will be resolved when the user clicks a button
    return new Promise((resolve) => {
      setPromiseResolvers({ resolve });
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setOptions({});
  };

  const handleConfirm = () => {
    if (promiseResolvers) {
      promiseResolvers.resolve(true); // Resolve the promise with 'true'
    }
    handleClose();
  };

  const handleCancel = () => {
    if (promiseResolvers) {
      promiseResolvers.resolve(false); // Resolve the promise with 'false'
    }
    handleClose();
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        options={options}
      />
    </ConfirmContext.Provider>
  );
};

// 3. Create a custom hook to use the context
export const useConfirm = () => {
  return useContext(ConfirmContext);
};

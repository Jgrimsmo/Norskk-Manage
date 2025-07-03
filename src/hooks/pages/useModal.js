// Custom hook for modal state management
import { useState } from 'react';

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const openModal = (modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setData(null);
  };

  const toggleModal = () => {
    setIsOpen(prev => !prev);
  };

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal
  };
}

export function useMultipleModals(modalNames = []) {
  const modals = {};
  
  modalNames.forEach(name => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    modals[name] = useModal();
  });

  return modals;
}

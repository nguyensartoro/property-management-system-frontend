import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalContent } from '../../utils/motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalBackdrop}
          className="flex fixed inset-0 z-50 justify-center items-center m-0 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            variants={modalContent}
            className={`overflow-hidden w-full bg-white rounded-lg shadow-xl ${sizeClasses[size]} max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-secondary-900">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full transition-colors hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={20} className="text-secondary-500" />
                </button>
              )}
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
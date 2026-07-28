import React, { useState, useEffect, useRef } from 'react';
import { SavedConfigurationExtended } from '../../lib/interfaces/configurator';
import { PrimaryButton } from '../ui';

interface SaveConfigurationModalProps {
  isOpen: boolean;
  loading?: boolean;
  error?: string;
  existingConfiguration?: SavedConfigurationExtended;
  onSave: (name: string, notes?: string) => void;
  onClose: () => void;
}

const SaveConfigurationModal: React.FC<SaveConfigurationModalProps> = ({
  isOpen,
  loading = false,
  error,
  existingConfiguration,
  onSave,
  onClose
}) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (existingConfiguration) {
        setName(existingConfiguration.name);
        setNotes(existingConfiguration.notes || '');
      } else {
        setName('');
        setNotes('');
      }
      setValidationErrors({});
      
      // Focus the name input after modal opens
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, existingConfiguration]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Configuration name is required';
    } else if (name.trim().length < 3) {
      errors.name = 'Configuration name must be at least 3 characters';
    } else if (name.trim().length > 50) {
      errors.name = 'Configuration name must be less than 50 characters';
    }

    if (notes && notes.length > 500) {
      errors.notes = 'Notes must be less than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(name.trim(), notes.trim() || undefined);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    if (validationErrors.notes) {
      setValidationErrors(prev => ({ ...prev, notes: '' }));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <form onSubmit={handleSubmit}>
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                <svg className="h-6 w-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {existingConfiguration ? 'Update Configuration' : 'Save Configuration'}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {existingConfiguration 
                      ? 'Update the name and notes for this configuration.'
                      : 'Give your configuration a name and optional notes for future reference.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Error saving configuration</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {/* Configuration Name Input */}
              <div>
                <label htmlFor="config-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="config-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g., Mom's Stairlift Setup"
                  maxLength={50}
                  className={`block w-full border rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    validationErrors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                  aria-describedby={validationErrors.name ? 'name-error' : undefined}
                  aria-invalid={!!validationErrors.name}
                />
                {validationErrors.name && (
                  <p id="name-error" className="mt-1 text-xs text-red-600" role="alert">
                    {validationErrors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {name.length}/50 characters
                </p>
              </div>

              {/* Notes Input */}
              <div>
                <label htmlFor="config-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="config-notes"
                  rows={3}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add any additional notes about this configuration..."
                  maxLength={500}
                  className={`block w-full border rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                    validationErrors.notes
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                  aria-describedby={validationErrors.notes ? 'notes-error' : undefined}
                  aria-invalid={!!validationErrors.notes}
                />
                {validationErrors.notes && (
                  <p id="notes-error" className="mt-1 text-xs text-red-600" role="alert">
                    {validationErrors.notes}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {notes.length}/500 characters
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
              >
                Cancel
              </button>
              <PrimaryButton
                type="submit"
                disabled={loading || !name.trim()}
                loading={loading}
                size="sm"
                className="w-full sm:w-auto"
              >
                {loading 
                  ? 'Saving...' 
                  : existingConfiguration 
                  ? 'Update Configuration' 
                  : 'Save Configuration'
                }
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveConfigurationModal;
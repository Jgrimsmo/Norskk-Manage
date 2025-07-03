// Custom hook for form state management with validation
import { useState, useCallback } from 'react';
import { validateForm } from '../../lib/validators/formValidators';

export function useFormData(initialData = {}, validationRules = {}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const handleMultipleSelect = useCallback((name, value) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [name]: newValues
      };
    });
  }, []);

  const validateAndSubmit = useCallback(async (onSubmit) => {
    try {
      setIsSubmitting(true);
      
      // Validate form
      const validation = validateForm(formData, validationRules);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return false;
      }

      // Submit form
      await onSubmit(formData);
      return true;
    } catch (err) {
      console.error('Form submission error:', err);
      setErrors({ submit: err.message || 'Submission failed' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationRules]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleMultipleSelect,
    validateAndSubmit,
    resetForm,
    updateFormData,
    setErrors
  };
}

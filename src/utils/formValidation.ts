/**
 * Form validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  date?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate a single field
 */
export const validateField = (
  fieldName: string,
  value: any,
  rules: ValidationRule
): ValidationError | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value).trim();

  // String length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${rules.minLength} characters long`
    };
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${rules.maxLength} characters long`
    };
  }

  // Numeric validations
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least ${rules.min}`
      };
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return {
        field: fieldName,
        message: `${fieldName} must be no more than ${rules.max}`
      };
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return {
      field: fieldName,
      message: `${fieldName} format is invalid`
    };
  }

  // Email validation
  if (rules.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(stringValue)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid email address`
      };
    }
  }

  // Phone validation
  if (rules.phone) {
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phonePattern.test(stringValue.replace(/[\s\-\(\)]/g, ''))) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid phone number`
      };
    }
  }

  // URL validation
  if (rules.url) {
    try {
      new URL(stringValue);
    } catch {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid URL`
      };
    }
  }

  // Date validation
  if (rules.date) {
    const date = new Date(stringValue);
    if (isNaN(date.getTime())) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid date`
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return {
        field: fieldName,
        message: customError
      };
    }
  }

  return null;
};

/**
 * Validate an entire form
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: ValidationError[] = [];

  Object.entries(rules).forEach(([fieldName, fieldRules]) => {
    const error = validateField(fieldName, data[fieldName], fieldRules);
    if (error) {
      errors.push(error);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Contract form validation rules
 */
export const contractValidationRules: Record<string, ValidationRule> = {
  renterId: { required: true },
  roomId: { required: true },
  startDate: { required: true, date: true },
  endDate: { 
    required: true, 
    date: true,
    custom: (value, formData) => {
      if (formData?.startDate && value) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          return 'End date must be after start date';
        }
      }
      return null;
    }
  },
  monthlyRent: { 
    required: true, 
    min: 0,
    custom: (value) => {
      if (isNaN(Number(value))) {
        return 'Monthly rent must be a valid number';
      }
      return null;
    }
  },
  securityDeposit: { 
    min: 0,
    custom: (value) => {
      if (value && isNaN(Number(value))) {
        return 'Security deposit must be a valid number';
      }
      return null;
    }
  },
  terms: { maxLength: 2000 }
};

/**
 * Payment form validation rules
 */
export const paymentValidationRules: Record<string, ValidationRule> = {
  contractId: { required: true },
  amount: { 
    required: true, 
    min: 0.01,
    custom: (value) => {
      if (isNaN(Number(value))) {
        return 'Amount must be a valid number';
      }
      return null;
    }
  },
  dueDate: { required: true, date: true },
  paymentDate: { date: true },
  method: { required: true },
  notes: { maxLength: 500 }
};

/**
 * Maintenance request validation rules
 */
export const maintenanceValidationRules: Record<string, ValidationRule> = {
  renterId: { required: true },
  roomId: { required: true },
  title: { required: true, minLength: 3, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 1000 },
  category: { required: true },
  priority: { required: true }
};

/**
 * Expense form validation rules
 */
export const expenseValidationRules: Record<string, ValidationRule> = {
  propertyId: { required: true },
  category: { required: true },
  amount: { 
    required: true, 
    min: 0.01,
    custom: (value) => {
      if (isNaN(Number(value))) {
        return 'Amount must be a valid number';
      }
      return null;
    }
  },
  description: { required: true, minLength: 3, maxLength: 200 },
  date: { required: true, date: true },
  vendor: { maxLength: 100 }
};

/**
 * User registration validation rules
 */
export const registrationValidationRules: Record<string, ValidationRule> = {
  name: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, email: true },
  password: { 
    required: true, 
    minLength: 8,
    custom: (value) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;
    }
  },
  confirmPassword: {
    required: true,
    custom: (value, formData) => {
      if (value !== formData?.password) {
        return 'Passwords do not match';
      }
      return null;
    }
  }
};

/**
 * Login validation rules
 */
export const loginValidationRules: Record<string, ValidationRule> = {
  email: { required: true, email: true },
  password: { required: true, minLength: 1 }
};

/**
 * File upload validation
 */
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): ValidationError | null => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // Default 5MB

  if (file.size > maxSize) {
    return {
      field: 'file',
      message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      field: 'file',
      message: `File type must be one of: ${allowedTypes.join(', ')}`
    };
  }

  return null;
};

/**
 * Validate multiple files
 */
export const validateMultipleFiles = (
  files: FileList | File[],
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const fileArray = Array.from(files);
  const { maxFiles = 10 } = options;

  if (fileArray.length > maxFiles) {
    errors.push({
      field: 'files',
      message: `Maximum ${maxFiles} files allowed`
    });
    return errors;
  }

  fileArray.forEach((file, index) => {
    const error = validateFileUpload(file, options);
    if (error) {
      errors.push({
        field: `file_${index}`,
        message: `File ${index + 1}: ${error.message}`
      });
    }
  });

  return errors;
};

import React from 'react';

/**
 * Real-time validation hook
 */
export const useFormValidation = (
  initialData: Record<string, any>,
  rules: Record<string, ValidationRule>
) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateSingleField = (fieldName: string, value: any) => {
    const rule = rules[fieldName];
    if (!rule) return;

    const error = validateField(fieldName, value, rule);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error?.message || ''
    }));
  };

  const handleChange = (fieldName: string, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validateSingleField(fieldName, value);
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateSingleField(fieldName, data[fieldName]);
  };

  const validateAll = (): boolean => {
    const result = validateForm(data, rules);
    const errorMap: Record<string, string> = {};
    
    result.errors.forEach(error => {
      errorMap[error.field] = error.message;
    });
    
    setErrors(errorMap);
    return result.isValid;
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};
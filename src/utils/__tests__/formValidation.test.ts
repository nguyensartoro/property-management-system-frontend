import { describe, it, expect } from 'vitest';
import {
  validateField,
  validateForm,
  validateFileUpload,
  validateMultipleFiles,
  contractValidationRules,
  paymentValidationRules,
  maintenanceValidationRules,
  expenseValidationRules,
} from '../formValidation';

describe('formValidation', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const result = validateField('name', '', { required: true });
      expect(result).toEqual({
        field: 'name',
        message: 'name is required'
      });
    });

    it('should pass validation for valid required field', () => {
      const result = validateField('name', 'John Doe', { required: true });
      expect(result).toBeNull();
    });

    it('should validate minimum length', () => {
      const result = validateField('password', 'abc', { minLength: 8 });
      expect(result).toEqual({
        field: 'password',
        message: 'password must be at least 8 characters long'
      });
    });

    it('should validate maximum length', () => {
      const result = validateField('name', 'a'.repeat(101), { maxLength: 100 });
      expect(result).toEqual({
        field: 'name',
        message: 'name must be no more than 100 characters long'
      });
    });

    it('should validate minimum value', () => {
      const result = validateField('age', 15, { min: 18 });
      expect(result).toEqual({
        field: 'age',
        message: 'age must be at least 18'
      });
    });

    it('should validate maximum value', () => {
      const result = validateField('score', 105, { max: 100 });
      expect(result).toEqual({
        field: 'score',
        message: 'score must be no more than 100'
      });
    });

    it('should validate email format', () => {
      const result = validateField('email', 'invalid-email', { email: true });
      expect(result).toEqual({
        field: 'email',
        message: 'email must be a valid email address'
      });
    });

    it('should pass valid email', () => {
      const result = validateField('email', 'test@example.com', { email: true });
      expect(result).toBeNull();
    });

    it('should validate phone format', () => {
      const result = validateField('phone', 'invalid-phone', { phone: true });
      expect(result).toEqual({
        field: 'phone',
        message: 'phone must be a valid phone number'
      });
    });

    it('should pass valid phone', () => {
      const result = validateField('phone', '+1234567890', { phone: true });
      expect(result).toBeNull();
    });

    it('should validate URL format', () => {
      const result = validateField('website', 'invalid-url', { url: true });
      expect(result).toEqual({
        field: 'website',
        message: 'website must be a valid URL'
      });
    });

    it('should pass valid URL', () => {
      const result = validateField('website', 'https://example.com', { url: true });
      expect(result).toBeNull();
    });

    it('should validate date format', () => {
      const result = validateField('date', 'invalid-date', { date: true });
      expect(result).toEqual({
        field: 'date',
        message: 'date must be a valid date'
      });
    });

    it('should pass valid date', () => {
      const result = validateField('date', '2024-01-01', { date: true });
      expect(result).toBeNull();
    });

    it('should validate with custom function', () => {
      const customRule = {
        custom: (value: string) => value === 'forbidden' ? 'Value is forbidden' : null
      };
      
      const result = validateField('field', 'forbidden', customRule);
      expect(result).toEqual({
        field: 'field',
        message: 'Value is forbidden'
      });
    });

    it('should validate pattern', () => {
      const result = validateField('code', 'abc123', { pattern: /^[A-Z]+$/ });
      expect(result).toEqual({
        field: 'code',
        message: 'code format is invalid'
      });
    });
  });

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        age: 15
      };
      
      const rules = {
        name: { required: true },
        email: { required: true, email: true },
        age: { min: 18 }
      };
      
      const result = validateForm(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[1].field).toBe('email');
      expect(result.errors[2].field).toBe('age');
    });

    it('should pass validation for valid form', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };
      
      const rules = {
        name: { required: true },
        email: { required: true, email: true },
        age: { min: 18 }
      };
      
      const result = validateForm(data, rules);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateFileUpload', () => {
    it('should validate file size', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      
      const result = validateFileUpload(file, { maxSize: 5 * 1024 * 1024 });
      
      expect(result).toEqual({
        field: 'file',
        message: 'File size must be less than 5MB'
      });
    });

    it('should validate file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      const result = validateFileUpload(file, { 
        allowedTypes: ['image/jpeg', 'image/png'] 
      });
      
      expect(result).toEqual({
        field: 'file',
        message: 'File type must be one of: image/jpeg, image/png'
      });
    });

    it('should pass valid file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateFileUpload(file, { 
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png'] 
      });
      
      expect(result).toBeNull();
    });
  });

  describe('validateMultipleFiles', () => {
    it('should validate maximum number of files', () => {
      const files = Array.from({ length: 15 }, (_, i) => 
        new File(['content'], `test${i}.txt`, { type: 'text/plain' })
      );
      
      const result = validateMultipleFiles(files, { maxFiles: 10 });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        field: 'files',
        message: 'Maximum 10 files allowed'
      });
    });

    it('should validate individual files', () => {
      const files = [
        new File(['content'], 'test1.txt', { type: 'text/plain' }),
        new File(['content'], 'test2.txt', { type: 'text/plain' })
      ];
      
      // Mock file sizes
      Object.defineProperty(files[0], 'size', { value: 10 * 1024 * 1024 });
      Object.defineProperty(files[1], 'size', { value: 1024 });
      
      const result = validateMultipleFiles(files, { 
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg']
      });
      
      expect(result).toHaveLength(2);
      expect(result[0].field).toBe('file_0');
      expect(result[1].field).toBe('file_1');
    });
  });

  describe('validation rules', () => {
    it('should have contract validation rules', () => {
      expect(contractValidationRules.renterId.required).toBe(true);
      expect(contractValidationRules.roomId.required).toBe(true);
      expect(contractValidationRules.startDate.required).toBe(true);
      expect(contractValidationRules.endDate.required).toBe(true);
      expect(contractValidationRules.monthlyRent.required).toBe(true);
      expect(contractValidationRules.monthlyRent.min).toBe(0);
    });

    it('should have payment validation rules', () => {
      expect(paymentValidationRules.contractId.required).toBe(true);
      expect(paymentValidationRules.amount.required).toBe(true);
      expect(paymentValidationRules.amount.min).toBe(0.01);
      expect(paymentValidationRules.dueDate.required).toBe(true);
      expect(paymentValidationRules.method.required).toBe(true);
    });

    it('should have maintenance validation rules', () => {
      expect(maintenanceValidationRules.renterId.required).toBe(true);
      expect(maintenanceValidationRules.roomId.required).toBe(true);
      expect(maintenanceValidationRules.title.required).toBe(true);
      expect(maintenanceValidationRules.title.minLength).toBe(3);
      expect(maintenanceValidationRules.description.required).toBe(true);
      expect(maintenanceValidationRules.description.minLength).toBe(10);
    });

    it('should have expense validation rules', () => {
      expect(expenseValidationRules.propertyId.required).toBe(true);
      expect(expenseValidationRules.category.required).toBe(true);
      expect(expenseValidationRules.amount.required).toBe(true);
      expect(expenseValidationRules.amount.min).toBe(0.01);
      expect(expenseValidationRules.description.required).toBe(true);
    });
  });
});
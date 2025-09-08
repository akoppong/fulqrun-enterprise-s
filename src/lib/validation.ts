export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'pattern' | 'custom';
  message: string;
  value?: any;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
}

export interface FieldValidationConfig {
  rules: ValidationRule[];
  realTime: boolean;
  debounceMs: number;
}

export class FieldValidator {
  static validateField(value: any, config: FieldValidationConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const rule of config.rules) {
      const result = this.validateRule(value, rule);
      if (!result.isValid) {
        errors.push(result.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private static validateRule(value: any, rule: ValidationRule): { isValid: boolean; message: string } {
    switch (rule.type) {
      case 'required':
        const isEmpty = value === null || value === undefined || value === '' || 
                       (Array.isArray(value) && value.length === 0);
        return {
          isValid: !isEmpty,
          message: isEmpty ? rule.message : ''
        };
        
      case 'email':
        if (!value) return { isValid: true, message: '' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(value);
        return {
          isValid: isValidEmail,
          message: isValidEmail ? '' : rule.message
        };
        
      case 'phone':
        if (!value) return { isValid: true, message: '' };
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        const isValidPhone = phoneRegex.test(cleanPhone);
        return {
          isValid: isValidPhone,
          message: isValidPhone ? '' : rule.message
        };
        
      case 'url':
        if (!value) return { isValid: true, message: '' };
        try {
          new URL(value);
          return { isValid: true, message: '' };
        } catch {
          return { isValid: false, message: rule.message };
        }
        
      case 'min':
        if (!value) return { isValid: true, message: '' };
        const minValid = Number(value) >= rule.value;
        return {
          isValid: minValid,
          message: minValid ? '' : rule.message
        };
        
      case 'max':
        if (!value) return { isValid: true, message: '' };
        const maxValid = Number(value) <= rule.value;
        return {
          isValid: maxValid,
          message: maxValid ? '' : rule.message
        };
        
      case 'pattern':
        if (!value) return { isValid: true, message: '' };
        const patternValid = rule.pattern?.test(value) ?? true;
        return {
          isValid: patternValid,
          message: patternValid ? '' : rule.message
        };
        
      case 'custom':
        if (!rule.validator) return { isValid: true, message: '' };
        const customValid = rule.validator(value);
        return {
          isValid: customValid,
          message: customValid ? '' : rule.message
        };
        
      default:
        return { isValid: true, message: '' };
    }
  }
}

export const commonValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    type: 'required',
    message
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    type: 'email',
    message
  }),
  
  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    type: 'phone',
    message
  }),
  
  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    type: 'url',
    message
  }),
  
  minValue: (min: number, message?: string): ValidationRule => ({
    type: 'min',
    value: min,
    message: message || `Value must be at least ${min}`
  }),
  
  maxValue: (max: number, message?: string): ValidationRule => ({
    type: 'max',
    value: max,
    message: message || `Value must be at most ${max}`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    pattern: regex,
    message
  }),
  
  strongPassword: (message = 'Password must contain uppercase, lowercase, numbers, and special characters'): ValidationRule => ({
    type: 'custom',
    validator: (password: string) => {
      if (!password) return true;
      return password.length >= 8 &&
             /[A-Z]/.test(password) &&
             /[a-z]/.test(password) &&
             /\d/.test(password) &&
             /[!@#$%^&*(),.?":{}|<>]/.test(password);
    },
    message
  }),
  
  creditCard: (message = 'Please enter a valid credit card number'): ValidationRule => ({
    type: 'custom',
    validator: (cardNumber: string) => {
      if (!cardNumber) return true;
      // Basic Luhn algorithm check
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) return false;
      
      let sum = 0;
      let isEven = false;
      
      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    },
    message
  })
};
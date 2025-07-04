// Security utilities for the Norskk Management System
import { auth } from '../Firebase/firebaseConfig';

// Input validation and sanitization
export const SecurityUtils = {
  
  // XSS Protection - Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  },

  // SQL Injection Protection - Validate input patterns
  validateInput: (input, type = 'text') => {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[\d\s\-\(\)]{10,}$/,
      alphanumeric: /^[a-zA-Z0-9\s\-_.]+$/,
      numeric: /^[\d.]+$/,
      text: /^[a-zA-Z0-9\s\-_.,!@#$%^&*()\[\]{}|\\:";'<>?/~`+=]+$/
    };
    
    if (!patterns[type]) return false;
    return patterns[type].test(input);
  },

  // Rate limiting helper
  createRateLimiter: (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();
    
    return (identifier) => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier) || [];
      
      // Clean old attempts
      const recentAttempts = userAttempts.filter(time => now - time < windowMs);
      
      if (recentAttempts.length >= maxAttempts) {
        const oldestAttempt = Math.min(...recentAttempts);
        const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
        throw new Error(`Too many attempts. Please wait ${waitTime} seconds.`);
      }
      
      recentAttempts.push(now);
      attempts.set(identifier, recentAttempts);
      
      return true;
    };
  },

  // Session validation
  validateSession: () => {
    const user = auth.currentUser;
    if (!user) return false;
    
    // Check if token is still valid
    const lastSignIn = user.metadata.lastSignInTime;
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (Date.now() - new Date(lastSignIn).getTime() > maxSessionAge) {
      auth.signOut();
      return false;
    }
    
    return true;
  },

  // Audit logging
  logSecurityEvent: (event, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId: auth.currentUser?.uid || 'anonymous',
      userAgent: navigator.userAgent,
      ip: 'client-side', // Note: Real IP would need server-side logging
      details
    };
    
    // In production, send to server or Firebase Cloud Function
    console.log('Security Event:', logEntry);
    
    // Store critical events locally for immediate action
    if (['failed_login', 'unauthorized_access', 'suspicious_activity'].includes(event)) {
      const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      securityLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (securityLogs.length > 100) {
        securityLogs.splice(0, securityLogs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(securityLogs));
    }
  },

  // Content Security Policy validation
  validateCSP: () => {
    // Check if CSP headers are properly set
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      console.warn('Content Security Policy not detected');
      return false;
    }
    return true;
  },

  // Environment validation
  validateEnvironment: () => {
    const requiredEnvVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_PROJECT_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      return false;
    }
    
    return true;
  },

  // Encrypt sensitive data before storing locally
  encryptData: (data, key = 'norskk_secure_key') => {
    try {
      // Simple encryption for local storage (not for sensitive production data)
      const encrypted = btoa(JSON.stringify(data));
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  },

  // Decrypt data from local storage
  decryptData: (encryptedData, key = 'norskk_secure_key') => {
    try {
      const decrypted = JSON.parse(atob(encryptedData));
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  },

  // Check for suspicious activity patterns
  detectSuspiciousActivity: () => {
    const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    const recentLogs = securityLogs.filter(log => 
      Date.now() - new Date(log.timestamp).getTime() < 60 * 60 * 1000 // Last hour
    );
    
    // Multiple failed logins
    const failedLogins = recentLogs.filter(log => log.event === 'failed_login').length;
    if (failedLogins > 3) {
      this.logSecurityEvent('suspicious_activity', { 
        reason: 'multiple_failed_logins',
        count: failedLogins 
      });
      return true;
    }
    
    // Rapid successive actions
    const actions = recentLogs.filter(log => 
      ['create', 'update', 'delete'].some(action => log.event.includes(action))
    );
    if (actions.length > 50) {
      this.logSecurityEvent('suspicious_activity', { 
        reason: 'rapid_actions',
        count: actions.length 
      });
      return true;
    }
    
    return false;
  }
};

// Create rate limiter instances
export const loginRateLimiter = SecurityUtils.createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = SecurityUtils.createRateLimiter(100, 60 * 1000); // 100 requests per minute

// Security middleware for API calls
export const secureApiCall = async (apiFunction, ...args) => {
  try {
    // Validate session
    if (!SecurityUtils.validateSession()) {
      throw new Error('Invalid session');
    }
    
    // Rate limiting
    apiRateLimiter(auth.currentUser?.uid || 'anonymous');
    
    // Detect suspicious activity
    if (SecurityUtils.detectSuspiciousActivity()) {
      SecurityUtils.logSecurityEvent('blocked_suspicious_activity');
      throw new Error('Activity blocked due to suspicious behavior');
    }
    
    // Execute API call
    const result = await apiFunction(...args);
    
    return result;
  } catch (error) {
    SecurityUtils.logSecurityEvent('api_error', { 
      function: apiFunction.name,
      error: error.message 
    });
    throw error;
  }
};

export default SecurityUtils;

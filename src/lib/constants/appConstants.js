// Application constants
export const WEATHER_OPTIONS = [
  { value: 'Sunny', label: '☀️ Sunny', icon: '☀️' },
  { value: 'Cloudy', label: '☁️ Cloudy', icon: '☁️' },
  { value: 'Rainy', label: '🌧️ Rainy', icon: '🌧️' },
  { value: 'Snow', label: '❄️ Snow', icon: '❄️' },
  { value: 'Windy', label: '💨 Windy', icon: '💨' },
  { value: 'Foggy', label: '🌫️ Foggy', icon: '🌫️' }
];

export const REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const REPORT_STATUS_ICONS = {
  [REPORT_STATUS.DRAFT]: '📝',
  [REPORT_STATUS.SUBMITTED]: '✅',
  [REPORT_STATUS.APPROVED]: '✓',
  [REPORT_STATUS.REJECTED]: '❌'
};

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const ESTIMATE_STATUS = {
  IN_PROGRESS: 'In Progress',
  SENT: 'Sent',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  UNDER_REVIEW: 'Under Review'
};

export const ESTIMATE_STATUS_OPTIONS = [
  ESTIMATE_STATUS.IN_PROGRESS,
  ESTIMATE_STATUS.SENT,
  ESTIMATE_STATUS.APPROVED,
  ESTIMATE_STATUS.REJECTED,
  ESTIMATE_STATUS.UNDER_REVIEW
];

export const COMPANY_INFO = {
  NAME: 'NORSKK MANAGEMENT',
  TAGLINE: 'Construction Management & Consulting',
  PHONE: '(555) 123-4567',
  EMAIL: 'info@norskkmanagement.com',
  ADDRESS: '123 Construction Ave, Builder City, BC 12345'
};

export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  FOREMAN: 'foreman',
  WORKER: 'worker',
  VIEWER: 'viewer'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

export const WORK_TYPES = ['T&M', 'Lump Sum'];

export const CREW_ROLES = {
  FOREMAN: 'foreman',
  WORKER: 'worker',
  OPERATOR: 'operator',
  SUPERVISOR: 'supervisor'
};

export const EQUIPMENT_STATUS = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'Out of Service'
};

export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SIGNATURE: 'signature',
  HEADING: 'heading'
};

export const PERMISSION_CATEGORIES = {
  PROJECTS: 'projects',
  ESTIMATES: 'estimates',
  CREW: 'crew',
  EQUIPMENT: 'equipment',
  REPORTS: 'reports',
  FORMS: 'forms',
  TIME: 'time',
  ADMIN: 'admin',
  RESOURCES: 'resources',
  FINANCE: 'finance'
};

export const CONDITIONS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor'
};

export const APPROVAL_STATUS = {
  YES: 'Yes',
  NO: 'No',
  CONDITIONAL: 'Conditional'
};

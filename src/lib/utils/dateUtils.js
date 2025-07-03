// Date utility functions
export const formatDate = (dateStr, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(dateStr).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US');
};

export const formatDateShort = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US');
};

export const formatDateWithWeekday = (dateStr) => {
  return formatDate(dateStr, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const isToday = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return date.toDateString() === today.toDateString();
};

export const isThisWeek = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  return date >= startOfWeek && date <= endOfWeek;
};

export const getCurrentDateString = () => {
  return new Date().toISOString().split('T')[0];
};

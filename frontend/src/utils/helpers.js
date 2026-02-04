import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(d, new Date());
};

export const getRelativeTime = (date) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLIANT':
      return 'text-green-600 bg-green-100';
    case 'DUE_SOON':
      return 'text-yellow-600 bg-yellow-100';
    case 'OVERDUE':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'COMPLIANT':
      return 'Compliant';
    case 'DUE_SOON':
      return 'Due Soon';
    case 'OVERDUE':
      return 'Overdue';
    default:
      return status;
  }
};

export const getFuelTypeText = (fuelType) => {
  switch (fuelType) {
    case 'DIESEL':
      return 'Diesel';
    case 'ALT_FUEL':
      return 'Alt-Fuel';
    default:
      return fuelType;
  }
};

export const formatVin = (vin) => {
  if (!vin) return '-';
  return vin.toUpperCase();
};

export const truncate = (str, length = 20) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

const calculateStatus = (nextDueDate) => {
  if (!nextDueDate) return 'COMPLIANT';

  const now = new Date();
  const dueDate = new Date(nextDueDate);
  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    return 'OVERDUE';
  } else if (daysUntilDue <= 30) {
    return 'DUE_SOON';
  } else {
    return 'COMPLIANT';
  }
};

const calculateNextDueDate = (testDate, schedule = 'SEMI_ANNUAL') => {
  const date = new Date(testDate);
  if (schedule === 'QUARTERLY') {
    date.setMonth(date.getMonth() + 3);
  } else {
    date.setMonth(date.getMonth() + 6);
  }
  return date;
};

const getDaysUntilDue = (nextDueDate) => {
  if (!nextDueDate) return null;
  const now = new Date();
  const dueDate = new Date(nextDueDate);
  return Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
};

module.exports = {
  calculateStatus,
  calculateNextDueDate,
  getDaysUntilDue,
};

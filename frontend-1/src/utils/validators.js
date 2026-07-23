export function required(value, label = 'This field') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required.`;
  }
  return '';
}

export function validateEmail(value) {
  if (!value) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? '' : 'Enter a valid email address.';
}

export function validatePhone(value) {
  //if (!value) return 'Phone number is required.';
  const re = /^[0-9]{10}$/;
  return re.test(value.replace(/\D/g, '').slice(-10)) ? '' : 'Enter a valid 10-digit phone number.';
}

export function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 4) return 'Password must be at least 6 characters.';
  return '';
}

export function validateUsername(value) {
  if (!value || !value.trim()) return 'Username is required.';
  if (value.trim().length < 3) return 'Username must be at least 3 characters.';
  return '';
}

export function validatePositiveAmount(value) {
  if (value === '' || value === null || value === undefined) return 'Amount is required.';
  const num = Number(value);
  if (Number.isNaN(num)) return 'Amount must be a number.';
  if (num <= 0) return 'Amount must be greater than zero.';
  return '';
}

export function validateName(value) {
  if (!value || !value.trim()) return 'Name is required.';
  return '';
}

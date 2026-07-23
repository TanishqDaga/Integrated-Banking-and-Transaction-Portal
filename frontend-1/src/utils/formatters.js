export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(num);
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function maskAccountNumber(accNo) {
  if (!accNo) return '—';
  const str = String(accNo);
  if (str.length <= 4) return str;
  return `•••• •••• ${str.slice(-4)}`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U';
}

export function getAccountId(account) {
  return account?.id ?? account?.accountId;
}

export function getAccountHolderName(account) {
  return account?.accountHolderName || account?.accountHolder || account?.holderName || account?.name || '—';
}

export function getUserId(user) {
  return user?.userid ?? user?.userId ?? user?.id;
}

export function getTxId(tx) {
  return tx?.transactionId ?? tx?.id;
}

export function getTxType(tx) {
  return (tx?.transactionType || tx?.type || '').toUpperCase();
}

export function getTxTime(tx) {
  return tx?.transactionTime || tx?.date || tx?.createdAt || tx?.timestamp;
}

export function getTxAccountLabel(tx) {
  const sourceId = tx?.sourceAccountId ?? tx?.sourceAccount?.id;
  const targetId = tx?.targetAccountId ?? tx?.targetAccount?.id;
  if (sourceId && targetId) return `${sourceId} → ${targetId}`;
  return sourceId || targetId || tx?.accountNumber || tx?.accountId || '—';
}

export function isCreditTransaction(tx) {
  return getTxType(tx) === 'DEPOSIT';
}

export function isDebitTransaction(tx) {
  const type = getTxType(tx);
  return type === 'WITHDRAW' || type === 'TRANSFER';
}

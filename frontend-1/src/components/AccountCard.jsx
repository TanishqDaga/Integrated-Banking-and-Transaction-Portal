import React from 'react';
import { formatCurrency, maskAccountNumber, getAccountId, getAccountHolderName } from '../utils/formatters';
import './AccountCard.css';

const STATUS_TONE = {
  ACTIVE: 'success',
  APPROVED: 'success',
  PENDING: 'warning',
  INACTIVE: 'error',
  REJECTED: 'error',
  BLOCKED: 'error'
};

export default function AccountCard({ account, onDeposit, onWithdraw, onTransfer, onDelete, onView, delay = 0 }) {
  const status = account.status?.toUpperCase();
  const tone = STATUS_TONE[status] || 'neutral';
  const bankLabel = account.bank?.bankName || (account.bankId ? `Bank #${account.bankId}` : null);

  return (
    <div className="account-card slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="account-card-top">
        <div>
          <p className="account-card-label">Account Number</p>
          <p className="account-card-number mono">{maskAccountNumber(getAccountId(account))}</p>
        </div>
        {status && <span className={`badge badge-${tone}`}>{status}</span>}
      </div>

      <div className="account-card-holder">
        <p className="account-card-name">{getAccountHolderName(account)}</p>
        {bankLabel && <p className="account-card-type text-muted">{bankLabel}</p>}
      </div>

      <div className="account-card-balance">
        <p className="account-card-label">Available Balance</p>
        <p className="account-card-amount mono">{formatCurrency(account.balance)}</p>
      </div>

      <div className="account-card-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onDeposit?.(account)}>
          Deposit
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => onWithdraw?.(account)}>
          Withdraw
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => onTransfer?.(account)}>
          Transfer
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onView?.(account)}>
          Details
        </button>
        <button className="btn btn-icon btn-ghost btn-sm account-delete" onClick={() => onDelete?.(account)} aria-label="Delete account">
          🗑
        </button>
      </div>
    </div>
  );
}

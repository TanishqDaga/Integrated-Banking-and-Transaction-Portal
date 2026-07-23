import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getMyAccounts, depositToAccount } from '../services/accountService';
import { useToast } from '../context/ToastContext';
import { validatePositiveAmount } from '../utils/validators';
import { formatCurrency, maskAccountNumber, getAccountId } from '../utils/formatters';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import './FormPage.css';

export default function Deposit() {
  const { data: accounts, loading } = useFetch(getMyAccounts, []);
  const toast = useToast();

  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const list = accounts || [];

  function validate() {
    const next = {
      accountId: accountId ? '' : 'Please select an account.',
      amount: validatePositiveAmount(amount)
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  }

  async function confirmDeposit() {
    setProcessing(true);
    try {
      const result = await depositToAccount(accountId, Number(amount));
      const acc = list.find((a) => String(getAccountId(a)) === String(accountId));
      setReceipt({
        amount: Number(amount),
        account: acc,
        newBalance: result?.balance ?? (Number(acc?.balance || 0) + Number(amount)),
        date: new Date()
      });
      setConfirmOpen(false);
      toast.success('Deposit successful!');
    } catch (e2) {
      toast.error(e2.friendlyMessage || 'Deposit failed.');
      setConfirmOpen(false);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <Loader fullPage label="Loading accounts…" />;

  if (receipt) {
    return (
      <div className="page fade-in form-page">
        <div className="card receipt-card slide-up">
          <div className="receipt-icon">✓</div>
          <h2>Deposit Successful</h2>
          <p className="receipt-amount text-success mono">+{formatCurrency(receipt.amount)}</p>
          <div className="receipt-detail-row">
            <span className="text-muted">Account</span>
            <span className="mono">{maskAccountNumber(getAccountId(receipt.account))}</span>
          </div>
          <div className="receipt-detail-row">
            <span className="text-muted">New balance</span>
            <span className="mono">{formatCurrency(receipt.newBalance)}</span>
          </div>
          <div className="receipt-detail-row">
            <span className="text-muted">Date</span>
            <span>{receipt.date.toLocaleString()}</span>
          </div>
          <div className="form-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => setReceipt(null)}>
              Make another deposit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="page fade-in">
        <EmptyState icon="↓" title="No accounts available" message="Create an account before making a deposit." />
      </div>
    );
  }

  return (
    <div className="page fade-in form-page">
      <div className="page-header">
        <div>
          <h1>Deposit Funds</h1>
          <p>Add money to one of your accounts.</p>
        </div>
      </div>

      <div className="card card-pad form-card slide-up">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="accountId">Account</label>
            <select
              id="accountId"
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                setErrors((err) => ({ ...err, accountId: '' }));
              }}
              className={errors.accountId ? 'has-error' : ''}
            >
              <option value="">Select an account</option>
              {list.map((a) => (
                <option key={getAccountId(a)} value={getAccountId(a)}>
                  {maskAccountNumber(getAccountId(a))} — {formatCurrency(a.balance)}
                </option>
              ))}
            </select>
            {errors.accountId && <p className="field-error">{errors.accountId}</p>}
          </div>

          <div className="field input-prefix">
            <label htmlFor="amount">Amount</label>
            <span className="prefix-symbol">$</span>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors((err) => ({ ...err, amount: '' }));
              }}
              className={errors.amount ? 'has-error' : ''}
              placeholder="0.00"
            />
            {errors.amount && <p className="field-error">{errors.amount}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success btn-block btn-lg">
              Continue
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm deposit"
        message={`Deposit ${formatCurrency(amount || 0)} to ${maskAccountNumber(getAccountId(list.find((a) => String(getAccountId(a)) === String(accountId))))}?`}
        confirmLabel="Confirm Deposit"
        tone="primary"
        loading={processing}
        onConfirm={confirmDeposit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

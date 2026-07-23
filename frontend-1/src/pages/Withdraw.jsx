import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getMyAccounts, withdrawFromAccount } from '../services/accountService';
import { useToast } from '../context/ToastContext';
import { validatePositiveAmount } from '../utils/validators';
import { formatCurrency, maskAccountNumber, getAccountId } from '../utils/formatters';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import './FormPage.css';

export default function Withdraw() {
  const { data: accounts, loading } = useFetch(getMyAccounts, []);
  const toast = useToast();

  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const list = accounts || [];
  const selectedAccount = list.find((a) => String(getAccountId(a)) === String(accountId));

  function validate() {
    let amountErr = validatePositiveAmount(amount);
    if (!amountErr && selectedAccount && Number(amount) > Number(selectedAccount.balance)) {
      amountErr = 'Amount exceeds available balance.';
    }
    const next = {
      accountId: accountId ? '' : 'Please select an account.',
      amount: amountErr
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  }

  async function confirmWithdraw() {
    setProcessing(true);
    try {
      const result = await withdrawFromAccount(accountId, Number(amount));
      setReceipt({
        amount: Number(amount),
        account: selectedAccount,
        newBalance: result?.balance ?? Number(selectedAccount?.balance || 0) - Number(amount),
        date: new Date()
      });
      setConfirmOpen(false);
      toast.success('Withdrawal successful!');
    } catch (e2) {
      toast.error(e2.friendlyMessage || 'Withdrawal failed.');
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
          <div className="receipt-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            ✓
          </div>
          <h2>Withdrawal Successful</h2>
          <p className="receipt-amount text-error mono">−{formatCurrency(receipt.amount)}</p>
          <div className="receipt-detail-row">
            <span className="text-muted">Account</span>
            <span className="mono">{maskAccountNumber(getAccountId(receipt.account))}</span>
          </div>
          <div className="receipt-detail-row">
            <span className="text-muted">Remaining balance</span>
            <span className="mono">{formatCurrency(receipt.newBalance)}</span>
          </div>
          <div className="receipt-detail-row">
            <span className="text-muted">Date</span>
            <span>{receipt.date.toLocaleString()}</span>
          </div>
          <div className="form-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => setReceipt(null)}>
              Make another withdrawal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="page fade-in">
        <EmptyState icon="↑" title="No accounts available" message="Create an account before withdrawing funds." />
      </div>
    );
  }

  return (
    <div className="page fade-in form-page">
      <div className="page-header">
        <div>
          <h1>Withdraw Funds</h1>
          <p>Take money out of one of your accounts.</p>
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
            {selectedAccount && !errors.amount && (
              <p className="field-hint">Available balance: {formatCurrency(selectedAccount.balance)}</p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-danger btn-block btn-lg">
              Continue
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm withdrawal"
        message={`Withdraw ${formatCurrency(amount || 0)} from ${maskAccountNumber(getAccountId(selectedAccount))}?`}
        confirmLabel="Confirm Withdrawal"
        tone="danger"
        loading={processing}
        onConfirm={confirmWithdraw}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getMyAccounts, getAllAccounts, transferFunds, transferFundsByIds } from '../services/accountService';
import { useToast } from '../context/ToastContext';
import { validatePositiveAmount } from '../utils/validators';
import { formatCurrency, maskAccountNumber, getAccountId, getAccountHolderName } from '../utils/formatters';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import './FormPage.css';

export default function Transfer() {
  const { data: myAccounts, loading: myLoading } = useFetch(getMyAccounts, []);
  const { data: allAccounts, loading: allLoading } = useFetch(getAllAccounts, []);
  const toast = useToast();

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const sourceList = myAccounts || [];
  const destList = allAccounts || [];
  const loading = myLoading || allLoading;

  const fromAccount = sourceList.find((a) => String(getAccountId(a)) === String(fromId));
  const toAccount = destList.find((a) => String(getAccountId(a)) === String(toId));

  function validate() {
    let amountErr = validatePositiveAmount(amount);
    if (!amountErr && fromAccount && Number(amount) > Number(fromAccount.balance)) {
      amountErr = 'Amount exceeds available balance.';
    }
    const next = {
      fromId: fromId ? '' : 'Select a source account.',
      toId: !toId ? 'Select a destination account.' : toId === fromId ? 'Source and destination must differ.' : '',
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

  async function confirmTransfer() {
    setProcessing(true);
    try {
      let result;
      try {
        result = await transferFunds({
          sourceAccountId: Number(fromId),
          targetAccountId: Number(toId),
          amount: Number(amount)
        });
      } catch (primaryErr) {
        result = await transferFundsByIds(fromId, toId, Number(amount));
      }
      setReceipt({
        amount: Number(amount),
        from: fromAccount,
        to: toAccount,
        reference: result?.transactionId || result?.id || `TXN-${Date.now()}`,
        date: new Date()
      });
      setConfirmOpen(false);
      toast.success('Transfer completed successfully!');
    } catch (e2) {
      toast.error(e2.friendlyMessage || 'Transfer failed.');
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
          <div className="receipt-icon">⇄</div>
          <h2>Transfer Complete</h2>
          <p className="receipt-amount mono">{formatCurrency(receipt.amount)}</p>
          <div className="receipt-detail-row">
            <span className="text-muted">From</span>
            <span className="mono">{maskAccountNumber(getAccountId(receipt.from))}</span>
          </div>
          <div className="receipt-detail-row">
            <span className="text-muted">To</span>
            <span className="mono">{maskAccountNumber(getAccountId(receipt.to))}</span>
          </div>
          <div className="receipt-detail-row">
            <span className="text-muted">Reference</span>
            <span className="mono">{receipt.reference}</span>
          </div>
          <div className="receipt-detail-row">
            <span className="text-muted">Date</span>
            <span>{receipt.date.toLocaleString()}</span>
          </div>
          <div className="form-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => setReceipt(null)}>
              Make another transfer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sourceList.length < 1) {
    return (
      <div className="page fade-in">
        <EmptyState icon="⇄" title="No accounts available" message="You need at least one account to make a transfer." />
      </div>
    );
  }

  return (
    <div className="page fade-in form-page">
      <div className="page-header">
        <div>
          <h1>Transfer Money</h1>
          <p>Move funds from your account to any account on the platform.</p>
        </div>
      </div>

      <div className="card card-pad form-card slide-up">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="fromId">From account</label>
            <select
              id="fromId"
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                setErrors((err) => ({ ...err, fromId: '' }));
              }}
              className={errors.fromId ? 'has-error' : ''}
            >
              <option value="">Select source account</option>
              {sourceList.map((a) => (
                <option key={getAccountId(a)} value={getAccountId(a)}>
                  {maskAccountNumber(getAccountId(a))} — {formatCurrency(a.balance)}
                </option>
              ))}
            </select>
            {errors.fromId && <p className="field-error">{errors.fromId}</p>}
          </div>

          <div className="field">
            <label htmlFor="toId">To account</label>
            <select
              id="toId"
              value={toId}
              onChange={(e) => {
                setToId(e.target.value);
                setErrors((err) => ({ ...err, toId: '' }));
              }}
              className={errors.toId ? 'has-error' : ''}
            >
              <option value="">Select destination account</option>
              {destList.map((a) => (
                <option key={getAccountId(a)} value={getAccountId(a)}>
                  {maskAccountNumber(getAccountId(a))} — {getAccountHolderName(a)} — {formatCurrency(a.balance)}
                </option>
              ))}
            </select>
            {errors.toId && <p className="field-error">{errors.toId}</p>}
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

          <div className="field">
            <label htmlFor="note">Note (optional)</label>
            <input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Rent, savings top-up" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Review Transfer
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm transfer"
        message={`Transfer ${formatCurrency(amount || 0)} from ${maskAccountNumber(getAccountId(fromAccount))} to ${maskAccountNumber(getAccountId(toAccount))}?`}
        confirmLabel="Confirm Transfer"
        tone="primary"
        loading={processing}
        onConfirm={confirmTransfer}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

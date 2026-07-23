import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { addAccount, getBanks } from '../services/accountService';
import { useToast } from '../context/ToastContext';
import { validateName, validatePositiveAmount } from '../utils/validators';
import Loader from '../components/Loader';
import './FormPage.css';

export default function CreateAccount() {
  const [form, setForm] = useState({ accountHolderName: '', bankId: '', initialDeposit: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { data: banks, loading: banksLoading } = useFetch(getBanks, []);
  const toast = useToast();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  }

  function validate() {
    const next = {
      accountHolderName: validateName(form.accountHolderName),
      bankId: form.bankId ? '' : 'Please select a bank.',
      initialDeposit: form.initialDeposit === '' ? '' : validatePositiveAmount(form.initialDeposit)
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addAccount({
        accountHolderName: form.accountHolderName,
        bankId: Number(form.bankId),
        balance: form.initialDeposit ? Number(form.initialDeposit) : 0
      });
      toast.success('Account request submitted. Awaiting admin approval.');
      navigate('/accounts');
    } catch (e2) {
      toast.error(e2.friendlyMessage || 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  }

  if (banksLoading) return <Loader fullPage label="Loading banks…" />;

  return (
    <div className="page fade-in form-page">
      <div className="page-header">
        <div>
          <h1>Create a New Account</h1>
          <p>Set up a new account in seconds.</p>
        </div>
      </div>

      <div className="card card-pad form-card slide-up">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="accountHolderName">Account holder name</label>
            <input
              id="accountHolderName"
              name="accountHolderName"
              value={form.accountHolderName}
              onChange={handleChange}
              className={errors.accountHolderName ? 'has-error' : ''}
              placeholder="Jane Doe"
            />
            {errors.accountHolderName && <p className="field-error">{errors.accountHolderName}</p>}
          </div>

          <div className="field">
            <label htmlFor="bankId">Bank</label>
            <select
              id="bankId"
              name="bankId"
              value={form.bankId}
              onChange={handleChange}
              className={errors.bankId ? 'has-error' : ''}
            >
              <option value="">Select a bank</option>
              {(banks || []).map((b) => (
                <option key={b.bankId || b.id} value={b.bankId || b.id}>
                  {b.bankName}{b.branch ? ` — ${b.branch}` : ''}
                </option>
              ))}
            </select>
            {errors.bankId && <p className="field-error">{errors.bankId}</p>}
            {!banks?.length && (
              <p className="field-hint">No banks available yet. Ask an admin to add partner banks first.</p>
            )}
          </div>

          <div className="field input-prefix">
            <label htmlFor="initialDeposit">Initial deposit (optional)</label>
            <span className="prefix-symbol">$</span>
            <input
              id="initialDeposit"
              name="initialDeposit"
              type="number"
              min="0"
              step="0.01"
              value={form.initialDeposit}
              onChange={handleChange}
              className={errors.initialDeposit ? 'has-error' : ''}
              placeholder="0.00"
            />
            {errors.initialDeposit && <p className="field-error">{errors.initialDeposit}</p>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/accounts')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !banks?.length}>
              {submitting ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getBanks, createBank } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { validateName } from '../utils/validators';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import './Banks.css';

export default function Banks() {
  const { data: banks, loading, error, setData } = useFetch(getBanks, []);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ bankName: '', branch: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  }

  function validate() {
    const next = { bankName: validateName(form.bankName) };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const newBank = await createBank({
        bankName: form.bankName,
        branch: form.branch || undefined
      });
      toast.success('Bank added successfully.');
      setData((prev) => [...(prev || []), newBank]);
      setModalOpen(false);
      setForm({ bankName: '', branch: '' });
    } catch (e2) {
      toast.error(e2.friendlyMessage || 'Could not create bank.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Partner Banks</h1>
          <p>Manage the banks connected to your platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Add Bank
        </button>
      </div>

      {loading ? (
        <Loader fullPage label="Loading banks…" />
      ) : error ? (
        <EmptyState icon="!" title="Couldn't load banks" message={error} />
      ) : !banks?.length ? (
        <EmptyState
          icon="🏦"
          title="No banks yet"
          message="Add your first partner bank to get started."
          action={
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              Add Bank
            </button>
          }
        />
      ) : (
        <div className="grid grid-3">
          {banks.map((b, i) => (
            <div key={b.bankId || b.id || i} className="bank-card slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="bank-card-icon">🏦</div>
              <div>
                <p className="bank-card-name">{b.bankName}</p>
                <p className="bank-card-code mono text-muted">{b.branch || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add a new bank"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Bank'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} noValidate>
          <div className="field">
            <label htmlFor="bankName">Bank name</label>
            <input
              id="bankName"
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              className={errors.bankName ? 'has-error' : ''}
              placeholder="e.g. First National Bank"
            />
            {errors.bankName && <p className="field-error">{errors.bankName}</p>}
          </div>
          <div className="field">
            <label htmlFor="branch">Branch</label>
            <input id="branch" name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. Downtown" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

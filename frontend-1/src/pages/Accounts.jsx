import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { getMyAccounts, deleteAccount, depositToAccount, withdrawFromAccount } from '../services/accountService';
import { useToast } from '../context/ToastContext';
import AccountCard from '../components/AccountCard';
import SearchBox from '../components/SearchBox';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { validatePositiveAmount } from '../utils/validators';
import { formatCurrency, maskAccountNumber, getAccountId, getAccountHolderName } from '../utils/formatters';
import './Accounts.css';

const SORT_OPTIONS = [
  { value: 'balance-desc', label: 'Balance: High to Low' },
  { value: 'balance-asc', label: 'Balance: Low to High' },
  { value: 'name-asc', label: 'Name: A to Z' }
];

export default function Accounts() {
  const { data: accounts, loading, error, setData, refetch } = useFetch(getMyAccounts, []);
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('balance-desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [quickAction, setQuickAction] = useState(null); // { type: 'deposit'|'withdraw', account }
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [processing, setProcessing] = useState(false);

  const filtered = useMemo(() => {
    let list = accounts || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) =>
        String(getAccountId(a)).toLowerCase().includes(q) ||
        getAccountHolderName(a).toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === 'balance-desc') return (b.balance || 0) - (a.balance || 0);
      if (sort === 'balance-asc') return (a.balance || 0) - (b.balance || 0);
      if (sort === 'name-asc') {
        return getAccountHolderName(a).localeCompare(getAccountHolderName(b));
      }
      return 0;
    });
    return sorted;
  }, [accounts, query, sort]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6);

  function openQuickAction(type, account) {
    setQuickAction({ type, account });
    setAmount('');
    setAmountError('');
  }

  async function confirmQuickAction() {
    const err = validatePositiveAmount(amount);
    setAmountError(err);
    if (err) return;
    setProcessing(true);
    try {
      const id = getAccountId(quickAction.account);
      if (quickAction.type === 'deposit') {
        await depositToAccount(id, Number(amount));
        toast.success(`Deposited ${formatCurrency(amount)} successfully.`);
      } else {
        await withdrawFromAccount(id, Number(amount));
        toast.success(`Withdrew ${formatCurrency(amount)} successfully.`);
      }
      setQuickAction(null);
      refetch();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Transaction failed.');
    } finally {
      setProcessing(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const id = getAccountId(deleteTarget);
      await deleteAccount(id);
      toast.success('Account deleted.');
      setData((prev) => (prev || []).filter((a) => getAccountId(a) !== id));
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not delete account.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Your Accounts</h1>
          <p>View balances, manage funds, and keep track of every account.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}>
          + Create Account
        </button>
      </div>

      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search by account number or name…" />
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader fullPage label="Loading your accounts…" />
      ) : error ? (
        <EmptyState icon="!" title="Couldn't load accounts" message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="▤"
          title="No accounts found"
          message={query ? 'Try a different search term.' : 'Create your first account to get started.'}
          action={
            !query && (
              <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}>
                Create Account
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-3">
            {pageItems.map((acc, i) => (
              <AccountCard
                key={getAccountId(acc)}
                account={acc}
                delay={i * 50}
                onDeposit={(a) => openQuickAction('deposit', a)}
                onWithdraw={(a) => openQuickAction('withdraw', a)}
                onTransfer={() => navigate('/transfer')}
                onDelete={(a) => setDeleteTarget(a)}
                onView={(a) => toast.info(`Account ${maskAccountNumber(getAccountId(a))} — ${formatCurrency(a.balance)}`)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={!!quickAction}
        onClose={() => setQuickAction(null)}
        title={quickAction?.type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setQuickAction(null)} disabled={processing}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={confirmQuickAction} disabled={processing}>
              {processing ? 'Processing…' : 'Confirm'}
            </button>
          </>
        }
      >
        <div className="field input-prefix">
          <label htmlFor="qa-amount">Amount</label>
          <span className="prefix-symbol">$</span>
          <input
            id="qa-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountError('');
            }}
            className={amountError ? 'has-error' : ''}
            placeholder="0.00"
            autoFocus
          />
          {amountError && <p className="field-error">{amountError}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this account?"
        message="This action cannot be undone. All account history will remain, but the account will be permanently removed."
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

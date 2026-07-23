import React, { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { getMyTransactions } from '../services/transactionService';
import SearchBox from '../components/SearchBox';
import TransactionTable from '../components/TransactionTable';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  getTxType,
  getTxTime,
  getTxAccountLabel,
  isCreditTransaction,
  isDebitTransaction
} from '../utils/formatters';
import './Transactions.css';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' }
];

export default function Transactions() {
  const { data: transactions, loading, error } = useFetch(getMyTransactions, []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date-desc');

  const filtered = useMemo(() => {
    let list = transactions || [];
    if (filter !== 'all') {
      list = list.filter((tx) => (filter === 'credit' ? isCreditTransaction(tx) : isDebitTransaction(tx)));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (tx) =>
          String(getTxAccountLabel(tx)).toLowerCase().includes(q) ||
          getTxType(tx).toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === 'date-desc') return new Date(getTxTime(b)) - new Date(getTxTime(a));
      if (sort === 'date-asc') return new Date(getTxTime(a)) - new Date(getTxTime(b));
      if (sort === 'amount-desc') return Math.abs(b.amount) - Math.abs(a.amount);
      if (sort === 'amount-asc') return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });
    return sorted;
  }, [transactions, query, filter, sort]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 10);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Transaction History</h1>
          <p>Every deposit, withdrawal, and transfer across your accounts.</p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search transactions…" />
        <div className="filter-chips">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-chip ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </select>
      </div>

      {loading ? (
        <Loader fullPage label="Loading transactions…" />
      ) : error ? (
        <EmptyState icon="!" title="Couldn't load transactions" message={error} />
      ) : (
        <>
          <TransactionTable transactions={pageItems} showAccount />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { getAdminTransactions } from '../services/adminService';
import SearchBox from '../components/SearchBox';
import Pagination from '../components/Pagination';
import TransactionTable from '../components/TransactionTable';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getTxType, getTxAccountLabel } from '../utils/formatters';

export default function AdminTransactions() {
  const { data: transactions, loading, error } = useFetch(getAdminTransactions, []);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = transactions || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (tx) =>
          String(getTxAccountLabel(tx)).toLowerCase().includes(q) ||
          getTxType(tx).toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, query]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 10);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>All Transactions</h1>
          <p>Platform-wide transaction activity.</p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search transactions…" />
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

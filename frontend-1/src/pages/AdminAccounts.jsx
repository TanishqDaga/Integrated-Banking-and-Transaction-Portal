import React, { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { getAdminAccounts } from '../services/adminService';
import SearchBox from '../components/SearchBox';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, maskAccountNumber, getAccountId, getAccountHolderName } from '../utils/formatters';
import './AdminTables.css';

const STATUS_TONE = {
  ACTIVE: 'success',
  APPROVED: 'success',
  PENDING: 'warning',
  INACTIVE: 'error',
  BLOCKED: 'error'
};

export default function AdminAccounts() {
  const { data: accounts, loading, error } = useFetch(getAdminAccounts, []);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('balance-desc');

  const filtered = useMemo(() => {
    let list = accounts || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          String(getAccountId(a)).toLowerCase().includes(q) ||
          getAccountHolderName(a).toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === 'balance-desc') return (b.balance || 0) - (a.balance || 0);
      if (sort === 'balance-asc') return (a.balance || 0) - (b.balance || 0);
      return 0;
    });
  }, [accounts, query, sort]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>All Accounts</h1>
          <p>Every account across the platform, in one place.</p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search by account number or holder…" />
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="balance-desc">Balance: High to Low</option>
          <option value="balance-asc">Balance: Low to High</option>
        </select>
      </div>

      {loading ? (
        <Loader fullPage label="Loading accounts…" />
      ) : error ? (
        <EmptyState icon="!" title="Couldn't load accounts" message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="▤" title="No accounts found" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="nimbus-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Holder</th>
                  <th>Bank</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((a) => {
                  const status = (a.status || 'PENDING').toUpperCase();
                  return (
                    <tr key={getAccountId(a)}>
                      <td className="mono">{maskAccountNumber(getAccountId(a))}</td>
                      <td>{getAccountHolderName(a)}</td>
                      <td>{a.bank?.bankName || '—'}</td>
                      <td>
                        <span className={`badge badge-${STATUS_TONE[status] || 'neutral'}`}>{status}</span>
                      </td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(a.balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

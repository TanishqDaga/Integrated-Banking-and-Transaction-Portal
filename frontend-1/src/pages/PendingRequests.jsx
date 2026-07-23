import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getPendingAccountRequests, approveAccount } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, maskAccountNumber, getAccountId, getAccountHolderName } from '../utils/formatters';
import './AdminTables.css';

export default function PendingRequests() {
  const { data: requests, loading, error, setData } = useFetch(getPendingAccountRequests, []);
  const toast = useToast();
  const [approvingId, setApprovingId] = useState(null);

  async function handleApprove(req) {
    const id = getAccountId(req);
    setApprovingId(id);
    try {
      await approveAccount(id);
      toast.success('Account request approved.');
      setData((prev) => (prev || []).filter((r) => getAccountId(r) !== id));
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not approve request.');
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Pending Account Requests</h1>
          <p>New account requests awaiting your approval.</p>
        </div>
      </div>

      {loading ? (
        <Loader fullPage label="Loading requests…" />
      ) : error ? (
        <EmptyState icon="!" title="Couldn't load requests" message={error} />
      ) : !requests?.length ? (
        <EmptyState icon="⏳" title="All caught up" message="There are no pending account requests right now." />
      ) : (
        <div className="table-wrap">
          <table className="Integrated-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Holder</th>
                <th>Bank</th>
                <th style={{ textAlign: 'right' }}>Initial Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const id = getAccountId(req);
                return (
                  <tr key={id}>
                    <td className="mono">{maskAccountNumber(id)}</td>
                    <td>{getAccountHolderName(req)}</td>
                    <td>{req.bank?.bankName || '—'}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>
                      {formatCurrency(req.balance)}
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(req)}
                        disabled={approvingId === id}
                      >
                        {approvingId === id ? 'Approving…' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

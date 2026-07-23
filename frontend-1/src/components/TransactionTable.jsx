import React from 'react';
import {
  formatCurrency,
  formatDateTime,
  getTxId,
  getTxType,
  getTxTime,
  getTxAccountLabel,
  isCreditTransaction
} from '../utils/formatters';
import EmptyState from './EmptyState';
import './TransactionTable.css';

export default function TransactionTable({ transactions = [], showAccount = false }) {
  if (!transactions.length) {
    return <EmptyState title="No transactions yet" message="Your transaction history will show up here." icon="≡" />;
  }

  return (
    <div className="table-wrap">
      <table className="nimbus-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            {showAccount && <th>Account</th>}
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const type = getTxType(tx);
            const isCredit = isCreditTransaction(tx);
            return (
              <tr key={getTxId(tx)}>
                <td className="text-muted">{formatDateTime(getTxTime(tx))}</td>
                <td>{type || '—'}</td>
                {showAccount && <td className="mono">{getTxAccountLabel(tx)}</td>}
                <td
                  className={`mono ${isCredit ? 'text-success' : 'text-error'}`}
                  style={{ textAlign: 'right', fontWeight: 700 }}
                >
                  {isCredit ? '+' : '−'} {formatCurrency(Math.abs(tx.amount))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

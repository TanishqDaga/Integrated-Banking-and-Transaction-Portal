import React, { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { getAllUsers, deleteUser } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import SearchBox from '../components/SearchBox';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { initials, getUserId } from '../utils/formatters';
import './AdminTables.css';

export default function AdminUsers() {
  const { data: users, loading, error, setData } = useFetch(getAllUsers, []);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = users || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((u) => (u.username || '').toLowerCase().includes(q));
    }
    return list;
  }, [users, query]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);

  async function confirmDelete() {
    const targetId = getUserId(target);
    setDeleting(true);
    try {
      await deleteUser(targetId);
      toast.success('User deleted.');
      setData((prev) => (prev || []).filter((u) => getUserId(u) !== targetId));
      setTarget(null);
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not delete user.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage everyone registered on the platform.</p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search users…" />
      </div>

      {loading ? (
        <Loader fullPage label="Loading users…" />
      ) : error ? (
        <EmptyState icon="!" title="Couldn't load users" message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="👤" title="No users found" message="Try adjusting your search." />
      ) : (
        <>
          <div className="table-wrap">
            <table className="nimbus-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => (
                  <tr key={getUserId(u)}>
                    <td>
                      <div className="user-cell">
                        <span className="user-avatar">{initials(u.username)}</span>
                        {u.username || '—'}
                      </div>
                    </td>
                    <td className="mono">{u.username}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-neutral'}`}>
                        {u.role || 'CUSTOMER'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setTarget(u)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!target}
        title="Delete this user?"
        message={`This will permanently remove ${target?.username} from the platform.`}
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address: {
    city: string;
    street?: string;
    zipcode?: string;
  };
  street?: string;
  city?: string;
  zip?: string;
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    const html = document.documentElement;
    const currentlyDark = html.classList.contains('dark');
    if (currentlyDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  }, []);

  return [isDark, toggle, mounted] as const;
}

const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [darkMode, toggleDarkMode, mounted] = useDarkMode();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        let localUsers: User[] = [];
        if (typeof window !== 'undefined') {
          localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
        }
        const mappedLocalUsers = localUsers.map((u) => ({
          ...u,
          phone: u.phone || '-',
          address: { city: u.city || '-', street: u.street || '-', zipcode: u.zip || '-' },
        }));
        setUsers([...data, ...mappedLocalUsers]);
        setFilteredUsers([...data, ...mappedLocalUsers]);
      } catch (err: unknown) {
        setError((err as Error).message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.address?.city.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    let isLocal = false;
    if (typeof userToDelete.id === 'number' && userToDelete.id > 1000) isLocal = true;

    if (isLocal) {
      const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const updated = localUsers.filter((u: User) => u.id !== userToDelete.id);
      localStorage.setItem('localUsers', JSON.stringify(updated));
    }
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setFilteredUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));

    toast.success('User deleted successfully!');

    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleUpdate = (user: User) => {
    setSelectedUser(user);
    setEditUser(user);
    setEditMode(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editUser) return;
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value, address: { ...editUser.address, [name]: value } });
  };

  const handleEditSave = () => {
    if (!editUser) return;
    let isLocal = false;
    if (typeof editUser.id === 'number' && editUser.id > 1000) isLocal = true;
    if (isLocal) {
      const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const updated = localUsers.map((u: User) => (u.id === editUser.id ? {
        ...u,
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        street: editUser.address?.street || editUser.street,
        city: editUser.address?.city || editUser.city,
        zip: editUser.address?.zipcode || editUser.zip,
      } : u));
      localStorage.setItem('localUsers', JSON.stringify(updated));
    }
    setUsers((prev) => prev.map((u) => (u.id === editUser.id ? {
      ...u,
      name: editUser.name,
      email: editUser.email,
      phone: editUser.phone,
      address: {
        city: ((editUser.address && editUser.address.city) || editUser.city || '') as string,
        street: ((editUser.address && editUser.address.street) || editUser.street || '') as string,
        zipcode: ((editUser.address && editUser.address.zipcode) || editUser.zip || '') as string,
      },
      street: (editUser.address && editUser.address.street) || editUser.street || '',
      city: (editUser.address && editUser.address.city) || editUser.city || '',
      zip: (editUser.address && editUser.address.zipcode) || editUser.zip || '',
    } : u)));
    setFilteredUsers((prev) => prev.map((u) => (u.id === editUser.id ? {
      ...u,
      name: editUser.name,
      email: editUser.email,
      phone: editUser.phone,
      address: {
        city: ((editUser.address && editUser.address.city) || editUser.city || '') as string,
        street: ((editUser.address && editUser.address.street) || editUser.street || '') as string,
        zipcode: ((editUser.address && editUser.address.zipcode) || editUser.zip || '') as string,
      },
      street: (editUser.address && editUser.address.street) || editUser.street || '',
      city: (editUser.address && editUser.address.city) || editUser.city || '',
      zip: (editUser.address && editUser.address.zipcode) || editUser.zip || '',
    } : u)));

    toast.success('User updated successfully!');

    setEditMode(false);
    setSelectedUser(null);
    setEditUser(null);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditUser(null);
    setSelectedUser(null);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.45, ease: [0.4, 0.2, 0.2, 1] }}
      >
        <div className="min-h-screen py-12 px-2" style={{ background: 'var(--bg)', transition: 'background 0.3s ease' }}>
          <div className="max-w-5xl mx-auto card rounded-3xl shadow-xl p-8 md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>User Dashboard</h1>
              <div className="flex items-center gap-3">
                {mounted && (
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full border transition-colors duration-300 ease-in-out"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    title="Toggle dark mode"
                  >
                    {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                  </button>
                )}
                <a
                  href="/dashboard/add"
                  className="inline-block accent px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-transform duration-300 ease-in-out font-semibold text-lg"
                >
                  + Add User
                </a>
              </div>
            </div>
            <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
              <input
                type="text"
                placeholder="Search by name or city..."
                className="border rounded-lg px-4 py-2 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-300 ease-in-out"
                style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="text-center py-20 text-xl animate-pulse" style={{ color: 'var(--fg)' }}>Loading users...</div>
            ) : error ? (
              <div className="text-center py-20 text-xl text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border shadow-lg" style={{ borderColor: 'var(--border)' }}>
                <table className="min-w-full text-left" style={{ color: 'var(--fg)' }}>
                  <thead style={{ background: 'var(--bg)', color: 'var(--fg)', borderBottom: '2px solid var(--border)' }}>
                    <tr>
                      <th className="py-4 px-4 font-semibold">Name</th>
                      <th className="py-4 px-4 font-semibold">Email</th>
                      <th className="py-4 px-4 font-semibold">Phone</th>
                      <th className="py-4 px-4 font-semibold">City</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredUsers.length === 0 ? (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan={4} className="text-center py-6 text-gray-500" style={{ color: 'var(--fg)' }}>No users found.</td>
                        </motion.tr>
                      ) : (
                        filteredUsers.map((user, idx) => (
                          <motion.tr
                            key={user.id}
                            className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-100 dark:bg-gray-800"} hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer group`}
                            style={{ background: 'var(--card)' }}
                            onClick={() => setSelectedUser(user)}
                            onMouseEnter={() => setHoveredRow(user.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{ scale: 1.02, zIndex: 1 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ delay: idx * 0.03, type: 'spring', stiffness: 100 }}
                            layout
                          >
                            <td className="py-3 px-4 border-b" style={{ borderColor: 'var(--border)' }}>{user.name}</td>
                            <td className="py-3 px-4 border-b" style={{ borderColor: 'var(--border)' }}>{user.email}</td>
                            <td className="py-3 px-4 border-b" style={{ borderColor: 'var(--border)' }}>{user.phone}</td>
                            <td className="py-3 px-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                              {user.address.city}
                              {hoveredRow === user.id && (
                                <span className="ml-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <button
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500 p-1 rounded-full bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 transition"
                                    onClick={e => { e.stopPropagation(); handleUpdate(user); }}
                                    title="Update"
                                  >
                                    <FaPencilAlt size={16} />
                                  </button>
                                  <button
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 p-1 rounded-full bg-red-100 dark:bg-gray-700 hover:bg-red-200 dark:hover:bg-gray-600 transition"
                                    onClick={e => { e.stopPropagation(); handleDelete(user); }}
                                    title="Delete"
                                  >
                                    <FaTrash size={16} />
                                  </button>
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <AnimatePresence>
            {selectedUser && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="card rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  layout
                >
                  <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none transition"
                    onClick={() => { setSelectedUser(null); setEditMode(false); setEditUser(null); }}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--fg)' }}>{editMode ? 'Edit User' : selectedUser.name}</h2>
                  {editMode && editUser ? (
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Name</label>
                        <input name="name" value={editUser.name} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out" style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)' }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Email</label>
                        <input name="email" value={editUser.email} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out" style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)' }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Phone</label>
                        <input name="phone" value={editUser.phone || ''} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out" style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)' }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Street</label>
                        <input name="street" value={editUser.address.street || editUser.street || ''} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out" style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)' }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>City</label>
                        <input name="city" value={editUser.address.city || editUser.city || ''} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out" style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)' }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Zip</label>
                        <input name="zip" value={editUser.address.zipcode || editUser.zip || ''} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out" style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--fg)' }} />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleEditCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors duration-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg accent hover:opacity-90 transition-opacity duration-200 font-semibold">Save</button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3" style={{ color: 'var(--fg)' }}>
                      <div><span className="font-semibold">Email:</span> {selectedUser.email}</div>
                      <div><span className="font-semibold">Phone:</span> {selectedUser.phone}</div>
                      <div><span className="font-semibold">Street:</span> {selectedUser.address.street || selectedUser.street || '-'}</div>
                      <div><span className="font-semibold">City:</span> {selectedUser.address.city || selectedUser.city || '-'}</div>
                      <div><span className="font-semibold">Zip:</span> {selectedUser.address.zipcode || selectedUser.zip || '-'}</div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {showDeleteConfirm && userToDelete && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="card rounded-lg shadow-xl p-6 w-full max-w-sm relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--fg)' }}>Confirm Deletion</h2>
                <p className="mb-6" style={{ color: 'var(--fg)' }}>
                  Are you sure you want to permanently delete user:
                  <br />
                  <span className="font-semibold">{userToDelete.name}</span>?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardPage; 
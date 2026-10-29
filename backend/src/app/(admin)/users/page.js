'use client';

import { useEffect, useState } from 'react';
import {
  getAdminUsers,
  createAdminUser,
  toggleAdminUser,
  toggleAdminUserRole,
  deleteAdminUser,
  decryptAdminUserPassword,
  updateAdminUserPassword,
  generateAdminUserResetLink,
  getCachedAdminUser,
} from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';
import PasswordStrengthIndicator, { evaluatePasswordRules } from '../PasswordStrengthIndicator.js';

export default function AdminUsersPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Decrypted Password State
  const [decryptedModalOpen, setDecryptedModalOpen] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decryptingId, setDecryptingId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Change Password Modal State (Super Admin Privilege)
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [targetUserForPassword, setTargetUserForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Unique Reset Link Modal State
  const [resetLinkModalOpen, setResetLinkModalOpen] = useState(false);
  const [resetLinkData, setResetLinkData] = useState(null);
  const [generatingResetLinkId, setGeneratingResetLinkId] = useState(null);
  const [resetLinkCopied, setResetLinkCopied] = useState(false);

  // Form State for creating a new user
  const initialForm = {
    name: '',
    email: '',
    role: 'user',
    password: '',
  };
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminUsers();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setUsers(list);
      setCurrentUser(getCachedAdminUser());
    } catch (err) {
      setError(err.message || 'Failed to fetch administrator accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    const pass = form.password;

    if (!cleanName || !cleanEmail || !pass) {
      setModalError('Please fill out all required fields.');
      return;
    }

    // 1. Strict Email Format & Existence Checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      setModalError('Please enter a valid email address format.');
      return;
    }

    const [localPart, domain] = cleanEmail.split('@');
    if (!domain || !domain.includes('.')) {
      setModalError('The email domain is invalid or does not exist.');
      return;
    }

    // Common typo domains
    const typoDomains = {
      'gamil.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gnail.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'icld.com': 'icloud.com',
    };
    if (typoDomains[domain]) {
      setModalError(`The email domain "@${domain}" does not exist. Did you mean "@${typoDomains[domain]}"?`);
      return;
    }

    // Block random keyboard mashes like mkjwnd, asdfgh (5+ letters without any vowels)
    if (/^[a-z]{5,}$/i.test(localPart) && !/[aeiouy]/i.test(localPart)) {
      setModalError('This email address appears to be invalid or non-existent.');
      return;
    }

    // Block repetitive sequences like aaaaaa, 111111
    if (/(.)\1{4,}/.test(localPart)) {
      setModalError('The email username contains invalid repetitive sequences.');
      return;
    }

    // 2. 8 Enterprise Password Security Rules Check
    const evaluation = evaluatePasswordRules(pass, cleanEmail);

    if (pass.length < 8) {
      setModalError('Password must be at least 8 characters long (Security Rule 1).');
      return;
    }

    if (evaluation.metCount < 4) {
      setModalError('Password is too weak. Please fulfill at least 4 of the 8 enterprise security rules (uppercase, lowercase, numbers, symbols).');
      return;
    }

    setActionLoading(true);
    try {
      await createAdminUser({
        name: cleanName,
        email: cleanEmail,
        role: form.role || 'user',
        password: pass,
      });
      setModalOpen(false);
      setForm(initialForm);
      setShowPassword(false);
      showToast(
        `User account "${cleanEmail}" (${form.role === 'admin' ? 'Administrator' : 'Standard User'}) created successfully!`
      );
      const updated = await getAdminUsers();
      setUsers(updated || []);
    } catch (err) {
      setModalError(err.message || 'Failed to create user account.');
    } finally {
      setActionLoading(false);
    }
  };

  const isSuperAdminUser = (u) => Boolean(
    u?.is_super_admin ||
    u?.role === 'super_admin' ||
    u?.email?.toLowerCase() === 'md.asif2412@gmail.com' ||
    u?.email?.toLowerCase() === 'mrrashidsaikh0365@gmail.com'
  );

  const isCurrentUserSuperAdmin = isSuperAdminUser(currentUser);

  const handleToggleRole = async (user) => {
    const isTargetSuper = isSuperAdminUser(user);

    // Normal admin cannot alter Super Admin role
    if (isTargetSuper && !isCurrentUserSuperAdmin) {
      showToast('Permission denied. Normal administrators cannot alter Super Administrator roles.', 'error');
      return;
    }

    if (user.email === 'md.asif2412@gmail.com' || user.email === 'mrrashidsaikh0365@gmail.com') {
      showToast('The primary Super Administrator role cannot be altered.', 'error');
      return;
    }

    if (changingRoleId === user.id) return;

    setChangingRoleId(user.id);
    const prevRole = user.role || 'user';
    const nextRole = prevRole === 'admin' ? 'user' : 'admin';

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
    );

    try {
      await toggleAdminUserRole(user.id);
      showToast(
        `Account role switched to ${nextRole === 'admin' ? 'Administrator' : 'Standard User'}!`,
        'success'
      );
    } catch (err) {
      // Revert if failed
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: prevRole } : u))
      );
      showToast(err.message || 'Failed to update user role.', 'error');
    } finally {
      setChangingRoleId(null);
    }
  };

  const handleToggle = async (user) => {
    // 1. Strict check: Cannot deactivate self
    const isSelf = currentUser && (
      currentUser.id === user.id ||
      String(currentUser.email).toLowerCase() === String(user.email).toLowerCase()
    );
    if (isSelf) {
      showToast('You cannot deactivate your own account. You can only log out from the top-right menu.', 'error');
      return;
    }

    // Normal admin cannot deactivate Super Admin
    if (isSuperAdminUser(user) && !isCurrentUserSuperAdmin) {
      showToast('Permission denied. Normal administrators cannot deactivate Super Administrator accounts.', 'error');
      return;
    }

    if (togglingUserId === user.id) return;
    setTogglingUserId(user.id);

    const prevStatus = Boolean(user.is_active);
    const nextStatus = !prevStatus;

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u))
    );

    try {
      await toggleAdminUser(user.id);
      showToast(
        `Account "${user.email}" is now ${nextStatus ? 'Active' : 'Inactive'}.`,
        'success'
      );
    } catch (err) {
      // Revert if failed
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: prevStatus } : u))
      );
      showToast(err.message || 'Failed to toggle account status.', 'error');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    const email = userToDelete.email;

    if (isSuperAdminUser(userToDelete) && !isCurrentUserSuperAdmin) {
      showToast('Permission denied. Normal administrators cannot delete Super Administrator accounts.', 'error');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }

    setActionLoading(true);
    try {
      await deleteAdminUser(targetId);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      showToast(`Administrator account "${email}" has been removed.`, 'success');
    } catch (err) {
      if (
        err.message?.includes('No query results') ||
        err.message?.includes('not found') ||
        err.message?.includes('already removed')
      ) {
        setDeleteModalOpen(false);
        setUserToDelete(null);
        setUsers((prev) => prev.filter((u) => u.id !== targetId));
        showToast(`Administrator account "${email}" has been removed.`, 'success');
      } else {
        showToast(err.message || 'Failed to delete user.', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecryptPassword = async (user) => {
    const isSelf = currentUser && (
      currentUser.id === user.id ||
      String(currentUser.email).toLowerCase() === String(user.email).toLowerCase()
    );

    if (!isSelf) {
      showToast('Permission denied. You cannot view another user\'s password.', 'error');
      return;
    }

    setDecryptingId(user.id);
    setCopied(false);
    try {
      const data = await decryptAdminUserPassword(user.id);
      setDecryptedData({
        user,
        password: data.decrypted_password,
      });
      setDecryptedModalOpen(true);
    } catch (err) {
      showToast(err.message || 'Encrypted password not found.', 'error');
    } finally {
      setDecryptingId(null);
    }
  };

  const handleCopyPassword = () => {
    if (!decryptedData?.password) return;
    navigator.clipboard.writeText(decryptedData.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Super Admin: Open Change Password Modal
  const handleOpenChangePassword = (user) => {
    if (isSuperAdminUser(user) && !isCurrentUserSuperAdmin) {
      showToast('Permission denied. Normal administrators cannot modify Super Administrator credentials.', 'error');
      return;
    }
    setTargetUserForPassword(user);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordError('');
    setChangePasswordModalOpen(true);
  };

  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');

    if (!newPassword) {
      setChangePasswordError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setChangePasswordError('Password must be at least 8 characters long.');
      return;
    }

    const evaluation = evaluatePasswordRules(newPassword, targetUserForPassword?.email || '');
    if (evaluation.metCount < 4) {
      setChangePasswordError('Password is too weak. Please fulfill at least 4 of the 8 enterprise security rules.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setChangingPassword(true);
    try {
      await updateAdminUserPassword(targetUserForPassword.id, newPassword);
      setChangePasswordModalOpen(false);
      showToast(`Password for "${targetUserForPassword.email}" updated successfully!`, 'success');
      const updated = await getAdminUsers();
      setUsers(updated || []);
    } catch (err) {
      setChangePasswordError(err.message || 'Failed to update user password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Generate Unique Reset Link for User
  const handleGenerateResetLink = async (user) => {
    if (isSuperAdminUser(user) && !isCurrentUserSuperAdmin) {
      showToast('Permission denied. Normal administrators cannot generate reset links for Super Administrators.', 'error');
      return;
    }

    setGeneratingResetLinkId(user.id);
    setResetLinkCopied(false);
    try {
      const data = await generateAdminUserResetLink(user.id);
      setResetLinkData({
        user,
        reset_url: data.reset_url,
        local_url: data.local_url,
        token: data.token,
      });
      setResetLinkModalOpen(true);
    } catch (err) {
      showToast(err.message || 'Failed to generate reset link.', 'error');
    } finally {
      setGeneratingResetLinkId(null);
    }
  };

  const handleCopyResetLink = () => {
    if (!resetLinkData?.reset_url) return;
    navigator.clipboard.writeText(resetLinkData.reset_url);
    setResetLinkCopied(true);
    setTimeout(() => setResetLinkCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCount = users.filter((u) => u.is_active).length;

  const modalSurfaceClass = isLight
    ? 'bg-white/98 border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900'
    : 'bg-[#100f0e]/98 border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]';

  const inputClass = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8b056] focus:ring-[#d8b056]/25'
    : 'bg-[#161513] border-[#292622] text-white placeholder-slate-500 focus:bg-[#1c1a17] focus:border-[#d8b056] focus:ring-[#d8b056]/25';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedbackMsg.text && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-md animate-in fade-in duration-200 ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            User Accounts &amp; Access
          </h1>
          <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Set up and manage user credentials, roles (Admin / User), and account access status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border ${
              isLight ? 'bg-white border-slate-200 text-slate-700 shadow-xs' : 'bg-[#141312] border-[#282520] text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeCount} Active / {users.length} Users</span>
          </div>

          <button
            onClick={() => {
              setModalError('');
              setForm(initialForm);
              setShowPassword(false);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>+ Setup New User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div
        className={`rounded-2xl border overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200/80 shadow-md shadow-slate-100' : 'bg-[#100f0e] border-[#24221e] shadow-xl'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead
              className={`text-xs font-bold uppercase tracking-wider border-b ${
                isLight ? 'bg-slate-50/80 text-slate-500 border-slate-200/80' : 'bg-[#141312] text-slate-400 border-[#24221e]'
              }`}
            >
              <tr>
                <th className="px-5 py-3.5">User Account</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5 text-center">Assigned Role</th>
                <th className="px-5 py-3.5 text-center">Password Security</th>
                <th className="px-5 py-3.5 text-center">Active Status</th>
                <th className="px-5 py-3.5 text-center">Created Date</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100 bg-white' : 'divide-[#24221e] bg-[#100f0e]'}`}>
              {users.map((u) => {
                const isSelf = currentUser && (
                  currentUser.id === u.id ||
                  String(currentUser.email).toLowerCase() === String(u.email).toLowerCase()
                );
                const isRowSuperAdmin = isSuperAdminUser(u);
                const isToggling = togglingUserId === u.id;
                const isChangingRole = changingRoleId === u.id;
                const isGeneratingLink = generatingResetLinkId === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`transition-none ${
                      isLight ? 'bg-white' : 'bg-[#100f0e]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[#080809] font-bold text-xs shadow-md ring-1 ring-[#d8b056]/50 shrink-0"
                          style={{
                            background: isRowSuperAdmin
                              ? 'linear-gradient(135deg, #eedb9f 0%, #d8b056 45%, #c89b3c 100%)'
                              : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                            boxShadow: isRowSuperAdmin ? '0 2px 10px -2px rgba(200, 155, 60, 0.45)' : 'none',
                          }}
                        >
                          {isRowSuperAdmin ? '👑' : (u.name?.charAt(0)?.toUpperCase() || 'U')}
                        </div>
                        <div>
                          <div
                            className="font-bold flex items-center gap-2"
                            style={{ color: isLight ? '#0f172a' : '#faf7f0' }}
                          >
                            <span>{u.name}</span>
                            {isRowSuperAdmin && (
                              <span className="text-[9px] bg-[#d8b056]/20 text-[#d8b056] border border-[#d8b056]/40 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                                Super
                              </span>
                            )}
                            {isSelf && (
                              <span className="text-[10px] bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>ID #{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className={`px-5 py-4 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {u.email}
                    </td>

                    {/* Assigned Role */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {isRowSuperAdmin ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wide border shadow-xs select-none ${
                              isLight
                                ? 'bg-[#d8b056]/20 text-[#876425] border-[#d8b056]/60'
                                : 'bg-[#d8b056]/20 text-[#e4c775] border-[#d8b056]/50'
                            }`}
                            title="Super Administrator (Protected Account)"
                          >
                            <span>👑</span>
                            <span>Super Admin</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!isCurrentUserSuperAdmin || isSelf || isChangingRole}
                            onClick={() => handleToggleRole(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 select-none ${
                              u.role === 'admin'
                                ? isLight
                                  ? 'bg-[#d8b056]/15 hover:bg-[#d8b056]/25 text-[#876425] border-[#d8b056]/40 shadow-xs'
                                  : 'bg-[#d8b056]/15 hover:bg-[#d8b056]/25 text-[#d8b056] border-[#d8b056]/40 shadow-xs'
                                : isLight
                                ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300 shadow-xs'
                                : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border-sky-500/35 shadow-xs'
                            } ${
                              !isCurrentUserSuperAdmin || isSelf
                                ? 'cursor-default opacity-85'
                                : 'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-md'
                            }`}
                            title={
                              !isCurrentUserSuperAdmin
                                ? 'Only Super Admin can change account roles'
                                : isSelf
                                ? 'Current Active Account (Role Locked)'
                                : `Click to switch to ${u.role === 'admin' ? 'User' : 'Admin'}`
                            }
                          >
                            {isChangingRole ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : u.role === 'admin' ? (
                              <>
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>Admin</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>User</span>
                              </>
                            )}

                            {isCurrentUserSuperAdmin && !isSelf && (
                              <svg
                                className="w-3 h-3 opacity-40 hover:opacity-100 transition-opacity ml-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Password Security — Strict Privacy: No user can view another user's password */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {!isSelf ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#181614] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#2b2721]"
                            title="Passwords are encrypted and private. One user cannot view another user's password."
                          >
                            <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Private & Encrypted</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDecryptPassword(u)}
                            disabled={decryptingId === u.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                            title="View your own saved password"
                          >
                            {decryptingId === u.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                            <span>{decryptingId === u.id ? 'Decrypting...' : 'My Password'}</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Active Status — Cannot self-deactivate; can only log out */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggle(u)}
                          disabled={isSelf || isToggling || (isRowSuperAdmin && !isCurrentUserSuperAdmin)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          } ${
                            isSelf || (isRowSuperAdmin && !isCurrentUserSuperAdmin)
                              ? 'opacity-60 cursor-not-allowed'
                              : 'cursor-pointer hover:bg-emerald-500/20'
                          }`}
                          title={
                            isSelf
                              ? 'You cannot deactivate your own account. You can only log out.'
                              : isRowSuperAdmin && !isCurrentUserSuperAdmin
                              ? 'Cannot deactivate Super Administrator'
                              : 'Click to toggle active/inactive'
                          }
                        >
                          {isToggling ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          )}
                          <span>{u.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                        {isSelf && (
                          <span className="text-[10px] text-amber-500 dark:text-amber-400 font-medium tracking-tight">
                            (Your Account)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className={`px-5 py-4 text-xs font-mono text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Actions Column */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Change Password Button (Super Admin can change any password) */}
                        {isCurrentUserSuperAdmin && (
                          <button
                            onClick={() => handleOpenChangePassword(u)}
                            className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                            title="Change this user's password directly (Super Admin)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>
                        )}


                        {/* Delete Account Button */}
                        {!isSelf ? (
                          isRowSuperAdmin && !isCurrentUserSuperAdmin ? (
                            <span
                              className="p-1.5 text-slate-400 opacity-40 cursor-not-allowed"
                              title="Super Administrator account is protected from deletion"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                              title="Remove administrator account"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )
                        ) : (
                          <span className={`text-[11px] font-semibold italic ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>Current</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- MODAL: SETUP NEW USER (COMPACT & SIMPLE) ---------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-5 sm:p-6 my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Setup New User</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Create direct credentials with assigned role.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 ${inputClass}`}
                />
              </div>

              {/* Compact Segmented Role Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Assigned Role *
                </label>
                <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#161513] border border-slate-200/80 dark:border-[#282520]">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'admin' })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      form.role === 'admin'
                        ? 'bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'user' })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      form.role === 'user'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Standard User</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  User Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@hopefairy.com"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 chars (uppercase, numbers, symbols)"
                    className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono border transition-all duration-200 focus:outline-none focus:ring-2 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Compact Password Strength Meter */}
                <PasswordStrengthIndicator
                  password={form.password}
                  email={form.email}
                  isLight={isLight}
                  showChecklistInitially={false}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer flex items-center gap-2"
                >
                  {actionLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>Create User Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: DECRYPTED PASSWORD REVEAL ---------------- */}
      {decryptedModalOpen && decryptedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1 tracking-tight">Decrypted Account Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Retrieved from encrypted credentials in the database.
            </p>

            <div className={`p-4 rounded-2xl border space-y-2 mb-6 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161513] border-[#292622]'}`}>
              <div className="text-xs text-slate-500">
                Account: <span className="font-semibold text-slate-900 dark:text-white">{decryptedData.user.email}</span>
              </div>
              <div className="text-xs text-slate-500">Plaintext Password:</div>
              <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${isLight ? 'bg-white border-[#d8b056]/40' : 'bg-[#1e1c19] border-[#d8b056]/40'}`}>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 select-all">{decryptedData.password}</span>
                <button
                  onClick={handleCopyPassword}
                  className={`text-xs px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDecryptedModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: DELETE USER CONFIRMATION ---------------- */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight">Remove {userToDelete.name}?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Are you sure you want to remove account <strong className="text-rose-500 font-bold">{userToDelete.email}</strong>? They will immediately lose access to the portal.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#24221e]">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Yes, Remove Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CHANGE USER PASSWORD (SUPER ADMIN PRIVILEGE) ---------------- */}
      {changePasswordModalOpen && targetUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#d8b056]/15 border border-[#d8b056]/30 text-[#d8b056] shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Change User Password</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Super Administrator credential override
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Target Account Badge */}
            <div className={`p-3 rounded-2xl border mb-4 flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161513] border-[#292622]'}`}>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account</div>
                <div className="text-xs font-mono font-bold text-[#d8b056] truncate max-w-[220px]">
                  {targetUserForPassword.email}
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                {targetUserForPassword.role || 'user'}
              </span>
            </div>

            {changePasswordError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{changePasswordError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars (uppercase, numbers, symbols)"
                    className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono border transition-all duration-200 focus:outline-none focus:ring-2 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                <PasswordStrengthIndicator
                  password={newPassword}
                  email={targetUserForPassword.email}
                  isLight={isLight}
                  showChecklistInitially={false}
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono border transition-all duration-200 focus:outline-none focus:ring-2 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer flex items-center gap-2"
                >
                  {changingPassword && (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: UNIQUE RESET LINK GENERATOR ---------------- */}
      {resetLinkModalOpen && resetLinkData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${modalSurfaceClass}`}>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-500/15 border border-sky-500/30 text-sky-500 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Unique Password Setup Link</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direct access URL for {resetLinkData.user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Send this unique URL to <strong>{resetLinkData.user.email}</strong>. Opening this link allows them to immediately configure or reset their password without waiting for OTP emails:
              </p>

              {/* Live Production URL Box */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Live Production URL
                </label>
                <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161513] border-[#292622]'}`}>
                  <span className="font-mono text-xs text-[#d8b056] truncate select-all">
                    {resetLinkData.reset_url}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resetLinkData.reset_url);
                      setResetLinkCopied(true);
                      setTimeout(() => setResetLinkCopied(false), 2500);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                      resetLinkCopied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#d8b056] text-[#0b0b0c] hover:brightness-105'
                    }`}
                  >
                    {resetLinkCopied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Local Dev URL Box */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Localhost URL (Development)
                </label>
                <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161513] border-[#292622]'}`}>
                  <span className="font-mono text-xs text-slate-400 truncate select-all">
                    {resetLinkData.local_url}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resetLinkData.local_url);
                      showToast('Localhost link copied!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setResetLinkModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

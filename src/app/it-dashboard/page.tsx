'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Ticket, Key, CheckCircle, Clock, Search, AlertCircle, Users, Trash2, ShieldAlert, UserPlus, Check } from 'lucide-react';

interface ResetTicket {
  id: number;
  email: string;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  student_id_number: string;
}

interface UserRecord {
  id: number;
  email: string;
  role: string;
  account_status?: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  student_id_number: string | null;
}

const DEPARTMENTS = [
  "Applied Arts",
  "Automotive Engineering",
  "Business and Management Studies",
  "Civil Engineering",
  "Construction Engineering",
  "Information and Communication Technology",
  "Electrical Engineering",
  "Library and Information Science",
  "Mechanical and Production Engineering",
  "Printing and Graphic Arts",
  "Science Technology",
  "School of Journalism and Media Studies",
  "School of Office Management",
  "School of Hospitality and Tourism"
];

export default function ITDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'tickets'>('users');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [tickets, setTickets] = useState<ResetTicket[]>([]);
  const [tempPasswords, setTempPasswords] = useState<{ [key: number]: string }>({});
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // Super Admin Create Account State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'hod',
    department: '',
    graduation_year: '',
    course_name: '',
    student_id_number: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const hpDarkBlue = '#1e3a8a';

  useEffect(() => {
    setCurrentUserRole(localStorage.getItem('role'));
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || (role !== 'it' && role !== 'super_admin')) {
        window.location.href = '/login';
        return;
      }

      if (activeTab === 'tickets') {
        const response = await fetch('https://harare-poly-api.onrender.com/api/it/reset-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load tickets');
        setTickets(await response.json());
      } else {
        const response = await fetch('https://harare-poly-api.onrender.com/api/it/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load users database');
        setUsers(await response.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStaff = async (userId: number) => {
    setApprovingId(userId);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://harare-poly-api.onrender.com/api/it/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve account');

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, account_status: 'active' } : u));
      setSuccessMsg(data.message || 'Staff account approved!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://harare-poly-api.onrender.com/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');

      setSuccessMsg('Account created and activated!');
      setShowCreateForm(false);
      setNewUser({
        first_name: '', last_name: '', email: '', password: '',
        role: 'hod', department: '', graduation_year: '', course_name: '', student_id_number: ''
      });
      fetchDashboardData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleResolveTicket = async (ticketId: number, email: string) => {
    const tempPassword = tempPasswords[ticketId];
    if (!tempPassword || tempPassword.length < 6) {
      setError("Please enter a secure temporary password (min 6 characters).");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setResolvingId(ticketId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://harare-poly-api.onrender.com/api/it/resolve-reset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ticket_id: ticketId, email, temp_password: tempPassword })
      });

      if (!response.ok) throw new Error('Failed to resolve ticket');
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      setTempPasswords(prev => {
        const newState = { ...prev };
        delete newState[ticketId];
        return newState;
      });
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://harare-poly-api.onrender.com/api/it/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');

      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err: any) {
      setError(err.message);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const isSuperAdmin = currentUserRole === 'super_admin';
  const pendingStaffCount = users.filter(u => u.account_status === 'pending_staff').length;

  const filteredUsers = users.filter(u => {
    const search = userSearchTerm.toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    return fullName.includes(search) || u.email.toLowerCase().includes(search) || u.role.toLowerCase().includes(search) || (u.student_id_number && u.student_id_number.toLowerCase().includes(search));
  });

  const canDeleteUser = (u: UserRecord) => {
    if (u.role === 'super_admin') return false;
    if (isSuperAdmin) return true;
    return u.role === 'alumni' || u.account_status === 'pending_staff';
  };

  const canApproveUser = (u: UserRecord) => {
    if (u.account_status !== 'pending_staff') return false;
    if (u.role === 'principal' || u.role === 'vp' || u.role === 'admin') return isSuperAdmin;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 rounded bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 mr-3">
              <ShieldCheck size={20} />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight truncate block" style={{ color: hpDarkBlue }}>
              {isSuperAdmin ? 'Super Admin & IT ' : 'IT Support '}
              <span className="font-light">Command Center</span>
            </span>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/login'; }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors shrink-0 whitespace-nowrap ml-2">
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex overflow-x-auto border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'users' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Users className="mr-2" size={18} /> User & Staff Management
            {pendingStaffCount > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {pendingStaffCount} Pending
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`whitespace-nowrap py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'tickets' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Ticket className="mr-2" size={18} /> Password Tickets
            {tickets.length > 0 && activeTab !== 'tickets' && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{tickets.length}</span>}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700 mb-6">
            <AlertCircle className="mr-3 shrink-0" size={20} />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center text-green-800 mb-6">
            <CheckCircle className="mr-3 shrink-0" size={20} />
            <p className="font-medium text-sm">{successMsg}</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Super Admin Direct Account Creator */}
            {isSuperAdmin && (
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Master Account Provisioning (Super Admin)</h3>
                    <p className="text-xs text-gray-500">Directly create active Staff (1 Principal, 2 VP, 1 PRO, 1 HOD/Dept, 5 IT) or Alumni accounts.</p>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2.5 bg-blue-800 text-white rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors flex items-center w-fit shrink-0"
                  >
                    <UserPlus size={16} className="mr-2" />
                    {showCreateForm ? 'Close Form' : 'Add Account'}
                  </button>
                </div>

                {showCreateForm && (
                  <form onSubmit={handleCreateUser} className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" required placeholder="First Name" value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
                    <input type="text" required placeholder="Last Name" value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-semibold">
                      <option value="principal">Principal (Max 1)</option>
                      <option value="vp">Vice Principal (Max 2)</option>
                      <option value="pro">PRO (Max 1)</option>
                      <option value="hod">HOD (Max 1 per Dept)</option>
                      <option value="it">IT Support (Max 5)</option>
                      <option value="alumni">Alumni</option>
                    </select>
                    <input type="email" required placeholder="Email (e.g. name.pro@hrepoly.ac.zw)" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
                    <input type="password" required minLength={6} placeholder="Initial Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900" />

                    {(newUser.role === 'hod' || newUser.role === 'alumni') && (
                      <select required value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white">
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    )}

                    {newUser.role === 'alumni' && (
                      <>
                        <input type="number" required placeholder="Graduation Year" value={newUser.graduation_year} onChange={e => setNewUser({ ...newUser, graduation_year: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
                        <input type="text" required placeholder="Course Name" value={newUser.course_name} onChange={e => setNewUser({ ...newUser, course_name: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
                      </>
                    )}

                    <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                      <button type="submit" disabled={creatingUser} className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-bold hover:bg-emerald-800 disabled:bg-gray-400">
                        {creatingUser ? 'Creating...' : 'Create Active Account'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">System Accounts & Staff Approvals</h2>
                  <p className="text-sm text-gray-500">Staff accounts never appear in public Alumni directories or analytics.</p>
                </div>
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search name, email, role, or ID..." 
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" 
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account Holder</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan={4} className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div></td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={4} className="py-10 text-center text-gray-500 text-sm">No users found.</td></tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className={user.account_status === 'pending_staff' ? 'bg-amber-50/60' : 'hover:bg-slate-50 transition-colors'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3">
                                {user.first_name ? user.first_name[0] : ''}{user.last_name ? user.last_name[0] : 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{user.first_name || 'User'} {user.last_name || ''}</div>
                                {user.department && <div className="text-xs text-gray-500">{user.department}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full uppercase tracking-wider ${
                                user.role === 'super_admin' ? 'bg-indigo-900 text-white' :
                                user.role === 'principal' || user.role === 'vp' || user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'it' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'pro' ? 'bg-emerald-100 text-emerald-800' :
                                user.role === 'hod' ? 'bg-cyan-100 text-cyan-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                              {user.account_status === 'pending_staff' && (
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-200 text-amber-900">
                                  Pending Approval
                                </span>
                              )}
                            </div>
                            {user.student_id_number && <div className="text-xs text-gray-500 mt-1 font-mono">{user.student_id_number}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {canApproveUser(user) && (
                                <button
                                  onClick={() => handleApproveStaff(user.id)}
                                  disabled={approvingId === user.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center transition-colors"
                                >
                                  <Check size={14} className="mr-1" />
                                  {approvingId === user.id ? 'Approving...' : 'Approve'}
                                </button>
                              )}
                              {canDeleteUser(user) && (
                                <button 
                                  onClick={() => setUserToDelete(user)}
                                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center"
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  {user.account_status === 'pending_staff' ? 'Reject' : 'Remove'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Password Recovery Desk</h1>
              <p className="text-gray-600 text-sm">Verify student identities before issuing temporary passwords.</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div></div>
            ) : tickets.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="mx-auto w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4"><CheckCircle size={40} /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inbox Zero!</h3>
                <p className="text-gray-500">There are no pending password reset requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center text-amber-600 text-sm font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <Clock size={16} className="mr-1.5" /> Pending
                      </div>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ticket #{ticket.id}</span>
                    </div>
                    <div className="p-6 border-b border-gray-100 flex-grow">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-1">{ticket.first_name || 'User'} {ticket.last_name || ''}</h3>
                      <div className="space-y-2 mt-4 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Registered Email:</span><span className="font-medium text-gray-900">{ticket.email}</span></div>
                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Student ID:</span><span className="font-mono font-bold text-blue-800">{ticket.student_id_number || 'Staff / N/A'}</span></div>
                        <div className="flex justify-between pb-2"><span className="text-gray-500">Requested On:</span><span className="text-gray-900">{new Date(ticket.created_at).toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Generate Temporary Password</label>
                      <div className="flex space-x-3">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Key className="h-5 w-5 text-gray-400" /></div>
                          <input type="text" placeholder="e.g. PolyTemp123!" value={tempPasswords[ticket.id] || ''} onChange={(e) => setTempPasswords({ ...tempPasswords, [ticket.id]: e.target.value })} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm font-mono bg-white" />
                        </div>
                        <button onClick={() => handleResolveTicket(ticket.id, ticket.email)} disabled={resolvingId === ticket.id || !tempPasswords[ticket.id]} className="bg-blue-800 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-900 transition-colors disabled:bg-gray-400 shadow-sm whitespace-nowrap">
                          {resolvingId === ticket.id ? 'Saving...' : 'Resolve'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Permanently delete <strong className="text-gray-900">{userToDelete.first_name} {userToDelete.last_name} ({userToDelete.email})</strong>? This cannot be undone.
            </p>
            <div className="flex flex-col space-y-3">
              <button onClick={handleDeleteUser} disabled={isDeleting} className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400">
                {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
              <button onClick={() => setUserToDelete(null)} disabled={isDeleting} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
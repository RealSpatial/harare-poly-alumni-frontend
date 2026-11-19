'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Ticket, Key, CheckCircle, Clock, Search, AlertCircle, Users, Trash2, ShieldAlert, X } from 'lucide-react';

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
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  student_id_number: string | null;
}

export default function ITDashboardPage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'tickets' | 'users'>('tickets');

  // Ticket State
  const [tickets, setTickets] = useState<ResetTicket[]>([]);
  const [tempPasswords, setTempPasswords] = useState<{ [key: number]: string }>({});
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // User Management State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const hpDarkBlue = '#1e3a8a';

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      // Security check
      if (!token || role !== 'it') {
        window.location.href = '/login';
        return;
      }

      if (activeTab === 'tickets') {
        const response = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/it/reset-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load tickets');
        const data = await response.json();
        setTickets(data);
      } else {
        const response = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/it/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load users database');
        const data = await response.json();
        setUsers(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      const response = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/it/resolve-reset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ticket_id: ticketId, email: email, temp_password: tempPassword })
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

      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/it/users/${userToDelete.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) throw new Error('Failed to delete user');

          // Remove from local state immediately
          setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
          setUserToDelete(null); // Close the modal
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsDeleting(false);
      }
  };

  const filteredUsers = users.filter(u => {
      const search = userSearchTerm.toLowerCase();
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      return fullName.includes(search) || u.email.toLowerCase().includes(search) || (u.student_id_number && u.student_id_number.toLowerCase().includes(search));
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded bg-blue-900 text-white font-bold flex items-center justify-center">
                <ShieldCheck size={20} />
             </div>
             <span className="font-bold text-xl tracking-tight" style={{ color: hpDarkBlue }}>
                IT Support <span className="font-light">Command Center</span>
             </span>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/login'; }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
              Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {}
        <div className="flex border-b border-gray-200 mb-8">
            <button 
                onClick={() => setActiveTab('tickets')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'tickets' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Ticket className="mr-2" size={18} /> Password Tickets
                {tickets.length > 0 && activeTab !== 'tickets' && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{tickets.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'users' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Users className="mr-2" size={18} /> User Management
            </button>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700 mb-6">
                <AlertCircle className="mr-3" size={24} />
                <p className="font-medium">{error}</p>
            </div>
        )}

        {}
        {activeTab === 'tickets' && (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Password Recovery Desk</h1>
                        <p className="text-gray-600 text-sm">Verify student identities before issuing temporary passwords.</p>
                    </div>
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
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-1">{ticket.first_name} {ticket.last_name}</h3>
                                    <div className="space-y-2 mt-4 text-sm">
                                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Registered Email:</span><span className="font-medium text-gray-900">{ticket.email}</span></div>
                                        <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Student ID (Verify this!):</span><span className="font-mono font-bold text-blue-800">{ticket.student_id_number}</span></div>
                                        <div className="flex justify-between pb-2"><span className="text-gray-500">Requested On:</span><span className="text-gray-900">{new Date(ticket.created_at).toLocaleString()}</span></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Generate Temporary Password</label>
                                    <div className="flex space-x-3">
                                        <div className="relative flex-grow">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Key className="h-5 w-5 text-gray-400" /></div>
                                            <input type="text" placeholder="e.g. PolyTemp123!" value={tempPasswords[ticket.id] || ''} onChange={(e) => setTempPasswords({...tempPasswords, [ticket.id]: e.target.value})} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
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

        {}
        {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">User Database</h2>
                        <p className="text-sm text-gray-500">Monitor and moderate registered accounts.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or ID..." 
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account Holder</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & ID</th>
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
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3">
                                                    {user.first_name ? user.first_name[0] : ''}{user.last_name ? user.last_name[0] : 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{user.first_name || 'Incomplete Profile'} {user.last_name || ''}</div>
                                                    {user.department && <div className="text-xs text-gray-500">{user.department}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'it' ? 'bg-blue-100 text-blue-800' :
                                                user.role === 'pro' ? 'bg-amber-100 text-amber-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                            {user.student_id_number && <div className="text-xs text-gray-500 mt-1 font-mono">{user.student_id_number}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user.role !== 'admin' && user.role !== 'it' && (
                                                <button 
                                                    onClick={() => setUserToDelete(user)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors flex items-center justify-end ml-auto"
                                                >
                                                    <Trash2 size={16} className="mr-1" /> Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </main>

      {}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Account?</h3>
                <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                    Are you absolutely sure you want to permanently delete the account for <strong className="text-gray-900">{userToDelete.first_name} {userToDelete.last_name} ({userToDelete.email})</strong>? This action will also wipe all their jobs, connections, and profile data. This cannot be undone.
                </p>
                <div className="flex flex-col space-y-3">
                    <button 
                        onClick={handleDeleteUser}
                        disabled={isDeleting}
                        className="w-full inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400"
                    >
                        {isDeleting ? 'Deleting User...' : 'Yes, Permanently Delete'}
                    </button>
                    <button 
                        onClick={() => setUserToDelete(null)}
                        disabled={isDeleting}
                        className="w-full inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { User, Search, MapPin, GraduationCap, ArrowLeft, Briefcase, Lock, X } from 'lucide-react';

interface AlumniInfo {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  department: string;
  course_name?: string;
  graduation_year: number;
  current_job: string | null;
  current_company: string | null;
}

export default function NetworkPage() {
  const [alumni, setAlumni] = useState<AlumniInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Connection Modal State
  const [selectedUser, setSelectedUser] = useState<AlumniInfo | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }

        // FIX 1: Cleaned API URL
        const response = await fetch('https://harare-poly-api.onrender.com/api/alumni/network', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch alumni network');
        const data = await response.json();
        setAlumni(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  const handleSendRequest = async () => {
      if (!selectedUser) return;
      setSendingRequest(true);
      setRequestStatus(null);

      try {
          const token = localStorage.getItem('token');
          // FIX 1: Cleaned API URL
          const res = await fetch('https://harare-poly-api.onrender.com/api/connections/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                  receiver_id: selectedUser.user_id,
                  message: connectionMessage
              })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to send request.");
          
          setRequestStatus({ success: true, message: "Connection request sent successfully!" });
          setTimeout(() => {
              setSelectedUser(null);
              setRequestStatus(null);
              setConnectionMessage('');
          }, 2000);

      } catch (err: any) {
          setRequestStatus({ success: false, message: err.message });
      } finally {
          setSendingRequest(false);
      }
  };

  const filteredAlumni = alumni.filter(person => {
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    const dept = person.department.toLowerCase();
    const course = (person.course_name || '').toLowerCase();
    const job = (person.current_job || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || 
           dept.includes(search) || 
           course.includes(search) || 
           job.includes(search) || 
           person.graduation_year.toString().includes(search);
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* FIX 2: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <a href="/profile" className="flex items-center text-gray-600 hover:text-blue-800 font-medium shrink-0">
            <ArrowLeft className="mr-2" size={20} /> 
            <span className="hidden sm:block">Back to Profile</span>
          </a>
          <div className="flex-1 text-right pl-4 overflow-hidden">
            <span className="font-bold text-lg sm:text-xl tracking-tight text-blue-900 truncate block">Alumni Directory</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Find Connections</h1>
            <p className="text-gray-600">Search by name, department, or profession (e.g., "Engineer", "CEO").</p>
          </div>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            {/* FIX 3: Added text-gray-900 */}
            <input type="text" placeholder="Search professionals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" />
          </div>
        </div>

        {loading && <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div></div>}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md my-8">
            <p className="text-red-700 font-bold">Backend Error: {error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((person) => (
              <div key={person.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800 mr-4 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{person.first_name} {person.last_name}</h3>
                      <p className="text-sm font-medium text-blue-600">{person.department}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-600 mb-6">
                    <div className="flex items-center">
                      <GraduationCap size={16} className="mr-3 text-gray-400" />
                      <span>Class of {person.graduation_year}</span>
                    </div>
                    {person.course_name && (
                       <div className="flex items-center text-xs">
                         <span className="ml-7 text-gray-500 italic border-l-2 border-gray-200 pl-2">{person.course_name}</span>
                       </div>
                    )}
                    {person.current_job && (
                      <div className="flex items-center mt-2">
                        <Briefcase size={16} className="mr-3 text-gray-400" />
                        <span className="truncate">{person.current_job} at {person.current_company}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUser(person)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold py-2.5 rounded-lg flex items-center justify-center transition-colors border border-blue-100"
                >
                  <Lock size={16} className="mr-2" /> Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Connect with {selectedUser.first_name}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
                {requestStatus && (
                    <div className={`p-4 rounded-md text-sm font-medium border ${requestStatus.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {requestStatus.message}
                    </div>
                )}
                
                {!requestStatus?.success && (
                    <>
                        <p className="text-sm text-gray-600">
                            Send a brief message explaining why you'd like to connect. {selectedUser.first_name} will have the option to accept and share their contact information or social handle.
                        </p>
                        <div>
                            {/* FIX 3: Added text-gray-900 */}
                            <textarea 
                                required 
                                rows={4}
                                value={connectionMessage}
                                onChange={(e) => setConnectionMessage(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm" 
                                placeholder={`Hi ${selectedUser.first_name}, I saw you are working as a ${selectedUser.current_job || 'professional'} and would love to connect regarding...`}
                            />
                        </div>
                        <button 
                            onClick={handleSendRequest}
                            disabled={sendingRequest || !connectionMessage.trim()}
                            className="w-full bg-blue-800 text-white font-bold py-3 rounded-md hover:bg-blue-900 mt-2 disabled:bg-gray-400 transition-colors flex justify-center items-center"
                        >
                            {sendingRequest ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </span>
                            ) : (
                                'Send Secure Request'
                            )}
                        </button>
                    </>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
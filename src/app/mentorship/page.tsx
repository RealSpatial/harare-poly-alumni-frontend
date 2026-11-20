'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, GraduationCap, Award, BookOpen, Send, CheckCircle2, Lock, X } from 'lucide-react';

interface Mentor {
  user_id: number;
  first_name: string;
  last_name: string;
  department: string;
  course_name?: string;
  graduation_year: number;
  mentorship_bio: string;
}

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for requesting mentorship
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{success: boolean, text: string} | null>(null);

  const hpDarkBlue = '#1e3a8a';
  const hpBackground = '#f8fafc';

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
           return;
        }

        // FIX 1: Cleaned API URL
        const response = await fetch('https://harare-poly-api.onrender.com/api/mentors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load mentors');
        
        const data = await response.json();
        setMentors(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleSendRequest = async () => {
      if (!selectedMentor) return;
      setIsSending(true);
      setRequestStatus(null);

      try {
          const token = localStorage.getItem('token');
          // FIX 1: Cleaned API URL
          const res = await fetch('https://harare-poly-api.onrender.com/api/connections/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                  receiver_id: selectedMentor.user_id,
                  message: `[MENTORSHIP REQUEST] - ${message}`
              })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to send request.");
          
          setRequestStatus({ success: true, text: "Mentorship request sent securely to their Inbox!" });
          setTimeout(() => {
              setSelectedMentor(null);
              setRequestStatus(null);
              setMessage('');
          }, 3000);

      } catch (err: any) {
          setRequestStatus({ success: false, text: err.message });
      } finally {
          setIsSending(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: hpBackground }}>
      {/* FIX 2: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <a href="/profile" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors font-medium shrink-0">
            <ArrowLeft className="mr-2" size={20} /> 
            <span className="hidden sm:block">Back to Profile</span>
          </a>
          <div className="flex-1 text-right pl-4 overflow-hidden">
            <span className="font-bold text-lg sm:text-xl tracking-tight truncate block" style={{ color: hpDarkBlue }}>Mentorship Hub</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-lg mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <Award size={48} className="mb-4 text-blue-200 relative z-10" />
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight relative z-10">Guide the Next Generation</h1>
            <p className="text-blue-100 text-lg max-w-2xl relative z-10 leading-relaxed">
                Connect with experienced alumni who have volunteered to offer career advice, industry insights, and professional guidance.
            </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
        ) : mentors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentors Available Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
                Be the first to step up! You can opt-in to become a mentor from your Profile page to guide junior graduates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.user_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col h-full">
                
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg mr-3">
                            {mentor.first_name[0]}{mentor.last_name[0]}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{mentor.first_name} {mentor.last_name}</h3>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Class of {mentor.graduation_year}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-100 mb-4 flex-grow italic leading-relaxed">
                    "{mentor.mentorship_bio}"
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 border-t border-gray-50 pt-4 mb-6">
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="font-medium">{mentor.department}</span>
                    </div>
                    {mentor.course_name && (
                        <div className="flex items-center text-xs ml-6 text-gray-500 border-l-2 border-gray-200 pl-2">
                            {mentor.course_name}
                        </div>
                    )}
                </div>

                <button 
                  onClick={() => setSelectedMentor(mentor)}
                  className="w-full bg-white border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white font-bold py-2.5 rounded-xl transition-colors mt-auto"
                >
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* REQUEST MENTORSHIP MODAL */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Request Mentorship</h3>
              <button onClick={() => setSelectedMentor(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
                {requestStatus ? (
                    <div className={`p-4 rounded-lg font-medium flex flex-col items-center justify-center text-center ${requestStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {requestStatus.success && <CheckCircle2 size={32} className="mb-2 text-green-600" />}
                        {requestStatus.text}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center text-sm text-blue-800 bg-blue-50 p-3 rounded-lg mb-2 border border-blue-100">
                            <Lock size={16} className="mr-2 shrink-0" />
                            This message will be sent securely to {selectedMentor.first_name}'s inbox.
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Your Intro Message</label>
                            {/* FIX 3: Added text-gray-900 */}
                            <textarea 
                                required 
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm" 
                                placeholder={`Hi ${selectedMentor.first_name}, I am looking for guidance on...`}
                            />
                        </div>
                        <button 
                            onClick={handleSendRequest}
                            disabled={isSending || !message.trim()}
                            className="w-full bg-blue-800 text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 mt-2 disabled:bg-gray-400 transition-all shadow-md flex justify-center items-center"
                        >
                            {isSending ? 'Transmitting Securely...' : <><Send size={18} className="mr-2" /> Send Request</>}
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
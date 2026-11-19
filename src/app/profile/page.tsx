'use client';

import React, { useEffect, useState } from 'react';
import { User, Users, Briefcase, GraduationCap, Edit3, Phone, Mail, Globe, Camera, Plus, X, BookOpen, Building, Bell, Check, MessageSquare, Lightbulb, Megaphone, Lock, Award } from 'lucide-react';

interface Employment {
  id: number;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface Study {
  id: number;
  institution_name: string;
  degree_obtained: string;
  field_of_study: string;
  graduation_year: number;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  department: string;
  course_name?: string;
  graduation_year: number;
  student_id_number: string;
  email: string;
  employment: Employment[];
  studies: Study[];
  phone_number?: string; 
  linkedin_url?: string; 
  is_mentor?: boolean; // NEW FOR MENTORSHIP
  mentorship_bio?: string; // NEW FOR MENTORSHIP
}

interface ConnectionRequest {
  id: number;
  sender_id: number;
  first_name: string;
  last_name: string;
  department: string;
  course_name: string;
  message: string;
  created_at: string;
}

interface Broadcast {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [inbox, setInbox] = useState<ConnectionRequest[]>([]);
  const [myConnections, setMyConnections] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hiddenBroadcasts, setHiddenBroadcasts] = useState<number[]>([]);

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false); // NEW FOR MENTORSHIP

  // Forms
  const [editForm, setEditForm] = useState({ phone_number: '', linkedin_url: '' });
  const [jobForm, setJobForm] = useState({ company_name: '', job_title: '', start_date: '', end_date: '', is_current: false });
  const [studyForm, setStudyForm] = useState({ institution_name: '', degree_obtained: '', field_of_study: '', graduation_year: '' });
  const [feedbackForm, setFeedbackForm] = useState({ category: 'Memories & Experiences', message: '' });
  const [mentorForm, setMentorForm] = useState({ is_mentor: false, mentorship_bio: '' }); // NEW FOR MENTORSHIP
  
  const [feedbackStatus, setFeedbackStatus] = useState<{success: boolean, message: string} | null>(null);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [shareType, setShareType] = useState('linkedin');
  const [shareValue, setShareValue] = useState('');

  const hpDarkBlue = '#1e3a8a';
  const hpBackground = '#f8fafc';

  useEffect(() => {
    const storedHidden = JSON.parse(localStorage.getItem('hiddenBroadcasts') || '[]');
    setHiddenBroadcasts(storedHidden);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role'); 
      setUserRole(role); 
      if (!token) { window.location.href = '/login'; return; }

      const profileRes = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/alumni/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json().catch(() => ({}));
        throw new Error(`Backend says: ${errData.error || profileRes.statusText} (Status Code: ${profileRes.status})`);
      }
      
      const profileData = await profileRes.json();
      setProfile(profileData);

      const inboxRes = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/connections/inbox', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (inboxRes.ok) {
        const inboxData = await inboxRes.json();
        setInbox(inboxData);
      }

      const myConnRes = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/connections/my-connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (myConnRes.ok) {
        const myConnData = await myConnRes.json();
        setMyConnections(myConnData);
      }

      const broadcastRes = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/alumni/broadcasts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (broadcastRes.ok) {
        const broadcastData = await broadcastRes.json();
        setBroadcasts(broadcastData);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/alumni/employment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(jobForm)
      });
      if (res.ok) {
        setShowJobModal(false);
        setJobForm({ company_name: '', job_title: '', start_date: '', end_date: '', is_current: false });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/alumni/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...studyForm, graduation_year: parseInt(studyForm.graduation_year) })
      });
      if (res.ok) {
        setShowStudyModal(false);
        setStudyForm({ institution_name: '', degree_obtained: '', field_of_study: '', graduation_year: '' });
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  const handleRespond = async (requestId: number, status: 'Accepted' | 'Rejected') => {
      try {
          const token = localStorage.getItem('token');
          const payload = {
              request_id: requestId,
              status: status,
              shared_info_type: status === 'Accepted' ? shareType : null,
              shared_info_value: status === 'Accepted' ? shareValue : null
          };

          const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/connections/respond', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(payload)
          });

          if (res.ok) {
              setRespondingTo(null);
              setShareValue('');
              fetchData(); 
          } else {
              alert("Failed to respond to request.");
          }
      } catch (err) {
          console.error(err);
      }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFeedbackStatus(null);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/feedback/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(feedbackForm)
          });
          if (res.ok) {
              setFeedbackStatus({ success: true, message: 'Thank you! Your submission has been sent directly to the Public Relations Officer.' });
              setTimeout(() => {
                  setShowFeedbackModal(false);
                  setFeedbackForm({ category: 'Memories & Experiences', message: '' });
                  setFeedbackStatus(null);
              }, 3000);
          } else {
              setFeedbackStatus({ success: false, message: 'Failed to send feedback.' });
          }
      } catch (err) { console.error(err); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/alumni/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(editForm)
          });
          if (res.ok) {
              setShowEditModal(false);
              fetchData(); 
          }
      } catch (err) { console.error(err); }
  };

  const openMentorModal = () => {
    setMentorForm({
        is_mentor: profile?.is_mentor || false,
        mentorship_bio: profile?.mentorship_bio || ''
    });
    setShowMentorModal(true);
  };

  const handleMentorSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/mentors/toggle', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(mentorForm)
          });
          if (res.ok) {
              setShowMentorModal(false);
              fetchData(); 
          }
      } catch (err) {
          console.error(err);
      }
  };

  const getFeedbackPlaceholder = () => {
      if (feedbackForm.category === 'Memories & Experiences') {
          return "Kindly share your favorite memories, inspiring lecturers, or experiences during and after your Harare Poly era...";
      } else if (feedbackForm.category === 'Partnerships for Growth') {
          return "Do you know of any international schools or organizations we should partner with? Please provide their names and contact emails here...";
      } else {
          return "Share your general feedback or curriculum suggestions...";
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div></div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Lock className="text-blue-800" size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
                For your security, your connection has timed out. Please sign in again to access your secure alumni portal.
            </p>
            <a href="/login" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); }} className="w-full inline-flex justify-center items-center bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-bold shadow-md">
                Return to Secure Login
            </a>
        </div>
    </div>
  );

  const visibleBroadcasts = broadcasts.filter(b => !hiddenBroadcasts.includes(b.id));

  const dismissBroadcast = (id: number) => {
      const updatedHidden = [...hiddenBroadcasts, id];
      setHiddenBroadcasts(updatedHidden);
      localStorage.setItem('hiddenBroadcasts', JSON.stringify(updatedHidden));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative pb-20" style={{ backgroundColor: hpBackground }}>
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* NEW: Made the title a clickable link to Home and updated to full name */}
            <a href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity" style={{ color: hpDarkBlue }}>
              Harare Polytechnic <span className="font-light">Alumni</span>
            </a>
          </div>
          <div className="flex items-center space-x-6">
            {userRole === 'pro' && (
                <a href="/pro-dashboard" className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors border border-amber-200">
                    PR Command Center
                </a>
            )}
            {/* NEW: Added an explicit Home link next to Network Directory */}
            <a href="/" className="text-sm font-medium text-gray-600 hover:text-blue-800">Home</a>
            <a href="/network" className="text-sm font-medium text-gray-600 hover:text-blue-800">Network Directory</a>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/login'; }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full z-10">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 relative">
          <div className="h-40 w-full bg-gradient-to-r from-blue-900 to-blue-600 relative">
            <button className="absolute bottom-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"><Camera size={20} /></button>
          </div>
          
          <div className="px-6 sm:px-10 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-blue-800 overflow-hidden">
                  <User size={64} className="text-gray-400" />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-800 text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-blue-900 transition-colors"><Camera size={16} /></button>
              </div>
              <button onClick={() => { setEditForm({phone_number: profile?.phone_number || '', linkedin_url: profile?.linkedin_url || ''}); setShowEditModal(true); }} className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"><Edit3 size={16} className="mr-2" />Edit Profile</button>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{profile?.first_name} {profile?.last_name}</h1>
            <p className="text-gray-500 mt-1 text-lg font-medium">{profile?.department} Professional</p>
            {profile?.course_name && (
                <p className="text-gray-400 text-sm mt-1">{profile.course_name}</p>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4 pb-3 border-b border-gray-50">
                <GraduationCap className="text-blue-800 mr-3" size={20} />
                <h2 className="text-lg font-bold text-gray-900">Harare Poly</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div><p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Department</p><p className="text-gray-900 font-medium mt-1">{profile?.department}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Class of</p><p className="text-gray-900 font-medium mt-1">{profile?.graduation_year}</p></div>
                  <div><p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Student ID</p><p className="text-gray-900 font-medium mt-1">{profile?.student_id_number}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4 pb-3 border-b border-gray-50">
                <User className="text-blue-800 mr-3" size={20} />
                <h2 className="text-lg font-bold text-gray-900">Contact</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center text-gray-700"><Mail size={16} className="mr-3 text-gray-400" /><span className="truncate">{profile?.email}</span></div>
                
                {profile?.phone_number ? (
                    <div className="flex items-center text-gray-700"><Phone size={16} className="mr-3 text-gray-400" /><span>{profile.phone_number}</span></div>
                ) : (
                    <div onClick={() => { setEditForm({phone_number: '', linkedin_url: profile?.linkedin_url || ''}); setShowEditModal(true); }} className="flex items-center text-blue-600 cursor-pointer hover:underline group"><Phone size={16} className="mr-3 text-gray-400 group-hover:text-blue-600" /><span>+ Add Phone Number</span></div>
                )}
                
                {profile?.linkedin_url ? (
                    <div className="flex items-center text-blue-600 hover:underline"><Globe size={16} className="mr-3 text-gray-400" /><a href={profile.linkedin_url.includes('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`} target="_blank" rel="noreferrer">{profile.linkedin_url}</a></div>
                ) : (
                    <div onClick={() => { setEditForm({phone_number: profile?.phone_number || '', linkedin_url: ''}); setShowEditModal(true); }} className="flex items-center text-blue-600 cursor-pointer hover:underline group"><Globe size={16} className="mr-3 text-gray-400 group-hover:text-blue-600" /><span>+ Link Web Profile</span></div>
                )}
              </div>
            </div>

            {/* NEW: MENTORSHIP SETTINGS CARD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                <div className="flex items-center">
                  <Award className="text-blue-800 mr-3" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">Mentorship</h2>
                </div>
                {profile?.is_mentor && (
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
                )}
              </div>
              
              {profile?.is_mentor ? (
                <div className="space-y-3 text-sm">
                    <p className="text-gray-700 italic bg-slate-50 p-3 rounded-lg border border-slate-100">"{profile.mentorship_bio}"</p>
                    <button onClick={openMentorModal} className="text-blue-600 font-medium hover:underline text-sm flex items-center mt-2">
                        <Edit3 size={14} className="mr-1"/> Edit Settings
                    </button>
                </div>
              ) : (
                <div className="text-sm">
                    <p className="text-gray-500 mb-4 leading-relaxed">Share your industry experience and guide recent graduates navigating their careers.</p>
                    <button onClick={openMentorModal} className="w-full bg-blue-50 text-blue-800 font-bold py-2.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm">
                        Become a Mentor
                    </button>
                </div>
              )}
            </div>

            {/* PR COMMUNICATION BOX */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-2xl shadow-md text-white mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="flex items-center mb-3">
                    <MessageSquare className="text-blue-200 mr-2" size={24} />
                    <h2 className="text-lg font-bold">Connect with PR</h2>
                </div>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                    Share your Harare Poly memories, or recommend international organizations we should partner with for growth.
                </p>
                <button 
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-full bg-white text-blue-900 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors shadow-sm"
                >
                    Write to Public Relations
                </button>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* PRO BROADCASTS / NOTICE BOARD */}
            {visibleBroadcasts.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-amber-200 relative overflow-hidden">
                    <div className="flex items-center mb-4 pb-3 border-b border-amber-200/50">
                        <Megaphone className="text-amber-600 mr-3" size={22} />
                        <h2 className="text-lg font-bold text-amber-900">Official Poly Announcements</h2>
                    </div>
                    <div className="space-y-4">
                        {visibleBroadcasts.map((b) => (
                            <div key={b.id} className="bg-white/80 p-4 rounded-xl border border-amber-100 relative group transition-all">
                                <button 
                                    onClick={() => dismissBroadcast(b.id)}
                                    className="absolute top-3 right-3 text-amber-300 hover:text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-50 hover:bg-amber-100 p-1.5 rounded-md"
                                    title="Mark as read / Dismiss"
                                >
                                    <X size={16} />
                                </button>
                                
                                <h4 className="font-bold text-gray-900 mb-1 pr-8">{b.title}</h4>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{b.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">Posted: {new Date(b.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* INBOX SECTION */}
            {inbox.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100">
                        <div className="flex items-center">
                            <div className="relative">
                                <Bell className="text-blue-800 mr-3" size={22} />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{inbox.length}</span>
                            </div>
                            <h2 className="text-xl font-bold text-blue-900">Connection Requests</h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {inbox.map((req) => (
                            <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-3 shrink-0">
                                            {req.first_name[0]}{req.last_name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{req.first_name} {req.last_name}</h4>
                                            <p className="text-xs text-blue-600 font-medium">{req.department} • {req.course_name}</p>
                                            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm text-gray-700 italic border border-gray-100 relative">
                                                <MessageSquare size={14} className="absolute top-3 left-3 text-gray-300" />
                                                <span className="pl-6 block">{req.message}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {respondingTo === req.id ? (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-700 uppercase mb-2">What would you like to share?</p>
                                        <div className="flex space-x-2 mb-3">
                                            <select 
                                                value={shareType} 
                                                onChange={(e) => setShareType(e.target.value)}
                                                className="border border-gray-300 rounded-md text-sm p-2 bg-white"
                                            >
                                                <option value="linkedin">LinkedIn URL</option>
                                                <option value="email">Email Address</option>
                                                <option value="phone">Phone Number</option>
                                                <option value="whatsapp">WhatsApp Link</option>
                                            </select>
                                            <input 
                                                type="text" 
                                                placeholder="Enter handle, link, or number..." 
                                                value={shareValue}
                                                onChange={(e) => setShareValue(e.target.value)}
                                                className="border border-gray-300 rounded-md text-sm p-2 flex-grow"
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleRespond(req.id, 'Accepted')}
                                                disabled={!shareValue.trim()}
                                                className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                                            >
                                                <Check size={16} className="mr-1" /> Send & Connect
                                            </button>
                                            <button 
                                                onClick={() => setRespondingTo(null)}
                                                className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex space-x-3 pl-14">
                                        <button 
                                            onClick={() => setRespondingTo(req.id)}
                                            className="bg-blue-800 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-blue-900 shadow-sm"
                                        >
                                            Accept & Share Contact
                                        </button>
                                        <button 
                                            onClick={() => handleRespond(req.id, 'Rejected')}
                                            className="bg-gray-100 text-gray-700 text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-200 border border-gray-200"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MY CONNECTIONS (SENT REQUESTS) */}
            {myConnections.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center mb-4 pb-3 border-b border-gray-50">
                        <Users className="text-blue-800 mr-3" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">My Network & Sent Requests</h2>
                    </div>
                    <div className="space-y-4">
                        {myConnections.map((conn) => (
                            <div key={conn.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{conn.first_name} {conn.last_name}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{conn.department} Professional</p>
                                </div>
                                <div className="mt-2 sm:mt-0 text-sm">
                                    {conn.status === 'Pending' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Waiting for response</span>
                                    )}
                                    {conn.status === 'Rejected' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Declined</span>
                                    )}
                                    {conn.status === 'Accepted' && (
                                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                            <span className="block text-xs font-bold text-green-800 uppercase mb-1">Connection Accepted!</span>
                                            <span className="text-gray-700 font-medium">
                                                {conn.shared_info_type === 'linkedin' ? 'LinkedIn: ' : 
                                                 conn.shared_info_type === 'email' ? 'Email: ' :
                                                 conn.shared_info_type === 'whatsapp' ? 'WhatsApp: ' : 'Contact: '}
                                                <a href={conn.shared_info_value.includes('http') ? conn.shared_info_value : `tel:${conn.shared_info_value}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                    {conn.shared_info_value}
                                                </a>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Career Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-50">
                <div className="flex items-center"><Briefcase className="text-blue-800 mr-3" size={20} /><h2 className="text-lg font-bold text-gray-900">Career History</h2></div>
                <button onClick={() => setShowJobModal(true)} className="flex items-center text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"><Plus size={16} className="mr-1"/> Add Role</button>
              </div>
              
              {profile?.employment && profile.employment.length > 0 ? (
                <div className="space-y-6">
                  {profile.employment.map((job) => (
                    <div key={job.id} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-gray-500"><Building size={18} /></div>
                        <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h3 className="text-lg font-bold text-gray-900">{job.job_title}</h3>
                        <p className="text-blue-800 font-medium">{job.company_name}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.start_date} - {job.is_current ? 'Present' : job.end_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-300">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-3"><Briefcase size={24} /></div>
                  <h3 className="text-md font-bold text-gray-900 mb-1">Where do you work?</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">Add your jobs to connect with alumni and update the Corporate Directory.</p>
                  <button onClick={() => setShowJobModal(true)} className="bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm">Add Employment</button>
                </div>
              )}
            </div>

            {/* Further Studies Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-50">
                <div className="flex items-center"><BookOpen className="text-blue-800 mr-3" size={20} /><h2 className="text-lg font-bold text-gray-900">Further Studies</h2></div>
                <button onClick={() => setShowStudyModal(true)} className="flex items-center text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"><Plus size={16} className="mr-1"/> Add Education</button>
              </div>
              
              {profile?.studies && profile.studies.length > 0 ? (
                <div className="space-y-6">
                  {profile.studies.map((study) => (
                    <div key={study.id} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-gray-500"><GraduationCap size={18} /></div>
                        <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h3 className="text-lg font-bold text-gray-900">{study.degree_obtained} in {study.field_of_study}</h3>
                        <p className="text-blue-800 font-medium">{study.institution_name}</p>
                        <p className="text-sm text-gray-500 mt-1">Class of {study.graduation_year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Did you pursue a Degree, Masters, or PhD after Harare Poly? Add it here to inspire current students.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {}
      {/* ADD JOB MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Add Employment</h3>
              <button onClick={() => setShowJobModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Business Name</label>
                <input type="text" required value={jobForm.company_name} onChange={e => setJobForm({...jobForm, company_name: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. Econet Wireless" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input type="text" required value={jobForm.job_title} onChange={e => setJobForm({...jobForm, job_title: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. Senior Network Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                  <input type="text" required value={jobForm.start_date} onChange={e => setJobForm({...jobForm, start_date: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. 2021" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                  <input type="text" disabled={jobForm.is_current} value={jobForm.is_current ? '' : jobForm.end_date} onChange={e => setJobForm({...jobForm, end_date: e.target.value})} className="w-full p-2 border rounded-md disabled:bg-gray-100" placeholder="e.g. 2024" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <input type="checkbox" id="current" checked={jobForm.is_current} onChange={e => setJobForm({...jobForm, is_current: e.target.checked})} className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300" />
                <label htmlFor="current" className="text-sm text-gray-700">I currently work here</label>
              </div>
              <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-md hover:bg-blue-900 mt-6">Save Employment</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDY MODAL */}
      {showStudyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Add Further Studies</h3>
              <button onClick={() => setShowStudyModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleStudySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University / Institution</label>
                <input type="text" required value={studyForm.institution_name} onChange={e => setStudyForm({...studyForm, institution_name: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. University of Zimbabwe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree Obtained</label>
                <input type="text" required value={studyForm.degree_obtained} onChange={e => setStudyForm({...studyForm, degree_obtained: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. BSc, MSc, PhD, Certificate" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input type="text" required value={studyForm.field_of_study} onChange={e => setStudyForm({...studyForm, field_of_study: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <input type="number" required value={studyForm.graduation_year} onChange={e => setStudyForm({...studyForm, graduation_year: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. 2024" />
              </div>
              <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-md hover:bg-blue-900 mt-6">Save Education</button>
            </form>
          </div>
        </div>
      )}

      {/* PR SUBMISSION MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Write to PR Office</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="p-6">
              {feedbackStatus?.success ? (
                  <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center font-medium border border-green-200">
                      {feedbackStatus.message}
                  </div>
              ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                      <select 
                          value={feedbackForm.category} 
                          onChange={e => setFeedbackForm({...feedbackForm, category: e.target.value})} 
                          className="w-full p-2 border border-gray-300 rounded-md bg-white font-medium"
                      >
                          <option value="Memories & Experiences">Memories & Experiences</option>
                          <option value="Partnerships for Growth">Partnerships for Growth</option>
                          <option value="General Feedback">General Feedback</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                      <textarea 
                          required 
                          rows={6} 
                          value={feedbackForm.message} 
                          onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} 
                          className="w-full p-3 border border-gray-300 rounded-md text-sm leading-relaxed" 
                          placeholder={getFeedbackPlaceholder()} 
                      />
                    </div>
                    <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-md hover:bg-blue-900 shadow-sm transition-all transform hover:-translate-y-0.5">
                        Submit to Public Relations
                    </button>
                  </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. +263 77 123 4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input type="text" value={editForm.linkedin_url} onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. linkedin.com/in/yourname" />
              </div>
              <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-md hover:bg-blue-900 mt-6">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW: MENTORSHIP SETTINGS MODAL */}
      {showMentorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Mentorship Preferences</h3>
              <button onClick={() => setShowMentorModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleMentorSubmit} className="p-6 space-y-4">
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start mb-4">
                  <input 
                      type="checkbox" 
                      id="is_mentor" 
                      checked={mentorForm.is_mentor} 
                      onChange={e => setMentorForm({...mentorForm, is_mentor: e.target.checked})} 
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded border-gray-300" 
                  />
                  <label htmlFor="is_mentor" className="text-sm text-gray-800 font-medium cursor-pointer">
                      Yes, I am available to offer mentorship and career guidance to junior alumni.
                  </label>
              </div>

              {mentorForm.is_mentor && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Mentorship Bio</label>
                      <p className="text-xs text-gray-500 mb-2">Briefly describe what topics you can help with (e.g., CV reviews, career switching, startup advice).</p>
                      <textarea 
                          required={mentorForm.is_mentor}
                          rows={4}
                          value={mentorForm.mentorship_bio} 
                          onChange={e => setMentorForm({...mentorForm, mentorship_bio: e.target.value})} 
                          className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" 
                          placeholder="I have 10 years of experience in structural engineering and can help review portfolios..."
                      />
                  </div>
              )}
              
              <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-lg hover:bg-blue-900 mt-2 shadow-sm transition-colors">
                  Save Preferences
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
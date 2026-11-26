'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, MessageSquare, Mail, Send, Briefcase, CheckCircle, XCircle, ImageIcon, PlusCircle, Trash2, Award, Store, Star, Phone, Tag } from 'lucide-react';

interface FeedbackData {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
  graduation_year: number;
  email: string;
  category: string;
  message: string;
  created_at: string;
}

interface PendingJob {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  posted_by_name: string;
  created_at: string;
}

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
}

interface MarketplaceItem {
  id: number;
  company_name: string;
  title: string;
  category: string;
  description: string;
  price: string;
  image_url: string;
  contact_phone: string;
  contact_email: string;
  is_featured: boolean;
}

export default function PRODashboardPage() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'jobs' | 'gallery' | 'stories' | 'marketplace'>('feedback');
  
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', description: '', image_url: '', category: 'Achievement' });

  const [newStory, setNewStory] = useState({ title: '', excerpt: '', content: '', image_url: '' });
  const [publishStatus, setPublishStatus] = useState<{success: boolean, text: string} | null>(null);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [newMarketplaceItem, setNewMarketplaceItem] = useState({
    company_name: '',
    title: '',
    category: 'Product',
    description: '',
    price: '',
    image_url: '',
    contact_phone: '',
    contact_email: '',
    is_featured: false
  });
  const [marketplaceStatus, setMarketplaceStatus] = useState<{success: boolean, text: string} | null>(null);

  const [loading, setLoading] = useState(true);

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<{success: boolean, text: string} | null>(null);

  const hpDarkBlue = '#1e3a8a';

  useEffect(() => {
    fetchPROData();
  }, [activeTab]);

  const fetchPROData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }

      // FIX 1: Cleaned all API URLs
      if (activeTab === 'feedback') {
          const res = await fetch('https://harare-poly-api.onrender.com/api/pro/feedback', { headers: { 'Authorization': `Bearer ${token}` }});
          if (res.ok) setFeedback(await res.json());
      } else if (activeTab === 'jobs') {
          const res = await fetch('https://harare-poly-api.onrender.com/api/pro/pending-jobs', { headers: { 'Authorization': `Bearer ${token}` }});
          if (res.ok) setPendingJobs(await res.json());
      } else if (activeTab === 'gallery') {
          const res = await fetch('https://harare-poly-api.onrender.com/api/gallery', { headers: { 'Authorization': `Bearer ${token}` }});
          if (res.ok) setGallery(await res.json());
      } else if (activeTab === 'marketplace') {
          const res = await fetch('https://harare-poly-api.onrender.com/api/marketplace');
          if (res.ok) setMarketplaceItems(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
      e.preventDefault();
      setSendStatus(null);
      try {
          const token = localStorage.getItem('token');
          // FIX 1: Cleaned API URL
          const res = await fetch('https://harare-poly-api.onrender.com/api/pro/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage })
          });
          if (res.ok) {
              setSendStatus({ success: true, text: "Broadcast sent to all alumni!" });
              setBroadcastTitle(''); setBroadcastMessage('');
              setTimeout(() => setSendStatus(null), 4000);
          }
      } catch (err) {}
  };

  const handleVerifyJob = async (id: number, status: 'Approved' | 'Rejected') => {
      try {
          const token = localStorage.getItem('token');
          // FIX 1: Cleaned API URL
          const res = await fetch(`https://harare-poly-api.onrender.com/api/pro/jobs/${id}/verify`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ status })
          });
          if (res.ok) {
              setPendingJobs(prev => prev.filter(job => job.id !== id));
          }
      } catch (err) {
          alert("Failed to update job status.");
      }
  };

  const handleAddHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        // FIX 1: Cleaned API URL
        const res = await fetch('https://harare-poly-api.onrender.com/api/pro/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newGalleryItem)
        });
        if (res.ok) {
            setNewGalleryItem({ title: '', description: '', image_url: '', category: 'Achievement' });
            fetchPROData();
        }
    } catch (err) {
        alert("Failed to add highlight");
    }
  };

  const handleDeleteHighlight = async (id: number) => {
      try {
          const token = localStorage.getItem('token');
          // FIX 1: Cleaned API URL
          await fetch(`https://harare-poly-api.onrender.com/api/pro/gallery/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          setGallery(prev => prev.filter(item => item.id !== id));
      } catch (err) {}
  };

  const handlePublishStory = async (e: React.FormEvent) => {
      e.preventDefault();
      setPublishStatus(null);
      try {
          const token = localStorage.getItem('token');
          // FIX 1: Cleaned API URL
          const res = await fetch('https://harare-poly-api.onrender.com/api/stories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(newStory)
          });
          
          if (res.ok) {
              setPublishStatus({ success: true, text: "Story published to the Landing Page!" });
              setNewStory({ title: '', excerpt: '', content: '', image_url: '' });
              setTimeout(() => setPublishStatus(null), 4000);
          } else {
              setPublishStatus({ success: false, text: "Failed to publish story." });
          }
      } catch (err) {
          setPublishStatus({ success: false, text: "Server error." });
      }
  };

  const handleAddMarketplaceItem = async (e: React.FormEvent) => {
      e.preventDefault();
      setMarketplaceStatus(null);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('https://harare-poly-api.onrender.com/api/pro/marketplace', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(newMarketplaceItem)
          });
          if (res.ok) {
              setMarketplaceStatus({ success: true, text: "Listing added to Harare Polytechnic Marketplace!" });
              setNewMarketplaceItem({
                  company_name: '',
                  title: '',
                  category: 'Product',
                  description: '',
                  price: '',
                  image_url: '',
                  contact_phone: '',
                  contact_email: '',
                  is_featured: false
              });
              fetchPROData();
              setTimeout(() => setMarketplaceStatus(null), 4000);
          } else {
              setMarketplaceStatus({ success: false, text: "Failed to add listing." });
          }
      } catch (err) {
          setMarketplaceStatus({ success: false, text: "Server error." });
      }
  };

  const handleToggleFeatured = async (id: number, currentStatus: boolean) => {
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`https://harare-poly-api.onrender.com/api/pro/marketplace/${id}/feature`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ is_featured: !currentStatus })
          });
          if (res.ok) {
              setMarketplaceItems(prev =>
                  prev.map(item => item.id === id ? { ...item, is_featured: !currentStatus } : item)
              );
          }
      } catch (err) {
          alert("Failed to update featured status.");
      }
  };

  const handleDeleteMarketplaceItem = async (id: number) => {
      if (!confirm("Delete this Marketplace listing?")) return;
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`https://harare-poly-api.onrender.com/api/pro/marketplace/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              setMarketplaceItems(prev => prev.filter(item => item.id !== id));
          }
      } catch (err) {
          alert("Failed to delete listing.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* FIX 2: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden">
             <div className="w-8 h-8 rounded bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mr-3">HP</div>
             <span className="font-bold text-lg sm:text-xl tracking-tight truncate block" style={{ color: hpDarkBlue }}>Public Relations <span className="font-light">Command Center</span></span>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/login'; }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors shrink-0 whitespace-nowrap ml-2">
              Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* TAB NAVIGATION */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-8 custom-scrollbar">
            <button 
                onClick={() => setActiveTab('feedback')}
                className={`whitespace-nowrap py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'feedback' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <MessageSquare className="mr-2" size={18} /> Direct Feedback
            </button>
            <button 
                onClick={() => setActiveTab('jobs')}
                className={`whitespace-nowrap py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'jobs' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Briefcase className="mr-2" size={18} /> Pending Vacancies
                {pendingJobs.length > 0 && activeTab !== 'jobs' && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingJobs.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('gallery')}
                className={`whitespace-nowrap py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'gallery' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <ImageIcon className="mr-2" size={18} /> Media & Highlights
            </button>
            <button 
                onClick={() => setActiveTab('stories')}
                className={`whitespace-nowrap py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'stories' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Award className="mr-2" size={18} /> Success Stories
            </button>
            <button 
                onClick={() => setActiveTab('marketplace')}
                className={`whitespace-nowrap py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'marketplace' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Store className="mr-2" size={18} /> Marketplace
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center mb-4 pb-3 border-b border-gray-50">
                        <Megaphone className="text-blue-800 mr-3" size={24} />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Broadcast Notice</h2>
                            <p className="text-xs text-gray-500">Send an alert to all alumni profiles</p>
                        </div>
                    </div>
                    {sendStatus && <div className={`p-3 rounded-md text-sm mb-4 font-medium ${sendStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{sendStatus.text}</div>}
                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                        <div>
                            {/* FIX 3: Added text-gray-900 */}
                            <input type="text" required value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} placeholder="Subject / Title" className="w-full p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm" />
                        </div>
                        <div>
                            {/* FIX 3: Added text-gray-900 */}
                            <textarea required rows={5} value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Message Body..." className="w-full p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm" />
                        </div>
                        <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-md hover:bg-blue-900 shadow-sm flex items-center justify-center transition-colors">
                            <Send size={18} className="mr-2" /> Send Broadcast
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                    
                    {activeTab === 'feedback' && (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <div><h3 className="text-lg font-bold text-gray-900">Alumni Submissions</h3><p className="text-xs text-gray-500">Memories, Growth Partnerships, and Direct Feedback</p></div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{feedback.length} Entries</span>
                            </div>
                            <div className="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-4">
                                {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div></div> : feedback.length === 0 ? <div className="text-center py-10 text-gray-500 text-sm">No submissions received yet.</div> : feedback.map((item) => (
                                    <div key={item.id} className="bg-white p-5 border border-gray-100 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center font-bold mr-3">{item.first_name[0]}{item.last_name[0]}</div>
                                                <div><h4 className="font-bold text-gray-900 text-sm">{item.first_name} {item.last_name}</h4><p className="text-xs text-gray-500">{item.department} (Class of {item.graduation_year})</p></div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-200">{item.category}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100 mb-3">"{item.message}"</div>
                                        <div className="flex justify-between text-xs"><a href={`mailto:${item.email}`} className="text-blue-600 hover:underline font-medium"><Mail size={14} className="inline mr-1" /> Reply</a><span className="text-gray-400 font-medium">Submitted: {new Date(item.created_at).toLocaleDateString()}</span></div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'jobs' && (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-amber-50 flex justify-between items-center">
                                <div><h3 className="text-lg font-bold text-amber-900">Pending Job Verifications</h3><p className="text-xs text-amber-700">Verify company authenticity before making jobs public.</p></div>
                                <span className="bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">{pendingJobs.length} Pending</span>
                            </div>
                            <div className="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-4">
                                {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div></div> : pendingJobs.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500 text-sm"><CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />All caught up! No pending jobs to review.</div>
                                ) : pendingJobs.map((job) => (
                                    <div key={job.id} className="bg-white p-5 border border-amber-200 rounded-xl shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg mb-1">{job.title}</h4>
                                                <p className="text-blue-800 font-medium text-sm mb-2">{job.company} • {job.location}</p>
                                                <p className="text-xs text-gray-500">Posted by: <strong>{job.posted_by_name}</strong> on {new Date(job.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex space-x-2 mt-4 sm:mt-0">
                                                <button onClick={() => handleVerifyJob(job.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center transition-colors">
                                                    <CheckCircle size={16} className="mr-1"/> Approve
                                                </button>
                                                <button onClick={() => handleVerifyJob(job.id, 'Rejected')} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-md text-sm font-bold flex items-center transition-colors">
                                                    <XCircle size={16} className="mr-1"/> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'gallery' && (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
                                <div><h3 className="text-lg font-bold text-blue-900">Media & Highlights</h3><p className="text-xs text-blue-700">Upload achievements, graduation photos, and campus news to the Homepage.</p></div>
                            </div>
                            
                            <div className="p-6 bg-white border-b border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center"><PlusCircle size={16} className="mr-2 text-blue-600"/> Post New Highlight</h4>
                                <form onSubmit={handleAddHighlight} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* FIX 3: Added text-gray-900 */}
                                    <input type="text" required value={newGalleryItem.title} onChange={e => setNewGalleryItem({...newGalleryItem, title: e.target.value})} placeholder="Highlight Title" className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm" />
                                    {/* FIX 3: Added text-gray-900 */}
                                    <select value={newGalleryItem.category} onChange={e => setNewGalleryItem({...newGalleryItem, category: e.target.value})} className="p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 text-sm">
                                        <option value="Achievement">Achievement</option>
                                        <option value="Graduation">Graduation</option>
                                        <option value="Campus">Campus News</option>
                                    </select>
                                    {/* FIX 3: Added text-gray-900 */}
                                    <input type="url" required value={newGalleryItem.image_url} onChange={e => setNewGalleryItem({...newGalleryItem, image_url: e.target.value})} placeholder="Image URL (e.g. https://.../photo.jpg)" className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm md:col-span-2" />
                                    {/* FIX 3: Added text-gray-900 */}
                                    <textarea required rows={2} value={newGalleryItem.description} onChange={e => setNewGalleryItem({...newGalleryItem, description: e.target.value})} placeholder="Short description..." className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm md:col-span-2" />
                                    <button type="submit" className="md:col-span-2 bg-blue-800 text-white font-bold py-2 rounded-md hover:bg-blue-900 transition-colors">Publish to Homepage</button>
                                </form>
                            </div>

                            <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {gallery.map(item => (
                                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                                            <div className="h-32 w-full bg-gray-200 relative overflow-hidden">
                                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <span className="absolute top-2 left-2 bg-blue-800/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase">{item.category}</span>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-bold text-gray-900 text-sm">{item.title}</h5>
                                                    <button onClick={() => handleDeleteHighlight(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'stories' && (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-indigo-50 flex justify-between items-center">
                                <div><h3 className="text-lg font-bold text-indigo-900">Success Stories & Spotlights</h3><p className="text-xs text-indigo-700">Write and publish full-length articles featuring outstanding alumni.</p></div>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
                                <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-sm max-w-3xl mx-auto">
                                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4"><Award size={20} className="mr-2 text-indigo-600"/> Publish New Story</h4>
                                    
                                    {publishStatus && <div className={`p-4 rounded-md text-sm mb-6 font-medium ${publishStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{publishStatus.text}</div>}
                                    
                                    <form onSubmit={handlePublishStory} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                                            {/* FIX 3: Added text-gray-900 */}
                                            <input type="text" required value={newStory.title} onChange={e => setNewStory({...newStory, title: e.target.value})} placeholder="e.g. Alumnus Spotlight: Jane Doe at Econet" className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Short Excerpt</label>
                                            {/* FIX 3: Added text-gray-900 */}
                                            <textarea required rows={2} value={newStory.excerpt} onChange={e => setNewStory({...newStory, excerpt: e.target.value})} placeholder="A quick summary for the landing page card..." className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Cover Image URL</label>
                                            {/* FIX 3: Added text-gray-900 */}
                                            <input type="url" required value={newStory.image_url} onChange={e => setNewStory({...newStory, image_url: e.target.value})} placeholder="https://..." className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Article Content</label>
                                            {/* FIX 3: Added text-gray-900 */}
                                            <textarea required rows={8} value={newStory.content} onChange={e => setNewStory({...newStory, content: e.target.value})} placeholder="Write the full success story here..." className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        
                                        <div className="pt-2">
                                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 shadow-md transition-colors flex justify-center items-center">
                                                <Send size={18} className="mr-2"/> Publish Story
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'marketplace' && (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-emerald-50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                    <h3 className="text-lg font-bold text-emerald-900">Harare Polytechnic Marketplace</h3>
                                    <p className="text-xs text-emerald-700">Manage products and services from campus enterprises (e.g., Poly Fashions) and feature highlights on the Home Page.</p>
                                </div>
                                <span className="bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full w-fit shrink-0">
                                    {marketplaceItems.length} Listings
                                </span>
                            </div>

                            {/* Add New Listing Form */}
                            <div className="p-6 bg-white border-b border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <PlusCircle size={16} className="mr-2 text-emerald-600" /> Add Product or Service
                                </h4>

                                {marketplaceStatus && (
                                    <div className={`p-3 rounded-md text-sm mb-4 font-medium ${marketplaceStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {marketplaceStatus.text}
                                    </div>
                                )}

                                <form onSubmit={handleAddMarketplaceItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        required
                                        value={newMarketplaceItem.company_name}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, company_name: e.target.value })}
                                        placeholder="Business Unit / Company (e.g. Poly Fashions)"
                                        className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm"
                                    />
                                    <input
                                        type="text"
                                        required
                                        value={newMarketplaceItem.title}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, title: e.target.value })}
                                        placeholder="Product or Service Name"
                                        className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm"
                                    />
                                    <select
                                        value={newMarketplaceItem.category}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, category: e.target.value })}
                                        className="p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
                                    >
                                        <option value="Product">Product</option>
                                        <option value="Service">Service</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={newMarketplaceItem.price}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, price: e.target.value })}
                                        placeholder="Price (e.g. $25 USD or Request Quote)"
                                        className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newMarketplaceItem.contact_phone}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, contact_phone: e.target.value })}
                                        placeholder="Contact Phone (e.g. +263 77 123 4567)"
                                        className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm"
                                    />
                                    <input
                                        type="email"
                                        value={newMarketplaceItem.contact_email}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, contact_email: e.target.value })}
                                        placeholder="Contact Email (e.g. fashions@hrepoly.ac.zw)"
                                        className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm"
                                    />
                                    <input
                                        type="url"
                                        value={newMarketplaceItem.image_url}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, image_url: e.target.value })}
                                        placeholder="Image URL (https://...)"
                                        className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm md:col-span-2"
                                    />
                                    <textarea
                                        required
                                        rows={2}
                                        value={newMarketplaceItem.description}
                                        onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, description: e.target.value })}
                                        placeholder="Short description of the product or service..."
                                        className="p-2.5 border border-gray-300 rounded-md text-gray-900 text-sm md:col-span-2"
                                    />
                                    <label className="md:col-span-2 flex items-center space-x-2 text-sm text-gray-700 font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newMarketplaceItem.is_featured}
                                            onChange={e => setNewMarketplaceItem({ ...newMarketplaceItem, is_featured: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-800 focus:ring-blue-800"
                                        />
                                        <span>Feature on Home Page Showcase</span>
                                    </label>
                                    <button
                                        type="submit"
                                        className="md:col-span-2 bg-emerald-700 text-white font-bold py-2.5 rounded-md hover:bg-emerald-800 transition-colors"
                                    >
                                        Publish to Marketplace
                                    </button>
                                </form>
                            </div>

                            {/* Existing Listings */}
                            <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
                                {loading ? (
                                    <div className="text-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div>
                                    </div>
                                ) : marketplaceItems.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 text-sm">
                                        No marketplace listings yet. Add your first product or service above.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {marketplaceItems.map((item) => (
                                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                                <div className="h-36 w-full bg-gray-100 relative overflow-hidden">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Store size={36} />
                                                        </div>
                                                    )}
                                                    <span className="absolute top-2 left-2 bg-blue-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                        {item.company_name}
                                                    </span>
                                                    <span className="absolute top-2 right-2 bg-white/95 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {item.category}
                                                    </span>
                                                </div>

                                                <div className="p-4 flex flex-col flex-grow">
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <h5 className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</h5>
                                                        <button
                                                            onClick={() => handleDeleteMarketplaceItem(item.id)}
                                                            className="text-red-400 hover:text-red-600 shrink-0"
                                                            title="Delete listing"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    {item.price && (
                                                        <div className="inline-flex items-center text-xs font-bold text-emerald-700 mb-2">
                                                            <Tag size={12} className="mr-1 shrink-0" /> {item.price}
                                                        </div>
                                                    )}

                                                    <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-grow">{item.description}</p>

                                                    <div className="text-[11px] text-gray-500 space-y-1 mb-3">
                                                        {item.contact_phone && (
                                                            <div className="flex items-center truncate">
                                                                <Phone size={12} className="mr-1.5 shrink-0 text-blue-800" /> {item.contact_phone}
                                                            </div>
                                                        )}
                                                        {item.contact_email && (
                                                            <div className="flex items-center truncate">
                                                                <Mail size={12} className="mr-1.5 shrink-0 text-blue-800" /> {item.contact_email}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                                                        className={`w-full py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center transition-colors ${
                                                            item.is_featured
                                                                ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <Star size={14} className={`mr-1.5 shrink-0 ${item.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                                                        {item.is_featured ? 'Featured on Home Page' : 'Feature on Home Page'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
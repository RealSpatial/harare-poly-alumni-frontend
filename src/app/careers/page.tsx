'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Briefcase, MapPin, Clock, ExternalLink, Plus, Search, Building2, X, Trash2 } from 'lucide-react';

interface JobPosting {
  id: number;
  poster_id: number;
  first_name: string;
  last_name: string;
  department: string;
  company_name: string;
  job_title: string;
  location: string;
  job_type: string;
  description: string;
  application_link: string;
  created_at: string;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
      company_name: '', job_title: '', location: 'Harare, Zimbabwe', job_type: 'Full-time', description: '', application_link: ''
  });

  const hpDarkBlue = '#1e3a8a';

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/alumni/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUserId(user.user_id || user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { 
        // Give them a return ticket so the login page knows where to send them back!
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`; 
        return; 
      }

      await fetchCurrentUser(token);

      const response = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to remove this job vacancy?")) return;
    
    setDeletingId(jobId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete job posting.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/jobs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(jobForm)
          });

          if (res.ok) {
              setShowPostModal(false);
              setJobForm({ company_name: '', job_title: '', location: 'Harare, Zimbabwe', job_type: 'Full-time', description: '', application_link: '' });
              fetchJobs(); // Refresh the board
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsSubmitting(false);
      }
  };

  const filteredJobs = jobs.filter(job => 
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <a href="/profile" className="text-gray-500 hover:text-blue-800 transition-colors mr-2"><ArrowLeft size={20}/></a>
             <span className="font-bold text-xl tracking-tight" style={{ color: hpDarkBlue }}>Alumni <span className="font-light">Job Board</span></span>
          </div>
          <button 
            onClick={() => setShowPostModal(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-bold px-4 py-2 rounded-md shadow-sm transition-colors flex items-center"
          >
              <Plus size={16} className="mr-1" /> Post a Vacancy
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-800 mb-4 transform rotate-3">
                <Briefcase size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Career Opportunities</h1>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
                Discover roles posted directly by fellow Harare Poly graduates. Hiring? Post a vacancy to recruit trusted, technically skilled alumni for your organization.
            </p>
            
            <div className="relative max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search by job title or company..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm" 
                />
            </div>
        </div>

        {/* Job Listings */}
        {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div></div>
        ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-900">No jobs posted yet</h3>
                <p className="text-sm text-gray-500 mt-1">Be the first to share an opportunity with the network.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {filteredJobs.map(job => (
                    <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-start justify-between gap-6">
                        
                        <div className="flex-grow">
                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-800 transition-colors">{job.job_title}</h2>
                            <h3 className="text-md font-medium text-blue-600 mb-3">{job.company_name}</h3>
                            
                            <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-600 mb-4">
                                <span className="flex items-center bg-gray-100 px-2.5 py-1 rounded-md"><MapPin size={14} className="mr-1 text-gray-400" /> {job.location}</span>
                                <span className="flex items-center bg-gray-100 px-2.5 py-1 rounded-md"><Clock size={14} className="mr-1 text-gray-400" /> {job.job_type}</span>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed mb-4">{job.description}</p>
                            
                            <div className="flex items-center border-t border-gray-50 pt-4 mt-4">
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs mr-2">
                                    {job.first_name[0]}{job.last_name[0]}
                                </div>
                                <span className="text-xs text-gray-500">
                                    Posted by <span className="font-bold text-gray-900">{job.first_name} {job.last_name}</span> ({job.department}) 
                                    <span className="mx-2">•</span> 
                                    {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {}
                        <div className="shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 gap-2">
                            <a 
                                href={job.application_link.includes('http') ? job.application_link : `https://${job.application_link}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full md:w-auto bg-blue-800 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-900 transition-all flex items-center justify-center shadow-sm"
                            >
                                Apply Now <ExternalLink size={16} className="ml-2" />
                            </a>

                            {(job.poster_id === currentUserId || localStorage.getItem('role') === 'admin') && (
                                <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    disabled={deletingId === job.id}
                                    className="w-full md:w-auto border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-xs"
                                >
                                    <Trash2 size={14} className="mr-1.5" />
                                    {deletingId === job.id ? 'Deleting...' : 'Remove Vacancy'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* POST JOB MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900">Post a Vacancy</h3>
              <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form onSubmit={handlePostJob} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input required type="text" value={jobForm.company_name} onChange={e => setJobForm({...jobForm, company_name: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-md text-sm" placeholder="e.g. Econet Wireless" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input required type="text" value={jobForm.job_title} onChange={e => setJobForm({...jobForm, job_title: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-md text-sm" placeholder="e.g. Senior Technician" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input required type="text" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-md text-sm" placeholder="e.g. Harare, Zimbabwe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                            <select value={jobForm.job_type} onChange={e => setJobForm({...jobForm, job_type: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-white">
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Attachment / Internship</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                        <textarea required rows={4} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-md text-sm" placeholder="Briefly describe the role, requirements, and responsibilities..."></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Application Link or Email</label>
                        <input required type="text" value={jobForm.application_link} onChange={e => setJobForm({...jobForm, application_link: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-md text-sm" placeholder="e.g. https://company.com/careers or hr@company.com" />
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-800 text-white font-bold py-3 rounded-md hover:bg-blue-900 transition-colors shadow-sm disabled:bg-blue-400 flex justify-center items-center">
                            {isSubmitting ? 'Posting...' : 'Post Job to Network'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
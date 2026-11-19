'use client';

import React, { useState, useEffect } from 'react';
import { Rocket, ArrowLeft, Building2, Globe, FileText, CheckCircle2 } from 'lucide-react';

export default function StartupsPage() {
  const [formData, setFormData] = useState({ name: '', industry: '', website: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const hpDarkBlue = '#1e3a8a';
  const hpBackground = '#f8fafc';

  // Return Ticket Check (Traffic Cop)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/companies', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to register startup.');
      
      setSuccess(true);
      // Wait 3 seconds, then redirect to the public directory so they can see their company!
      setTimeout(() => {
          window.location.href = '/directory';
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: hpBackground }}>
      <nav className="bg-white shadow-sm border-b" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/profile" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors font-medium">
            <ArrowLeft className="mr-2" size={20} /> Back to Profile
          </a>
          <span className="font-bold text-lg" style={{ color: hpDarkBlue }}>Startup Registration</span>
        </div>
      </nav>

      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 sm:p-10 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
             <Rocket size={48} className="mb-4 text-blue-200" />
             <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">Register Your Enterprise</h1>
             <p className="text-blue-100 text-lg max-w-lg">
                Add your business to the official Harare Poly Corporate Directory and let the network know you are alumni-owned.
             </p>
          </div>

          <div className="p-8 sm:p-10">
              {success ? (
                  <div className="text-center py-10">
                      <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle2 size={40} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Startup Registered!</h2>
                      <p className="text-gray-600 mb-6">Your company is now officially listed on the Corporate Directory.</p>
                      <p className="text-sm text-blue-600 font-bold animate-pulse">Redirecting you to the directory...</p>
                  </div>
              ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{error}</div>}
                      
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Company / Startup Name</label>
                          <div className="relative">
                              <Building2 className="absolute top-3 left-3 text-gray-400" size={18} />
                              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Innovate Tech Solutions" />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Industry</label>
                              <select required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 bg-white">
                                  <option value="">Select Industry...</option>
                                  <option value="Information Technology">Information Technology</option>
                                  <option value="Construction & Engineering">Construction & Engineering</option>
                                  <option value="Finance & Accounting">Finance & Accounting</option>
                                  <option value="Manufacturing">Manufacturing</option>
                                  <option value="Media & Design">Media & Design</option>
                                  <option value="Other">Other</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Website URL (Optional)</label>
                              <div className="relative">
                                  <Globe className="absolute top-3 left-3 text-gray-400" size={18} />
                                  <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500" placeholder="https://..." />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Short Description</label>
                          <div className="relative">
                              <FileText className="absolute top-3 left-3 text-gray-400" size={18} />
                              <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500" placeholder="What does your company do?" />
                          </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-800 text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:bg-gray-400">
                              {isSubmitting ? 'Registering...' : 'Launch on the Directory 🚀'}
                          </button>
                      </div>
                  </form>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
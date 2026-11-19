'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, ShieldAlert, CheckCircle2, Headset, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success_it' | 'success_email' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [method, setMethod] = useState<'email' | 'it'>('email');

  const hpDarkBlue = '#1e3a8a';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Choose the correct endpoint based on the user's selection
      const endpoint = method === 'it' 
        ? '[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/auth/request-reset' 
        : '[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/auth/send-reset-email';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      
      setStatus(method === 'it' ? 'success_it' : 'success_email');
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/login" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors font-medium">
            <ArrowLeft className="mr-2" size={20} /> Back to Login
          </a>
          <span className="font-bold text-xl tracking-tight" style={{ color: hpDarkBlue }}>
            Harare Poly <span className="font-light">Support</span>
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-10">
            
          {status === 'success_it' ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="text-green-600 w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">IT Ticket Opened</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                      If your email is registered, a secure ticket has been opened. Please contact the administration office to receive your temporary access code.
                  </p>
                  <a href="/login" className="w-full inline-flex justify-center items-center bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-bold shadow-md">
                      Return to Login
                  </a>
              </div>
          ) : status === 'success_email' ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <Send className="text-blue-600 w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check Your Inbox</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                      If your email is registered in our system, we have sent a password reset link to your inbox. The link will expire in 1 hour.
                  </p>
                  <a href="/login" className="w-full inline-flex justify-center items-center bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-bold shadow-md">
                      Return to Login
                  </a>
              </div>
          ) : (
              <>
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                      <ShieldAlert className="text-amber-600 w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password Recovery</h2>
                  <p className="text-gray-600 text-sm">
                    Choose how you would like to recover your account access.
                  </p>
                </div>

                {status === 'error' && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button type="button" onClick={() => setMethod('email')} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${method === 'email' ? 'border-blue-800 bg-blue-50 text-blue-900' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                        <Mail className="mb-2" size={24} />
                        <span className="text-xs font-bold uppercase tracking-wider">Email Link</span>
                    </button>
                    <button type="button" onClick={() => setMethod('it')} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${method === 'it' ? 'border-blue-800 bg-blue-50 text-blue-900' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                        <Headset className="mb-2" size={24} />
                        <span className="text-xs font-bold uppercase tracking-wider">IT Support</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-gray-400"
                  >
                    {status === 'submitting' 
                        ? 'Processing...' 
                        : method === 'email' 
                            ? 'Send Email Reset Link' 
                            : 'Open IT Support Ticket'
                    }
                  </button>
                </form>
              </>
          )}

        </div>
      </main>
    </div>
  );
}
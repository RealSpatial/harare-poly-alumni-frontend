'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const hpDarkBlue = '#1e3a8a';

  useEffect(() => {
    // Manually parse the URL parameters since we cannot rely on next/navigation here
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlEmail = urlParams.get('email');

    setToken(urlToken);
    setEmail(urlEmail);

    // If they land on this page without a token or email, show an error immediately
    if (!urlToken || !urlEmail) {
      setStatus('error');
      setErrorMessage("Invalid or missing reset token. Please request a new link.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // FIX 1: Cleaned the API URL
      const res = await fetch('https://harare-poly-api.onrender.com/api/auth/reset-password-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password Updated!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
              Your password has been securely reset. You can now log into your account using your new credentials.
          </p>
          <a href="/login" className="w-full inline-flex justify-center items-center bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-bold shadow-md">
              Proceed to Login
          </a>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Lock className="text-blue-800 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Create New Password</h2>
        <p className="text-gray-600 text-sm">
          Please enter a strong, secure password for your account.
        </p>
      </div>

      {status === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Only show the form if we actually have a token to use */}
      {token && email && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            {/* FIX 3: Added text-gray-900 */}
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            {/* FIX 3: Added text-gray-900 */}
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-gray-400 mt-2"
          >
            {status === 'submitting' ? 'Updating Securely...' : 'Save New Password'}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  const hpDarkBlue = '#1e3a8a';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* FIX 2: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <a href="/login" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors font-medium shrink-0">
            <ArrowLeft className="mr-2" size={20} /> 
            <span className="hidden sm:block">Back to Login</span>
          </a>
          <div className="flex-1 text-right pl-4 overflow-hidden">
            <span className="font-bold text-lg sm:text-xl tracking-tight truncate block" style={{ color: hpDarkBlue }}>
              Harare Poly <span className="font-light">Security</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-10">
           <Suspense fallback={<div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div></div>}>
              <ResetPasswordForm />
           </Suspense>
        </div>
      </main>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hpDarkBlue = '#1e3a8a';

  // NEW: Auto-Redirect if already logged in!
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');

      if (redirectUrl) {
        window.location.href = redirectUrl; // If there is, go there
      } else {
        // Otherwise, use the default role-based routing
        if (role === 'admin') window.location.href = '/management-dashboard';
      else if (role === 'pro') window.location.href = '/pro-dashboard';
      else if (role === 'it') window.location.href = '/it-dashboard';
      else if (role === 'hod') window.location.href = '/hod-dashboard';
      else window.location.href = '/profile';
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success! Save the token and role to the browser
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      
      // NEW: Check if we have a "Return Ticket" in the URL after a successful login
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');

      // THE TRAFFIC COP ROUTING:
      if (redirectUrl) {
            window.location.href = redirectUrl; // Send them to the exact page they requested
        } else if (data.role === 'admin') {
            window.location.href = '/management-dashboard'; // Management goes to charts
        } else if (data.role === 'pro') {
            window.location.href = '/pro-dashboard';
        } else if (data.role === 'it') {
            window.location.href = '/it-dashboard';
        } else if (data.role === 'hod') {
            window.location.href = '/hod-dashboard'; // HOD goes to departmental analytics
        } else {
            window.location.href = '/profile'; // Normal users go to their personal profile
        }
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors font-medium">
            <ArrowLeft className="mr-2" size={20} /> Back to Home
          </a>
          <span className="font-bold text-xl tracking-tight" style={{ color: hpDarkBlue }}>
            Harare Poly <span className="font-light">Alumni Network</span>
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Sign in to your alumni account</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-gray-400"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <a href="/register" className="font-bold text-blue-800 hover:text-blue-900 hover:underline">Register here</a>
          </div>
        </div>
      </main>
    </div>
  );
}
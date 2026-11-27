'use client';

import React, { useState } from 'react';
import { ArrowLeft, UserPlus, CheckCircle2, Lock, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    graduationYear: '',
    department: '',
    courseName: '', 
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingStaffRole, setPendingStaffRole] = useState<string | null>(null);

  const hpDarkBlue = '#1e3a8a';
  const hpLightBlue = '#3b82f6';
  const hpBackground = '#f8fafc';

  // Live detection of official Harare Polytechnic staff email suffixes
  const lowerEmail = formData.email.trim().toLowerCase();
  const detectedStaffRole =
    lowerEmail.endsWith('.principal@hrepoly.ac.zw') ? 'Principal' :
    lowerEmail.endsWith('.vp@hrepoly.ac.zw') ? 'Vice Principal' :
    lowerEmail.endsWith('.pro@hrepoly.ac.zw') ? 'Public Relations Officer (PRO)' :
    lowerEmail.endsWith('.hod@hrepoly.ac.zw') ? 'Head of Department (HOD)' :
    lowerEmail.endsWith('.it@hrepoly.ac.zw') ? 'IT Support' :
    null;

  const isStaff = Boolean(detectedStaffRole);
  const isHod = lowerEmail.endsWith('.hod@hrepoly.ac.zw');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // FIX 1: Cleaned API URL
      const response = await fetch('https://harare-poly-api.onrender.com/api/alumni/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          student_id_number: isStaff ? '' : formData.studentId,
          graduation_year: isStaff ? null : parseInt(formData.graduationYear),
          department: isStaff && !isHod ? 'Administration' : formData.department,
          course_name: isStaff ? `Staff (${detectedStaffRole})` : formData.courseName, 
          email: formData.email.trim(),
          password: formData.password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please check your inputs.');
      }

      if (data.pendingApproval) {
        setPendingStaffRole(detectedStaffRole || data.role?.toUpperCase() || 'Staff');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: hpBackground }}>
      
      {/* FIX 2: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <a href="/" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors shrink-0">
            <ArrowLeft className="mr-2" size={20} />
            <span className="hidden sm:block">Back to Home</span>
          </a>
          <div className="flex-1 text-right pl-4 overflow-hidden">
            <span className="font-bold text-lg sm:text-xl truncate block" style={{ color: hpDarkBlue }}>
              {isStaff ? 'Staff Portal Registration' : 'Alumni Registration'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Form */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="px-6 py-8 md:p-10">
            {success ? (
              <div className="text-center py-8">
                {pendingStaffRole ? (
                  <>
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
                      <Clock className="h-10 w-10 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Awaiting Staff Verification</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Your <strong>{pendingStaffRole}</strong> account has been created and placed in the verification queue. Once IT Support or a Super Admin approves your account, you will be able to sign in.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
                    <p className="text-gray-600 mb-8">
                      Welcome to the Harare Polytechnic Alumni Network. Your secure profile has been created.
                    </p>
                  </>
                )}
                <a href="/login" className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Proceed to Login
                </a>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" style={{ backgroundColor: `${hpLightBlue}20` }}>
                    <UserPlus size={24} style={{ color: hpDarkBlue }} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900">Join the Network</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Connect with fellow graduates and track your career.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">Account Credentials</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        {/* FIX 3: Added text-gray-900 */}
                        <input type="email" name="email" required
                          value={formData.email} onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 sm:text-sm" 
                          placeholder="you@example.com" />
                      </div>
                      {isStaff && (
                        <div className="mt-2 flex items-center text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                          <ShieldCheck size={15} className="mr-1.5 shrink-0" />
                          Official {detectedStaffRole} email detected — requires admin approval after sign-up.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                        {/* FIX 3: Added text-gray-900 */}
                        <input type="password" name="password" required minLength={6}
                          value={formData.password} onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 sm:text-sm" 
                          placeholder="Create a strong password" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">
                      {isStaff ? 'Staff Details' : 'Polytechnic Details'}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        {/* FIX 3: Added text-gray-900 */}
                        <input type="text" name="firstName" required
                          value={formData.firstName} onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 sm:text-sm p-2.5 border" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        {/* FIX 3: Added text-gray-900 */}
                        <input type="text" name="lastName" required
                          value={formData.lastName} onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 sm:text-sm p-2.5 border" />
                      </div>
                    </div>

                    {!isStaff && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Student ID Number <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                        </label>
                        {/* FIX 3: Added text-gray-900 */}
                        <input type="text" name="studentId" placeholder="e.g., 2018H00123 (Leave blank if forgotten)"
                          value={formData.studentId} onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 sm:text-sm p-2.5 border" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {!isStaff && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                          {/* FIX 3: Added text-gray-900 */}
                          <input type="number" name="graduationYear" required={!isStaff} min="1919" max="2026"
                            value={formData.graduationYear} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 sm:text-sm p-2.5 border" />
                        </div>
                      )}

                      {(!isStaff || isHod) && (
                        <div className={isHod ? 'sm:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700">Department</label>
                          {/* FIX 3: Added text-gray-900 */}
                          <select name="department" required={!isStaff || isHod}
                            value={formData.department} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 sm:text-sm p-2.5 border bg-white">
                            <option value="">Select Department / Division</option>
                            <option value="Applied Arts">Applied Arts</option>
                            <option value="Automotive Engineering">Automotive Engineering</option>
                            <option value="Business and Management Studies">Business and Management Studies</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Construction Engineering">Construction Engineering</option>
                            <option value="Information and Communication Technology">Information and Communication Technology</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                            <option value="Library and Information Science">Library and Information Science</option>
                            <option value="Mechanical and Production Engineering">Mechanical and Production Engineering</option>
                            <option value="Printing and Graphic Arts">Printing and Graphic Arts</option>
                            <option value="Science Technology">Science Technology</option>
                            <option value="School of Journalism and Media Studies">School of Journalism and Media Studies</option>
                            <option value="School of Office Management">School of Office Management</option>
                            <option value="School of Hospitality and Tourism">School of Hospitality and Tourism</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {!isStaff && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Specific Course / Certificate</label>
                        {/* FIX 3: Added text-gray-900 */}
                        <input type="text" name="courseName" required={!isStaff} placeholder="e.g., NC in Plumbing and Drainlaying"
                          value={formData.courseName} onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 sm:text-sm p-2.5 border" />
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900 hover:shadow-xl'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Encrypting & Registering...
                        </span>
                      ) : (
                        isStaff ? 'Submit Staff Account for Approval' : 'Secure Registration'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Already have an account? <a href="/login" className="text-blue-600 font-medium hover:underline">Sign In</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
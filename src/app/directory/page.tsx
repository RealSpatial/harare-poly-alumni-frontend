'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Briefcase, MapPin, ArrowLeft, Globe, FileText, GraduationCap } from 'lucide-react';
import Link from 'next/link';

// Define the shape of our company data based on the PostgreSQL database
interface Company {
  id: number;
  name: string;
  industry: string;
  is_alumni_owned: boolean;
  website?: string;
  description?: string;
}

export default function DirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hpDarkBlue = '#1e3a8a';
  const hpLightBlue = '#3b82f6';
  const hpBackground = '#f8fafc';

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // FIX 1: Corrected API URL (removed markdown brackets)
        const response = await fetch('https://harare-poly-api.onrender.com/api/companies');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setCompanies(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        // FIX 2: Updated the hardcoded error message for production
        setError("Please check your internet connection or try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: hpBackground }}>
      
      {/* FIX 3: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors shrink-0">
            <ArrowLeft className="mr-2" size={20} />
            {/* Hidden on mobile, shown on larger screens */}
            <span className="hidden sm:block">Back to Home</span>
          </Link>
          <div className="flex-1 text-right pl-4 overflow-hidden">
            {/* Truncates text with '...' if it gets too long on tiny screens */}
            <span className="font-bold text-lg sm:text-xl truncate block" style={{ color: hpDarkBlue }}>Corporate Directory</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Official Partner Companies</h1>
          <p className="text-gray-600 max-w-2xl text-lg">
            A live directory of companies where Harare Polytechnic alumni are currently employed, or companies founded by our graduates.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center border border-gray-200">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="mt-1 text-gray-500">The database is currently empty. Add a company via the API to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col"
              >
                <div
                  className="h-2 w-full shrink-0"
                  style={{ backgroundColor: company.is_alumni_owned ? '#d97706' : hpDarkBlue }}
                ></div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{company.name}</h3>
                    {company.is_alumni_owned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        <GraduationCap size={14} />
                        Alumni-Founded
                      </span>
                    )}
                  </div>

                  {/* Show Description if available */}
                  {company.description && (
                    <div className="mb-4 text-sm text-gray-600 line-clamp-2 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                      "{company.description}"
                    </div>
                  )}
                  
                  <div className="space-y-3 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center">
                      <Briefcase className="mr-3 h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium">{company.industry || 'Industry not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-3 h-4 w-4 text-gray-400 shrink-0" />
                      <span>Harare, Zimbabwe</span>
                    </div>
                    
                    {/* NEW: Website Link Area */}
                    {company.website ? (
                      <div className="flex items-center">
                        <Globe className="mr-3 h-4 w-4 text-blue-500 shrink-0" />
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 hover:underline truncate font-medium transition-colors"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    ) : (
                       <div className="flex items-center text-gray-400">
                        <Globe className="mr-3 h-4 w-4 opacity-50 shrink-0" />
                        <span className="italic text-xs">No website provided</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Building2, TrendingUp, Download, Search, FileSpreadsheet, Briefcase, GraduationCap, Mail } from 'lucide-react';

interface AlumniData {
  first_name: string;
  last_name: string;
  department: string;
  course_name: string | null;
  graduation_year: number;
  student_id_number: string;
  job_title: string | null;
  company_name: string | null;
  email?: string; // NEW: Added email
}

interface DashboardStats {
  totalAlumni: number;
  totalCompanies: number;
  totalEmployed: number;
  totalFurtherStudies: number;
  departmentStats: { name: string; Alumni: number }[];
  tableData: AlumniData[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const hpDarkBlue = '#1e3a8a';
  const COLORS = ['#1e3a8a', '#3b82f6', '#059669', '#d97706', '#7c3aed', '#dc2626', '#db2777', '#ea580c', '#65a30d', '#0891b2', '#4f46e5', '#c026d3', '#e11d48', '#0d9488'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }

        // FIX 1: Cleaned the API URL (removed markdown brackets)
        const response = await fetch(`https://harare-poly-api.onrender.com/api/dashboard/stats?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const employmentRate = stats && stats.totalAlumni > 0 ? Math.round(((stats.totalEmployed || 0) / stats.totalAlumni) * 100) : 0;
  const studiesRate = stats && stats.totalAlumni > 0 ? Math.round(((stats.totalFurtherStudies || 0) / stats.totalAlumni) * 100) : 0;

  const handleDownloadCSV = () => {
    if (!stats || !stats.tableData || stats.tableData.length === 0) return;

    const summaryRows = [
        ["HARARE POLYTECHNIC ALUMNI - EXECUTIVE INSIGHTS REPORT"],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [],
        ["KEY PERFORMANCE INDICATORS"],
        ["Total Registered Alumni:", stats.totalAlumni],
        ["Verified Corporate Partners:", stats.totalCompanies],
        ["Alumni Employment Rate:", `${employmentRate}%`, `(${stats.totalEmployed} out of ${stats.totalAlumni})`],
        ["Further Education Rate:", `${studiesRate}%`, `(${stats.totalFurtherStudies} out of ${stats.totalAlumni})`],
        [],
        ["--------------------------------------------------------"],
        ["FULL ALUMNI DIRECTORY"],
        []
    ];

    const headers = ['First Name', 'Last Name', 'Email', 'Student ID', 'Department', 'Course/Certificate', 'Graduation Year', 'Job Title', 'Company'];
    const dataRows = stats.tableData.map(alumnus => [
      alumnus.first_name || 'N/A',
      alumnus.last_name || 'N/A',
      alumnus.email || 'N/A',
      alumnus.student_id_number || 'N/A',
      alumnus.department || 'N/A',
      alumnus.course_name || 'N/A',
      alumnus.graduation_year || 'N/A',
      alumnus.job_title || 'N/A',
      alumnus.company_name || 'N/A'
    ]);

    const csvContent = [
      ...summaryRows.map(row => row.join(',')), 
      headers.join(','),                        
      ...dataRows.map(row => row.map(cell => `"${cell}"`).join(',')) 
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HP_Alumni_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTable = (stats?.tableData || []).filter(alumnus => {
      if (!alumnus) return false;
      const searchStr = searchTerm.toLowerCase();
      const fName = (alumnus.first_name || '').toLowerCase();
      const lName = (alumnus.last_name || '').toLowerCase();
      const dept = (alumnus.department || '').toLowerCase();
      const comp = (alumnus.company_name || '').toLowerCase();
      const email = (alumnus.email || '').toLowerCase();

      return fName.includes(searchStr) || lName.includes(searchStr) || dept.includes(searchStr) || comp.includes(searchStr) || email.includes(searchStr);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* FIX 2: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden">
             <div className="w-8 h-8 rounded bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mr-3">HP</div>
             <span className="font-bold text-lg sm:text-xl tracking-tight truncate block" style={{ color: hpDarkBlue }}>Management <span className="font-light">Dashboard</span></span>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors shrink-0 whitespace-nowrap ml-2">
              Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-500 mt-1 text-sm">Real-time overview of alumni engagement and metrics.</p>
          </div>
          <button 
            onClick={handleDownloadCSV}
            suppressHydrationWarning
            disabled={stats === null || stats.tableData.length === 0}
            className="flex items-center px-5 py-2.5 bg-blue-800 rounded-lg text-sm font-bold text-white hover:bg-blue-900 shadow-md transition-all transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:transform-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Full Insight Report
          </button>
        </div>

        {loading && <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div></div>}
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8"><p className="text-sm text-red-700 font-medium">Error: {error}</p></div>}

        {stats && !loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registered Alumni</p>
                  <p className="text-4xl font-extrabold text-gray-900">{stats.totalAlumni}</p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 text-blue-800"><Users size={28} /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Corporate Partners</p>
                  <p className="text-4xl font-extrabold text-gray-900">{stats.totalCompanies}</p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-50 text-green-700"><Building2 size={28} /></div>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-2xl shadow-lg flex items-center justify-between text-white">
                <div>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Platform Status</p>
                  <p className="text-4xl font-extrabold">Online</p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 text-white"><TrendingUp size={28} /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-800"><Briefcase size={20} /></div>
                            <h3 className="font-bold text-gray-900">Employment Rate</h3>
                        </div>
                        <span className="text-2xl font-extrabold text-blue-800">{employmentRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                        <div className="bg-blue-800 h-2.5 rounded-full" style={{ width: `${employmentRate}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                        Based on captured alumni, {employmentRate}% are currently employed or operating businesses.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-700"><GraduationCap size={20} /></div>
                            <h3 className="font-bold text-gray-900">Further Education</h3>
                        </div>
                        <span className="text-2xl font-extrabold text-purple-700">{studiesRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${studiesRate}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                        {studiesRate}% of alumni have pursued a Degree, Masters, or PhD after graduating from Harare Poly.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-2">Alumni Distribution by Department</h3>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.departmentStats} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 11 }} 
                        angle={-45} 
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="Alumni" fill={hpDarkBlue} radius={[6, 6, 0, 0]} barSize={35} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-2">Department Ratio</h3>
                <div className="h-[400px] w-full mt-4">
                  {stats.departmentStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.departmentStats} cx="50%" cy="40%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="Alumni" animationDuration={1500}>
                          {stats.departmentStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', lineHeight: '1.4' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
                    <div className="flex items-center">
                        <FileSpreadsheet className="text-blue-800 mr-3" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Live Alumni Database</h3>
                            <p className="text-xs text-gray-500">Quickly search and view registered profiles</p>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        {/* FIX 3: Added text-gray-900 */}
                        <input 
                            type="text" 
                            placeholder="Search name, email, dept, or company..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumnus</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Employment</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {filteredTable?.map((alumnus, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3">
                                                {alumnus.first_name[0]}{alumnus.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{alumnus.first_name} {alumnus.last_name}</div>
                                                <div className="text-xs text-gray-500">Class of {alumnus.graduation_year}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                            {alumnus.email ? (
                                                <a href={`mailto:${alumnus.email}`} className="hover:text-blue-600">{alumnus.email}</a>
                                            ) : (
                                                <span className="italic text-gray-400">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">{alumnus.department}</div>
                                        {alumnus.course_name && <div className="text-xs text-gray-500 italic">{alumnus.course_name}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {alumnus.student_id_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {alumnus.job_title ? (
                                            <>
                                                <div className="text-sm font-bold text-gray-900">{alumnus.job_title}</div>
                                                <div className="text-xs text-blue-600 font-medium">{alumnus.company_name}</div>
                                            </>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Not Specified
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTable?.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">No alumni match your search.</div>
                    )}
                </div>
            </div>

          </>
        )}
      </main>
    </div>
  );
}
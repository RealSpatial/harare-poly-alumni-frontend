'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Building2, TrendingUp, Download, Search, FileSpreadsheet,
  Briefcase, GraduationCap, Mail, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AlumniData {
  first_name: string;
  last_name: string;
  department: string;
  course_name: string | null;
  graduation_year: number;
  student_id_number: string;
  job_title: string | null;
  company_name: string | null;
  email?: string;
}

interface DashboardStats {
  totalAlumni: number;
  totalCompanies: number;
  totalEmployed: number;
  totalFurtherStudies: number;
  departmentStats: { name: string; Alumni: number }[];
  tableData: AlumniData[];
}

const ACRONYMS = new Set(['NC', 'ND', 'HND', 'BTECH', 'MTECH', 'ICT', 'IT', 'AI', 'BIM', 'CAD']);
const LOWER_WORDS = new Set(['and', 'in', 'of', 'for', 'to']);

const formatCourseName = (raw: string | null) => {
  if (!raw || !raw.trim()) return null;
  return raw
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper === 'BTECH' ? 'BTech' : upper === 'MTECH' ? 'MTech' : upper;
      const lower = word.toLowerCase();
      if (idx > 0 && LOWER_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
};

const shortenDeptLabel = (name: string) => {
  if (name === 'Information and Communication Technology') return 'ICT';
  if (name === 'Mechanical and Production Engineering') return 'Mechanical & Prod. Eng.';
  if (name === 'Business and Management Studies') return 'Business & Management';
  if (name === 'School of Journalism and Media Studies') return 'Journalism & Media';
  if (name === 'School of Hospitality and Tourism') return 'Hospitality & Tourism';
  if (name === 'School of Office Management') return 'Office Management';
  if (name === 'Library and Information Science') return 'Library & Info Science';
  return name;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [employmentFilter, setEmploymentFilter] = useState<'All' | 'Employed' | 'Unspecified'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const hpDarkBlue = '#1e3a8a';
  const COLORS = ['#1e3a8a', '#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#db2777', '#ea580c', '#65a30d', '#0891b2', '#4f46e5', '#c026d3', '#e11d48', '#0d9488'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }

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

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDept, employmentFilter]);

  const employmentRate = stats && stats.totalAlumni > 0 ? Math.round(((stats.totalEmployed || 0) / stats.totalAlumni) * 100) : 0;
  const studiesRate = stats && stats.totalAlumni > 0 ? Math.round(((stats.totalFurtherStudies || 0) / stats.totalAlumni) * 100) : 0;

  const sortedDeptStats = [...(stats?.departmentStats || [])]
    .sort((a, b) => b.Alumni - a.Alumni)
    .map(item => ({
      ...item,
      shortName: shortenDeptLabel(item.name)
    }));

  const uniqueDepartments = Array.from(new Set((stats?.tableData || []).map(a => a.department).filter(Boolean))).sort();

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
    if (selectedDept !== 'All' && alumnus.department !== selectedDept) return false;
    if (employmentFilter === 'Employed' && !alumnus.job_title) return false;
    if (employmentFilter === 'Unspecified' && alumnus.job_title) return false;

    const searchStr = searchTerm.toLowerCase().trim();
    if (!searchStr) return true;

    const fName = (alumnus.first_name || '').toLowerCase();
    const lName = (alumnus.last_name || '').toLowerCase();
    const fullName = `${fName} ${lName}`;
    const dept = (alumnus.department || '').toLowerCase();
    const comp = (alumnus.company_name || '').toLowerCase();
    const email = (alumnus.email || '').toLowerCase();
    const stdId = (alumnus.student_id_number || '').toLowerCase();

    return fullName.includes(searchStr) || dept.includes(searchStr) || comp.includes(searchStr) || email.includes(searchStr) || stdId.includes(searchStr);
  });

  const totalPages = Math.max(1, Math.ceil(filteredTable.length / rowsPerPage));
  const paginatedRows = filteredTable.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Sticky Top Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mr-3">HP</div>
            <span className="font-bold text-lg sm:text-xl tracking-tight truncate block" style={{ color: hpDarkBlue }}>
              Management <span className="font-light">Dashboard</span>
            </span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.href = '/login';
            }}
            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors shrink-0 whitespace-nowrap ml-2"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Page Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Platform Analytics</h1>
            <p className="text-gray-500 mt-1 text-sm">Real-time executive overview of graduate outcomes and department metrics.</p>
          </div>
          <button
            onClick={handleDownloadCSV}
            suppressHydrationWarning
            disabled={stats === null || stats.tableData.length === 0}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-blue-800 rounded-xl text-sm font-bold text-white hover:bg-blue-900 shadow-sm transition-all disabled:bg-gray-300 shrink-0"
          >
            <Download className="mr-2 h-4 w-4 shrink-0" />
            Download Insight Report (CSV)
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700 font-medium">Error: {error}</p>
          </div>
        )}

        {stats && !loading && !error && (
          <>
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registered Alumni</p>
                  <p className="text-4xl font-extrabold text-gray-900 tabular-nums">{stats.totalAlumni}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-800 shrink-0">
                  <Users size={26} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Corporate Partners</p>
                  <p className="text-4xl font-extrabold text-gray-900 tabular-nums">{stats.totalCompanies}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-700 shrink-0">
                  <Building2 size={26} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-2xl shadow-sm flex items-center justify-between text-white">
                <div>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Platform Status</p>
                  <p className="text-3xl sm:text-4xl font-extrabold">Online</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 text-white shrink-0">
                  <TrendingUp size={26} />
                </div>
              </div>
            </div>

            {/* Outcome Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-800"><Briefcase size={20} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">Employment Rate</h3>
                      <p className="text-xs text-gray-400">{stats.totalEmployed} of {stats.totalAlumni} alumni</p>
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-blue-800 tabular-nums">{employmentRate}%</span>
                </div>
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2.5 overflow-hidden">
                    <div className="bg-blue-800 h-2.5 rounded-full transition-all duration-700" style={{ width: `${employmentRate}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Percentage of registered alumni with active employment or enterprise records.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-700"><GraduationCap size={20} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">Further Education</h3>
                      <p className="text-xs text-gray-400">{stats.totalFurtherStudies} of {stats.totalAlumni} alumni</p>
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-purple-700 tabular-nums">{studiesRate}%</span>
                </div>
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2.5 overflow-hidden">
                    <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-700" style={{ width: `${studiesRate}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Alumni who pursued a BTech, Degree, Masters, or PhD after graduating from Harare Poly.
                  </p>
                </div>
              </div>
            </div>

            {/* Aligned Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sorted Horizontal Bar Chart — Never clips long Department names */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Alumni Distribution by Department</h3>
                    <p className="text-xs text-gray-500">Ranked highest to lowest registration volume</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full">
                    {sortedDeptStats.length} Active {sortedDeptStats.length === 1 ? 'Faculty' : 'Faculties'}
                  </span>
                </div>

                {sortedDeptStats.length > 0 ? (
                  <div className="w-full flex-grow flex items-center" style={{ minHeight: `${Math.max(280, sortedDeptStats.length * 52)}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortedDeptStats}
                        layout="vertical"
                        margin={{ top: 8, right: 28, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="shortName"
                          width={175}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                        />
                        <RechartsTooltip
                          cursor={{ fill: '#f8fafc' }}
                          formatter={(value: any) => [`${value} Alumni`, 'Registered']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)' }}
                        />
                        <Bar dataKey="Alumni" fill={hpDarkBlue} radius={[0, 6, 6, 0]} barSize={26} animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No department data yet.</div>
                )}
              </div>

              {/* Centered Donut + Clean Structured Percentage Breakdown */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Department Share</h3>
                  <p className="text-xs text-gray-500">Proportional breakdown of total alumni</p>
                </div>

                {sortedDeptStats.length > 0 ? (
                  <div className="flex flex-col flex-grow justify-between">
                    <div className="relative h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sortedDeptStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={88}
                            paddingAngle={3}
                            dataKey="Alumni"
                            nameKey="name"
                            animationDuration={1000}
                          >
                            {sortedDeptStats.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Donut Metric */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-extrabold text-gray-900 tabular-nums">{stats.totalAlumni}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
                      </div>
                    </div>

                    {/* Clean Aligned Breakdown List */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {sortedDeptStats.map((dept, index) => {
                        const pct = stats.totalAlumni > 0 ? Math.round((dept.Alumni / stats.totalAlumni) * 100) : 0;
                        return (
                          <div key={dept.name} className="flex items-center justify-between text-xs gap-3">
                            <div className="flex items-center min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 mr-2.5"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-gray-700 font-medium truncate" title={dept.name}>
                                {dept.name}
                              </span>
                            </div>
                            <div className="shrink-0 font-bold text-gray-900 tabular-nums">
                              {dept.Alumni} <span className="text-gray-400 font-normal">({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data available.</div>
                )}
              </div>
            </div>

            {/* Live Alumni Database with Filters, Aligned Columns & Pagination */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div className="flex items-center">
                  <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl mr-3 shrink-0">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-gray-900">Live Alumni Database</h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 tabular-nums">
                        {filteredTable.length} {filteredTable.length === 1 ? 'Record' : 'Records'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Filter, search, and contact registered graduates</p>
                  </div>
                </div>

                {/* Filter & Search Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500 sm:max-w-[200px]"
                  >
                    <option value="All">All Departments</option>
                    {uniqueDepartments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={employmentFilter}
                    onChange={(e) => setEmploymentFilter(e.target.value as 'All' | 'Employed' | 'Unspecified')}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Employed">Employed</option>
                    <option value="Unspecified">Not Specified</option>
                  </select>

                  <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumnus</th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department &amp; Course</th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedRows.map((alumnus, idx) => {
                      const formattedCourse = formatCourseName(alumnus.course_name);
                      const hasStudentId = Boolean(alumnus.student_id_number && alumnus.student_id_number.trim() !== '');
                      return (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          {/* Alumnus */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3 shrink-0">
                                {alumnus.first_name?.[0] || ''}{alumnus.last_name?.[0] || ''}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{alumnus.first_name} {alumnus.last_name}</div>
                                <div className="text-xs text-gray-500">
                                  {alumnus.graduation_year ? `Class of ${alumnus.graduation_year}` : 'Year N/A'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600 max-w-[220px]">
                              <Mail className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                              {alumnus.email ? (
                                <a
                                  href={`mailto:${alumnus.email}`}
                                  title={alumnus.email}
                                  className="hover:text-blue-700 hover:underline truncate"
                                >
                                  {alumnus.email}
                                </a>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>

                          {/* Department & Normalized Course */}
                          <td className="px-5 py-4 max-w-[260px]">
                            <div className="text-sm text-gray-900 font-semibold truncate" title={alumnus.department}>
                              {alumnus.department}
                            </div>
                            {formattedCourse ? (
                              <div className="text-xs text-gray-500 truncate mt-0.5" title={formattedCourse}>
                                {formattedCourse}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 mt-0.5">—</div>
                            )}
                          </td>

                          {/* Student ID */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {hasStudentId ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                                {alumnus.student_id_number.toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">—</span>
                            )}
                          </td>

                          {/* Current Role */}
                          <td className="px-5 py-4 max-w-[220px]">
                            {alumnus.job_title ? (
                              <div>
                                <div className="text-sm font-bold text-gray-900 truncate" title={alumnus.job_title}>
                                  {alumnus.job_title}
                                </div>
                                <div className="text-xs text-blue-700 font-medium truncate" title={alumnus.company_name || ''}>
                                  {alumnus.company_name}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 whitespace-nowrap">
                                Not Specified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredTable.length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    No alumni match your selected filters.
                  </div>
                )}
              </div>

              {/* Clean Pagination Footer */}
              {filteredTable.length > rowsPerPage && (
                <div className="px-5 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                  <div>
                    Showing <span className="font-bold text-gray-900">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                    <span className="font-bold text-gray-900">{Math.min(currentPage * rowsPerPage, filteredTable.length)}</span> of{' '}
                    <span className="font-bold text-gray-900">{filteredTable.length}</span> alumni
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} className="mr-1" /> Previous
                    </button>
                    <span className="px-2 font-bold text-gray-800 tabular-nums">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
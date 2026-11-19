'use client';

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, GraduationCap, ArrowLeft, BarChart3, Search, Mail, FileSpreadsheet, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

interface AlumniData {
    first_name: string;
    last_name: string;
    course_name: string | null;
    graduation_year: number;
    student_id_number: string;
    job_title: string | null;
    company_name: string | null;
    email: string | null;
}

interface HodStats {
    department: string;
    totalAlumni: number;
    totalEmployed: number;
    totalFurtherStudies: number;
    topCompanies: { name: string; count: number }[];
    tableData: AlumniData[];
    curriculumAdvice: string;
}

export default function HODDashboard() {
    const [stats, setStats] = useState<HodStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const hpDarkBlue = '#1e3a8a';
    const PIE_COLORS = ['#059669', '#7c3aed', '#94a3b8']; // Emerald (Employed), Purple (Studies), Gray (Seeking)

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/hod/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch HOD data');
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div></div>;

    const employmentRate = stats && stats.totalAlumni > 0 ? Math.round((stats.totalEmployed / stats.totalAlumni) * 100) : 0;

    // --- NEW: DATA PROCESSING FOR THE NEW CHARTS ---
    // 1. Calculate Career Outcomes
    let seekingCount = (stats?.totalAlumni || 0) - (stats?.totalEmployed || 0) - (stats?.totalFurtherStudies || 0);
    if (seekingCount < 0) seekingCount = 0; // Failsafe

    const careerData = [
        { name: 'Employed', value: stats?.totalEmployed || 0 },
        { name: 'Further Studies', value: stats?.totalFurtherStudies || 0 },
        { name: 'Seeking/Unspecified', value: seekingCount }
    ];

    // 2. Calculate Graduation Cohorts (Group by Year)
    const cohortMap: Record<number, number> = {};
    stats?.tableData.forEach(a => {
        if (a.graduation_year) {
            cohortMap[a.graduation_year] = (cohortMap[a.graduation_year] || 0) + 1;
        }
    });

    const cohortData = Object.keys(cohortMap)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(year => ({
            year,
            Alumni: cohortMap[parseInt(year)]
        }));
    // -----------------------------------------------

    const filteredTable = (stats?.tableData || []).filter(alumnus => {
        if (!alumnus) return false;
        const searchStr = searchTerm.toLowerCase();
        return (alumnus.first_name || '').toLowerCase().includes(searchStr) ||
            (alumnus.last_name || '').toLowerCase().includes(searchStr) ||
            (alumnus.company_name || '').toLowerCase().includes(searchStr) ||
            (alumnus.email || '').toLowerCase().includes(searchStr);
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">

            <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <a href="/" className="text-gray-500 hover:text-blue-800 transition-colors"><ArrowLeft size={24} /></a>
                        <span className="font-bold text-xl tracking-tight" style={{ color: hpDarkBlue }}>
                            Harare Polytechnic <span className="font-light">Departmental Analytics</span>
                        </span>
                    </div>
                    <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/login'; }} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">Sign Out</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8">
                        <p className="text-sm text-red-700 font-medium">Backend Error: {error}</p>
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Head of Department: {stats?.department || 'Loading...'}</h1>
                    <p className="text-gray-600 mt-2">Track the industry impact and career trajectories of your department's graduates.</p>
                </div>

                {!error && stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center mr-4"><Users size={28} /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Registered Alumni</p>
                                    <h3 className="text-3xl font-black text-gray-900">{stats.totalAlumni}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4"><Briefcase size={28} /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Employed</p>
                                    <h3 className="text-3xl font-black text-gray-900">{employmentRate}%</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                                <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4"><GraduationCap size={28} /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Further Studies</p>
                                    <h3 className="text-3xl font-black text-gray-900">{stats.totalFurtherStudies}</h3>
                                </div>
                            </div>
                        </div>

                        {/* NEW: Career Outcomes & Graduation Cohort Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Career Outcomes Pie Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Career Outcomes</h3>
                                <div className="h-64 w-full">
                                    {stats.totalAlumni > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={careerData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {careerData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">Not enough data to display.</div>
                                    )}
                                </div>
                            </div>

                            {/* Graduation Cohorts Line Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Alumni Registration by Cohort</h3>
                                <div className="h-64 w-full">
                                    {cohortData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={cohortData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                                                <RechartsTooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Line type="monotone" dataKey="Alumni" stroke={hpDarkBlue} strokeWidth={3} dot={{ r: 4, fill: hpDarkBlue, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">Not enough data to display.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900 rounded-2xl shadow-md p-8 text-white mb-8">
                            <div className="flex items-center mb-4">
                                <BarChart3 className="text-blue-300 mr-3" size={28} />
                                <h2 className="text-2xl font-bold">Departmental Curriculum Review</h2>
                            </div>
                            <p className="text-blue-100 max-w-3xl leading-relaxed mb-6">
                                Based on alumni feedback and current employment data, the most requested skill upgrade for your department is <span className="font-bold text-white">{stats.curriculumAdvice || 'Advanced Data Literacy'}</span>. Consider integrating this into your syllabus to align with industry trends.
                            </p>
                            <button className="bg-white text-blue-900 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                                Download Full Department Report (PDF)
                            </button>
                        </div>

                        {stats.topCompanies && stats.topCompanies.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                                <div className="flex items-center mb-6">
                                    <Building2 className="text-blue-800 mr-3" size={24} />
                                    <h3 className="text-lg font-bold text-gray-900">Top Companies Hiring Your Graduates</h3>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.topCompanies} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12 }} width={150} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="count" fill={hpDarkBlue} radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
                                <div className="flex items-center">
                                    <FileSpreadsheet className="text-blue-800 mr-3" size={24} />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Your Department's Alumni Database</h3>
                                        <p className="text-xs text-gray-500">View and contact students registered in your faculty.</p>
                                    </div>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search name, email, or company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumnus</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Specialization</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Employment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-50">
                                        {filteredTable?.map((alumnus, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3">
                                                            {alumnus.first_name?.[0] || ''}{alumnus.last_name?.[0] || ''}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900">{alumnus.first_name} {alumnus.last_name}</div>
                                                            <div className="text-xs text-gray-500 font-mono">ID: {alumnus.student_id_number}</div>
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
                                                    <div className="text-sm text-gray-900 font-medium">{alumnus.course_name || 'General Route'}</div>
                                                    <div className="text-xs text-gray-500">Class of {alumnus.graduation_year}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {alumnus.job_title ? (
                                                        <>
                                                            <div className="text-sm font-bold text-gray-900">{alumnus.job_title}</div>
                                                            <div className="text-xs text-blue-600 font-medium">{alumnus.company_name}</div>
                                                        </>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            Seeking Opportunities
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredTable?.length === 0 && (
                                    <div className="text-center py-10 text-gray-500 text-sm">No alumni found in your department.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
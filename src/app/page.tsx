'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Briefcase, Building2, MessageSquare, ArrowRight, Menu, X, ChevronRight, TrendingUp, Award, Users } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [spotlight, setSpotlight] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);

  // --- MAGNETIC NETWORK STATE ---
  const zoneRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [dotOffsets, setDotOffsets] = useState<Record<number, { x: number, y: number }>>({});
  const [btnCenter, setBtnCenter] = useState({ x: 600, y: 250 });
  const [zoneSize, setZoneSize] = useState({ w: 1200, h: 600 });
  const [isHovering, setIsHovering] = useState(false); // Tracks if the mouse is in the network zone

  const dots = [
    { id: 1, left: '10%', top: '20%', size: 8 },
    { id: 2, left: '18%', top: '55%', size: 12 },
    { id: 3, left: '12%', top: '85%', size: 6 },
    { id: 4, left: '32%', top: '15%', size: 10 },
    { id: 5, left: '48%', top: '35%', size: 6 },
    { id: 6, left: '68%', top: '18%', size: 12 },
    { id: 7, left: '85%', top: '30%', size: 8 },
    { id: 8, left: '92%', top: '60%', size: 10 },
    { id: 9, left: '82%', top: '88%', size: 8 },
    { id: 10, left: '28%', top: '75%', size: 10 },
    { id: 11, left: '68%', top: '65%', size: 6 },
    { id: 12, left: '52%', top: '12%', size: 8 },
    { id: 13, left: '5%', top: '40%', size: 6 },
    { id: 14, left: '95%', top: '20%', size: 7 },
  ];

  const edges = [
    [1, 4], [1, 13], [13, 2], [2, 10], [2, 3], [3, 10], 
    [4, 12], [4, 5], [12, 6], [5, 6], [6, 14], [14, 7], 
    [6, 7], [7, 8], [8, 11], [8, 9], [9, 11], [11, 10]
  ];
  
  const centerEdges = [3, 4, 5, 6, 9];
  // -----------------------------------

  const hpDarkBlue = '#1e3a8a';
  const hpLightBlue = '#3b82f6';
  const hpBackground = '#f8fafc';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }

    fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/pro/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGallery(data);
      })
      .catch(err => console.error("Failed to load gallery", err));

    fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/stories/latest')
      .then(res => res.json())
      .then(data => {
        if (data) setSpotlight(data);
      })
      .catch(err => console.error("Failed to load spotlight", err));
    
    fetch('[https://harare-poly-api.onrender.com](https://harare-poly-api.onrender.com)/api/public/trends')
      .then(res => res.json())
      .then(data => {
        if (data) setTrends(data);
      })
      .catch(err => console.error("Failed to load trends", err));  

      const updateCenter = () => {
        if (zoneRef.current && btnRef.current) {
            const zRect = zoneRef.current.getBoundingClientRect();
            const bRect = btnRef.current.getBoundingClientRect();
            setZoneSize({ w: zRect.width, h: zRect.height });
            setBtnCenter({
                x: (bRect.left - zRect.left + bRect.width / 2),
                y: (bRect.top - zRect.top + bRect.height / 2),
            });
        }
    };
    
    setTimeout(updateCenter, 100);
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/dashboard';
    if (userRole === 'pro') return '/pro-dashboard';
    if (userRole === 'it') return '/it-dashboard';
    if (userRole === 'hod') return '/hod-dashboard'; 
    return '/profile';
  };

  const getDashboardText = () => {
    if (userRole === 'admin' || userRole === 'pro' || userRole === 'it' || userRole === 'hod') return 'Command Center';
    return 'My Profile';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoneRef.current) return;
    const rect = zoneRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (btnRef.current) {
        const btnRect = btnRef.current.getBoundingClientRect();
        const btnCX = btnRect.left - rect.left + btnRect.width / 2;
        const btnCY = btnRect.top - rect.top + btnRect.height / 2;
        setBtnOffset({ x: (mouseX - btnCX) * 0.1, y: (mouseY - btnCY) * 0.1 }); 
    }

    const newOffsets: Record<number, {x: number, y: number}> = {};
    dots.forEach(dot => {
        const dotCX = (parseFloat(dot.left) / 100) * zoneSize.w;
        const dotCY = (parseFloat(dot.top) / 100) * zoneSize.h;

        const vectorX = mouseX - dotCX;
        const vectorY = mouseY - dotCY;
        const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        
        const dotPullStrength = 40; 
        if (distance > 0) {
            newOffsets[dot.id] = { 
                x: (vectorX / distance) * dotPullStrength, 
                y: (vectorY / distance) * dotPullStrength 
            };
        }
    });
    setDotOffsets(newOffsets);
  };

  const handleMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
    setDotOffsets({});
    setIsHovering(false); // Disable waves when mouse leaves
  };

  const getDotX = (dot: any, offX: number) => (parseFloat(dot.left) / 100) * zoneSize.w + offX;
  const getDotY = (dot: any, offY: number) => (parseFloat(dot.top) / 100) * zoneSize.h + offY;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: hpBackground }}>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md border-b-4" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-16 flex items-center justify-center">
                <img src="/logo.png" alt="Harare Polytechnic Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl md:text-2xl tracking-tight" style={{ color: hpDarkBlue }}>
                Harare Polytechnic <br className="hidden md:block lg:hidden" />
                <span className="text-gray-500 text-sm md:text-lg font-normal">Alumni Network</span>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="/directory" className="text-gray-600 hover:text-blue-800 font-medium transition-colors">Directory</a>
              <a href="/careers" className="text-gray-600 hover:text-blue-800 font-medium transition-colors">Careers</a>
              <a href="/mentorship" className="text-gray-600 hover:text-blue-800 font-medium transition-colors">Mentorship</a>
              
              {isLoggedIn ? (
                <a href={getDashboardLink()}
                  className="px-6 py-2.5 rounded-md text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  style={{ backgroundColor: hpDarkBlue }}
                >
                  {getDashboardText()}
                </a>
              ) : (
                <a href="/register"
                  className="px-6 py-2.5 rounded-md text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  style={{ backgroundColor: hpLightBlue }}
                >
                  Sign In
                </a>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="/directory" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-800">Directory</a>
              <a href="/careers" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-800">Careers</a>
              <a href="/mentorship" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-800">Mentorship</a>
              <div className="px-3 py-3">
                {isLoggedIn ? (
                  <a href={getDashboardLink()}
                    className="block w-full px-6 py-3 rounded-md text-white font-semibold text-center"
                    style={{ backgroundColor: hpDarkBlue }}
                  >
                    {getDashboardText()}
                  </a>
                ) : (
                  <a href="/register"
                    className="block w-full px-6 py-3 rounded-md text-white font-semibold text-center"
                    style={{ backgroundColor: hpDarkBlue }}
                  >
                    Sign In
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        
        <div 
          className="relative overflow-hidden"
          ref={zoneRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleMouseLeave}
        >
          
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-7xl -z-10 opacity-10">
             <div className="absolute top-20 right-0 w-96 h-96 rounded-full" style={{ backgroundColor: hpLightBlue, filter: 'blur(100px)' }}></div>
             <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full" style={{ backgroundColor: hpDarkBlue, filter: 'blur(80px)' }}></div>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* NEW: Expanding Impact Waves */}
            {isHovering && (
                <g>
                    <style>
                        {`
                        @keyframes impactWave {
                            0% { r: 50px; opacity: 0.5; stroke-width: 2px; }
                            100% { r: 600px; opacity: 0; stroke-width: 0.5px; }
                        }
                        .wave-circle {
                            fill: none;
                            stroke: ${hpLightBlue};
                            animation: impactWave 3s infinite cubic-bezier(0.1, 0.4, 0.8, 1);
                        }
                        .wave-2 { animation-delay: 1s; }
                        .wave-3 { animation-delay: 2s; }
                        `}
                    </style>
                    <circle cx={btnCenter.x + btnOffset.x} cy={btnCenter.y + btnOffset.y} className="wave-circle" />
                    <circle cx={btnCenter.x + btnOffset.x} cy={btnCenter.y + btnOffset.y} className="wave-circle wave-2" />
                    <circle cx={btnCenter.x + btnOffset.x} cy={btnCenter.y + btnOffset.y} className="wave-circle wave-3" />
                </g>
            )}

            {edges.map((edge, i) => {
                const d1 = dots.find(d => d.id === edge[0]);
                const d2 = dots.find(d => d.id === edge[1]);
                if(!d1 || !d2) return null;
                const off1 = dotOffsets[d1.id] || { x: 0, y: 0 };
                const off2 = dotOffsets[d2.id] || { x: 0, y: 0 };
                return (
                    <line
                        key={`edge-${i}`}
                        x1={getDotX(d1, off1.x)}
                        y1={getDotY(d1, off1.y)}
                        x2={getDotX(d2, off2.x)}
                        y2={getDotY(d2, off2.y)}
                        stroke={hpDarkBlue}
                        strokeWidth="1" 
                        opacity="0.2"
                        style={{ transition: 'x1 0.2s ease-out, y1 0.2s ease-out, x2 0.2s ease-out, y2 0.2s ease-out' }}
                    />
                );
            })}
            
            {centerEdges.map((dotId, i) => {
                const d1 = dots.find(d => d.id === dotId);
                if(!d1) return null;
                const off1 = dotOffsets[d1.id] || { x: 0, y: 0 };
                return (
                    <line
                        key={`cedge-${i}`}
                        x1={getDotX(d1, off1.x)}
                        y1={getDotY(d1, off1.y)}
                        x2={btnCenter.x + btnOffset.x}
                        y2={btnCenter.y + btnOffset.y}
                        stroke={hpDarkBlue}
                        strokeWidth="1" 
                        opacity="0.25"
                        style={{ transition: 'x1 0.2s ease-out, y1 0.2s ease-out, x2 0.2s ease-out, y2 0.2s ease-out' }}
                    />
                );
            })}

            {dots.map(dot => {
                const off = dotOffsets[dot.id] || { x: 0, y: 0 };
                return (
                    <circle
                        key={`dot-${dot.id}`}
                        cx={getDotX(dot, off.x)}
                        cy={getDotY(dot, off.y)}
                        r={dot.size / 2}
                        fill={hpLightBlue}
                        opacity="0.8"
                        style={{ transition: 'cx 0.2s ease-out, cy 0.2s ease-out' }}
                    />
                );
            })}
          </svg>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-32 pointer-events-none">
            <div className="text-center max-w-4xl mx-auto pointer-events-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                Connecting Generations of <br className="hidden md:block"/>
                <span style={{ color: hpDarkBlue }}>Harare Polytechnic Excellence.</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Since 1919, we have shaped industry leaders. Reconnect with classmates, track your career journey, and build the future of Zimbabwe's technical expertise.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                
                {isLoggedIn ? (
                  <a href={getDashboardLink()}
                    ref={btnRef}
                    className="w-full sm:w-auto px-8 py-4 rounded-lg text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-colors flex items-center justify-center group"
                    style={{ 
                      backgroundColor: hpDarkBlue,
                      transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
                      transition: 'transform 0.1s linear, background-color 0.3s'
                    }}
                  >
                    Return to Dashboard
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </a>
                ) : (
                  <a href="/register"
                    ref={btnRef}
                    className="w-full sm:w-auto px-8 py-4 rounded-lg text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-colors flex items-center justify-center group"
                    style={{ 
                      backgroundColor: hpDarkBlue,
                      transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
                      transition: 'transform 0.1s linear, background-color 0.3s'
                    }}
                  >
                    Join the Network
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </a>
                )}

                <a href="/directory" className="w-full sm:w-auto px-8 py-4 rounded-lg text-gray-700 bg-white border border-gray-200 font-semibold text-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center">
                  Corporate Partners
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white py-20 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900" style={{ color: hpDarkBlue }}>One Platform, Endless Opportunities</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Update your profile to help us track the impact of Harare Polytechnic graduates worldwide.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <a href="/profile" className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group block">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: `${hpLightBlue}20`, color: hpDarkBlue }}>
                  <Briefcase size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-between group-hover:text-blue-800 transition-colors">
                  Career Tracking
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">&rarr;</span>
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Log your employment history, promotions, and current role. See where other alumni are working.
                </p>
              </a>

              <a href="/profile" className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group block">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: `${hpLightBlue}20`, color: hpDarkBlue }}>
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-between group-hover:text-blue-800 transition-colors">
                  Further Studies
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">&rarr;</span>
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Did you attain a degree after Harare Polytechnic? Add it to your profile and inspire current students.
                </p>
              </a>

              <a href="/startups" className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group block">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: `${hpLightBlue}20`, color: hpDarkBlue }}>
                  <Building2 size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-between group-hover:text-blue-800 transition-colors">
                  Enterprise Startups
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">&rarr;</span>
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Have you created your own company? Register it here so we can celebrate your entrepreneurial success.
                </p>
              </a>

              <a href="/profile" className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group block">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: `${hpLightBlue}20`, color: hpDarkBlue }}>
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-between group-hover:text-blue-800 transition-colors">
                  Suggestion Box
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">&rarr;</span>
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Provide direct feedback to Management and HODs on how to improve the institution based on industry trends.
                </p>
              </a>
            </div>
          </div>
        </div>

        <div className="py-20 bg-slate-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center" style={{ color: hpDarkBlue }}>
                  <TrendingUp className="mr-3" size={32} />
                  Alumni Impact & Trends
                </h2>
                <p className="mt-4 text-gray-600 max-w-2xl">Discover where our graduates are leading the market and shaping the future of Zimbabwe's and global technical sectors.</p>
              </div>
              <a href="/careers" className="hidden md:flex text-blue-700 font-semibold hover:text-blue-900 items-center">
                Explore Job Board <ChevronRight size={20} className="ml-1"/>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dynamic Trending Professions Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6"><TrendingUp size={24} /></div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Trending Professions</h4>
                <ul className="space-y-3 mt-4 text-gray-600">
                  {trends?.trendingProfessions && trends.trendingProfessions.length > 0 ? (
                      trends.trendingProfessions.map((job: any, idx: number) => (
                          <li key={idx} className="flex justify-between items-center">
                              <span className="font-medium line-clamp-1 pr-2">{job.name}</span> 
                              <span className="text-emerald-600 text-sm font-bold whitespace-nowrap">{job.count} {Number(job.count) === 1 ? 'Grad' : 'Grads'}</span>
                          </li>
                      ))
                  ) : (
                      <li className="text-sm text-gray-400 italic">Aggregating live job data...</li>
                  )}
                </ul>
              </div>
              
              {/* Dynamic Top Hiring Partners Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6"><Users size={24} /></div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Top Hiring Partners</h4>
                <ul className="space-y-3 mt-4 text-gray-600">
                  {trends?.topCompanies && trends.topCompanies.length > 0 ? (
                      trends.topCompanies.map((company: any, idx: number) => (
                          <li key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium line-clamp-1 pr-2">{company.name}</span>
                              <span className="text-purple-700 text-xs font-bold bg-purple-50 px-2 py-1 rounded whitespace-nowrap">{company.count} {Number(company.count) === 1 ? 'Hire' : 'Hires'}</span>
                          </li>
                      ))
                  ) : (
                      <li className="text-sm text-gray-400 italic">Aggregating corporate partners...</li>
                  )}
                </ul>
              </div>
              
              <div className="bg-blue-900 p-8 rounded-2xl shadow-sm text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="w-12 h-12 rounded-xl bg-blue-800 text-blue-200 flex items-center justify-center mb-6"><Award size={24} /></div>
                
                <h4 className="text-lg font-bold mb-2 line-clamp-1">{spotlight?.title || 'Alumnus Spotlight'}</h4>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed line-clamp-3">
                  {spotlight?.excerpt || 'Loading latest success story...'}
                </p>
                
                {spotlight ? (
                  <a href={`/news/${spotlight.id}`} className="text-sm font-bold text-blue-300 hover:text-white flex items-center">
                    Read Full Story <ArrowRight size={16} className="ml-1"/>
                  </a>
                ) : (
                  <span className="text-sm font-bold text-blue-400">Loading...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900" style={{ color: hpDarkBlue }}>Latest from Campus</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Official highlights, graduations, and achievements from Harare Polytechnic.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.length > 0 ? gallery.slice(0, 3).map((item) => (
                <div key={item.id} className="group rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer">
                  <div className="h-56 overflow-hidden relative">
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md uppercase tracking-wider">{item.category}</div>
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 text-gray-400 font-medium">
                  Loading highlights...
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      <footer className="text-white py-12" style={{ backgroundColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Respice Finem</h2>
          <p className="text-blue-200 mb-8 max-w-md mx-auto text-sm">
            The official Alumni and Corporate tracking platform for Harare Polytechnic.
          </p>
          <div className="border-t border-blue-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-blue-300">
            <p>&copy; 2026 Harare Polytechnic. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/support" className="hover:text-white transition-colors">IT Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
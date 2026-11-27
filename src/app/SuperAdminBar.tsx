'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, BarChart3, Megaphone, GraduationCap, Users, Globe } from 'lucide-react';

export default function SuperAdminBar() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsSuperAdmin(Boolean(token && role === 'super_admin'));
  }, [pathname]);

  if (!isSuperAdmin) return null;

  const navItems = [
    { label: 'IT & Accounts', href: '/it-dashboard', icon: Users },
    { label: 'Management (Principal/VP)', href: '/management-dashboard', icon: BarChart3 },
    { label: 'PRO Center', href: '/pro-dashboard', icon: Megaphone },
    { label: 'HOD Analytics', href: '/hod-dashboard', icon: GraduationCap },
    { label: 'Public Home', href: '/', icon: Globe },
  ];

  return (
    <div className="bg-slate-900 text-white border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider">
            <Shield size={12} className="mr-1" /> Super Admin
          </span>
          <span className="text-xs text-slate-400 hidden lg:inline">Master Switcher:</span>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={13} className="mr-1.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
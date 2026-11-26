'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Phone, Mail, Store, Tag, Package } from 'lucide-react';

interface MarketplaceItem {
  id: number;
  company_name: string;
  title: string;
  category: string;
  description: string;
  price: string;
  image_url: string;
  contact_phone: string;
  contact_email: string;
  is_featured: boolean;
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const hpDarkBlue = '#1e3a8a';
  const hpBackground = '#f8fafc';

  useEffect(() => {
    fetch('https://harare-poly-api.onrender.com/api/marketplace')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => console.error('Failed to load marketplace:', err))
      .finally(() => setLoading(false));
  }, []);

  // Dynamically extract unique business units (e.g., Poly Fashions, etc.)
  const companies = ['All', ...Array.from(new Set(items.map((item) => item.company_name).filter(Boolean)))];
  const categories = ['All', 'Product', 'Service'];

  const filteredItems = items.filter((item) => {
    const matchesCompany = selectedCompany === 'All' || item.company_name === selectedCompany;
    const matchesCategory =
      selectedCategory === 'All' ||
      (item.category || 'Product').toLowerCase() === selectedCategory.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.company_name.toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q);

    return matchesCompany && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: hpBackground }}>
      {/* Responsive Mobile & Desktop Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-blue-800 transition-colors shrink-0 font-medium"
          >
            <ArrowLeft className="mr-2" size={20} />
            <span className="hidden sm:block">Back to Home</span>
          </Link>
          <div className="flex-1 text-right pl-4 overflow-hidden">
            <span className="font-bold text-base sm:text-xl truncate block" style={{ color: hpDarkBlue }}>
              Harare Polytechnic Marketplace
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Intro & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2" style={{ color: hpDarkBlue }}>
              Harare Polytechnic Marketplace
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Quality products and professional services offered by Harare Polytechnic enterprises and business units.
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products, services, units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
        </div>

        {/* Filters: Category + Business Unit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
          {/* Business Unit Filter Pills (horizontally scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {companies.map((company) => (
              <button
                key={company}
                onClick={() => setSelectedCompany(company)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCompany === company
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
                style={selectedCompany === company ? { backgroundColor: hpDarkBlue } : {}}
              >
                {company}
              </button>
            ))}
          </div>

          {/* Product / Service Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No listings found</h3>
            <p className="text-gray-500 text-sm">
              {items.length === 0
                ? 'Products and services from Harare Polytechnic units will appear here soon.'
                : 'Try adjusting your search or filter selection.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col"
              >
                {/* Image */}
                <div className="h-52 bg-slate-100 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Store size={48} />
                    </div>
                  )}
                  <span
                    className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                    style={{ backgroundColor: hpDarkBlue }}
                  >
                    {item.company_name}
                  </span>
                  <span className="absolute top-3 right-3 bg-white/95 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {item.category || 'Product'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">{item.title}</h2>
                  </div>

                  {item.price && (
                    <div className="inline-flex items-center text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-3">
                      <Tag size={14} className="mr-1.5 shrink-0" />
                      {item.price}
                    </div>
                  )}

                  <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-grow">
                    {item.description}
                  </p>

                  {/* Direct Contact Details */}
                  <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Order &amp; Inquiries
                    </p>
                    {item.contact_phone && (
                      <a
                        href={`tel:${item.contact_phone}`}
                        className="flex items-center text-gray-700 hover:text-blue-800 font-medium break-all"
                      >
                        <Phone size={15} className="mr-2 text-blue-800 shrink-0" />
                        {item.contact_phone}
                      </a>
                    )}
                    {item.contact_email && (
                      <a
                        href={`mailto:${item.contact_email}`}
                        className="flex items-center text-gray-700 hover:text-blue-800 font-medium break-all"
                      >
                        <Mail size={15} className="mr-2 text-blue-800 shrink-0" />
                        {item.contact_email}
                      </a>
                    )}
                    {!item.contact_phone && !item.contact_email && (
                      <p className="text-xs text-gray-400 italic">Contact Harare Polytechnic PR Office for inquiries.</p>
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
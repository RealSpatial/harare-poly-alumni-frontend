'use client';

import React, { useState } from 'react';
import { ArrowLeft, LifeBuoy, Key, Users, Briefcase, Mail, ShieldAlert } from 'lucide-react';

export default function SupportPage() {
  const hpDarkBlue = '#1e3a8a';
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "If you have forgotten your password, click the 'Open Support Ticket' button below, or click 'Forgot Password' on the login screen. You can choose to have a reset link emailed to you, or you can open a secure ticket with the IT department to receive a temporary access code.",
      icon: <Key className="text-blue-600 mr-3" size={20} />
    },
    {
      question: "How do I connect with other alumni?",
      answer: "Once logged in, navigate to the 'Network Directory'. You can search for alumni by name, department, or current job. Click 'Connect' to send a secure message. If they accept, they will share their contact information with you.",
      icon: <Users className="text-blue-600 mr-3" size={20} />
    },
    {
      question: "How do I add my company to the Startup Directory?",
      answer: "We love celebrating entrepreneurial success! Log into your account, go to the homepage, and click the 'Enterprise Startups' card. Fill out the registration form, and your company will instantly appear on the public Corporate Directory with an 'Alumni Owned' badge.",
      icon: <Briefcase className="text-blue-600 mr-3" size={20} />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      {/* FIX 1: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: hpDarkBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <a href="/" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors font-medium shrink-0">
            <ArrowLeft className="mr-2" size={20} /> 
            <span className="hidden sm:block">Back to Home</span>
          </a>
          <div className="flex-1 text-right pl-4 overflow-hidden">
            <span className="font-bold text-lg sm:text-xl tracking-tight truncate block" style={{ color: hpDarkBlue }}>
              Help & <span className="font-light">Support</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        <div className="text-center mb-12">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <LifeBuoy className="text-blue-800 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">How can we help you?</h1>
            <p className="text-gray-600 text-lg">
                Browse our frequently asked questions or contact the Harare Poly IT department for assistance.
            </p>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {faqs.map((faq, index) => (
                    <div key={index} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {faq.icon}
                                <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                            </div>
                            <span className="text-2xl text-gray-400 font-light">{openFaq === index ? '−' : '+'}</span>
                        </div>
                        {openFaq === index && (
                            <p className="mt-4 text-gray-600 leading-relaxed pl-8 animate-in slide-in-from-top-2 fade-in duration-200">
                                {faq.answer}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Contact IT Section */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <div className="flex items-center mb-3">
                        <ShieldAlert className="text-blue-200 mr-2" size={24} />
                        <h2 className="text-2xl font-bold">Still need help?</h2>
                    </div>
                    <p className="text-blue-100 mb-2">
                        If you are locked out of your account or experiencing technical issues, you can open a secure ticket with our IT Desk.
                    </p>
                    <a href="mailto:it-support@hrepoly.ac.zw" className="text-sm text-blue-200 hover:text-white flex items-center mt-4">
                        <Mail size={16} className="mr-2" /> or email it-support@hrepoly.ac.zw directly
                    </a>
                </div>
                
                <a href="/forgot-password" className="shrink-0 bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md flex items-center">
                    Open IT Ticket
                </a>
            </div>
        </div>

      </main>
    </div>
  );
}
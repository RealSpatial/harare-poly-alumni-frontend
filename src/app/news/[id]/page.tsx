'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Share2, Award } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function ArticlePage() {
  const params = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX 1: Cleaned API URL (removed markdown brackets, kept template literal)
    fetch(`https://harare-poly-api.onrender.com/api/stories/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setStory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div></div>;
  if (!story) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><h1 className="text-2xl font-bold text-gray-400">Story not found.</h1></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* FIX 2: Responsive Mobile Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <a href="/" className="text-gray-500 hover:text-blue-800 transition-colors flex items-center text-sm font-bold uppercase tracking-wider shrink-0">
            <ArrowLeft size={18} className="mr-2" /> 
            <span className="hidden sm:block">Back to Network</span>
          </a>
          <div className="flex-1 overflow-hidden flex justify-end items-center text-blue-800 font-bold pl-4">
            <Award className="mr-2 shrink-0" size={20}/> 
            <span className="truncate block">Alumni Spotlight</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">{story.title}</h1>
          <div className="flex items-center justify-center text-gray-500 text-sm space-x-6 font-medium">
            <span className="flex items-center"><Calendar size={16} className="mr-2" /> {new Date(story.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <button className="flex items-center hover:text-blue-600 transition-colors"><Share2 size={16} className="mr-2" /> Share Story</button>
          </div>
        </div>

        {/* Hero Image */}
        {story.image_url && (
          <div className="w-full h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-xl mb-12 border border-gray-100">
            <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <article className="prose prose-lg prose-blue max-w-none bg-white p-8 md:p-14 rounded-3xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {story.content}
        </article>
        
      </main>
    </div>
  );
}
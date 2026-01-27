'use client';

import { useState, useEffect } from 'react';
import { clipperDb } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AboutPage {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function AdminAboutPage() {
  const [about, setAbout] = useState<AboutPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    setIsLoading(true);
    const { data, error } = await clipperDb
      .from('AboutPage')
      .select('*')
      .single();

    if (!error && data) {
      setAbout(data as AboutPage);
      setFormData({
        title: data.title,
        content: data.content,
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!about) return;

    setIsSaving(true);
    setMessage(null);

    const { error } = await clipperDb
      .from('AboutPage')
      .update({
        title: formData.title,
        content: formData.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', about.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } else {
      setMessage({ type: 'success', text: 'Changes saved successfully.' });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-foreground">Edit About</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage about page content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors"
          >
            Preview
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 border text-xs ${
            message.type === 'success'
              ? 'border-border bg-muted/30 text-foreground'
              : 'border-border bg-muted/30 text-foreground'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="border border-border divide-y divide-border">
        {/* Title */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            placeholder="About"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Content
          </label>
          <textarea
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
            placeholder="Write about page content here..."
          />
          <p className="mt-2 text-[10px] text-muted-foreground">
            Use line breaks to separate paragraphs. URLs will be automatically linked.
          </p>
        </div>
      </div>

      {about && (
        <p className="mt-4 text-[10px] text-muted-foreground">
          Last updated: {new Date(about.updated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { clipperDb } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface AboutPage {
  id: string;
  title: string;
  content: string;
  profile_image_url: string | null;
  timeline: TimelineItem[];
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
    profile_image_url: '',
    timeline: [] as TimelineItem[],
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
      const aboutData = data as AboutPage;
      setAbout(aboutData);
      setFormData({
        title: aboutData.title,
        content: aboutData.content,
        profile_image_url: aboutData.profile_image_url || '',
        timeline: aboutData.timeline || [],
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
        profile_image_url: formData.profile_image_url || null,
        timeline: formData.timeline,
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

  const addTimelineItem = () => {
    setFormData({
      ...formData,
      timeline: [...formData.timeline, { year: '', title: '', description: '' }],
    });
  };

  const removeTimelineItem = (index: number) => {
    setFormData({
      ...formData,
      timeline: formData.timeline.filter((_, i) => i !== index),
    });
  };

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    const newTimeline = [...formData.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setFormData({ ...formData, timeline: newTimeline });
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
        {/* Profile Image URL */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Profile Image URL
          </label>
          <input
            type="url"
            value={formData.profile_image_url}
            onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            placeholder="https://example.com/image.jpg"
          />
          {formData.profile_image_url && (
            <div className="mt-3">
              <img
                src={formData.profile_image_url}
                alt="Profile preview"
                className="w-20 h-20 object-cover rounded-full border border-border"
              />
            </div>
          )}
        </div>

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
            Bio
          </label>
          <textarea
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
            placeholder="Write about page content here..."
          />
          <p className="mt-2 text-[10px] text-muted-foreground">
            Use line breaks to separate paragraphs. URLs will be automatically linked.
          </p>
        </div>

        {/* Timeline */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs font-medium text-foreground">
              Timeline
            </label>
            <button
              onClick={addTimelineItem}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Item
            </button>
          </div>

          {formData.timeline.length === 0 ? (
            <p className="text-xs text-muted-foreground">No timeline items yet.</p>
          ) : (
            <div className="space-y-4">
              {formData.timeline.map((item, index) => (
                <div key={index} className="border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => updateTimelineItem(index, 'year', e.target.value)}
                        className="px-2 py-1.5 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                        placeholder="Year (e.g., 2024)"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                        className="col-span-2 px-2 py-1.5 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                        placeholder="Title"
                      />
                    </div>
                    <button
                      onClick={() => removeTimelineItem(index)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateTimelineItem(index, 'description', e.target.value)}
                    className="mt-2 w-full px-2 py-1.5 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                    placeholder="Description (optional)"
                  />
                </div>
              ))}
            </div>
          )}
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

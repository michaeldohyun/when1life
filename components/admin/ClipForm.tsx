'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clip, clipperDb } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ClipFormProps {
  clip?: Clip;
  isNew?: boolean;
}

export function ClipForm({ clip, isNew }: ClipFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    content: string;
    content_type: 'text' | 'link' | 'image';
    source: string;
    category: string;
    tags: string;
    summary: string;
    image_url: string;
  }>({
    content: clip?.content || '',
    content_type: clip?.content_type || 'text',
    source: clip?.source || '',
    category: clip?.category || '',
    tags: clip?.tags?.join(', ') || '',
    summary: clip?.summary || '',
    image_url: clip?.image_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const tags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const data = {
      content: formData.content,
      content_type: formData.content_type as 'text' | 'link' | 'image',
      source: formData.source || null,
      category: (formData.category as 'idea' | 'article' | 'quote' | 'book') || null,
      tags: tags.length > 0 ? tags : null,
      summary: formData.summary || null,
      image_url: formData.image_url || null,
      ai_processed: true,
    };

    try {
      if (isNew) {
        const { error } = await clipperDb.from('Clips').insert({
          ...data,
          chat_id: 'admin',
        });
        if (error) throw error;
      } else if (clip) {
        const { error } = await clipperDb
          .from('Clips')
          .update(data)
          .eq('id', clip.id);
        if (error) throw error;
      }

      router.push('/admin/clips');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clips"
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-foreground">
              {isNew ? 'New Clip' : 'Edit Clip'}
            </h1>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-border bg-muted/30 text-xs text-foreground">
          {error}
        </div>
      )}

      <div className="border border-border divide-y divide-border">
        {/* Content */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Content <span className="text-muted-foreground">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
            placeholder="Enter clip content"
          />
        </div>

        {/* Content Type */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Type
          </label>
          <select
            value={formData.content_type}
            onChange={(e) => setFormData({ ...formData, content_type: e.target.value as 'text' | 'link' | 'image' })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="text">Text</option>
            <option value="link">Link</option>
            <option value="image">Image</option>
          </select>
        </div>

        {/* Category */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="">None</option>
            <option value="idea">Idea</option>
            <option value="article">Article</option>
            <option value="quote">Quote</option>
            <option value="book">Book</option>
          </select>
        </div>

        {/* Source */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Source
          </label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            placeholder="Source URL or name"
          />
        </div>

        {/* Summary */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Summary
          </label>
          <input
            type="text"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            placeholder="Brief summary"
          />
        </div>

        {/* Tags */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Tags
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            placeholder="Comma separated (e.g., AI, startup, tech)"
          />
        </div>

        {/* Image URL */}
        <div className="p-4">
          <label className="block text-xs font-medium text-foreground mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    </form>
  );
}

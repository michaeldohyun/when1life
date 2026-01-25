'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clip, clipperDb } from '@/lib/supabase';
import { Save, ArrowLeft, X } from 'lucide-react';
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
      category: (formData.category as 'idea' | 'article' | 'quote') || null,
      tags: tags.length > 0 ? tags : null,
      summary: formData.summary || null,
      image_url: formData.image_url || null,
      ai_processed: true,
    };

    try {
      if (isNew) {
        const { error } = await clipperDb.from('Clip').insert({
          ...data,
          chat_id: 'admin', // 관리자가 직접 추가한 클립
        });
        if (error) throw error;
      } else if (clip) {
        const { error } = await clipperDb
          .from('Clip')
          .update(data)
          .eq('id', clip.id);
        if (error) throw error;
      }

      router.push('/admin/clips');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clips"
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isNew ? '새 클립' : '클립 수정'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6">
        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] resize-none"
            placeholder="클립 내용을 입력하세요"
          />
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            콘텐츠 유형
          </label>
          <select
            value={formData.content_type}
            onChange={(e) => setFormData({ ...formData, content_type: e.target.value as 'text' | 'link' | 'image' })}
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="text">텍스트</option>
            <option value="link">링크</option>
            <option value="image">이미지</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            카테고리
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="">선택 안함</option>
            <option value="idea">아이디어</option>
            <option value="article">읽을거리</option>
            <option value="quote">명언</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            출처
          </label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="출처 URL 또는 이름"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            요약
          </label>
          <input
            type="text"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="간략한 요약"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            태그
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="쉼표로 구분 (예: AI, 스타트업, 기술)"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            이미지 URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    </form>
  );
}

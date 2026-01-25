'use client';

import { useState, useEffect } from 'react';
import { Clip, clipperDb, CATEGORY_NAME } from '@/lib/supabase';
import { Pencil, Trash2, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    setIsLoading(true);
    const { data, error } = await clipperDb
      .from('Clip')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClips(data as Clip[]);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await clipperDb.from('Clip').delete().eq('id', id);

    if (!error) {
      setClips(clips.filter((clip) => clip.id !== id));
      setDeleteConfirm(null);
    }
  };

  const filteredClips = clips.filter((clip) => {
    const matchesSearch =
      !searchQuery ||
      clip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.source?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || clip.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">클립 관리</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            총 {filteredClips.length}개의 클립
          </p>
        </div>
        <Link
          href="/admin/clips/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 클립
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] appearance-none cursor-pointer"
          >
            <option value="all">전체 카테고리</option>
            <option value="idea">아이디어</option>
            <option value="article">읽을거리</option>
            <option value="quote">명언</option>
          </select>
        </div>
      </div>

      {/* Clips Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  내용
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden sm:table-cell">
                  카테고리
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden md:table-cell">
                  출처
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden lg:table-cell">
                  생성일
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredClips.map((clip) => (
                <tr
                  key={clip.id}
                  className="hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm text-[var(--text-primary)] line-clamp-2">
                      {clip.content}
                    </p>
                    {clip.summary && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-1">
                        {clip.summary}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {clip.category && (
                      <span
                        className={`
                          inline-flex px-2 py-1 text-xs rounded-full
                          ${clip.category === 'idea' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                          ${clip.category === 'article' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${clip.category === 'quote' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        `}
                      >
                        {CATEGORY_NAME[clip.category]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-[var(--text-secondary)] truncate max-w-[150px]">
                      {clip.source || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-[var(--text-tertiary)]">
                      {new Date(clip.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/clips/${clip.id}/edit`}
                        className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-md transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {deleteConfirm === clip.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(clip.id)}
                            className="px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(clip.id)}
                          className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--text-tertiary)]">클립이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

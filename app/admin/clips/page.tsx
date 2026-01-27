'use client';

import { useState, useEffect } from 'react';
import { Clip, clipperDb } from '@/lib/supabase';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    setIsLoading(true);
    const { data, error } = await clipperDb
      .from('Clips')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClips(data as Clip[]);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await clipperDb.from('Clips').delete().eq('id', id);

    if (!error) {
      setClips(clips.filter((clip) => clip.id !== id));
      setDeleteConfirm(null);
    }
  };

  const filteredClips = clips.filter((clip) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      clip.content.toLowerCase().includes(query) ||
      clip.summary?.toLowerCase().includes(query) ||
      clip.source?.toLowerCase().includes(query)
    );
  });

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
        <div>
          <h1 className="text-lg font-medium text-foreground">Clips</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredClips.length} items
          </p>
        </div>
        <Link
          href="/admin/clips/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
        />
      </div>

      {/* Clips List */}
      <div className="border border-border divide-y divide-border">
        {filteredClips.map((clip) => (
          <div
            key={clip.id}
            className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2">
                {clip.content}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                <span>{new Date(clip.created_at).toLocaleDateString('en-US')}</span>
                {clip.source && (
                  <>
                    <span>&middot;</span>
                    <span className="truncate max-w-[120px]">{clip.source}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/admin/clips/${clip.id}/edit`}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>
              {deleteConfirm === clip.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(clip.id)}
                    className="px-2 py-1 text-[10px] text-foreground bg-muted hover:bg-muted/80"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(clip.id)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredClips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xs text-muted-foreground">No clips found</p>
          </div>
        )}
      </div>
    </div>
  );
}

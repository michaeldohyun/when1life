'use client';

import { useState, useEffect, use } from 'react';
import { Clip, clipperDb } from '@/lib/supabase';
import { ClipForm } from '@/components/admin/ClipForm';
import { useRouter } from 'next/navigation';

interface EditClipPageProps {
  params: Promise<{ id: string }>;
}

export default function EditClipPage({ params }: EditClipPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [clip, setClip] = useState<Clip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClip = async () => {
      const { data, error } = await clipperDb
        .from('Clips')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/admin/clips');
        return;
      }

      setClip(data as Clip);
      setIsLoading(false);
    };

    fetchClip();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!clip) {
    return null;
  }

  return <ClipForm clip={clip} />;
}

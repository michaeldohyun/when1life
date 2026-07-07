'use client';

import { useState, useEffect } from 'react';
import { clipperDb } from '@/lib/supabase';
import { DEFAULT_HERO, type HomeHero } from '@/lib/content-db';

const inputCls =
  'w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground';
const labelCls = 'block text-xs font-medium text-foreground mb-1.5';

export default function AdminHomePage() {
  const [form, setForm] = useState<HomeHero | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await clipperDb
        .from('SiteContent')
        .select('content')
        .eq('key', 'home_hero')
        .maybeSingle();
      const c = (data?.content ?? {}) as Partial<HomeHero>;
      setForm({
        ...DEFAULT_HERO,
        ...c,
        diagram: { ...DEFAULT_HERO.diagram, ...(c.diagram ?? {}) },
      });
    })();
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setMsg(null);
    const { error } = await clipperDb
      .from('SiteContent')
      .upsert({ key: 'home_hero', content: form, updated_at: new Date().toISOString() });
    setMsg(error ? `저장 실패: ${error.message}` : '저장되었습니다. 홈에 바로 반영됩니다.');
    setSaving(false);
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const setDiagram = (
    box: 'before' | 'build' | 'after',
    field: 'label' | 'title' | 'desc',
    value: string,
  ) =>
    setForm({
      ...form,
      diagram: { ...form.diagram, [box]: { ...form.diagram[box], [field]: value } },
    });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-foreground">Edit Home</h1>
          <p className="text-xs text-muted-foreground mt-0.5">홈 히어로 문구 관리</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 text-sm bg-foreground text-background hover:opacity-90 disabled:opacity-50"
        >
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 border border-border bg-muted/30 text-xs text-foreground">
          {msg}
        </div>
      )}

      <div className="border border-border p-5 space-y-4">
        <div>
          <label className={labelCls}>킥커 (상단 작은 라벨)</label>
          <input
            value={form.kicker}
            onChange={(e) => setForm({ ...form, kicker: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>헤드라인 (줄바꿈 = 실제 줄바꿈)</label>
          <textarea
            rows={2}
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            className={inputCls + ' resize-none'}
          />
        </div>
        <div>
          <label className={labelCls}>서브 문단</label>
          <textarea
            rows={3}
            value={form.sub}
            onChange={(e) => setForm({ ...form, sub: e.target.value })}
            className={inputCls + ' resize-none'}
          />
        </div>
        <div>
          <label className={labelCls}>서브 문단 강조어 (모노 강조, 선택)</label>
          <input
            value={form.subHighlight ?? ''}
            onChange={(e) => setForm({ ...form, subHighlight: e.target.value })}
            placeholder="예: 300~440건"
            className={inputCls}
          />
        </div>

        {/* 다이어그램 */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-foreground">
              전환 다이어그램 (3박스, 설명은 줄바꿈 지원)
            </p>
            <select
              value={form.visual ?? 'diagram'}
              onChange={(e) =>
                setForm({ ...form, visual: e.target.value as 'diagram' | 'metrics' | 'none' })
              }
              className="px-2 py-1 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
            >
              <option value="diagram">전환 다이어그램</option>
              <option value="metrics">수치 카드</option>
              <option value="none">표시 안 함</option>
            </select>
          </div>
          <div className="space-y-4">
            {(['before', 'build', 'after'] as const).map((box) => (
              <div key={box} className="grid grid-cols-[90px_1fr_2fr] gap-2">
                <input
                  value={form.diagram[box].label}
                  onChange={(e) => setDiagram(box, 'label', e.target.value)}
                  placeholder="라벨"
                  className={inputCls}
                />
                <input
                  value={form.diagram[box].title}
                  onChange={(e) => setDiagram(box, 'title', e.target.value)}
                  placeholder="제목"
                  className={inputCls}
                />
                <textarea
                  rows={2}
                  value={form.diagram[box].desc}
                  onChange={(e) => setDiagram(box, 'desc', e.target.value)}
                  placeholder="설명 (줄바꿈 가능)"
                  className={inputCls + ' resize-none'}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className={labelCls}>화살표 1 라벨</label>
              <input
                value={form.diagram.arrow1}
                onChange={(e) =>
                  setForm({ ...form, diagram: { ...form.diagram, arrow1: e.target.value } })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>화살표 2 라벨</label>
              <input
                value={form.diagram.arrow2}
                onChange={(e) =>
                  setForm({ ...form, diagram: { ...form.diagram, arrow2: e.target.value } })
                }
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* 수치 카드 (visual='metrics'용) */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-foreground">
              수치 카드 (시각화를 &quot;수치 카드&quot;로 선택 시 표시)
            </p>
            <button
              onClick={() =>
                setForm({
                  ...form,
                  metrics: [...(form.metrics ?? []), { value: '', caption: '', href: '' }],
                })
              }
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              + 추가
            </button>
          </div>
          <div className="space-y-1.5">
            {(form.metrics ?? []).map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.6fr_1fr_auto] gap-2">
                <input
                  value={m.value}
                  placeholder="수치 (예: 53,810건)"
                  onChange={(e) => {
                    const arr = [...(form.metrics ?? [])];
                    arr[i] = { ...arr[i], value: e.target.value };
                    setForm({ ...form, metrics: arr });
                  }}
                  className={inputCls}
                />
                <input
                  value={m.caption}
                  placeholder="설명"
                  onChange={(e) => {
                    const arr = [...(form.metrics ?? [])];
                    arr[i] = { ...arr[i], caption: e.target.value };
                    setForm({ ...form, metrics: arr });
                  }}
                  className={inputCls}
                />
                <input
                  value={m.href ?? ''}
                  placeholder="링크 (선택)"
                  onChange={(e) => {
                    const arr = [...(form.metrics ?? [])];
                    arr[i] = { ...arr[i], href: e.target.value };
                    setForm({ ...form, metrics: arr });
                  }}
                  className={inputCls}
                />
                <button
                  onClick={() =>
                    setForm({ ...form, metrics: (form.metrics ?? []).filter((_, j) => j !== i) })
                  }
                  className="px-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-foreground">
              CTA 버튼 (순서대로 표시 · 이메일/LinkedIn 아이콘은 고정)
            </p>
            <button
              onClick={() =>
                setForm({
                  ...form,
                  ctas: [...(form.ctas ?? []), { label: '', href: '', style: 'outline' }],
                })
              }
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              + 추가
            </button>
          </div>
          <div className="space-y-1.5">
            {(form.ctas ?? []).map((cta, i) => (
              <div key={i} className="grid grid-cols-[1.2fr_1.5fr_auto_auto] gap-2">
                <input
                  value={cta.label}
                  placeholder="라벨"
                  onChange={(e) => {
                    const arr = [...(form.ctas ?? [])];
                    arr[i] = { ...arr[i], label: e.target.value };
                    setForm({ ...form, ctas: arr });
                  }}
                  className={inputCls}
                />
                <input
                  value={cta.href}
                  placeholder="/work 또는 https://..."
                  onChange={(e) => {
                    const arr = [...(form.ctas ?? [])];
                    arr[i] = { ...arr[i], href: e.target.value };
                    setForm({ ...form, ctas: arr });
                  }}
                  className={inputCls}
                />
                <select
                  value={cta.style}
                  onChange={(e) => {
                    const arr = [...(form.ctas ?? [])];
                    arr[i] = { ...arr[i], style: e.target.value as 'primary' | 'outline' };
                    setForm({ ...form, ctas: arr });
                  }}
                  className="px-2 py-2 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                >
                  <option value="primary">강조(검정)</option>
                  <option value="outline">외곽선</option>
                </select>
                <button
                  onClick={() =>
                    setForm({ ...form, ctas: (form.ctas ?? []).filter((_, j) => j !== i) })
                  }
                  className="px-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <label className={labelCls}>챗봇 안내 문장</label>
          <input
            value={form.chatLine}
            onChange={(e) => setForm({ ...form, chatLine: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

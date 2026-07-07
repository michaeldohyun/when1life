'use client';

import { useState, useEffect } from 'react';
import { clipperDb } from '@/lib/supabase';
import { Plus, Trash2, X } from 'lucide-react';

interface Pair {
  title: string;
  detail: string;
}
interface Metric {
  value: string;
  caption: string;
}
interface Comp {
  name: string;
  desc: string;
}

interface Row {
  id?: string;
  slug: string;
  title: string;
  one_liner: string;
  period: string;
  role: string;
  context: string;
  reframe: string;
  decisions: Pair[];
  impact: Metric[];
  learnings: Pair[];
  system_slugs: string[];
  components: Comp[];
  demo_slug: string | null;
  note: string | null;
  sort_order: number;
}

const EMPTY: Row = {
  slug: '',
  title: '',
  one_liner: '',
  period: '',
  role: '',
  context: '',
  reframe: '',
  decisions: [],
  impact: [],
  learnings: [],
  system_slugs: [],
  components: [],
  demo_slug: '',
  note: '',
  sort_order: 0,
};

const inputCls =
  'w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground';
const labelCls = 'block text-xs font-medium text-foreground mb-1.5';

export default function AdminCasesPage() {
  const [list, setList] = useState<Row[]>([]);
  const [form, setForm] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchList = async () => {
    const { data } = await clipperDb
      .from('CaseStudy')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setList(data as Row[]);
  };
  useEffect(() => {
    fetchList();
  }, []);

  const edit = (r: Row) => {
    setForm({
      ...EMPTY,
      ...r,
      demo_slug: r.demo_slug ?? '',
      note: r.note ?? '',
      decisions: r.decisions ?? [],
      impact: r.impact ?? [],
      learnings: r.learnings ?? [],
      system_slugs: r.system_slugs ?? [],
      components: r.components ?? [],
    });
    setIsNew(false);
    setMsg(null);
  };

  const save = async () => {
    if (!form) return;
    if (!form.slug.trim() || !form.title.trim()) {
      setMsg('slug과 title은 필수입니다.');
      return;
    }
    setSaving(true);
    setMsg(null);
    const payload = {
      slug: form.slug.trim(),
      title: form.title,
      one_liner: form.one_liner,
      period: form.period,
      role: form.role,
      context: form.context,
      reframe: form.reframe,
      decisions: form.decisions.filter((d) => d.title || d.detail),
      impact: form.impact.filter((m) => m.value || m.caption),
      learnings: form.learnings.filter((d) => d.title || d.detail),
      system_slugs: form.system_slugs.map((s) => s.trim()).filter(Boolean),
      components: form.components.filter((c) => c.name || c.desc),
      demo_slug: form.demo_slug?.trim() ? form.demo_slug.trim() : null,
      note: form.note?.trim() ? form.note : null,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };
    const res = isNew
      ? await clipperDb.from('CaseStudy').insert(payload)
      : await clipperDb.from('CaseStudy').update(payload).eq('id', form.id!);
    setMsg(res.error ? `저장 실패: ${res.error.message}` : '저장되었습니다.');
    if (!res.error) {
      setIsNew(false);
      await fetchList();
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!form?.id) return;
    if (!confirm(`케이스 "${form.title}"를 삭제할까요?`)) return;
    const { error } = await clipperDb.from('CaseStudy').delete().eq('id', form.id);
    if (error) setMsg(`삭제 실패: ${error.message}`);
    else {
      setForm(null);
      await fetchList();
    }
  };

  // {title, detail} 반복 편집기
  const pairList = (field: 'decisions' | 'learnings', label: string) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls + ' mb-0'}>{label}</label>
        <button
          onClick={() =>
            setForm({ ...form!, [field]: [...form![field], { title: '', detail: '' }] })
          }
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> 추가
        </button>
      </div>
      <div className="space-y-2">
        {form![field].map((v, i) => (
          <div key={i} className="border border-border p-2 space-y-1.5">
            <div className="flex gap-2">
              <input
                value={v.title}
                placeholder="제목"
                onChange={(e) => {
                  const arr = [...form![field]];
                  arr[i] = { ...arr[i], title: e.target.value };
                  setForm({ ...form!, [field]: arr });
                }}
                className={inputCls}
              />
              <button
                onClick={() =>
                  setForm({ ...form!, [field]: form![field].filter((_, j) => j !== i) })
                }
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={v.detail}
              placeholder="내용"
              onChange={(e) => {
                const arr = [...form![field]];
                arr[i] = { ...arr[i], detail: e.target.value };
                setForm({ ...form!, [field]: arr });
              }}
              className={inputCls + ' resize-none'}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-foreground">Edit Cases</h1>
          <p className="text-xs text-muted-foreground mt-0.5">케이스 스터디 관리 (/work)</p>
        </div>
        <button
          onClick={() => {
            setForm({ ...EMPTY, sort_order: list.length });
            setIsNew(true);
            setMsg(null);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-foreground text-background hover:opacity-90"
        >
          <Plus className="w-3.5 h-3.5" /> 새 케이스
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 border border-border bg-muted/30 text-xs text-foreground">
          {msg}
        </div>
      )}

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        {/* 목록 */}
        <div className="border border-border divide-y divide-border h-fit">
          {list.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">케이스가 없습니다.</p>
          )}
          {list.map((r) => (
            <button
              key={r.id}
              onClick={() => edit(r)}
              className={`w-full text-left px-3 py-2.5 transition-colors ${
                form?.id === r.id ? 'bg-muted/50' : 'hover:bg-muted/30'
              }`}
            >
              <p className="text-xs font-medium text-foreground line-clamp-2">{r.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{r.period}</p>
            </button>
          ))}
        </div>

        {/* 폼 */}
        {form ? (
          <div className="border border-border p-5 space-y-4">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
              <div>
                <label className={labelCls}>slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>기간</label>
                <input
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>정렬</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>제목</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>한 줄 소개</label>
              <textarea
                rows={2}
                value={form.one_liner}
                onChange={(e) => setForm({ ...form, one_liner: e.target.value })}
                className={inputCls + ' resize-none'}
              />
            </div>
            <div>
              <label className={labelCls}>역할</label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>상황 (비즈니스 컨텍스트)</label>
              <textarea
                rows={3}
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                className={inputCls + ' resize-none'}
              />
            </div>
            <div>
              <label className={labelCls}>문제 재정의</label>
              <textarea
                rows={3}
                value={form.reframe}
                onChange={(e) => setForm({ ...form, reframe: e.target.value })}
                className={inputCls + ' resize-none'}
              />
            </div>

            {pairList('decisions', '접근 — 핵심 의사결정')}

            {/* 임팩트 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls + ' mb-0'}>검증된 임팩트 (수치 + 설명)</label>
                <button
                  onClick={() =>
                    setForm({ ...form, impact: [...form.impact, { value: '', caption: '' }] })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 추가
                </button>
              </div>
              <div className="space-y-1.5">
                {form.impact.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                    <input
                      value={m.value}
                      placeholder="53,810건"
                      onChange={(e) => {
                        const arr = [...form.impact];
                        arr[i] = { ...arr[i], value: e.target.value };
                        setForm({ ...form, impact: arr });
                      }}
                      className={inputCls}
                    />
                    <input
                      value={m.caption}
                      placeholder="설명"
                      onChange={(e) => {
                        const arr = [...form.impact];
                        arr[i] = { ...arr[i], caption: e.target.value };
                        setForm({ ...form, impact: arr });
                      }}
                      className={inputCls}
                    />
                    <button
                      onClick={() =>
                        setForm({ ...form, impact: form.impact.filter((_, j) => j !== i) })
                      }
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {pairList('learnings', '러닝 포인트')}

            <div>
              <label className={labelCls}>
                구성 시스템 slugs (쉼표 구분 — /work 시스템 상세와 연결)
              </label>
              <textarea
                rows={2}
                value={form.system_slugs.join(', ')}
                onChange={(e) =>
                  setForm({ ...form, system_slugs: e.target.value.split(',') })
                }
                className={inputCls + ' resize-none'}
              />
            </div>

            {/* 구성 요소 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls + ' mb-0'}>구성 요소 (시스템 DB 없는 케이스용)</label>
                <button
                  onClick={() =>
                    setForm({
                      ...form,
                      components: [...form.components, { name: '', desc: '' }],
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 추가
                </button>
              </div>
              <div className="space-y-1.5">
                {form.components.map((c, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                    <input
                      value={c.name}
                      placeholder="이름"
                      onChange={(e) => {
                        const arr = [...form.components];
                        arr[i] = { ...arr[i], name: e.target.value };
                        setForm({ ...form, components: arr });
                      }}
                      className={inputCls}
                    />
                    <input
                      value={c.desc}
                      placeholder="설명"
                      onChange={(e) => {
                        const arr = [...form.components];
                        arr[i] = { ...arr[i], desc: e.target.value };
                        setForm({ ...form, components: arr });
                      }}
                      className={inputCls}
                    />
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          components: form.components.filter((_, j) => j !== i),
                        })
                      }
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>데모 slug (선택, 예: recruit-pipeline)</label>
                <input
                  value={form.demo_slug ?? ''}
                  onChange={(e) => setForm({ ...form, demo_slug: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>각주 (선택)</label>
                <input
                  value={form.note ?? ''}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 text-sm bg-foreground text-background hover:opacity-90 disabled:opacity-50"
              >
                {saving ? '저장 중…' : '저장'}
              </button>
              {!isNew && form.id && (
                <button
                  onClick={remove}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
            왼쪽에서 케이스를 선택하거나 &quot;새 케이스&quot;를 눌러 편집하세요.
          </div>
        )}
      </div>
    </div>
  );
}

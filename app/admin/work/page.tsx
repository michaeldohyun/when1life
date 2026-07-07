'use client';

import { useState, useEffect } from 'react';
import { clipperDb } from '@/lib/supabase';
import { BUCKETS } from '@/lib/work-data';
import { Plus, Trash2, X } from 'lucide-react';

interface Row {
  id?: string;
  slug: string;
  bucket: string;
  title: string;
  one_liner: string;
  tags: string[];
  problem: string;
  comparison: { axis: string; before: string; after: string }[];
  metric: { value: string; caption: string };
  how: string;
  evidence: string[];
  tech: string[];
  note: string | null;
  sort_order: number;
  company: string | null;
  period: string | null;
  role: string | null;
}

const EMPTY: Row = {
  slug: '',
  bucket: BUCKETS[0].key,
  title: '',
  one_liner: '',
  tags: [],
  problem: '',
  comparison: [],
  metric: { value: '', caption: '' },
  how: '',
  evidence: [],
  tech: [],
  note: '',
  sort_order: 0,
  company: '',
  period: '',
  role: '',
};

const inputCls =
  'w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground';
const labelCls = 'block text-xs font-medium text-foreground mb-1.5';

export default function AdminWorkPage() {
  const [list, setList] = useState<Row[]>([]);
  const [form, setForm] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchList = async () => {
    const { data } = await clipperDb
      .from('WorkProject')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setList(data as Row[]);
  };
  useEffect(() => {
    fetchList();
  }, []);

  const edit = (r: Row) => {
    setForm({ ...EMPTY, ...r, note: r.note ?? '', company: r.company ?? '', period: r.period ?? '', role: r.role ?? '' });
    setIsNew(false);
    setMsg(null);
  };
  const create = () => {
    setForm({ ...EMPTY, sort_order: list.length });
    setIsNew(true);
    setMsg(null);
  };

  const save = async () => {
    if (!form) return;
    if (!form.slug.trim() || !form.title.trim()) {
      setMsg({ type: 'err', text: 'slug과 title은 필수입니다.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    const payload = {
      slug: form.slug.trim(),
      bucket: form.bucket,
      title: form.title,
      one_liner: form.one_liner,
      tags: form.tags.filter((t) => t.trim()),
      problem: form.problem,
      comparison: form.comparison.filter((c) => c.axis || c.before || c.after),
      metric: form.metric,
      how: form.how,
      evidence: form.evidence.filter((t) => t.trim()),
      tech: form.tech.filter((t) => t.trim()),
      note: form.note?.trim() ? form.note : null,
      company: form.company?.trim() ? form.company : null,
      period: form.period?.trim() ? form.period : null,
      role: form.role?.trim() ? form.role : null,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };
    const res = isNew
      ? await clipperDb.from('WorkProject').insert(payload)
      : await clipperDb.from('WorkProject').update(payload).eq('id', form.id!);
    if (res.error) {
      setMsg({ type: 'err', text: `저장 실패: ${res.error.message}` });
    } else {
      setMsg({ type: 'ok', text: '저장되었습니다.' });
      setIsNew(false);
      await fetchList();
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!form?.id) return;
    if (!confirm(`"${form.title}" 프로젝트를 삭제할까요?`)) return;
    const { error } = await clipperDb.from('WorkProject').delete().eq('id', form.id);
    if (error) setMsg({ type: 'err', text: `삭제 실패: ${error.message}` });
    else {
      setForm(null);
      await fetchList();
    }
  };

  // 반복 문자열 리스트 편집기 (컴포넌트가 아닌 인라인 함수 — 포커스 유지)
  const stringList = (
    field: 'tags' | 'evidence' | 'tech',
    label: string,
    placeholder: string,
  ) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls + ' mb-0'}>{label}</label>
        <button
          onClick={() => setForm({ ...form!, [field]: [...form![field], ''] })}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> 추가
        </button>
      </div>
      <div className="space-y-1.5">
        {form![field].map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              placeholder={placeholder}
              onChange={(e) => {
                const arr = [...form![field]];
                arr[i] = e.target.value;
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
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-foreground">Edit Work</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            포트폴리오 프로젝트 관리 (/work)
          </p>
        </div>
        <button
          onClick={create}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-foreground text-background hover:opacity-90"
        >
          <Plus className="w-3.5 h-3.5" /> 새 프로젝트
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 border border-border bg-muted/30 text-xs text-foreground">
          {msg.text}
        </div>
      )}

      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        {/* 목록 */}
        <div className="border border-border divide-y divide-border h-fit">
          {list.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">프로젝트가 없습니다.</p>
          )}
          {list.map((r) => (
            <button
              key={r.id}
              onClick={() => edit(r)}
              className={`w-full text-left px-3 py-2.5 transition-colors ${
                form?.id === r.id ? 'bg-muted/50' : 'hover:bg-muted/30'
              }`}
            >
              <p className="text-xs font-medium text-foreground truncate">{r.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {BUCKETS.find((b) => b.key === r.bucket)?.label ?? r.bucket}
              </p>
            </button>
          ))}
        </div>

        {/* 폼 */}
        {form ? (
          <div className="border border-border p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="recruit-pipeline"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>정렬 순서</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>버킷</label>
              <select
                value={form.bucket}
                onChange={(e) => setForm({ ...form, bucket: e.target.value })}
                className={inputCls}
              >
                {BUCKETS.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
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
              <label className={labelCls}>한 줄 소개 (카드용)</label>
              <input
                value={form.one_liner}
                onChange={(e) => setForm({ ...form, one_liner: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>문제 (problem)</label>
              <textarea
                rows={3}
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
                className={inputCls + ' resize-none'}
              />
            </div>

            {/* Before/After */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls + ' mb-0'}>Before → After</label>
                <button
                  onClick={() =>
                    setForm({
                      ...form,
                      comparison: [...form.comparison, { axis: '', before: '', after: '' }],
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 행 추가
                </button>
              </div>
              <div className="space-y-1.5">
                {form.comparison.map((c, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1.5fr_1.5fr_auto] gap-2">
                    {(['axis', 'before', 'after'] as const).map((k) => (
                      <input
                        key={k}
                        value={c[k]}
                        placeholder={k === 'axis' ? '축' : k === 'before' ? 'before' : 'after'}
                        onChange={(e) => {
                          const arr = [...form.comparison];
                          arr[i] = { ...arr[i], [k]: e.target.value };
                          setForm({ ...form, comparison: arr });
                        }}
                        className={inputCls}
                      />
                    ))}
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          comparison: form.comparison.filter((_, j) => j !== i),
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

            {/* Metric */}
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <div>
                <label className={labelCls}>핵심 숫자</label>
                <input
                  value={form.metric.value}
                  onChange={(e) =>
                    setForm({ ...form, metric: { ...form.metric, value: e.target.value } })
                  }
                  placeholder="53,810건"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>숫자 설명</label>
                <input
                  value={form.metric.caption}
                  onChange={(e) =>
                    setForm({ ...form, metric: { ...form.metric, caption: e.target.value } })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>어떻게 (how)</label>
              <textarea
                rows={3}
                value={form.how}
                onChange={(e) => setForm({ ...form, how: e.target.value })}
                className={inputCls + ' resize-none'}
              />
            </div>

            {stringList('tags', '태그', 'AX')}
            {stringList('evidence', '검증·증거', 'DB 집계 53,810건')}
            {stringList('tech', '기술', 'TypeScript')}

            {/* 경력기술서(/resume)용 맥락 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>회사 (resume)</label>
                <input
                  value={form.company ?? ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="에딧메이트 — ..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>기간</label>
                <input
                  value={form.period ?? ''}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="2023 – 2026"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>역할</label>
                <input
                  value={form.role ?? ''}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="서비스 운영 총괄"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>정직성 각주 (선택)</label>
              <input
                value={form.note ?? ''}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="예: 실제 2건 E2E 검증(표본 작음)"
                className={inputCls}
              />
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
            왼쪽에서 프로젝트를 선택하거나 &quot;새 프로젝트&quot;를 눌러 편집하세요.
          </div>
        )}
      </div>
    </div>
  );
}

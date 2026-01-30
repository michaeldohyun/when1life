'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Palette, Image as ImageIcon, Type, LayoutGrid, X } from 'lucide-react';

export interface CustomColors {
  white: string;
  green: string;
  red: string;
  blue: string;
  orange: string;
  muted: string;
  background: string;
}

export interface FontSettings {
  family: string;
  sizeMultiplier: number; // 0.5 ~ 1.5
}

export interface LayoutSettings {
  spiral: 'archimedean' | 'rectangular';
  rotation: 'horizontal' | 'mixed' | 'dynamic';
  padding: number; // 1 ~ 15
}

export interface CustomizerSettings {
  colors: CustomColors;
  backgroundImage: string | null;
  font: FontSettings;
  layout: LayoutSettings;
}

interface WordCloudCustomizerProps {
  settings: CustomizerSettings;
  onSettingsChange: (settings: CustomizerSettings) => void;
}

const COLOR_PRESETS = {
  default: {
    name: '기본',
    colors: {
      white: '#fafafa',
      green: '#22c55e',
      red: '#ef4444',
      blue: '#3b82f6',
      orange: '#f59e0b',
      muted: '#525252',
      background: '#0a0a0a',
    },
  },
  ocean: {
    name: '오션',
    colors: {
      white: '#e0f2fe',
      green: '#06b6d4',
      red: '#f472b6',
      blue: '#0ea5e9',
      orange: '#a78bfa',
      muted: '#64748b',
      background: '#0c1222',
    },
  },
  forest: {
    name: '포레스트',
    colors: {
      white: '#ecfdf5',
      green: '#10b981',
      red: '#f97316',
      blue: '#14b8a6',
      orange: '#eab308',
      muted: '#6b7280',
      background: '#0a1612',
    },
  },
  sunset: {
    name: '선셋',
    colors: {
      white: '#fff7ed',
      green: '#84cc16',
      red: '#ef4444',
      blue: '#f97316',
      orange: '#fbbf24',
      muted: '#78716c',
      background: '#1c0a0a',
    },
  },
  monochrome: {
    name: '모노크롬',
    colors: {
      white: '#ffffff',
      green: '#d4d4d4',
      red: '#a3a3a3',
      blue: '#e5e5e5',
      orange: '#737373',
      muted: '#525252',
      background: '#171717',
    },
  },
};

const BACKGROUND_IMAGES = [
  { id: null, name: '없음', preview: null },
  { id: 'gradient-dark', name: '그라데이션 (다크)', preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
  { id: 'gradient-purple', name: '그라데이션 (퍼플)', preview: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)' },
  { id: 'gradient-ocean', name: '그라데이션 (오션)', preview: 'linear-gradient(135deg, #0a1628 0%, #0c2d48 50%, #0a1628 100%)' },
  { id: 'pattern-dots', name: '도트 패턴', preview: 'radial-gradient(circle, #333 1px, transparent 1px)' },
  { id: 'pattern-grid', name: '그리드 패턴', preview: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)' },
];

const FONT_OPTIONS = [
  { id: 'system-ui, -apple-system, sans-serif', name: '시스템 기본', preview: 'Aa' },
  { id: '"Noto Sans KR", sans-serif', name: 'Noto Sans', preview: 'Aa' },
  { id: '"Pretendard", sans-serif', name: 'Pretendard', preview: 'Aa' },
  { id: '"IBM Plex Sans KR", sans-serif', name: 'IBM Plex', preview: 'Aa' },
  { id: 'monospace', name: '모노스페이스', preview: 'Aa' },
  { id: '"Black Han Sans", sans-serif', name: '검은고딕', preview: 'Aa' },
];

const SPIRAL_OPTIONS = [
  { id: 'archimedean', name: '아르키메데스', description: '원형으로 퍼지는 나선형' },
  { id: 'rectangular', name: '사각형', description: '사각형 형태로 배치' },
];

const ROTATION_OPTIONS = [
  { id: 'horizontal', name: '가로 전용', description: '모든 텍스트를 가로로 배치' },
  { id: 'mixed', name: '가로/세로 혼합', description: '가로와 세로를 섞어서 배치' },
  { id: 'dynamic', name: '다이나믹', description: '다양한 각도로 자유롭게 배치' },
];

export default function WordCloudCustomizer({
  settings,
  onSettingsChange,
}: WordCloudCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'background' | 'font' | 'layout'>('colors');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePresetChange = (presetKey: keyof typeof COLOR_PRESETS) => {
    const preset = COLOR_PRESETS[presetKey];
    onSettingsChange({
      ...settings,
      colors: preset.colors,
    });
  };

  const handleColorChange = (colorKey: keyof CustomColors, value: string) => {
    onSettingsChange({
      ...settings,
      colors: {
        ...settings.colors,
        [colorKey]: value,
      },
    });
  };

  const handleBackgroundImageChange = (imageId: string | null) => {
    onSettingsChange({
      ...settings,
      backgroundImage: imageId,
    });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onSettingsChange({
      ...settings,
      font: {
        ...settings.font,
        family: fontFamily,
      },
    });
  };

  const handleSizeMultiplierChange = (multiplier: number) => {
    onSettingsChange({
      ...settings,
      font: {
        ...settings.font,
        sizeMultiplier: multiplier,
      },
    });
  };

  const handleSpiralChange = (spiral: LayoutSettings['spiral']) => {
    onSettingsChange({
      ...settings,
      layout: {
        ...settings.layout,
        spiral,
      },
    });
  };

  const handleRotationChange = (rotation: LayoutSettings['rotation']) => {
    onSettingsChange({
      ...settings,
      layout: {
        ...settings.layout,
        rotation,
      },
    });
  };

  const handlePaddingChange = (padding: number) => {
    onSettingsChange({
      ...settings,
      layout: {
        ...settings.layout,
        padding,
      },
    });
  };

  const handleReset = () => {
    onSettingsChange({
      colors: COLOR_PRESETS.default.colors,
      backgroundImage: null,
      font: {
        family: 'system-ui, -apple-system, sans-serif',
        sizeMultiplier: 1,
      },
      layout: {
        spiral: 'archimedean',
        rotation: 'mixed',
        padding: 5,
      },
    });
  };

  return (
    <>
      {/* 커스터마이즈 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
        title="커스터마이즈"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* 모달 - Portal을 사용하여 body에 직접 렌더링 */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl max-h-[90vh] flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
              <h2 className="text-base font-medium text-neutral-200">커스터마이즈</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 탭 */}
            <div className="flex border-b border-neutral-800 shrink-0">
              <button
                onClick={() => setActiveTab('colors')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === 'colors'
                    ? 'text-neutral-200 border-b-2 border-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Palette className="w-4 h-4" />
                색상
              </button>
              <button
                onClick={() => setActiveTab('background')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === 'background'
                    ? 'text-neutral-200 border-b-2 border-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                배경
              </button>
              <button
                onClick={() => setActiveTab('font')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === 'font'
                    ? 'text-neutral-200 border-b-2 border-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Type className="w-4 h-4" />
                폰트
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === 'layout'
                    ? 'text-neutral-200 border-b-2 border-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                레이아웃
              </button>
            </div>

            {/* 콘텐츠 */}
            <div className="p-4 overflow-y-auto flex-1">
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  {/* 프리셋 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">색상 프리셋</label>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => handlePresetChange(key as keyof typeof COLOR_PRESETS)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                          title={preset.name}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 border-neutral-700"
                            style={{
                              background: `linear-gradient(135deg, ${preset.colors.white} 0%, ${preset.colors.blue} 50%, ${preset.colors.green} 100%)`,
                            }}
                          />
                          <span className="text-[10px] text-neutral-400">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 개별 색상 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">개별 색상</label>
                    <div className="space-y-3">
                      {[
                        { key: 'white', label: '주요 수치' },
                        { key: 'green', label: '긍정적 변화' },
                        { key: 'red', label: '부정적 변화' },
                        { key: 'blue', label: '마일스톤' },
                        { key: 'orange', label: '주의' },
                        { key: 'muted', label: '보조 텍스트' },
                        { key: 'background', label: '배경색' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settings.colors[key as keyof CustomColors]}
                            onChange={(e) => handleColorChange(key as keyof CustomColors, e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border border-neutral-700"
                          />
                          <span className="text-sm text-neutral-300 flex-1">{label}</span>
                          <span className="text-xs text-neutral-500 font-mono">
                            {settings.colors[key as keyof CustomColors]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'background' && (
                <div className="space-y-4">
                  <label className="block text-xs text-neutral-500 mb-2">배경 이미지</label>
                  <div className="grid grid-cols-2 gap-3">
                    {BACKGROUND_IMAGES.map((bg) => (
                      <button
                        key={bg.id ?? 'none'}
                        onClick={() => handleBackgroundImageChange(bg.id)}
                        className={`relative aspect-video rounded-lg border-2 overflow-hidden transition-all ${
                          settings.backgroundImage === bg.id
                            ? 'border-neutral-200'
                            : 'border-neutral-700 hover:border-neutral-500'
                        }`}
                        style={{
                          background: bg.preview ?? settings.colors.background,
                          backgroundSize: bg.id === 'pattern-dots' ? '10px 10px' : bg.id === 'pattern-grid' ? '20px 20px' : 'cover',
                        }}
                      >
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-neutral-300 bg-black/50 rounded px-1 py-0.5 text-center">
                          {bg.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'font' && (
                <div className="space-y-6">
                  {/* 폰트 선택 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">폰트</label>
                    <div className="grid grid-cols-2 gap-2">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => handleFontFamilyChange(font.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            settings.font.family === font.id
                              ? 'border-neutral-200 bg-neutral-800'
                              : 'border-neutral-700 hover:border-neutral-500'
                          }`}
                        >
                          <span
                            className="text-xl text-neutral-200"
                            style={{ fontFamily: font.id }}
                          >
                            {font.preview}
                          </span>
                          <span className="text-xs text-neutral-400">{font.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 크기 조절 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">
                      텍스트 크기: {Math.round(settings.font.sizeMultiplier * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={settings.font.sizeMultiplier}
                      onChange={(e) => handleSizeMultiplierChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-200"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>작게</span>
                      <span>보통</span>
                      <span>크게</span>
                    </div>
                  </div>

                  {/* 미리보기 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">미리보기</label>
                    <div
                      className="p-4 rounded-lg bg-neutral-800 text-center"
                      style={{ fontFamily: settings.font.family }}
                    >
                      <div
                        className="text-neutral-200"
                        style={{ fontSize: `${24 * settings.font.sizeMultiplier}px` }}
                      >
                        총 92.2km
                      </div>
                      <div
                        className="text-neutral-400 mt-1"
                        style={{ fontSize: `${14 * settings.font.sizeMultiplier}px` }}
                      >
                        1월 러닝 정산
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="space-y-6">
                  {/* 나선형 선택 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">배치 형태</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SPIRAL_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleSpiralChange(option.id as LayoutSettings['spiral'])}
                          className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all ${
                            settings.layout.spiral === option.id
                              ? 'border-neutral-200 bg-neutral-800'
                              : 'border-neutral-700 hover:border-neutral-500'
                          }`}
                        >
                          <span className="text-sm text-neutral-200">{option.name}</span>
                          <span className="text-[10px] text-neutral-500 mt-0.5">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 회전 패턴 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">회전 패턴</label>
                    <div className="space-y-2">
                      {ROTATION_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleRotationChange(option.id as LayoutSettings['rotation'])}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                            settings.layout.rotation === option.id
                              ? 'border-neutral-200 bg-neutral-800'
                              : 'border-neutral-700 hover:border-neutral-500'
                          }`}
                        >
                          <div className="text-left">
                            <span className="text-sm text-neutral-200">{option.name}</span>
                            <span className="text-[10px] text-neutral-500 ml-2">{option.description}</span>
                          </div>
                          {settings.layout.rotation === option.id && (
                            <div className="w-2 h-2 rounded-full bg-neutral-200" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 간격 조절 */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">
                      텍스트 간격: {settings.layout.padding}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={settings.layout.padding}
                      onChange={(e) => handlePaddingChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-200"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>밀집</span>
                      <span>보통</span>
                      <span>여유</span>
                    </div>
                  </div>

                  {/* 레이아웃 프리뷰 설명 */}
                  <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                    <p className="text-xs text-neutral-400">
                      💡 설정 변경 후 워드 클라우드가 자동으로 새로 생성됩니다.
                      랜덤 요소가 포함되어 있어 매번 조금씩 다른 모양이 나올 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-800 shrink-0">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                초기화
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// 배경 스타일 유틸리티 함수
export function getBackgroundStyle(backgroundImage: string | null, backgroundColor: string): React.CSSProperties {
  if (!backgroundImage) {
    return { backgroundColor };
  }

  switch (backgroundImage) {
    case 'gradient-dark':
      return { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' };
    case 'gradient-purple':
      return { background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)' };
    case 'gradient-ocean':
      return { background: 'linear-gradient(135deg, #0a1628 0%, #0c2d48 50%, #0a1628 100%)' };
    case 'pattern-dots':
      return {
        backgroundColor,
        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
        backgroundSize: '10px 10px',
      };
    case 'pattern-grid':
      return {
        backgroundColor,
        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    default:
      return { backgroundColor };
  }
}

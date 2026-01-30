'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

export interface WordItem {
  text: string;
  size: number;
  color: string;
}

interface MonthlyWordCloudProps {
  words: WordItem[];
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundImage?: string | null;
  fontFamily?: string;
  spiral?: 'archimedean' | 'rectangular';
  rotation?: 'horizontal' | 'mixed' | 'dynamic';
  padding?: number;
}

export interface MonthlyWordCloudRef {
  getSvgElement: () => SVGSVGElement | null;
}

const MonthlyWordCloud = forwardRef<MonthlyWordCloudRef, MonthlyWordCloudProps>(
  ({ words, width = 800, height = 800, backgroundColor = '#0a0a0a', backgroundImage = null, fontFamily = 'system-ui, -apple-system, sans-serif', spiral = 'archimedean', rotation = 'mixed', padding = 5 }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isReady, setIsReady] = useState(false);

    // 외부에서 SVG 요소에 접근할 수 있도록 ref 노출
    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current,
    }));

    useEffect(() => {
      if (!svgRef.current || words.length === 0) return;

      // 기존 내용 클리어
      d3.select(svgRef.current).selectAll('*').remove();

      const svg = d3.select(svgRef.current);

      // 배경 추가 (다운로드 시 배경이 포함되도록)
      const defs = svg.append('defs');

      // 배경 이미지/그라데이션 정의
      if (backgroundImage) {
        switch (backgroundImage) {
          case 'gradient-dark':
            defs.append('linearGradient')
              .attr('id', 'bg-gradient')
              .attr('x1', '0%').attr('y1', '0%')
              .attr('x2', '100%').attr('y2', '100%')
              .selectAll('stop')
              .data([
                { offset: '0%', color: '#1a1a2e' },
                { offset: '50%', color: '#16213e' },
                { offset: '100%', color: '#0f3460' },
              ])
              .enter()
              .append('stop')
              .attr('offset', d => d.offset)
              .attr('stop-color', d => d.color);
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', 'url(#bg-gradient)');
            break;
          case 'gradient-purple':
            defs.append('linearGradient')
              .attr('id', 'bg-gradient')
              .attr('x1', '0%').attr('y1', '0%')
              .attr('x2', '100%').attr('y2', '100%')
              .selectAll('stop')
              .data([
                { offset: '0%', color: '#1a0a2e' },
                { offset: '50%', color: '#2d1b4e' },
                { offset: '100%', color: '#1a0a2e' },
              ])
              .enter()
              .append('stop')
              .attr('offset', d => d.offset)
              .attr('stop-color', d => d.color);
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', 'url(#bg-gradient)');
            break;
          case 'gradient-ocean':
            defs.append('linearGradient')
              .attr('id', 'bg-gradient')
              .attr('x1', '0%').attr('y1', '0%')
              .attr('x2', '100%').attr('y2', '100%')
              .selectAll('stop')
              .data([
                { offset: '0%', color: '#0a1628' },
                { offset: '50%', color: '#0c2d48' },
                { offset: '100%', color: '#0a1628' },
              ])
              .enter()
              .append('stop')
              .attr('offset', d => d.offset)
              .attr('stop-color', d => d.color);
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', 'url(#bg-gradient)');
            break;
          case 'pattern-dots':
            defs.append('pattern')
              .attr('id', 'bg-pattern')
              .attr('patternUnits', 'userSpaceOnUse')
              .attr('width', 10)
              .attr('height', 10)
              .append('circle')
              .attr('cx', 5)
              .attr('cy', 5)
              .attr('r', 1)
              .attr('fill', '#333');
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', backgroundColor);
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', 'url(#bg-pattern)');
            break;
          case 'pattern-grid':
            defs.append('pattern')
              .attr('id', 'bg-pattern')
              .attr('patternUnits', 'userSpaceOnUse')
              .attr('width', 20)
              .attr('height', 20)
              .selectAll('line')
              .data([
                { x1: 0, y1: 0, x2: 20, y2: 0 },
                { x1: 0, y1: 0, x2: 0, y2: 20 },
              ])
              .enter()
              .append('line')
              .attr('x1', d => d.x1)
              .attr('y1', d => d.y1)
              .attr('x2', d => d.x2)
              .attr('y2', d => d.y2)
              .attr('stroke', '#333')
              .attr('stroke-width', 1);
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', backgroundColor);
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', 'url(#bg-pattern)');
            break;
          default:
            svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .attr('fill', backgroundColor);
        }
      } else {
        svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', backgroundColor);
      }

      // 회전 함수 결정
      const getRotation = () => {
        switch (rotation) {
          case 'horizontal':
            return () => 0;
          case 'mixed':
            return () => {
              const rand = Math.random();
              if (rand < 0.75) return 0;
              if (rand < 0.88) return 90;
              return -90;
            };
          case 'dynamic':
            return () => {
              const angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 90, -90];
              return angles[Math.floor(Math.random() * angles.length)];
            };
          default:
            return () => 0;
        }
      };

      const layout = cloud<WordItem & cloud.Word>()
        .size([width, height])
        .words(words.map(w => ({ ...w })))
        .padding(padding)
        .rotate(getRotation())
        .font(fontFamily)
        .fontSize(d => d.size)
        .spiral(spiral)
        .on('end', draw);

      layout.start();

      function draw(computedWords: Array<WordItem & cloud.Word>) {
        svg
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('xmlns', 'http://www.w3.org/2000/svg');

        const g = svg
          .append('g')
          .attr('transform', `translate(${width / 2},${height / 2})`);

        g.selectAll('text')
          .data(computedWords)
          .enter()
          .append('text')
          .style('font-size', d => `${d.size}px`)
          .style('font-family', fontFamily)
          .style('font-weight', d => (d.size >= 60 ? '700' : d.size >= 40 ? '600' : '500'))
          .style('fill', d => d.color)
          .style('cursor', 'default')
          .style('opacity', 0)
          .attr('text-anchor', 'middle')
          .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
          .text(d => d.text)
          // 애니메이션: fade in
          .transition()
          .duration(600)
          .delay((_, i) => i * 50)
          .style('opacity', 1);

        setIsReady(true);
      }
    }, [words, width, height, backgroundColor, backgroundImage, fontFamily, spiral, rotation, padding]);

    return (
      <div className="relative">
        <svg
          ref={svgRef}
          className="w-full h-auto max-w-full"
          style={{
            opacity: isReady ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground text-sm">로딩 중...</div>
          </div>
        )}
      </div>
    );
  }
);

MonthlyWordCloud.displayName = 'MonthlyWordCloud';

export default MonthlyWordCloud;

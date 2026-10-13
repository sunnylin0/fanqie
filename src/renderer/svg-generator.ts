import { LayoutResult } from './layout.js';
import { NoteItem, Measure, ScoreLine } from './types.js';
import { SVG_GLYPH_DEFS } from './svg-defs.js';

export function generateSVG(layout: LayoutResult): string {
  const { width, height, ast } = layout;

  let svg = `<svg width="${width}" height="${height}" version="1.1" viewBox="0 0 ${width} ${height}" encoding="UTF-8" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;
  svg += `<rect x="0" y="0" height="100%" width="100%" fill="#ffffff" />`;
  svg += `<defs>${SVG_GLYPH_DEFS}</defs>`;

  // Title
  svg += `<text x="${width / 2}" y="100" text-anchor="middle" fill="#1b1b1b" style="font-weight:bold;" font-size="36" font-family="Microsoft YaHei">${escapeXml(ast.title)}</text>`;

  // SubTitle
  if (ast.subTitle) {
    svg += `<text x="${width / 2}" y="145" text-anchor="middle" fill="#1b1b1b" font-size="20" font-family="Microsoft YaHei">${escapeXml(ast.subTitle)}</text>`;
  }

  // Metadata: Key, Meter, Tempo & Composer
  const metaY = ast.subTitle ? 185 : 155;
  svg += `<text x="80" y="${metaY}" fill="#1b1b1b" font-size="18" font-family="Microsoft YaHei">1=${escapeXml(ast.key.replace(/^1=/, ''))}  ${escapeXml(ast.meter)}</text>`;
  if (ast.composer) {
    svg += `<text x="${width - 80}" y="${metaY}" text-anchor="end" fill="#1b1b1b" font-size="16" font-family="Microsoft YaHei">${escapeXml(ast.composer)}</text>`;
  }

  // Lines
  for (const line of ast.lines) {
    renderScoreLine(svgParts => { svg += svgParts; }, line);
  }

  svg += `</svg>`;
  return svg;
}

function renderScoreLine(emit: (chunk: string) => void, line: ScoreLine) {
  let pendingTieStart: NoteItem | null = null;

  for (const measure of line.measures) {
    renderMeasure(emit, measure);

    // Track ties across items
    for (const item of measure.items) {
      if (item.tieStart) {
        pendingTieStart = item;
      } else if (item.tieEnd && pendingTieStart && item.x && pendingTieStart.x && item.y && pendingTieStart.y) {
        // Draw quadratic Bézier tie curve
        const x1 = pendingTieStart.x + 5;
        const x2 = item.x + 5;
        const y = item.y - 12;
        const midX = (x1 + x2) / 2;
        const midY = y - 10;
        emit(`<path d="M ${x1} ${y} Q ${midX} ${midY} ${x2} ${y}" fill="none" stroke="#1b1b1b" stroke-width="1.5" />`);
        pendingTieStart = null;
      }
    }

    // Render bar lines
    const rightX = (measure.x || 0) + (measure.width || 0);
    const barY = (measure.items[0]?.y || line.y || 200);

    if (measure.barlineRight) {
      renderBarline(emit, measure.barlineRight, rightX, barY);
    }
  }
}

function renderMeasure(emit: (chunk: string) => void, measure: Measure) {
  for (const item of measure.items) {
    renderNoteItem(emit, item);
  }
}

function renderNoteItem(emit: (chunk: string) => void, item: NoteItem) {
  const x = item.x || 0;
  const y = item.y || 0;

  if (item.isDash) {
    emit(`<use x="${x}" y="${y}" xlink:href="#yanyinfu" notepos="${item.notepos || ''}"></use>`);
    return;
  }

  // Note glyph
  if (item.pitch >= 0 && item.pitch <= 7) {
    const glyphId = 'shuzi_b_' + item.pitch;
    emit(`<use x="${x}" y="${y}" xlink:href="#${glyphId}" notepos="${item.notepos || ''}"></use>`);
  }

  // Octave dots
  if (item.octave > 0) {
    for (let o = 0; o < item.octave; o++) {
      emit(`<circle cx="${x + 5}" cy="${y - 12 - o * 6}" r="1.8" fill="#1b1b1b" />`);
    }
  } else if (item.octave < 0) {
    for (let o = 0; o < Math.abs(item.octave); o++) {
      emit(`<circle cx="${x + 5}" cy="${y + 14 + o * 6}" r="1.8" fill="#1b1b1b" />`);
    }
  }

  // Dots
  if (item.dots > 0) {
    for (let d = 0; d < item.dots; d++) {
      emit(`<circle cx="${x + 14 + d * 6}" cy="${y}" r="1.5" fill="#1b1b1b" />`);
    }
  }

  // Accidentals (#, $, =)
  if (item.accidental) {
    const accChar = item.accidental === '#' ? '♯' : item.accidental === '$' ? '♭' : '♮';
    emit(`<text x="${x - 7}" y="${y - 4}" font-size="12" fill="#1b1b1b" font-family="sans-serif">${accChar}</text>`);
  }

  // Underlines (beams: 1 underline = eighth note, 2 underlines = sixteenth)
  if (item.underlines > 0) {
    const beamYBase = y + (item.octave < 0 ? 18 : 10);
    for (let u = 0; u < item.underlines; u++) {
      emit(`<rect x="${x - 1}" y="${beamYBase + u * 3.5}" width="13" height="1.6" fill="#1b1b1b" />`);
    }
  }

  // Lyric text
  if (item.lyric) {
    emit(`<text x="${x + 5}" y="${y + 36}" text-anchor="middle" font-size="16" fill="#1b1b1b" font-family="Microsoft YaHei">${escapeXml(item.lyric)}</text>`);
  }
}

function renderBarline(emit: (chunk: string) => void, barType: string, x: number, y: number) {
  if (barType === '||') {
    emit(`<use x="${x - 14}" y="${y}" xlink:href="#jieshufu"></use>`);
  } else if (barType === ':|:' || barType === '|::|' || barType === ':|' || barType === '|:') {
    emit(`<use x="${x - 16}" y="${y}" xlink:href="#xunhuan_zuoyou"></use>`);
  } else {
    emit(`<use x="${x - 8}" y="${y}" xlink:href="#xiaojiexian"></use>`);
  }
}

function escapeXml(unsafe: string): string {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

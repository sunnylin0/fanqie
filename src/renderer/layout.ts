import { ScoreAST, ScoreConfig, ScoreLine, Measure, NoteItem } from './types.js';

export interface LayoutResult {
  width: number;
  height: number;
  ast: ScoreAST;
}

export function computeLayout(ast: ScoreAST, config: ScoreConfig = {}): LayoutResult {
  const width = config.width || 840;
  const marginLeft = config.marginLeft || 80;
  const marginRight = config.marginRight || 80;
  const marginTop = config.marginTop || 80;
  const marginBottom = config.marginBottom || 80;

  const contentWidth = width - marginLeft - marginRight; // 680px
  let currentY = marginTop + 20;

  // Header spacing
  if (ast.title) currentY += 50;
  if (ast.subTitle) currentY += 40;
  currentY += 40; // metadata line (key, meter, composer)

  const rowHeight = 85;

  for (const line of ast.lines) {
    line.y = currentY;
    line.height = rowHeight;
    layoutScoreLine(line, marginLeft, contentWidth, currentY);
    currentY += rowHeight;
  }

  const height = Math.max(config.height || 1193, currentY + marginBottom);

  return {
    width,
    height,
    ast
  };
}

function layoutScoreLine(
  line: ScoreLine,
  startX: number,
  totalWidth: number,
  baseY: number
) {
  const measures = line.measures;
  if (measures.length === 0) return;

  // Calculate duration weights for spring allocation
  const weights: number[] = [];
  let totalWeight = 0;

  for (const m of measures) {
    let mWeight = 0;
    for (const item of m.items) {
      mWeight += item.duration || 1;
    }
    // Avoid zero weight
    mWeight = Math.max(mWeight, 1);
    weights.push(mWeight);
    totalWeight += mWeight;
  }

  let curMeasureX = startX;

  for (let i = 0; i < measures.length; i++) {
    const m = measures[i];
    const mWidth = (weights[i] / totalWeight) * totalWidth;
    m.x = curMeasureX;
    m.width = mWidth;

    // Distribute note items inside measure
    const count = m.items.length;
    if (count > 0) {
      const step = (mWidth - 15) / count;
      for (let j = 0; j < count; j++) {
        const item = m.items[j];
        item.x = curMeasureX + j * step + 5;
        item.y = baseY;
        item.width = step;
      }
    }

    curMeasureX += mWidth;
  }
}

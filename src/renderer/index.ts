import { parseZhipuNotation } from './parser.js';
import { computeLayout } from './layout.js';
import { generateSVG } from './svg-generator.js';
import { ScoreConfig } from './types.js';

export function renderZhipuScore(codeText: string, config?: ScoreConfig): string {
  const ast = parseZhipuNotation(codeText);
  const layout = computeLayout(ast, config);
  return generateSVG(layout);
}

// Attach to browser global if present
if (typeof window !== 'undefined') {
  (window as unknown as { renderZhipuScore: typeof renderZhipuScore }).renderZhipuScore = renderZhipuScore;
}

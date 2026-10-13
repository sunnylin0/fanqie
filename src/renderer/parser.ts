import { ScoreAST, ScoreLine, Measure, NoteItem } from './types.js';

export function parseZhipuNotation(codeText: string): ScoreAST {
  const ast: ScoreAST = {
    version: '1.0',
    title: '未命名简谱',
    subTitle: '',
    composer: '',
    key: '1=C',
    meter: '4/4',
    tempo: '60',
    lines: []
  };

  const rawLines = codeText.split(/\r?\n/);
  let currentScoreLine: ScoreLine | null = null;
  let lineCount = 0;

  for (let raw of rawLines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const tag = line.slice(0, 2);
    const val = line.slice(2).trim();

    switch (tag) {
      case 'V:':
        ast.version = val;
        break;
      case 'B:':
        if (!ast.title || ast.title === '未命名简谱') {
          ast.title = val;
        } else {
          ast.subTitle = val;
        }
        break;
      case 'Z:':
        ast.composer += (ast.composer ? ' ' : '') + val;
        break;
      case 'D:':
        ast.key = val.startsWith('1=') ? val : '1=' + val;
        break;
      case 'P:':
        ast.meter = val;
        break;
      case 'J:':
        ast.tempo = val;
        break;
      case 'Q:': {
        const measures = parseMelodyLine(val, lineCount);
        currentScoreLine = {
          lineIndex: lineCount++,
          measures,
          rawMelody: val,
          rawLyrics: []
        };
        ast.lines.push(currentScoreLine);
        break;
      }
      case 'C:': {
        if (currentScoreLine) {
          currentScoreLine.rawLyrics.push(val);
          assignLyricsToMeasures(currentScoreLine.measures, val);
        }
        break;
      }
    }
  }

  return ast;
}

function parseMelodyLine(melody: string, lineIndex: number): Measure[] {
  const measures: Measure[] = [];
  const tokens = melody.split(/\s+/).filter(Boolean);

  let currentMeasure: Measure = { items: [] };
  measures.push(currentMeasure);

  let noteIndex = 0;
  let nextTieStart = false;

  for (let tok of tokens) {
    // Check standalone slur parens
    if (tok === '(') {
      nextTieStart = true;
      continue;
    }
    if (tok === ')') {
      const lastItem = currentMeasure.items[currentMeasure.items.length - 1];
      if (lastItem) lastItem.tieEnd = true;
      continue;
    }

    // Check barline
    if (tok === '|' || tok === '||' || tok === '|:' || tok === ':|' || tok === ':|:' || tok === '||:') {
      currentMeasure.barlineRight = tok;
      currentMeasure = { items: [], barlineLeft: tok };
      measures.push(currentMeasure);
      continue;
    }

    if (tok.startsWith('|')) {
      currentMeasure.barlineRight = '|';
      currentMeasure = { items: [] };
      measures.push(currentMeasure);
      tok = tok.slice(1);
      if (!tok) continue;
    }

    const item = parseNoteToken(tok, `${lineIndex}_${noteIndex++}`);
    if (item) {
      if (nextTieStart) {
        item.tieStart = true;
        nextTieStart = false;
      }
      currentMeasure.items.push(item);
    }
  }

  return measures.filter((m, idx) => m.items.length > 0 || idx < measures.length - 1);
}

function parseNoteToken(tok: string, pos: string): NoteItem | null {
  if (!tok) return null;

  if (tok === '-') {
    return {
      raw: tok,
      pitch: 0,
      octave: 0,
      duration: 1,
      underlines: 0,
      dots: 0,
      isDash: true,
      notepos: pos
    };
  }

  let tieStart = false;
  let tieEnd = false;
  if (tok.startsWith('(')) {
    tieStart = true;
    tok = tok.slice(1);
  }
  if (tok.endsWith(')')) {
    tieEnd = true;
    tok = tok.slice(0, -1);
  }

  const pitchMatch = tok.match(/^[0-9]/);
  if (!pitchMatch) return null;

  const pitch = parseInt(pitchMatch[0], 10);
  let rest = tok.slice(1);

  // Octave: apostrophes (') high, commas (,) low
  let octave = 0;
  const highMatches = rest.match(/'/g);
  if (highMatches) octave += highMatches.length;
  const lowMatches = rest.match(/,/g);
  if (lowMatches) octave -= lowMatches.length;

  // Accidental: #, $, =
  let accidental: '#' | '$' | '=' | undefined;
  if (rest.includes('#')) accidental = '#';
  else if (rest.includes('$')) accidental = '$';
  else if (rest.includes('=')) accidental = '=';

  // Dots: '.'
  const dotMatches = rest.match(/\./g);
  const dots = dotMatches ? dotMatches.length : 0;

  // Underlines: '/'
  const slashMatches = rest.match(/\//g);
  const underlines = slashMatches ? slashMatches.length : 0;

  let duration = 1 / Math.pow(2, underlines);
  if (dots === 1) duration *= 1.5;
  else if (dots === 2) duration *= 1.75;

  return {
    raw: tok,
    pitch,
    octave,
    accidental,
    duration,
    underlines,
    dots,
    tieStart,
    tieEnd,
    notepos: pos
  };
}

function assignLyricsToMeasures(measures: Measure[], lyricText: string) {
  const chars = lyricText.replace(/\s+/g, '').split('');
  let cIdx = 0;

  for (const m of measures) {
    for (const item of m.items) {
      if (!item.isDash && item.pitch > 0 && cIdx < chars.length) {
        item.lyric = chars[cIdx++];
      }
    }
  }
}

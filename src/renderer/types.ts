export interface ScoreConfig {
  page?: string;
  width?: number;
  height?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  titleFont?: string;
  lyricFont?: string;
}

export interface NoteItem {
  raw: string;
  pitch: number; // 0=rest, 1..7=note, 8=hidden, 9=rhythm
  octave: number; // -2, -1, 0, 1, 2
  accidental?: '#' | '$' | '=';
  duration: number; // 1=quarter, 0.5=eighth, 0.25=sixteenth, 2=half, 4=whole
  underlines: number; // number of beams (0, 1, 2, 3)
  dots: number;
  isDash?: boolean; // '-'
  tieStart?: boolean;
  tieEnd?: boolean;
  graceNotes?: NoteItem[];
  lyric?: string;
  notepos?: string;
  // Computed layout coordinates
  x?: number;
  y?: number;
  width?: number;
}

export interface Measure {
  items: NoteItem[];
  barlineLeft?: string;
  barlineRight?: string;
  volta?: number;
  // Computed layout
  x?: number;
  width?: number;
}

export interface ScoreLine {
  lineIndex: number;
  measures: Measure[];
  rawMelody: string;
  rawLyrics: string[];
  y?: number;
  height?: number;
}

export interface ScoreAST {
  version: string;
  title: string;
  subTitle: string;
  composer: string;
  key: string;
  meter: string;
  tempo: string;
  lines: ScoreLine[];
}

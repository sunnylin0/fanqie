"use strict";
var ZhipuRenderer = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/renderer/index.ts
  var index_exports = {};
  __export(index_exports, {
    renderZhipuScore: () => renderZhipuScore
  });

  // src/renderer/parser.ts
  function parseZhipuNotation(codeText) {
    const ast = {
      version: "1.0",
      title: "\u672A\u547D\u540D\u7B80\u8C31",
      subTitle: "",
      composer: "",
      key: "1=C",
      meter: "4/4",
      tempo: "60",
      lines: []
    };
    const rawLines = codeText.split(/\r?\n/);
    let currentScoreLine = null;
    let lineCount = 0;
    for (let raw of rawLines) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const tag = line.slice(0, 2);
      const val = line.slice(2).trim();
      switch (tag) {
        case "V:":
          ast.version = val;
          break;
        case "B:":
          if (!ast.title || ast.title === "\u672A\u547D\u540D\u7B80\u8C31") {
            ast.title = val;
          } else {
            ast.subTitle = val;
          }
          break;
        case "Z:":
          ast.composer += (ast.composer ? " " : "") + val;
          break;
        case "D:":
          ast.key = val.startsWith("1=") ? val : "1=" + val;
          break;
        case "P:":
          ast.meter = val;
          break;
        case "J:":
          ast.tempo = val;
          break;
        case "Q:": {
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
        case "C:": {
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
  function parseMelodyLine(melody, lineIndex) {
    const measures = [];
    const tokens = melody.split(/\s+/).filter(Boolean);
    let currentMeasure = { items: [] };
    measures.push(currentMeasure);
    let noteIndex = 0;
    let nextTieStart = false;
    for (let tok of tokens) {
      if (tok === "(") {
        nextTieStart = true;
        continue;
      }
      if (tok === ")") {
        const lastItem = currentMeasure.items[currentMeasure.items.length - 1];
        if (lastItem) lastItem.tieEnd = true;
        continue;
      }
      if (tok === "|" || tok === "||" || tok === "|:" || tok === ":|" || tok === ":|:" || tok === "||:") {
        currentMeasure.barlineRight = tok;
        currentMeasure = { items: [], barlineLeft: tok };
        measures.push(currentMeasure);
        continue;
      }
      if (tok.startsWith("|")) {
        currentMeasure.barlineRight = "|";
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
  function parseNoteToken(tok, pos) {
    if (!tok) return null;
    if (tok === "-") {
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
    if (tok.startsWith("(")) {
      tieStart = true;
      tok = tok.slice(1);
    }
    if (tok.endsWith(")")) {
      tieEnd = true;
      tok = tok.slice(0, -1);
    }
    const pitchMatch = tok.match(/^[0-9]/);
    if (!pitchMatch) return null;
    const pitch = parseInt(pitchMatch[0], 10);
    let rest = tok.slice(1);
    let octave = 0;
    const highMatches = rest.match(/'/g);
    if (highMatches) octave += highMatches.length;
    const lowMatches = rest.match(/,/g);
    if (lowMatches) octave -= lowMatches.length;
    let accidental;
    if (rest.includes("#")) accidental = "#";
    else if (rest.includes("$")) accidental = "$";
    else if (rest.includes("=")) accidental = "=";
    const dotMatches = rest.match(/\./g);
    const dots = dotMatches ? dotMatches.length : 0;
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
  function assignLyricsToMeasures(measures, lyricText) {
    const chars = lyricText.replace(/\s+/g, "").split("");
    let cIdx = 0;
    for (const m of measures) {
      for (const item of m.items) {
        if (!item.isDash && item.pitch > 0 && cIdx < chars.length) {
          item.lyric = chars[cIdx++];
        }
      }
    }
  }

  // src/renderer/layout.ts
  function computeLayout(ast, config = {}) {
    const width = config.width || 840;
    const marginLeft = config.marginLeft || 80;
    const marginRight = config.marginRight || 80;
    const marginTop = config.marginTop || 80;
    const marginBottom = config.marginBottom || 80;
    const contentWidth = width - marginLeft - marginRight;
    let currentY = marginTop + 20;
    if (ast.title) currentY += 50;
    if (ast.subTitle) currentY += 40;
    currentY += 40;
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
  function layoutScoreLine(line, startX, totalWidth, baseY) {
    const measures = line.measures;
    if (measures.length === 0) return;
    const weights = [];
    let totalWeight = 0;
    for (const m of measures) {
      let mWeight = 0;
      for (const item of m.items) {
        mWeight += item.duration || 1;
      }
      mWeight = Math.max(mWeight, 1);
      weights.push(mWeight);
      totalWeight += mWeight;
    }
    let curMeasureX = startX;
    for (let i = 0; i < measures.length; i++) {
      const m = measures[i];
      const mWidth = weights[i] / totalWeight * totalWidth;
      m.x = curMeasureX;
      m.width = mWidth;
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

  // src/renderer/svg-defs.ts
  var SVG_GLYPH_DEFS = `
<g id="diaohao_fu" transform="translate(-50,-50)"><path d="m63.90001,57.81227l-8.81873,0l0,-1.70001l3.45433,0l0,-11.7568l-3.53561,1.04459l0,-1.80243l5.46599,-1.59762l0,14.11224l3.43402,0l0,1.70001l0,0.00001l0,0.00001z" fill="#1b1b1b"/><rect height="2" width="11" y="46.85897" x="68" stroke-width="33" fill="#1b1b1b"/><rect height="2" width="11" y="51.32479" x="68" stroke-width="33" fill="#1b1b1b"/></g>
<g id="paihao_xian" transform="translate(-50,-50)"><rect fill="#1b1b1b" stroke-width="33" x="51" y="49" width="21" height="2"/></g>
<g id="shuzi_b_bian_4" transform="translate(-50,-50)"><path d="m54.96645,54.05346l-1.77282,0l0,3.1344l-2.55111,0l0,-3.1344l-5.60941,0l0,-2.02145l6.16115,-9.21987l1.99982,0l0,8.92801l1.7728,0l0,2.31331l-0.00044,0l0.00001,0zm-4.32348,-2.31331l0,-4.43158l-2.81056,4.43158l2.81056,0z" fill="black"/></g>
<g id="shuzi_b_bian_2" transform="translate(-50,-50)"><path d="m44.75782,57.18786l0,-2.08388q1.91619,-1.97869 3.99896,-4.18637t3.16584,-3.66571q1.08271,-1.45799 1.43714,-2.35356t0.35405,-1.68707q0,-1.7079 -1.02058,-2.58267t-2.81177,-0.87477q-1.22851,0 -2.54101,0.56235t-2.58267,1.72873l-1.24933,-2.08278q1.77039,-1.49987 3.47827,-2.18698t3.39499,-0.68711q3.10336,0 4.81124,1.52069t1.70789,4.24885q0,1.41634 -0.62483,2.77014t-1.95784,3.16584q-1.33289,1.81206 -4.10307,4.64468l0,0.06248l6.83158,0l0,2.44962l-11.89069,0z" fill="black"/></g>
<g id="shuzi_b_1" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m55.19999,57.99227l-8.81873,0l0,-1.70001l3.45433,0l0,-11.7568l-3.53561,1.04459l0,-1.80243l5.46599,-1.59762l0,14.11224l3.43402,0l0,1.70001l0,0.00001l0,0.00001z" fill="black"/></g>
<g id="shuzi_b_2" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m44.75782,57.18786l0,-2.08388q1.91619,-1.97869 3.99896,-4.18637t3.16584,-3.66571q1.08271,-1.45799 1.43714,-2.35356t0.35405,-1.68707q0,-1.7079 -1.02058,-2.58267t-2.81177,-0.87477q-1.22851,0 -2.54101,0.56235t-2.58267,1.72873l-1.24933,-2.08278q1.77039,-1.49987 3.47827,-2.18698t3.39499,-0.68711q3.10336,0 4.81124,1.52069t1.70789,4.24885q0,1.41634 -0.62483,2.77014t-1.95784,3.16584q-1.33289,1.81206 -4.10307,4.64468l0,0.06248l6.83158,0l0,2.44962l-11.89069,0z" fill="black"/></g>
<g id="shuzi_b_3" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m44.75782,55.18786q1.22851,1.52069 3.47827,1.52069q2.54101,0 3.74896,-1.45799t1.20795,-3.66571q0,-2.08278 -1.24933,-3.16584t-3.53561,-1.08306l-1.80243,0l0,-2.08278l1.80243,0q1.91619,0 3.16584,-0.95831t1.24965,-2.72848q0,-1.66632 -1.04135,-2.49948t-2.77014,-0.83316q-1.7079,0 -3.12423,1.04135l-1.24933,-2.08278q2.08278,-1.52069 4.60307,-1.52069q3.04097,0 4.79048,1.52069t1.74951,3.87402q0,1.66632 -0.95831,2.89508t-2.60344,1.83287l0,0.06248q2.08278,0.56235 3.16584,2.08278t1.08306,3.66571q0,3.12423 -2.08278,5.08204t-5.60268,1.95781q-3.12423,0 -5.08204,-1.87453l1.45799,-2.08278z" fill="black"/></g>
<g id="shuzi_b_4" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m54.96645,54.05346l-1.77282,0l0,3.1344l-2.55111,0l0,-3.1344l-5.60941,0l0,-2.02145l6.16115,-9.21987l1.99982,0l0,8.92801l1.7728,0l0,2.31331l-0.00044,0l0.00001,0zm-4.32348,-2.31331l0,-4.43158l-2.81056,4.43158l2.81056,0z" fill="black"/></g>
<g id="shuzi_b_5" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m44.75782,55.18786q1.22851,1.52069 3.47827,1.52069q2.54101,0 3.74896,-1.45799t1.20795,-3.66571q0,-2.08278 -1.24933,-3.16584t-3.53561,-1.08306l-2.08278,0l0.62483,-6.24835l7.28974,0l0,2.08278l-5.41523,0l-0.31241,2.49934q1.04135,-0.31241 2.08278,-0.31241q2.91623,0 4.60307,1.66632t1.68684,4.24885q0,3.12423 -2.08278,5.08204t-5.60268,1.95781q-3.12423,0 -5.08204,-1.87453l1.45799,-2.08278z" fill="black"/></g>
<g id="shuzi_b_6" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m53.92484,43.18786l-1.45799,1.87453q-1.45799,-1.24933 -3.12423,-1.24933q-2.70778,0 -4.16557,2.29106t-1.45779,6.04024l0.06248,0q1.24933,-1.87453 3.53561,-1.87453q2.70778,0 4.24885,1.74951t1.54107,4.33216q0,2.91623 -1.87453,4.68662t-4.79048,1.77039q-3.33245,0 -5.20698,-2.49948t-1.87453,-6.95633q0,-4.99868 2.29106,-7.74819t5.83179,-2.74951q2.49948,0 4.43224,1.45799l-0.00044,0l0.00001,0zm-7.07925,9.16424q-1.45799,0 -2.29106,1.04135t-0.83307,2.70778q0,1.87453 0.83307,2.83308t2.29106,0.95855q1.45799,0 2.29106,-0.95855t0.83307,-2.83308q0,-1.66643 -0.83307,-2.70778t-2.29106,-1.04135z" fill="black"/></g>
<g id="shuzi_b_7" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m44.75782,43.18786l0,-2.08278l10.83057,0l0,1.87453l-6.87324,14.21611l-2.70778,0l6.66496,-14.00786l-7.91451,0z" fill="black"/></g>
<g id="shuzi_b_0" transform="translate(-50,-50)"><rect height="17.9" width="11" y="41.05" x="44.5" fill="none"/><path d="m50.00001,41.05q3.54101,0 5.20755,2.91623t1.66654,7.91451q0,4.99828 -1.66654,7.91451t-5.20755,2.91623q-3.54101,0 -5.20755,-2.91623t-1.66654,-7.91451q0,-4.99828 1.66654,-7.91451t5.20755,-2.91623zm0,2.08278q-2.29162,0 -3.33297,2.29162t-1.04135,6.45634q0,4.16472 1.04135,6.45634t3.33297,2.29162q2.29162,0 3.33297,-2.29162t1.04135,-6.45634q0,-4.16472 -1.04135,-6.45634t-3.33297,-2.29162z" fill="black"/></g>
<g id="yanyinfu" transform="translate(-50,-50)"><rect height="17.9" width="14" y="41.05" x="43" fill="none"/><rect fill="black" x="44" y="49" width="12" height="2"/></g>
<g id="xiaojiexian" transform="translate(-50,-50)"><rect height="28" width="8" y="36" x="46" fill="none"/><rect fill="#1b1b1b" x="49" y="38" width="1.5" height="24"/></g>
<g id="jieshufu" transform="translate(-50,-50)"><rect height="28" width="14" y="36" x="43" fill="none"/><rect fill="#1b1b1b" x="46" y="38" width="1.5" height="24"/><rect fill="#1b1b1b" x="51" y="38" width="3.5" height="24"/></g>
<g id="xunhuan_zuoyou" transform="translate(-50,-50)"><rect height="28" width="18" y="36" x="41" fill="none"/><rect fill="#1b1b1b" x="44" y="38" width="3.5" height="24"/><rect fill="#1b1b1b" x="53" y="38" width="1.5" height="24"/><circle cx="49" cy="46" r="1.5" fill="#1b1b1b"/><circle cx="49" cy="54" r="1.5" fill="#1b1b1b"/></g>
<g id="yingao_gao" transform="translate(-50,-50)"><circle cx="50" cy="35" r="1.8" fill="black"/></g>
<g id="yingao_di" transform="translate(-50,-50)"><circle cx="50" cy="65" r="1.8" fill="black"/></g>
<g id="fudian" transform="translate(-50,-50)"><circle cx="58" cy="50" r="1.5" fill="black"/></g>
`;

  // src/renderer/svg-generator.ts
  function generateSVG(layout) {
    const { width, height, ast } = layout;
    let svg = `<svg width="${width}" height="${height}" version="1.1" viewBox="0 0 ${width} ${height}" encoding="UTF-8" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;
    svg += `<rect x="0" y="0" height="100%" width="100%" fill="#ffffff" />`;
    svg += `<defs>${SVG_GLYPH_DEFS}</defs>`;
    svg += `<text x="${width / 2}" y="100" text-anchor="middle" fill="#1b1b1b" style="font-weight:bold;" font-size="36" font-family="Microsoft YaHei">${escapeXml(ast.title)}</text>`;
    if (ast.subTitle) {
      svg += `<text x="${width / 2}" y="145" text-anchor="middle" fill="#1b1b1b" font-size="20" font-family="Microsoft YaHei">${escapeXml(ast.subTitle)}</text>`;
    }
    const metaY = ast.subTitle ? 185 : 155;
    svg += `<text x="80" y="${metaY}" fill="#1b1b1b" font-size="18" font-family="Microsoft YaHei">1=${escapeXml(ast.key.replace(/^1=/, ""))}  ${escapeXml(ast.meter)}</text>`;
    if (ast.composer) {
      svg += `<text x="${width - 80}" y="${metaY}" text-anchor="end" fill="#1b1b1b" font-size="16" font-family="Microsoft YaHei">${escapeXml(ast.composer)}</text>`;
    }
    for (const line of ast.lines) {
      renderScoreLine((svgParts) => {
        svg += svgParts;
      }, line);
    }
    svg += `</svg>`;
    return svg;
  }
  function renderScoreLine(emit, line) {
    let pendingTieStart = null;
    for (const measure of line.measures) {
      renderMeasure(emit, measure);
      for (const item of measure.items) {
        if (item.tieStart) {
          pendingTieStart = item;
        } else if (item.tieEnd && pendingTieStart && item.x && pendingTieStart.x && item.y && pendingTieStart.y) {
          const x1 = pendingTieStart.x + 5;
          const x2 = item.x + 5;
          const y = item.y - 12;
          const midX = (x1 + x2) / 2;
          const midY = y - 10;
          emit(`<path d="M ${x1} ${y} Q ${midX} ${midY} ${x2} ${y}" fill="none" stroke="#1b1b1b" stroke-width="1.5" />`);
          pendingTieStart = null;
        }
      }
      const rightX = (measure.x || 0) + (measure.width || 0);
      const barY = measure.items[0]?.y || line.y || 200;
      if (measure.barlineRight) {
        renderBarline(emit, measure.barlineRight, rightX, barY);
      }
    }
  }
  function renderMeasure(emit, measure) {
    for (const item of measure.items) {
      renderNoteItem(emit, item);
    }
  }
  function renderNoteItem(emit, item) {
    const x = item.x || 0;
    const y = item.y || 0;
    if (item.isDash) {
      emit(`<use x="${x}" y="${y}" xlink:href="#yanyinfu" notepos="${item.notepos || ""}"></use>`);
      return;
    }
    if (item.pitch >= 0 && item.pitch <= 7) {
      const glyphId = "shuzi_b_" + item.pitch;
      emit(`<use x="${x}" y="${y}" xlink:href="#${glyphId}" notepos="${item.notepos || ""}"></use>`);
    }
    if (item.octave > 0) {
      for (let o = 0; o < item.octave; o++) {
        emit(`<circle cx="${x + 5}" cy="${y - 12 - o * 6}" r="1.8" fill="#1b1b1b" />`);
      }
    } else if (item.octave < 0) {
      for (let o = 0; o < Math.abs(item.octave); o++) {
        emit(`<circle cx="${x + 5}" cy="${y + 14 + o * 6}" r="1.8" fill="#1b1b1b" />`);
      }
    }
    if (item.dots > 0) {
      for (let d = 0; d < item.dots; d++) {
        emit(`<circle cx="${x + 14 + d * 6}" cy="${y}" r="1.5" fill="#1b1b1b" />`);
      }
    }
    if (item.accidental) {
      const accChar = item.accidental === "#" ? "\u266F" : item.accidental === "$" ? "\u266D" : "\u266E";
      emit(`<text x="${x - 7}" y="${y - 4}" font-size="12" fill="#1b1b1b" font-family="sans-serif">${accChar}</text>`);
    }
    if (item.underlines > 0) {
      const beamYBase = y + (item.octave < 0 ? 18 : 10);
      for (let u = 0; u < item.underlines; u++) {
        emit(`<rect x="${x - 1}" y="${beamYBase + u * 3.5}" width="13" height="1.6" fill="#1b1b1b" />`);
      }
    }
    if (item.lyric) {
      emit(`<text x="${x + 5}" y="${y + 36}" text-anchor="middle" font-size="16" fill="#1b1b1b" font-family="Microsoft YaHei">${escapeXml(item.lyric)}</text>`);
    }
  }
  function renderBarline(emit, barType, x, y) {
    if (barType === "||") {
      emit(`<use x="${x - 14}" y="${y}" xlink:href="#jieshufu"></use>`);
    } else if (barType === ":|:" || barType === "|::|" || barType === ":|" || barType === "|:") {
      emit(`<use x="${x - 16}" y="${y}" xlink:href="#xunhuan_zuoyou"></use>`);
    } else {
      emit(`<use x="${x - 8}" y="${y}" xlink:href="#xiaojiexian"></use>`);
    }
  }
  function escapeXml(unsafe) {
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }

  // src/renderer/index.ts
  function renderZhipuScore(codeText, config) {
    const ast = parseZhipuNotation(codeText);
    const layout = computeLayout(ast, config);
    return generateSVG(layout);
  }
  if (typeof window !== "undefined") {
    window.renderZhipuScore = renderZhipuScore;
  }
  return __toCommonJS(index_exports);
})();

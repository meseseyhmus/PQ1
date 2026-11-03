import { countWords, readingTimeMinutes } from "@/lib/format";
import type { SubtitleStats } from "@/types";

const TIMECODE_LINE = /-->|^\d{1,2}:\d{2}([:.]\d{2,3})?\s*$|^\d+\s*$|^WEBVTT|^NOTE\b|^STYLE\b|^REGION\b/i;
const INLINE_TAGS = /<[^>]+>/g;
const BRACE_TAGS = /\{\\[^}]*\}/g;

function isTimestampOrIndexLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.includes("-->")) return true;
  if (/^\d+$/.test(trimmed)) return true;
  if (/^WEBVTT/i.test(trimmed)) return true;
  if (/^(NOTE|STYLE|REGION)\b/.test(trimmed)) return true;
  if (/^\d{1,2}:\d{2}([:.]\d{2,3})?$/.test(trimmed)) return true;
  return false;
}

function cleanLine(line: string): string {
  return line
    .replace(INLINE_TAGS, "")
    .replace(BRACE_TAGS, "")
    // speaker prefixes: ">>", "SPEAKER 01:", "[Konuşmacı]:"
    .replace(/^(?:>>+\s*)+/, "")
    .replace(/^(?:\[[^\]]*\]|[A-ZÇĞİÖŞÜ0-9 ]{2,20}):\s*/, (m) =>
      // keep things that look like normal sentences with a colon (URLs etc.)
      m.length > 0 && /^[A-ZÇĞİÖŞÜ0-9 ]+:$/.test(m.trim()) ? "" : m
    )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCueText(block: string): string {
  return block
    .split(/\r?\n/)
    .filter((line) => !isTimestampOrIndexLine(line))
    .map(cleanLine)
    .filter((line) => line.length > 0)
    .join(" ")
    .trim();
}

/**
 * Parses an SRT / WebVTT subtitle file (or a plain transcript) and returns
 * clean plain prose text: timecodes, numbering, inline tags, speaker labels
 * and duplicate overlapping lines removed, cues merged into paragraphs.
 */
export function parseSubtitles(raw: string): string {
  const normalized = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  // Drop WEBVTT header / metadata blocks entirely.
  const withoutHeader = normalized
    .split(/\n\n/)
    .filter(
      (block) =>
        !/^\s*(WEBVTT|NOTE|STYLE|REGION)\b/i.test(block.trim())
    )
    .join("\n\n");

  const cues: string[] = [];
  for (const block of withoutHeader.split(/\n\s*\n/)) {
    const text = normalizeCueText(block);
    if (!text) continue;
    // remove duplicate / overlapping lines (repeated cue text)
    const previous = cues[cues.length - 1];
    if (previous === text) continue;
    if (previous && previous.endsWith(text)) continue;
    if (previous && text.endsWith(previous)) {
      cues[cues.length - 1] = text;
      continue;
    }
    cues.push(text);
  }

  // Join cues, then re-flow into paragraphs of up to 3 sentences.
  const full = cues.join(" ").replace(/\s+/g, " ").trim();
  if (!full) return "";

  const sentences = full.match(/[^.!?…]+[.!?…]+|\S[^.!?…]*$/g) ?? [full];
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const sentence of sentences) {
    current.push(sentence.trim());
    if (current.length >= 3) {
      paragraphs.push(current.join(" "));
      current = [];
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" "));
  return paragraphs.join("\n\n");
}

export function subtitleStats(rawInput: string, cleaned: string): SubtitleStats {
  const cueCount = (rawInput.match(/-->/g) ?? []).length;
  const wordCount = countWords(cleaned);
  return {
    cueCount,
    wordCount,
    readingMinutes: readingTimeMinutes(wordCount),
  };
}

/** Splits cleaned prose into bullet points (first one or two sentences per paragraph). */
export function toBulletPoints(cleaned: string, maxBullets = 30): string[] {
  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const bullets: string[] = [];
  for (const paragraph of paragraphs) {
    if (bullets.length >= maxBullets) break;
    const sentences = paragraph.match(/[^.!?…]+[.!?…]+/g) ?? [paragraph];
    const bullet = sentences.slice(0, 2).join(" ").trim();
    if (bullet) bullets.push(bullet);
  }
  return bullets;
}

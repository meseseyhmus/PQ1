import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { extractText } from "@/lib/pdfExtract";
import type { PageText } from "@/types";

export interface DocxConversionOptions {
  title?: string;
  creator?: string;
  description?: string;
  includePageNumbers?: boolean;
}

/**
 * Heuristically determines if a line should be rendered as a heading.
 */
export function isHeadingLine(line: string): { isHeading: boolean; level?: (typeof HeadingLevel)[keyof typeof HeadingLevel] } {
  const trimmed = line.trim();
  if (!trimmed) return { isHeading: false };

  // Explicit markdown style
  if (trimmed.startsWith("# ")) return { isHeading: true, level: HeadingLevel.HEADING_1 };
  if (trimmed.startsWith("## ")) return { isHeading: true, level: HeadingLevel.HEADING_2 };
  if (trimmed.startsWith("### ")) return { isHeading: true, level: HeadingLevel.HEADING_3 };

  // Numbered section e.g. "1. Giriş", "2.1 Metodoloji"
  if (/^\d+(\.\d+)*\.?\s+[A-ZÇĞİÖŞÜa-zçğıöşü]/.test(trimmed) && trimmed.length < 70) {
    return { isHeading: true, level: HeadingLevel.HEADING_2 };
  }

  // Short all-uppercase line (at least 4 chars, less than 60 chars)
  if (
    trimmed.length >= 4 &&
    trimmed.length <= 60 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-ZÇĞİÖŞÜ]/.test(trimmed)
  ) {
    return { isHeading: true, level: HeadingLevel.HEADING_1 };
  }

  return { isHeading: false };
}

/**
 * Builds an array of docx Paragraphs from plain/formatted text lines.
 */
export function textToDocxParagraphs(text: string): Paragraph[] {
  const lines = text.split(/\r?\n/);
  const paragraphs: Paragraph[] = [];

  let currentBlock: string[] = [];

  const flushCurrentBlock = () => {
    if (currentBlock.length > 0) {
      const bodyText = currentBlock.join(" ").trim();
      if (bodyText) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: bodyText, size: 22 })],
            spacing: { after: 160, line: 300 },
          })
        );
      }
      currentBlock = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushCurrentBlock();
      continue;
    }

    const headingInfo = isHeadingLine(line);
    if (headingInfo.isHeading) {
      flushCurrentBlock();
      const cleanHeading = line.replace(/^#{1,3}\s+/, "");
      paragraphs.push(
        new Paragraph({
          text: cleanHeading,
          heading: headingInfo.level ?? HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else {
      currentBlock.push(line);
    }
  }

  flushCurrentBlock();

  // If input was empty or generated nothing, at least return an empty paragraph
  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
  }

  return paragraphs;
}

/**
 * Converts PageText array (extracted from PDF) into a single docx Document.
 */
export function pagesToDocxDocument(
  pages: PageText[],
  options?: DocxConversionOptions
): Document {
  const allChildren: Paragraph[] = [];

  if (options?.title) {
    allChildren.push(
      new Paragraph({
        text: options.title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 300 },
      })
    );
  }

  pages.forEach((page, index) => {
    // Add page break before page if index > 0
    if (index > 0) {
      allChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Sayfa ${page.page} ---`,
              bold: true,
              color: "888888",
              size: 18,
            }),
          ],
          pageBreakBefore: true,
          spacing: { before: 100, after: 150 },
        })
      );
    }

    const pageParagraphs = textToDocxParagraphs(page.text);
    allChildren.push(...pageParagraphs);
  });

  return new Document({
    creator: options?.creator || "KonvertLab",
    title: options?.title || "KonvertLab PDF to Word",
    description: options?.description || "Converted with KonvertLab (100% Client-Side)",
    sections: [
      {
        properties: {},
        children: allChildren,
      },
    ],
  });
}

/**
 * End-to-end PDF to Word (DOCX) converter entirely in the browser.
 */
export async function convertPdfToDocx(
  file: File,
  onProgress?: (percent: number) => void,
  options?: DocxConversionOptions
): Promise<Blob> {
  const pages = await extractText(file, (p) => {
    // PDF extraction is ~70% of total work
    onProgress?.(Math.round(p * 0.7));
  });

  const baseTitle = file.name.replace(/\.pdf$/i, "");
  const doc = pagesToDocxDocument(pages, {
    title: options?.title || baseTitle,
    ...options,
  });

  onProgress?.(85);
  const blob = await Packer.toBlob(doc);
  onProgress?.(100);

  return blob;
}

/**
 * Converts plain text to Word (DOCX) Blob.
 */
export async function convertTextToDocx(text: string, title?: string): Promise<Blob> {
  const paragraphs = textToDocxParagraphs(text);
  const doc = new Document({
    creator: "KonvertLab",
    title: title || "Belge",
    sections: [
      {
        children: [
          ...(title
            ? [
                new Paragraph({
                  text: title,
                  heading: HeadingLevel.TITLE,
                  spacing: { after: 240 },
                }),
              ]
            : []),
          ...paragraphs,
        ],
      },
    ],
  });
  return await Packer.toBlob(doc);
}

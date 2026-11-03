import * as XLSX from "xlsx";
import { extractStructuredPages, parseDelimitedTextToRows, type StructuredPageData } from "@/lib/pdfExtract";

export interface ExcelGenerateOptions {
  combinedSheet?: boolean; // if true, puts all pages into one single sheet; if false, one sheet per page
  sheetPrefix?: string;
}

/**
 * Creates an XLSX WorkBook from structured page table rows.
 */
export function buildWorkbookFromPages(
  pages: StructuredPageData[],
  options?: ExcelGenerateOptions
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  if (options?.combinedSheet) {
    const allRows: string[][] = [];
    pages.forEach((p, idx) => {
      if (idx > 0) {
        allRows.push([`--- Sayfa ${p.pageNumber} ---`]);
      }
      allRows.push(...p.tableRows);
    });
    const ws = XLSX.utils.aoa_to_sheet(allRows.length > 0 ? allRows : [["Veri bulunamadı"]]);
    XLSX.utils.book_append_sheet(wb, ws, "Tüm Sayfalar");
  } else {
    pages.forEach((p) => {
      const sheetName = `${options?.sheetPrefix || "Sayfa"} ${p.pageNumber}`.slice(0, 31);
      const rows = p.tableRows.length > 0 ? p.tableRows : [["Bu sayfada veri bulunamadı"]];
      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Auto-fit column widths approximately
      const colWidths = rows.reduce<number[]>((acc, row) => {
        row.forEach((cell, colIdx) => {
          const len = String(cell || "").length;
          acc[colIdx] = Math.max(acc[colIdx] || 10, Math.min(len + 3, 50));
        });
        return acc;
      }, []);
      ws["!cols"] = colWidths.map((wch) => ({ wch }));

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
  }

  return wb;
}

/**
 * Converts a workbook to a downloadable Blob (.xlsx).
 */
export function workbookToBlob(wb: XLSX.WorkBook): Blob {
  const wbout = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * End-to-end PDF to Excel (XLSX) converter entirely in the browser.
 */
export async function convertPdfToExcel(
  file: File,
  onProgress?: (percent: number) => void,
  options?: ExcelGenerateOptions
): Promise<{ blob: Blob; rowCount: number; sheetCount: number; sampleData: string[][] }> {
  const pages = await extractStructuredPages(file, (p) => {
    onProgress?.(Math.round(p * 0.8));
  });

  const wb = buildWorkbookFromPages(pages, options);
  onProgress?.(90);

  const blob = workbookToBlob(wb);
  onProgress?.(100);

  const totalRows = pages.reduce((n, p) => n + p.tableRows.length, 0);
  const sampleData = pages[0]?.tableRows?.slice(0, 5) || [];

  return {
    blob,
    rowCount: totalRows,
    sheetCount: wb.SheetNames.length,
    sampleData,
  };
}

/**
 * Converts raw delimited text (TSV, CSV, Markdown, multi-spaced lines) directly to XLSX Blob.
 */
export function convertTextToExcel(
  text: string,
  sheetName = "Veri"
): { blob: Blob; rows: string[][] } {
  const rows = parseDelimitedTextToRows(text);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [["Boş Veri"]]);

  // Adjust column widths
  const colWidths = rows.reduce<number[]>((acc, row) => {
    row.forEach((cell, colIdx) => {
      const len = String(cell || "").length;
      acc[colIdx] = Math.max(acc[colIdx] || 10, Math.min(len + 3, 50));
    });
    return acc;
  }, []);
  ws["!cols"] = colWidths.map((wch) => ({ wch }));

  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const blob = workbookToBlob(wb);
  return { blob, rows };
}

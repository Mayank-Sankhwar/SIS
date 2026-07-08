import ExcelJS from "exceljs";
import {
  type ReportAccess,
  type ReportFilters,
  ReportRepository,
  type ReportTable
} from "../repositories/report.repository.js";
import { workbookToBuffer } from "../utils/excel.js";

export type ReportFormat = "json" | "xlsx" | "pdf";

export interface ReportRequest extends ReportFilters {
  format: ReportFormat;
}

export interface ReportResult {
  fileName: string;
  format: ReportFormat;
  table: ReportTable;
  buffer?: Buffer;
}

export class ReportService {
  constructor(private readonly reportRepository = new ReportRepository()) {}

  async getSubstationReport(access: ReportAccess, request: ReportRequest): Promise<ReportResult> {
    const table = await this.reportRepository.getSubstationReport(access, request);
    return this.formatReport("substations-report", "Substation Report", table, request);
  }

  async getTransformerReport(access: ReportAccess, request: ReportRequest): Promise<ReportResult> {
    const table = await this.reportRepository.getTransformerReport(access, request);
    return this.formatReport("transformers-report", "Transformer Report", table, request);
  }

  async getFeederReport(access: ReportAccess, request: ReportRequest): Promise<ReportResult> {
    const table = await this.reportRepository.getFeederReport(access, request);
    return this.formatReport("feeders-report", "Feeder Report", table, request);
  }

  async getEquipmentSummaryReport(access: ReportAccess, request: ReportRequest): Promise<ReportResult> {
    const table = await this.reportRepository.getEquipmentSummaryReport(access, request);
    return this.formatReport("equipment-summary-report", "Equipment Summary Report", table, request);
  }

  async getImportHistoryReport(access: ReportAccess, request: ReportRequest): Promise<ReportResult> {
    const table = await this.reportRepository.getImportHistoryReport(access, request);
    return this.formatReport("import-history-report", "Import History Report", table, request);
  }

  async getImportErrorReport(access: ReportAccess, request: ReportRequest): Promise<ReportResult> {
    const table = await this.reportRepository.getImportErrorReport(access, request);
    return this.formatReport("import-errors-report", "Import Error Report", table, request);
  }

  async getAuditLogReport(access: ReportAccess, request: ReportRequest): Promise<ReportResult> {
    const table = await this.reportRepository.getAuditLogReport(access, request);
    return this.formatReport("audit-log-report", "Audit Log Report", table, request);
  }

  private async formatReport(
    fileName: string,
    title: string,
    table: ReportTable,
    request: ReportRequest
  ): Promise<ReportResult> {
    if (request.format === "json") {
      return { fileName, format: request.format, table };
    }

    if (request.format === "pdf") {
      return {
        fileName,
        format: request.format,
        table,
        buffer: this.buildPdf(title, table, request)
      };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(table.sheetName);
    const headers = this.collectHeaders(table);

    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: Math.max(header.length + 2, 16)
    }));

    worksheet.addRows(table.rows);
    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: Math.max(headers.length, 1) }
    };

    return {
      fileName,
      format: request.format,
      table,
      buffer: await workbookToBuffer(workbook)
    };
  }

  private collectHeaders(table: ReportTable): string[] {
    const headers = new Set<string>(table.headers);

    for (const row of table.rows) {
      for (const key of Object.keys(row)) {
        headers.add(key);
      }
    }

    return Array.from(headers);
  }

  private buildPdf(title: string, table: ReportTable, request: ReportRequest): Buffer {
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 32;
    const rowHeight = 15;
    const headers = this.collectHeaders(table);
    const appliedFilters = this.appliedFilters(request);
    const hierarchy = this.hierarchyInformation(request);
    const rowsPerPage = 24;
    const pages = this.chunkRows(table.rows, rowsPerPage);
    const contentStreams = pages.length > 0 ? pages : [[]];
    const objects: string[] = [];
    const pageObjectIds: number[] = [];

    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

    contentStreams.forEach((rows, index) => {
      const pageObjectId = objects.length + 1;
      const contentObjectId = pageObjectId + 1;
      pageObjectIds.push(pageObjectId);

      const content = this.renderPdfPage({
        title,
        generatedAt: new Date(),
        filters: appliedFilters,
        hierarchy,
        headers,
        rows,
        pageNumber: index + 1,
        totalPages: contentStreams.length,
        pageWidth,
        pageHeight,
        margin,
        rowHeight
      });

      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`);
      objects.push(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
    });

    objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

    return this.assemblePdf(objects);
  }

  private renderPdfPage(input: {
    title: string;
    generatedAt: Date;
    filters: string;
    hierarchy: string;
    headers: string[];
    rows: ReportTable["rows"];
    pageNumber: number;
    totalPages: number;
    pageWidth: number;
    pageHeight: number;
    margin: number;
    rowHeight: number;
  }): string {
    const commands: string[] = [];
    const tableTop = input.pageHeight - 125;
    const tableWidth = input.pageWidth - input.margin * 2;
    const columnWidth = tableWidth / Math.max(input.headers.length, 1);
    const fontSize = input.headers.length > 10 ? 5 : 7;

    this.addText(commands, input.title, input.margin, input.pageHeight - 34, 15);
    this.addText(commands, `Generated: ${input.generatedAt.toISOString()}`, input.margin, input.pageHeight - 55, 8);
    this.addText(commands, `Filters: ${input.filters || "None"}`, input.margin, input.pageHeight - 72, 8);
    this.addText(commands, `Hierarchy: ${input.hierarchy}`, input.margin, input.pageHeight - 89, 8);
    this.addLine(commands, input.margin, input.pageHeight - 101, input.pageWidth - input.margin, input.pageHeight - 101);

    input.headers.forEach((header, index) => {
      this.addText(commands, this.truncate(header, columnWidth, fontSize), input.margin + index * columnWidth, tableTop, fontSize);
    });
    this.addLine(commands, input.margin, tableTop - 5, input.pageWidth - input.margin, tableTop - 5);

    input.rows.forEach((row, rowIndex) => {
      const y = tableTop - 18 - rowIndex * input.rowHeight;
      input.headers.forEach((header, columnIndex) => {
        const value = this.formatPdfCell(row[header]);
        this.addText(commands, this.truncate(value, columnWidth, fontSize), input.margin + columnIndex * columnWidth, y, fontSize);
      });
    });

    this.addLine(commands, input.margin, 38, input.pageWidth - input.margin, 38);
    this.addText(commands, "Substation Info System", input.margin, 22, 8);
    this.addText(commands, `Page ${input.pageNumber} of ${input.totalPages}`, input.pageWidth - 95, 22, 8);

    return commands.join("\n");
  }

  private assemblePdf(objects: string[]): Buffer {
    const chunks: string[] = ["%PDF-1.4\n"];
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(chunks.join(""), "utf8"));
      chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
    });

    const xrefOffset = Buffer.byteLength(chunks.join(""), "utf8");
    chunks.push(`xref\n0 ${objects.length + 1}\n`);
    chunks.push("0000000000 65535 f \n");

    for (let index = 1; index <= objects.length; index += 1) {
      chunks.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
    }

    chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return Buffer.from(chunks.join(""), "utf8");
  }

  private addText(commands: string[], value: string, x: number, y: number, size: number): void {
    commands.push(`BT /F1 ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${this.escapePdf(value)}) Tj ET`);
  }

  private addLine(commands: string[], x1: number, y1: number, x2: number, y2: number): void {
    commands.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  private escapePdf(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  private truncate(value: string, width: number, fontSize: number): string {
    const maxCharacters = Math.max(Math.floor(width / (fontSize * 0.55)), 4);
    return value.length > maxCharacters ? `${value.slice(0, maxCharacters - 3)}...` : value;
  }

  private formatPdfCell(value: string | number | boolean | Date | null | undefined): string {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value);
  }

  private chunkRows(rows: ReportTable["rows"], size: number): ReportTable["rows"][] {
    const chunks: ReportTable["rows"][] = [];

    for (let index = 0; index < rows.length; index += size) {
      chunks.push(rows.slice(index, index + size));
    }

    return chunks;
  }

  private appliedFilters(request: ReportRequest): string {
    return Object.entries(request)
      .filter(([key, value]) => key !== "format" && value !== undefined)
      .map(([key, value]) => `${key}=${value instanceof Date ? value.toISOString() : String(value)}`)
      .join(", ");
  }

  private hierarchyInformation(request: ReportRequest): string {
    const hierarchyFilters = [
      ["discomId", request.discomId],
      ["zoneId", request.zoneId],
      ["verticalId", request.verticalId],
      ["subVerticalId", request.subVerticalId],
      ["substationId", request.substationId]
    ]
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`);

    return hierarchyFilters.length > 0 ? hierarchyFilters.join(" > ") : "All authorized hierarchy";
  }
}

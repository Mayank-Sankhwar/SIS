import ExcelJS from "exceljs";

type ExcelInputBuffer = Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0];

export async function workbookFromBuffer(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelInputBuffer);
  return workbook;
}

export async function workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const output = await workbook.xlsx.writeBuffer();
  return Buffer.from(output);
}

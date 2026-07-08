import crypto from "node:crypto";
import { ImportJobStatus } from "@prisma/client";
import type {
  ImportExecutionResponseDto,
  ImportMode,
  ImportRowDto,
  ImportValidationResponseDto,
  ParsedWorkbookDto,
  WorkbookValidationIssue
} from "../dtos/import-workbook.dto.js";
import { SUBSTATION_WORKBOOK_SHEETS } from "../parsers/substation-workbook.schema.js";
import { ImportRepository } from "../repositories/import.repository.js";
import { AppError } from "../utils/app-error.js";
import { SubstationWorkbookParser } from "../parsers/substation-workbook.parser.js";

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export class ImportService {
  constructor(
    private readonly importRepository = new ImportRepository(),
    private readonly workbookParser = new SubstationWorkbookParser()
  ) {}

  async validateWorkbook(file: Express.Multer.File | undefined, actorUserId: string): Promise<ImportValidationResponseDto> {
    if (!file) {
      throw new AppError("Workbook file is required", 400);
    }

    this.validateFileEnvelope(file);

    const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const storedFileName = `${Date.now()}-${checksum}.xlsx`;

    return this.importRepository.runInTransaction(async (tx) => {
      const uploadedFile = await this.importRepository.createUploadedFile(tx, {
        originalFileName: file.originalname,
        storedFileName,
        storagePath: `imports/validation-only/${storedFileName}`,
        mimeType: file.mimetype,
        fileSizeBytes: BigInt(file.size),
        checksum,
        uploadedById: actorUserId
      });

      const importJob = await this.importRepository.createImportJob(tx, {
        uploadedFileId: uploadedFile.id,
        createdById: actorUserId
      });

      const validationResult =
        file.size === 0
          ? this.emptyFileValidationResult()
          : await this.workbookParser.validate(file.buffer);

      await this.importRepository.createImportErrors(tx, importJob.id, validationResult.validationErrors);

      const updatedImportJob = await this.importRepository.updateImportJobStatus(tx, importJob.id, {
        status: validationResult.isValid ? ImportJobStatus.COMPLETED : ImportJobStatus.FAILED_VALIDATION,
        totalRows: validationResult.workbookSummary.totalRows,
        failedRows: validationResult.validationErrors.length,
        updatedById: actorUserId
      });

      return {
        ...validationResult,
        uploadedFile: {
          id: uploadedFile.id,
          originalFileName: uploadedFile.originalFileName,
          mimeType: uploadedFile.mimeType,
          fileSizeBytes: Number(uploadedFile.fileSizeBytes),
          checksum: uploadedFile.checksum
        },
        importJob: {
          id: updatedImportJob.id,
          status: updatedImportJob.status,
          totalRows: updatedImportJob.totalRows,
          failedRows: updatedImportJob.failedRows
        }
      };
    });
  }

  async importWorkbook(
    file: Express.Multer.File | undefined,
    actorUserId: string,
    modeInput: unknown
  ): Promise<ImportExecutionResponseDto> {
    const startedAt = Date.now();
    const mode = this.parseImportMode(modeInput);

    if (!file) {
      throw new AppError("Workbook file is required", 400);
    }

    this.validateFileEnvelope(file);

    const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const storedFileName = `${Date.now()}-${checksum}.xlsx`;

    return this.importRepository.runInTransaction(async (tx) => {
      const uploadedFile = await this.importRepository.createUploadedFile(tx, {
        originalFileName: file.originalname,
        storedFileName,
        storagePath: `imports/executed/${storedFileName}`,
        mimeType: file.mimetype,
        fileSizeBytes: BigInt(file.size),
        checksum,
        uploadedById: actorUserId
      });

      const importJob = await this.importRepository.createImportJob(tx, {
        uploadedFileId: uploadedFile.id,
        createdById: actorUserId
      });

      const validationResult =
        file.size === 0
          ? this.emptyFileValidationResult()
          : await this.workbookParser.validate(file.buffer);

      if (!validationResult.isValid) {
        await this.importRepository.createImportErrors(tx, importJob.id, validationResult.validationErrors);
        const updatedImportJob = await this.importRepository.updateImportJobStatus(tx, importJob.id, {
          status: ImportJobStatus.FAILED_VALIDATION,
          totalRows: validationResult.workbookSummary.totalRows,
          failedRows: validationResult.validationErrors.length,
          updatedById: actorUserId
        });

        return {
          ...validationResult,
          mode,
          uploadedFile: {
            id: uploadedFile.id,
            originalFileName: uploadedFile.originalFileName,
            mimeType: uploadedFile.mimeType,
            fileSizeBytes: Number(uploadedFile.fileSizeBytes),
            checksum: uploadedFile.checksum
          },
          importJob: {
            id: updatedImportJob.id,
            status: updatedImportJob.status,
            totalRows: updatedImportJob.totalRows,
            failedRows: updatedImportJob.failedRows
          },
          summary: {
            rowsRead: validationResult.workbookSummary.totalRows,
            rowsImported: 0,
            rowsUpdated: 0,
            rowsFailed: validationResult.validationErrors.length,
            validationErrors: validationResult.validationErrors,
            executionTimeMs: Date.now() - startedAt
          }
        };
      }

      const parsedWorkbook = await this.workbookParser.parse(file.buffer);
      const processor = new WorkbookImportProcessor(this.importRepository, tx, actorUserId, mode);
      const summary = await processor.process(parsedWorkbook);

      await this.importRepository.createImportErrors(tx, importJob.id, summary.validationErrors);

      const updatedImportJob = await this.importRepository.updateImportJobStatus(tx, importJob.id, {
        status: summary.rowsFailed > 0 ? ImportJobStatus.COMPLETED_WITH_ERRORS : ImportJobStatus.COMPLETED,
        totalRows: summary.rowsRead,
        failedRows: summary.rowsFailed,
        updatedById: actorUserId
      });

      return {
        ...validationResult,
        mode,
        uploadedFile: {
          id: uploadedFile.id,
          originalFileName: uploadedFile.originalFileName,
          mimeType: uploadedFile.mimeType,
          fileSizeBytes: Number(uploadedFile.fileSizeBytes),
          checksum: uploadedFile.checksum
        },
        importJob: {
          id: updatedImportJob.id,
          status: updatedImportJob.status,
          totalRows: updatedImportJob.totalRows,
          failedRows: updatedImportJob.failedRows
        },
        summary: {
          ...summary,
          executionTimeMs: Date.now() - startedAt
        }
      };
    });
  }

  private validateFileEnvelope(file: Express.Multer.File): void {
    const extension = this.getFileExtension(file.originalname);

    if (extension !== ".xlsx") {
      throw new AppError("Only .xlsx workbook files are supported", 400);
    }

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      throw new AppError("Workbook file size must not exceed 10 MB", 400);
    }
  }

  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf(".");
    return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
  }

  private parseImportMode(value: unknown): ImportMode {
    if (value === undefined || value === null || value === "") {
      return "UPSERT";
    }

    if (value === "INSERT_ONLY" || value === "UPSERT") {
      return value;
    }

    throw new AppError("Import mode must be INSERT_ONLY or UPSERT", 422);
  }

  private emptyFileValidationResult() {
    const validationErrors: WorkbookValidationIssue[] = [
      {
        rowNumber: 0,
        errorCode: "EMPTY_FILE",
        errorMessage: "Workbook file is empty"
      }
    ];

    return {
      isValid: false,
      workbookSummary: {
        sheetCount: 0,
        requiredSheetCount: SUBSTATION_WORKBOOK_SHEETS.length,
        totalRows: 0
      },
      sheetNames: [],
      sheets: [],
      validationErrors,
      validationWarnings: []
    };
  }
}

interface ImportProcessorSummary {
  rowsRead: number;
  rowsImported: number;
  rowsUpdated: number;
  rowsFailed: number;
  validationErrors: WorkbookValidationIssue[];
  executionTimeMs: number;
}

class WorkbookImportProcessor {
  private readonly discomIdsByCode = new Map<string, string>();
  private readonly zoneIdsByCode = new Map<string, string>();
  private readonly verticalIdsByCode = new Map<string, string>();
  private readonly subVerticalIdsByCode = new Map<string, string>();
  private readonly substationIdsByCode = new Map<string, string>();
  private readonly seenKeys = new Set<string>();
  private readonly validationErrors: WorkbookValidationIssue[] = [];
  private rowsImported = 0;
  private rowsUpdated = 0;

  constructor(
    private readonly repository: ImportRepository,
    private readonly tx: Parameters<ImportRepository["createImportJob"]>[0],
    private readonly actorUserId: string,
    private readonly mode: ImportMode
  ) {}

  async process(workbook: ParsedWorkbookDto): Promise<ImportProcessorSummary> {
    await this.processDiscoms(workbook.discoms);
    await this.processZones(workbook.zones);
    await this.processVerticals(workbook.verticals);
    await this.processSubVerticals(workbook.subVerticals);
    await this.processSubstations(workbook.substations);
    await this.processIncomingSources(workbook.incomingSources);
    await this.processTransformers(workbook.transformers);
    await this.processOutgoingFeeders(workbook.outgoingFeeders);
    await this.processLightningArresters(workbook.lightningArresters);
    await this.processBatteryBanks(workbook.batteryBanks);
    await this.processCapacitorBanks(workbook.capacitorBanks);

    return {
      rowsRead: this.countRows(workbook),
      rowsImported: this.rowsImported,
      rowsUpdated: this.rowsUpdated,
      rowsFailed: this.validationErrors.length,
      validationErrors: this.validationErrors,
      executionTimeMs: 0
    };
  }

  private async processDiscoms(rows: ParsedWorkbookDto["discoms"]): Promise<void> {
    for (const row of rows) {
      if (!this.validateRequired(row, "Discoms", [["name", row.data.name], ["code", row.data.code]])) {
        continue;
      }

      if (!this.ensureWorkbookUnique("Discoms", row, `discom:${row.data.code}`, "Duplicate Discom code in workbook")) {
        continue;
      }

      const existing = await this.repository.findDiscomByCode(this.tx, row.data.code);
      const record =
        this.mode === "UPSERT"
          ? await this.repository.upsertDiscom(this.tx, { ...row.data, userId: this.actorUserId })
          : existing ?? (await this.repository.createDiscom(this.tx, { ...row.data, userId: this.actorUserId }));

      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
      this.discomIdsByCode.set(record.code, record.id);
    }
  }

  private async processZones(rows: ParsedWorkbookDto["zones"]): Promise<void> {
    for (const row of rows) {
      if (!this.validateRequired(row, "Zones", [["discomCode", row.data.discomCode], ["name", row.data.name], ["code", row.data.code]])) {
        continue;
      }

      const discomId = await this.resolveDiscom(row.data.discomCode);
      if (!discomId) {
        this.addError("Zones", row.rowNumber, "MISSING_PARENT", `Discom '${row.data.discomCode}' was not found`, "discomCode", row.data.discomCode);
        continue;
      }

      if (!this.ensureWorkbookUnique("Zones", row, `zone:${discomId}:${row.data.code}`, "Duplicate Zone code in workbook")) {
        continue;
      }

      const existing = await this.repository.findZoneByCode(this.tx, discomId, row.data.code);
      const record =
        this.mode === "UPSERT"
          ? await this.repository.upsertZone(this.tx, { discomId, ...row.data, userId: this.actorUserId })
          : existing ?? (await this.repository.createZone(this.tx, { discomId, ...row.data, userId: this.actorUserId }));

      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
      this.zoneIdsByCode.set(row.data.code, record.id);
    }
  }

  private async processVerticals(rows: ParsedWorkbookDto["verticals"]): Promise<void> {
    for (const row of rows) {
      if (!this.validateRequired(row, "Verticals", [["zoneCode", row.data.zoneCode], ["name", row.data.name], ["code", row.data.code]])) {
        continue;
      }

      const zoneId = await this.resolveZone(row.data.zoneCode);
      if (!zoneId) {
        this.addError("Verticals", row.rowNumber, "MISSING_PARENT", `Zone '${row.data.zoneCode}' was not found`, "zoneCode", row.data.zoneCode);
        continue;
      }

      if (!this.ensureWorkbookUnique("Verticals", row, `vertical:${zoneId}:${row.data.code}`, "Duplicate Vertical code in workbook")) {
        continue;
      }

      const existing = await this.repository.findVerticalByCode(this.tx, zoneId, row.data.code);
      const record =
        this.mode === "UPSERT"
          ? await this.repository.upsertVertical(this.tx, { zoneId, ...row.data, userId: this.actorUserId })
          : existing ?? (await this.repository.createVertical(this.tx, { zoneId, ...row.data, userId: this.actorUserId }));

      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
      this.verticalIdsByCode.set(row.data.code, record.id);
    }
  }

  private async processSubVerticals(rows: ParsedWorkbookDto["subVerticals"]): Promise<void> {
    for (const row of rows) {
      if (!this.validateRequired(row, "Sub Verticals", [["verticalCode", row.data.verticalCode], ["name", row.data.name], ["code", row.data.code]])) {
        continue;
      }

      const verticalId = await this.resolveVertical(row.data.verticalCode);
      if (!verticalId) {
        this.addError("Sub Verticals", row.rowNumber, "MISSING_PARENT", `Vertical '${row.data.verticalCode}' was not found`, "verticalCode", row.data.verticalCode);
        continue;
      }

      if (!this.ensureWorkbookUnique("Sub Verticals", row, `subVertical:${verticalId}:${row.data.code}`, "Duplicate SubVertical code in workbook")) {
        continue;
      }

      const existing = await this.repository.findSubVerticalByCode(this.tx, verticalId, row.data.code);
      const record =
        this.mode === "UPSERT"
          ? await this.repository.upsertSubVertical(this.tx, { verticalId, ...row.data, userId: this.actorUserId })
          : existing ?? (await this.repository.createSubVertical(this.tx, { verticalId, ...row.data, userId: this.actorUserId }));

      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
      this.subVerticalIdsByCode.set(row.data.code, record.id);
    }
  }

  private async processSubstations(rows: ParsedWorkbookDto["substations"]): Promise<void> {
    for (const row of rows) {
      if (
        !this.validateRequired(row, "Substations", [
          ["subVerticalCode", row.data.subVerticalCode],
          ["name", row.data.name],
          ["code", row.data.code]
        ]) ||
        !this.validatePositiveNumber("Substations", row, "voltageLevelKv", row.data.voltageLevelKv) ||
        !this.validateCoordinates(row) ||
        !this.validatePastDate("Substations", row, "commissioningDate", row.data.commissioningDate)
      ) {
        continue;
      }

      const subVerticalId = await this.resolveSubVertical(row.data.subVerticalCode);
      if (!subVerticalId) {
        this.addError("Substations", row.rowNumber, "MISSING_PARENT", `SubVertical '${row.data.subVerticalCode}' was not found`, "subVerticalCode", row.data.subVerticalCode);
        continue;
      }

      if (!this.ensureWorkbookUnique("Substations", row, `substation:${subVerticalId}:${row.data.code}`, "Duplicate Substation code in workbook")) {
        continue;
      }

      const existing = await this.repository.findSubstationByCode(this.tx, subVerticalId, row.data.code);
      const record =
        this.mode === "UPSERT"
          ? await this.repository.upsertSubstation(this.tx, { subVerticalId, ...row.data, userId: this.actorUserId })
          : existing ?? (await this.repository.createSubstation(this.tx, { subVerticalId, ...row.data, userId: this.actorUserId }));

      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
      this.substationIdsByCode.set(row.data.code, record.id);
    }
  }

  private async processIncomingSources(rows: ParsedWorkbookDto["incomingSources"]): Promise<void> {
    for (const row of rows) {
      const substationId = await this.resolveSubstation("Incoming Sources", row, row.data.substationCode);
      if (!substationId || !this.validateRequired(row, "Incoming Sources", [["sourceName", row.data.sourceName]]) || !this.validatePositiveNumber("Incoming Sources", row, "voltageLevelKv", row.data.voltageLevelKv)) {
        continue;
      }
      if (!this.ensureWorkbookUnique("Incoming Sources", row, `incoming:${substationId}:${row.data.sourceName}`, "Duplicate Incoming Source name in workbook")) {
        continue;
      }
      const existing = await this.repository.findIncomingSource(this.tx, substationId, row.data.sourceName);
      if (this.mode === "UPSERT") await this.repository.upsertIncomingSource(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      else if (!existing) await this.repository.createIncomingSource(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
    }
  }

  private async processTransformers(rows: ParsedWorkbookDto["transformers"]): Promise<void> {
    for (const row of rows) {
      const substationId = await this.resolveSubstation("Transformers", row, row.data.substationCode);
      if (!substationId || !this.validateRequired(row, "Transformers", [["transformerCode", row.data.transformerCode]]) || !this.validatePositiveNumber("Transformers", row, "capacityMva", row.data.capacityMva) || !this.validatePositiveNumber("Transformers", row, "primaryVoltageKv", row.data.primaryVoltageKv) || !this.validatePositiveNumber("Transformers", row, "secondaryVoltageKv", row.data.secondaryVoltageKv) || !this.validatePastDate("Transformers", row, "commissioningDate", row.data.commissioningDate)) {
        continue;
      }
      if (!this.ensureWorkbookUnique("Transformers", row, `transformer:${substationId}:${row.data.transformerCode}`, "Duplicate Transformer code in workbook")) {
        continue;
      }
      const existing = await this.repository.findTransformer(this.tx, substationId, row.data.transformerCode);
      if (this.mode === "UPSERT") await this.repository.upsertTransformer(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      else if (!existing) await this.repository.createTransformer(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
    }
  }

  private async processOutgoingFeeders(rows: ParsedWorkbookDto["outgoingFeeders"]): Promise<void> {
    for (const row of rows) {
      const substationId = await this.resolveSubstation("Outgoing Feeders", row, row.data.substationCode);
      if (!substationId || !this.validateRequired(row, "Outgoing Feeders", [["feederName", row.data.feederName]]) || !this.validatePositiveNumber("Outgoing Feeders", row, "voltageLevelKv", row.data.voltageLevelKv)) {
        continue;
      }
      if (!this.ensureWorkbookUnique("Outgoing Feeders", row, `outgoing:${substationId}:${row.data.feederName}`, "Duplicate Outgoing Feeder name in workbook")) {
        continue;
      }
      const existing = await this.repository.findOutgoingFeeder(this.tx, substationId, row.data.feederName);
      if (this.mode === "UPSERT") await this.repository.upsertOutgoingFeeder(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      else if (!existing) await this.repository.createOutgoingFeeder(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
    }
  }

  private async processLightningArresters(rows: ParsedWorkbookDto["lightningArresters"]): Promise<void> {
    for (const row of rows) {
      const substationId = await this.resolveSubstation("Lightning Arresters", row, row.data.substationCode);
      if (!substationId || !this.validateRequired(row, "Lightning Arresters", [["arresterCode", row.data.arresterCode]]) || !this.validatePositiveNumber("Lightning Arresters", row, "voltageRatingKv", row.data.voltageRatingKv) || !this.validatePastDate("Lightning Arresters", row, "installationDate", row.data.installationDate)) {
        continue;
      }
      if (!this.ensureWorkbookUnique("Lightning Arresters", row, `arrester:${substationId}:${row.data.arresterCode}`, "Duplicate Lightning Arrester code in workbook")) {
        continue;
      }
      const existing = await this.repository.findLightningArrester(this.tx, substationId, row.data.arresterCode);
      if (this.mode === "UPSERT") await this.repository.upsertLightningArrester(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      else if (!existing) await this.repository.createLightningArrester(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
    }
  }

  private async processBatteryBanks(rows: ParsedWorkbookDto["batteryBanks"]): Promise<void> {
    for (const row of rows) {
      const substationId = await this.resolveSubstation("Battery Banks", row, row.data.substationCode);
      if (!substationId || !this.validateRequired(row, "Battery Banks", [["batteryBankCode", row.data.batteryBankCode]]) || !this.validatePositiveNumber("Battery Banks", row, "voltageV", row.data.voltageV) || !this.validatePositiveNumber("Battery Banks", row, "capacityAh", row.data.capacityAh) || !this.validatePastDate("Battery Banks", row, "installationDate", row.data.installationDate)) {
        continue;
      }
      if (!this.ensureWorkbookUnique("Battery Banks", row, `battery:${substationId}:${row.data.batteryBankCode}`, "Duplicate Battery Bank code in workbook")) {
        continue;
      }
      const existing = await this.repository.findBatteryBank(this.tx, substationId, row.data.batteryBankCode);
      if (this.mode === "UPSERT") await this.repository.upsertBatteryBank(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      else if (!existing) await this.repository.createBatteryBank(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
    }
  }

  private async processCapacitorBanks(rows: ParsedWorkbookDto["capacitorBanks"]): Promise<void> {
    for (const row of rows) {
      const substationId = await this.resolveSubstation("Capacitor Banks", row, row.data.substationCode);
      if (!substationId || !this.validateRequired(row, "Capacitor Banks", [["capacitorBankCode", row.data.capacitorBankCode]]) || !this.validatePositiveNumber("Capacitor Banks", row, "capacityMvar", row.data.capacityMvar) || !this.validatePositiveNumber("Capacitor Banks", row, "voltageLevelKv", row.data.voltageLevelKv) || !this.validatePastDate("Capacitor Banks", row, "installationDate", row.data.installationDate)) {
        continue;
      }
      if (!this.ensureWorkbookUnique("Capacitor Banks", row, `capacitor:${substationId}:${row.data.capacitorBankCode}`, "Duplicate Capacitor Bank code in workbook")) {
        continue;
      }
      const existing = await this.repository.findCapacitorBank(this.tx, substationId, row.data.capacitorBankCode);
      if (this.mode === "UPSERT") await this.repository.upsertCapacitorBank(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      else if (!existing) await this.repository.createCapacitorBank(this.tx, { substationId, ...row.data, userId: this.actorUserId });
      this.trackWrite(existing !== null, Boolean(!existing || this.mode === "UPSERT"));
    }
  }

  private async resolveDiscom(code: string): Promise<string | undefined> {
    const cached = this.discomIdsByCode.get(code);
    if (cached) return cached;

    const existing = await this.repository.findDiscomByCode(this.tx, code);
    if (existing) {
      this.discomIdsByCode.set(code, existing.id);
      return existing.id;
    }

    return undefined;
  }

  private async resolveZone(code: string): Promise<string | undefined> {
    const cached = this.zoneIdsByCode.get(code);
    if (cached) return cached;

    const existing = await this.repository.findAnyZoneByCode(this.tx, code);
    if (existing) {
      this.zoneIdsByCode.set(code, existing.id);
      return existing.id;
    }

    return undefined;
  }

  private async resolveVertical(code: string): Promise<string | undefined> {
    const cached = this.verticalIdsByCode.get(code);
    if (cached) return cached;

    const existing = await this.repository.findAnyVerticalByCode(this.tx, code);
    if (existing) {
      this.verticalIdsByCode.set(code, existing.id);
      return existing.id;
    }

    return undefined;
  }

  private async resolveSubVertical(code: string): Promise<string | undefined> {
    const cached = this.subVerticalIdsByCode.get(code);
    if (cached) return cached;

    const existing = await this.repository.findAnySubVerticalByCode(this.tx, code);
    if (existing) {
      this.subVerticalIdsByCode.set(code, existing.id);
      return existing.id;
    }

    return undefined;
  }

  private async resolveSubstation(
    sheetName: string,
    row: ImportRowDto<{ substationCode: string }>,
    substationCode: string
  ): Promise<string | undefined> {
    let substationId = this.substationIdsByCode.get(substationCode);

    if (!substationId) {
      const existing = await this.repository.findAnySubstationByCode(this.tx, substationCode);
      if (existing) {
        substationId = existing.id;
        this.substationIdsByCode.set(substationCode, existing.id);
      }
    }

    if (!substationId) {
      this.addError(sheetName, row.rowNumber, "MISSING_PARENT", `Substation '${substationCode}' was not found`, "substationCode", substationCode);
    }

    return substationId;
  }

  private validateRequired(row: ImportRowDto<unknown>, sheetName: string, fields: Array<[string, string | undefined]>): boolean {
    const missing = fields.find(([, value]) => !value);

    if (!missing) {
      return true;
    }

    this.addError(sheetName, row.rowNumber, "REQUIRED_FIELD_MISSING", `${missing[0]} is required`, missing[0]);
    return false;
  }

  private validatePositiveNumber(sheetName: string, row: ImportRowDto<unknown>, fieldName: string, value: number): boolean {
    if (Number.isFinite(value) && value > 0) {
      return true;
    }

    this.addError(sheetName, row.rowNumber, "INVALID_NUMBER", `${fieldName} must be a positive number`, fieldName, String(value));
    return false;
  }

  private validateCoordinates(row: ParsedWorkbookDto["substations"][number]): boolean {
    const { latitude, longitude } = row.data;

    if (latitude !== undefined && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
      this.addError("Substations", row.rowNumber, "INVALID_COORDINATES", "Latitude must be between -90 and 90", "latitude", String(latitude));
      return false;
    }

    if (longitude !== undefined && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
      this.addError("Substations", row.rowNumber, "INVALID_COORDINATES", "Longitude must be between -180 and 180", "longitude", String(longitude));
      return false;
    }

    return true;
  }

  private validatePastDate(sheetName: string, row: ImportRowDto<unknown>, fieldName: string, value: Date | undefined): boolean {
    if (!value || value <= new Date()) {
      return true;
    }

    this.addError(sheetName, row.rowNumber, "FUTURE_DATE", `${fieldName} cannot be in the future`, fieldName, value.toISOString());
    return false;
  }

  private ensureWorkbookUnique(sheetName: string, row: ImportRowDto<unknown>, key: string, message: string): boolean {
    if (this.seenKeys.has(key)) {
      this.addError(sheetName, row.rowNumber, "DUPLICATE_IN_WORKBOOK", message);
      return false;
    }

    this.seenKeys.add(key);
    return true;
  }

  private trackWrite(existing: boolean, wrote: boolean): void {
    if (!wrote) {
      return;
    }

    if (existing && this.mode === "UPSERT") {
      this.rowsUpdated += 1;
      return;
    }

    if (!existing) {
      this.rowsImported += 1;
    }
  }

  private addError(
    sheetName: string,
    rowNumber: number,
    errorCode: string,
    errorMessage: string,
    fieldName?: string,
    rawValue?: string
  ): void {
    this.validationErrors.push({
      sheetName,
      rowNumber,
      fieldName,
      rawValue,
      errorCode,
      errorMessage
    });
  }

  private countRows(workbook: ParsedWorkbookDto): number {
    return Object.values(workbook).reduce((total, rows) => total + rows.length, 0);
  }
}

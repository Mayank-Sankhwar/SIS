import type { AreaType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface ReportAccess {
  userId: string;
  role: string;
}

export interface ReportFilters {
  discomId?: string;
  zoneId?: string;
  verticalId?: string;
  subVerticalId?: string;
  substationId?: string;
  voltageLevelKv?: number;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReportTable {
  sheetName: string;
  headers: string[];
  rows: Record<string, string | number | boolean | Date | null>[];
}

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface EquipmentCounts {
  incomingSources: number;
  outgoingFeeders: number;
  transformers: number;
  lightningArresters: number;
  batteryBanks: number;
  capacitorBanks: number;
}

type EquipmentCountKey = keyof EquipmentCounts;

interface HierarchySubVertical {
  id: string;
  name: string;
  code: string;
  vertical: {
    id: string;
    name: string;
    code: string;
    zone: {
      id: string;
      name: string;
      code: string;
      discom: { id: string; name: string; code: string };
    };
  };
}

interface SummarySubstation {
  id: string;
  subVertical: HierarchySubVertical;
}

interface AuditableRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: { name: string; email: string } | null;
  updatedBy: { name: string; email: string } | null;
  deletedBy: { name: string; email: string } | null;
}

const notDeleted = { deletedAt: null };

const substationReportHeaders = [
  "discomName",
  "discomCode",
  "zoneName",
  "zoneCode",
  "verticalName",
  "verticalCode",
  "subVerticalName",
  "subVerticalCode",
  "substationId",
  "substationName",
  "substationCode",
  "voltageLevelKv",
  "address",
  "latitude",
  "longitude",
  "commissioningDate",
  "isActive",
  "incomingSources",
  "outgoingFeeders",
  "transformers",
  "lightningArresters",
  "batteryBanks",
  "capacitorBanks"
];

const transformerReportHeaders = [
  "discomName",
  "discomCode",
  "zoneName",
  "zoneCode",
  "verticalName",
  "verticalCode",
  "subVerticalName",
  "subVerticalCode",
  "substationId",
  "substationName",
  "substationCode",
  "transformerId",
  "transformerCode",
  "capacityMva",
  "primaryVoltageKv",
  "secondaryVoltageKv",
  "make",
  "serialNumber",
  "commissioningDate",
  "isActive"
];

const feederReportHeaders = [
  "discomName",
  "discomCode",
  "zoneName",
  "zoneCode",
  "verticalName",
  "verticalCode",
  "subVerticalName",
  "subVerticalCode",
  "substationId",
  "substationName",
  "substationCode",
  "feederId",
  "feederName",
  "feederCode",
  "voltageLevelKv",
  "feederType",
  "connectedLoadMw",
  "isActive"
];

const equipmentSummaryReportHeaders = [
  "groupLevel",
  "discomName",
  "discomCode",
  "zoneName",
  "zoneCode",
  "verticalName",
  "verticalCode",
  "subVerticalName",
  "subVerticalCode",
  "incomingSources",
  "outgoingFeeders",
  "transformers",
  "lightningArresters",
  "batteryBanks",
  "capacitorBanks"
];

const importHistoryReportHeaders = [
  "importJobId",
  "uploadedFile",
  "importStatus",
  "rowsProcessed",
  "rowsImported",
  "rowsFailed",
  "executionTimeMs",
  "uploadedBy",
  "uploadedByEmail",
  "date"
];

const importErrorReportHeaders = [
  "importJobId",
  "workbook",
  "sheet",
  "row",
  "column",
  "errorCode",
  "errorMessage",
  "timestamp"
];

const auditLogReportHeaders = ["user", "action", "entity", "entityId", "timestamp"];

export class ReportRepository {
  async getSubstationReport(access: ReportAccess, filters: ReportFilters): Promise<ReportTable> {
    const substationWhere = await this.buildSubstationWhere(access, filters);

    const [
      substations,
      incomingSources,
      outgoingFeeders,
      transformers,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    ] = await Promise.all([
      prisma.substation.findMany({
        where: substationWhere,
        select: {
          id: true,
          name: true,
          code: true,
          voltageLevelKv: true,
          address: true,
          latitude: true,
          longitude: true,
          commissioningDate: true,
          isActive: true,
          subVertical: { select: this.hierarchySelect() }
        },
        orderBy: { name: "asc" }
      }),
      prisma.incomingSource.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.outgoingFeeder.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.transformer.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.lightningArrester.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.batteryBank.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.capacitorBank.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } })
    ]);

    const countsBySubstation = this.initializeEquipmentCounts(substations.map((substation) => substation.id));
    this.addSubstationCounts(countsBySubstation, incomingSources, "incomingSources");
    this.addSubstationCounts(countsBySubstation, outgoingFeeders, "outgoingFeeders");
    this.addSubstationCounts(countsBySubstation, transformers, "transformers");
    this.addSubstationCounts(countsBySubstation, lightningArresters, "lightningArresters");
    this.addSubstationCounts(countsBySubstation, batteryBanks, "batteryBanks");
    this.addSubstationCounts(countsBySubstation, capacitorBanks, "capacitorBanks");

    return {
      sheetName: "Substations",
      headers: substationReportHeaders,
      rows: substations.map((substation) => ({
        discomName: substation.subVertical.vertical.zone.discom.name,
        discomCode: substation.subVertical.vertical.zone.discom.code,
        zoneName: substation.subVertical.vertical.zone.name,
        zoneCode: substation.subVertical.vertical.zone.code,
        verticalName: substation.subVertical.vertical.name,
        verticalCode: substation.subVertical.vertical.code,
        subVerticalName: substation.subVertical.name,
        subVerticalCode: substation.subVertical.code,
        substationId: substation.id,
        substationName: substation.name,
        substationCode: substation.code,
        voltageLevelKv: this.decimalToNumber(substation.voltageLevelKv),
        address: substation.address,
        latitude: this.decimalToNumber(substation.latitude),
        longitude: this.decimalToNumber(substation.longitude),
        commissioningDate: substation.commissioningDate,
        isActive: substation.isActive,
        ...countsBySubstation.get(substation.id)
      }))
    };
  }

  async getTransformerReport(access: ReportAccess, filters: ReportFilters): Promise<ReportTable> {
    const transformerWhere = await this.buildEquipmentWhere<Prisma.TransformerWhereInput>(access, filters, "primaryVoltageKv");

    const transformers = await prisma.transformer.findMany({
      where: transformerWhere,
      select: {
        id: true,
        transformerCode: true,
        capacityMva: true,
        primaryVoltageKv: true,
        secondaryVoltageKv: true,
        make: true,
        serialNumber: true,
        commissioningDate: true,
        isActive: true,
        substation: { select: this.substationHierarchySelect() }
      },
      orderBy: { transformerCode: "asc" }
    });

    return {
      sheetName: "Transformers",
      headers: transformerReportHeaders,
      rows: transformers.map((transformer) => ({
        ...this.flattenHierarchy(transformer.substation),
        transformerId: transformer.id,
        transformerCode: transformer.transformerCode,
        capacityMva: this.decimalToNumber(transformer.capacityMva),
        primaryVoltageKv: this.decimalToNumber(transformer.primaryVoltageKv),
        secondaryVoltageKv: this.decimalToNumber(transformer.secondaryVoltageKv),
        make: transformer.make,
        serialNumber: transformer.serialNumber,
        commissioningDate: transformer.commissioningDate,
        isActive: transformer.isActive
      }))
    };
  }

  async getFeederReport(access: ReportAccess, filters: ReportFilters): Promise<ReportTable> {
    const feederWhere = await this.buildEquipmentWhere<Prisma.OutgoingFeederWhereInput>(access, filters, "voltageLevelKv");

    const feeders = await prisma.outgoingFeeder.findMany({
      where: feederWhere,
      select: {
        id: true,
        feederName: true,
        feederCode: true,
        voltageLevelKv: true,
        feederType: true,
        connectedLoadMw: true,
        isActive: true,
        substation: { select: this.substationHierarchySelect() }
      },
      orderBy: { feederName: "asc" }
    });

    return {
      sheetName: "Feeders",
      headers: feederReportHeaders,
      rows: feeders.map((feeder) => ({
        ...this.flattenHierarchy(feeder.substation),
        feederId: feeder.id,
        feederName: feeder.feederName,
        feederCode: feeder.feederCode,
        voltageLevelKv: this.decimalToNumber(feeder.voltageLevelKv),
        feederType: feeder.feederType,
        connectedLoadMw: this.decimalToNumber(feeder.connectedLoadMw),
        isActive: feeder.isActive
      }))
    };
  }

  async getEquipmentSummaryReport(access: ReportAccess, filters: ReportFilters): Promise<ReportTable> {
    const substationWhere = await this.buildSubstationWhere(access, filters);
    const [
      substations,
      incomingSources,
      outgoingFeeders,
      transformers,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    ] = await Promise.all([
      prisma.substation.findMany({
        where: substationWhere,
        select: this.substationHierarchySelect()
      }),
      prisma.incomingSource.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.outgoingFeeder.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.transformer.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.lightningArrester.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.batteryBank.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } }),
      prisma.capacitorBank.groupBy({ by: ["substationId"], where: { deletedAt: null, substation: substationWhere }, _count: { _all: true } })
    ]);

    const rollups = this.initializeSummaryRollups(substations);
    this.addSummaryCounts(rollups, substations, incomingSources, "incomingSources");
    this.addSummaryCounts(rollups, substations, outgoingFeeders, "outgoingFeeders");
    this.addSummaryCounts(rollups, substations, transformers, "transformers");
    this.addSummaryCounts(rollups, substations, lightningArresters, "lightningArresters");
    this.addSummaryCounts(rollups, substations, batteryBanks, "batteryBanks");
    this.addSummaryCounts(rollups, substations, capacitorBanks, "capacitorBanks");

    return {
      sheetName: "Equipment Summary",
      headers: equipmentSummaryReportHeaders,
      rows: Array.from(rollups.values()).map((item) => ({ ...item.hierarchy, ...item.counts }))
    };
  }

  async getImportHistoryReport(access: ReportAccess, filters: ReportFilters): Promise<ReportTable> {
    const importJobs = await prisma.importJob.findMany({
      where: this.importJobWhere(access, filters),
      select: {
        id: true,
        status: true,
        totalRows: true,
        successRows: true,
        failedRows: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        uploadedFile: { select: { originalFileName: true } },
        createdBy: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      sheetName: "Import History",
      headers: importHistoryReportHeaders,
      rows: importJobs.map((job) => ({
        importJobId: job.id,
        uploadedFile: job.uploadedFile.originalFileName,
        importStatus: job.status,
        rowsProcessed: job.totalRows,
        rowsImported: job.successRows,
        rowsFailed: job.failedRows,
        executionTimeMs: job.startedAt && job.completedAt ? job.completedAt.getTime() - job.startedAt.getTime() : null,
        uploadedBy: job.createdBy.name,
        uploadedByEmail: job.createdBy.email,
        date: job.createdAt
      }))
    };
  }

  async getImportErrorReport(access: ReportAccess, filters: ReportFilters): Promise<ReportTable> {
    const errors = await prisma.importError.findMany({
      where: {
        importJob: this.importJobWhere(access, filters)
      },
      select: {
        sheetName: true,
        rowNumber: true,
        columnName: true,
        errorCode: true,
        errorMessage: true,
        createdAt: true,
        importJob: {
          select: {
            id: true,
            uploadedFile: { select: { originalFileName: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      sheetName: "Import Errors",
      headers: importErrorReportHeaders,
      rows: errors.map((error) => ({
        importJobId: error.importJob.id,
        workbook: error.importJob.uploadedFile.originalFileName,
        sheet: error.sheetName,
        row: error.rowNumber,
        column: error.columnName,
        errorCode: error.errorCode,
        errorMessage: error.errorMessage,
        timestamp: error.createdAt
      }))
    };
  }

  async getAuditLogReport(access: ReportAccess, filters: ReportFilters): Promise<ReportTable> {
    const [
      substations,
      incomingSources,
      outgoingFeeders,
      transformers,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    ] = await Promise.all([
      prisma.substation.findMany({
        where: {
          AND: [
            await this.accessSubstationFilter(access),
            this.substationFilter(filters),
            this.auditWindowFilter(filters)
          ]
        },
        select: this.auditSelect()
      }),
      prisma.incomingSource.findMany({
        where: await this.buildAuditEquipmentWhere<Prisma.IncomingSourceWhereInput>(access, filters),
        select: this.auditSelect()
      }),
      prisma.outgoingFeeder.findMany({
        where: await this.buildAuditEquipmentWhere<Prisma.OutgoingFeederWhereInput>(access, filters),
        select: this.auditSelect()
      }),
      prisma.transformer.findMany({
        where: await this.buildAuditEquipmentWhere<Prisma.TransformerWhereInput>(access, filters),
        select: this.auditSelect()
      }),
      prisma.lightningArrester.findMany({
        where: await this.buildAuditEquipmentWhere<Prisma.LightningArresterWhereInput>(access, filters),
        select: this.auditSelect()
      }),
      prisma.batteryBank.findMany({
        where: await this.buildAuditEquipmentWhere<Prisma.BatteryBankWhereInput>(access, filters),
        select: this.auditSelect()
      }),
      prisma.capacitorBank.findMany({
        where: await this.buildAuditEquipmentWhere<Prisma.CapacitorBankWhereInput>(access, filters),
        select: this.auditSelect()
      })
    ]);

    const rows = [
      ...this.toAuditRows("Substation", substations, filters),
      ...this.toAuditRows("IncomingSource", incomingSources, filters),
      ...this.toAuditRows("OutgoingFeeder", outgoingFeeders, filters),
      ...this.toAuditRows("Transformer", transformers, filters),
      ...this.toAuditRows("LightningArrester", lightningArresters, filters),
      ...this.toAuditRows("BatteryBank", batteryBanks, filters),
      ...this.toAuditRows("CapacitorBank", capacitorBanks, filters)
    ].sort((left, right) => {
      const leftTimestamp = left.timestamp instanceof Date ? left.timestamp.getTime() : 0;
      const rightTimestamp = right.timestamp instanceof Date ? right.timestamp.getTime() : 0;
      return rightTimestamp - leftTimestamp;
    });

    return {
      sheetName: "Audit Log",
      headers: auditLogReportHeaders,
      rows
    };
  }

  private async buildSubstationWhere(access: ReportAccess, filters: ReportFilters): Promise<Prisma.SubstationWhereInput> {
    return {
      AND: [
        notDeleted,
        await this.accessSubstationFilter(access),
        this.substationFilter(filters),
        this.createdAtFilter(filters),
        filters.voltageLevelKv !== undefined ? { voltageLevelKv: filters.voltageLevelKv } : {},
        filters.isActive !== undefined ? { isActive: filters.isActive } : {}
      ]
    };
  }

  private importJobWhere(access: ReportAccess, filters: ReportFilters): Prisma.ImportJobWhereInput {
    const createdAt: Prisma.DateTimeFilter = {};

    if (filters.dateFrom) createdAt.gte = filters.dateFrom;
    if (filters.dateTo) createdAt.lte = filters.dateTo;

    return {
      ...(access.role === "ADMIN" ? {} : { createdById: access.userId }),
      ...(filters.dateFrom || filters.dateTo ? { createdAt } : {})
    };
  }

  private async buildEquipmentWhere<T>(access: ReportAccess, filters: ReportFilters, voltageField: string): Promise<T> {
    return {
      AND: [
        notDeleted,
        await this.accessEquipmentFilter<T>(access),
        this.equipmentFilter<T>(filters),
        this.createdAtFilter(filters),
        filters.voltageLevelKv !== undefined ? { [voltageField]: filters.voltageLevelKv } : {},
        filters.isActive !== undefined ? { isActive: filters.isActive } : {}
      ]
    } as T;
  }

  private async buildAuditEquipmentWhere<T>(access: ReportAccess, filters: ReportFilters): Promise<T> {
    return {
      AND: [
        await this.accessEquipmentFilter<T>(access),
        this.equipmentFilter<T>(filters),
        this.auditWindowFilter(filters)
      ]
    } as T;
  }

  private async accessSubstationFilter(access: ReportAccess): Promise<Prisma.SubstationWhereInput> {
    if (access.role === "ADMIN") return {};

    const assignments = await this.findAssignments(access.userId);
    return this.orNoAccess(this.toSubstationScopes(assignments));
  }

  private async accessEquipmentFilter<T>(access: ReportAccess): Promise<T> {
    if (access.role === "ADMIN") return {} as T;

    const assignments = await this.findAssignments(access.userId);
    return this.orNoAccess(this.toEquipmentScopes<T>(assignments)) as T;
  }

  private findAssignments(userId: string): Promise<UserAreaAssignment[]> {
    return prisma.userAreaMapping.findMany({
      where: { userId, isActive: true, deletedAt: null },
      select: {
        areaType: true,
        discomId: true,
        zoneId: true,
        verticalId: true,
        subVerticalId: true,
        substationId: true
      }
    });
  }

  private substationFilter(filters: ReportFilters): Prisma.SubstationWhereInput {
    return {
      ...(filters.discomId ? { subVertical: { vertical: { zone: { discomId: filters.discomId } } } } : {}),
      ...(filters.zoneId ? { subVertical: { vertical: { zoneId: filters.zoneId } } } : {}),
      ...(filters.verticalId ? { subVertical: { verticalId: filters.verticalId } } : {}),
      ...(filters.subVerticalId ? { subVerticalId: filters.subVerticalId } : {}),
      ...(filters.substationId ? { id: filters.substationId } : {})
    };
  }

  private equipmentFilter<T>(filters: ReportFilters): T {
    return {
      ...(filters.discomId ? { substation: { subVertical: { vertical: { zone: { discomId: filters.discomId } } } } } : {}),
      ...(filters.zoneId ? { substation: { subVertical: { vertical: { zoneId: filters.zoneId } } } } : {}),
      ...(filters.verticalId ? { substation: { subVertical: { verticalId: filters.verticalId } } } : {}),
      ...(filters.subVerticalId ? { substation: { subVerticalId: filters.subVerticalId } } : {}),
      ...(filters.substationId ? { substationId: filters.substationId } : {})
    } as T;
  }

  private createdAtFilter(filters: ReportFilters): Prisma.SubstationWhereInput {
    const createdAt: Prisma.DateTimeFilter = {};

    if (filters.dateFrom) createdAt.gte = filters.dateFrom;
    if (filters.dateTo) createdAt.lte = filters.dateTo;

    return filters.dateFrom || filters.dateTo ? { createdAt } : {};
  }

  private auditWindowFilter(filters: ReportFilters): Prisma.SubstationWhereInput {
    const timestampFilter: Prisma.DateTimeFilter = {};

    if (filters.dateFrom) timestampFilter.gte = filters.dateFrom;
    if (filters.dateTo) timestampFilter.lte = filters.dateTo;

    return filters.dateFrom || filters.dateTo
      ? { OR: [{ createdAt: timestampFilter }, { updatedAt: timestampFilter }, { deletedAt: timestampFilter }] }
      : {};
  }

  private auditSelect() {
    return {
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      createdBy: { select: { name: true, email: true } },
      updatedBy: { select: { name: true, email: true } },
      deletedBy: { select: { name: true, email: true } }
    };
  }

  private toAuditRows(entity: string, records: AuditableRecord[], filters: ReportFilters): ReportTable["rows"] {
    return records.flatMap((record) => {
      const rows: ReportTable["rows"] = [];

      if (this.isInDateRange(record.createdAt, filters)) {
        rows.push({
          user: this.auditUser(record.createdBy),
          action: "CREATE",
          entity,
          entityId: record.id,
          timestamp: record.createdAt
        });
      }

      if (record.updatedBy && record.updatedAt.getTime() !== record.createdAt.getTime() && this.isInDateRange(record.updatedAt, filters)) {
        rows.push({
          user: this.auditUser(record.updatedBy),
          action: "UPDATE",
          entity,
          entityId: record.id,
          timestamp: record.updatedAt
        });
      }

      if (record.deletedAt && this.isInDateRange(record.deletedAt, filters)) {
        rows.push({
          user: this.auditUser(record.deletedBy),
          action: "DELETE",
          entity,
          entityId: record.id,
          timestamp: record.deletedAt
        });
      }

      return rows;
    });
  }

  private auditUser(user: { name: string; email: string } | null): string {
    return user ? `${user.name} <${user.email}>` : "System";
  }

  private isInDateRange(value: Date, filters: ReportFilters): boolean {
    if (filters.dateFrom && value < filters.dateFrom) return false;
    if (filters.dateTo && value > filters.dateTo) return false;
    return true;
  }

  private toSubstationScopes(assignments: UserAreaAssignment[]): Prisma.SubstationWhereInput[] {
    const filters: Prisma.SubstationWhereInput[] = [];

    for (const assignment of assignments) {
      if (assignment.areaType === "DISCOM" && assignment.discomId) filters.push({ subVertical: { vertical: { zone: { discomId: assignment.discomId } } } });
      if (assignment.areaType === "ZONE" && assignment.zoneId) filters.push({ subVertical: { vertical: { zoneId: assignment.zoneId } } });
      if (assignment.areaType === "VERTICAL" && assignment.verticalId) filters.push({ subVertical: { verticalId: assignment.verticalId } });
      if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) filters.push({ subVerticalId: assignment.subVerticalId });
      if (assignment.areaType === "SUBSTATION" && assignment.substationId) filters.push({ id: assignment.substationId });
    }

    return filters;
  }

  private toEquipmentScopes<T>(assignments: UserAreaAssignment[]): T[] {
    return assignments.flatMap((assignment) => {
      if (assignment.areaType === "DISCOM" && assignment.discomId) return [{ substation: { subVertical: { vertical: { zone: { discomId: assignment.discomId } } } } } as T];
      if (assignment.areaType === "ZONE" && assignment.zoneId) return [{ substation: { subVertical: { vertical: { zoneId: assignment.zoneId } } } } as T];
      if (assignment.areaType === "VERTICAL" && assignment.verticalId) return [{ substation: { subVertical: { verticalId: assignment.verticalId } } } as T];
      if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) return [{ substation: { subVerticalId: assignment.subVerticalId } } as T];
      if (assignment.areaType === "SUBSTATION" && assignment.substationId) return [{ substationId: assignment.substationId } as T];
      return [];
    });
  }

  private orNoAccess<T>(filters: T[]): { OR: T[] } | { id: string } {
    return filters.length > 0 ? { OR: filters } : { id: "__no_assigned_area__" };
  }

  private hierarchySelect() {
    return {
      id: true,
      name: true,
      code: true,
      vertical: {
        select: {
          id: true,
          name: true,
          code: true,
          zone: {
            select: {
              id: true,
              name: true,
              code: true,
              discom: { select: { id: true, name: true, code: true } }
            }
          }
        }
      }
    } satisfies Prisma.SubVerticalSelect;
  }

  private substationHierarchySelect() {
    return {
      id: true,
      name: true,
      code: true,
      subVertical: { select: this.hierarchySelect() }
    } satisfies Prisma.SubstationSelect;
  }

  private flattenHierarchy(substation: {
    id: string;
    name: string;
    code: string;
    subVertical: {
      id: string;
      name: string;
      code: string;
      vertical: {
        id: string;
        name: string;
        code: string;
        zone: {
          id: string;
          name: string;
          code: string;
          discom: { id: string; name: string; code: string };
        };
      };
    };
  }) {
    return {
      discomName: substation.subVertical.vertical.zone.discom.name,
      discomCode: substation.subVertical.vertical.zone.discom.code,
      zoneName: substation.subVertical.vertical.zone.name,
      zoneCode: substation.subVertical.vertical.zone.code,
      verticalName: substation.subVertical.vertical.name,
      verticalCode: substation.subVertical.vertical.code,
      subVerticalName: substation.subVertical.name,
      subVerticalCode: substation.subVertical.code,
      substationId: substation.id,
      substationName: substation.name,
      substationCode: substation.code
    };
  }

  private initializeEquipmentCounts(substationIds: string[]): Map<string, EquipmentCounts> {
    return new Map(substationIds.map((id) => [id, this.emptyEquipmentCounts()]));
  }

  private emptyEquipmentCounts(): EquipmentCounts {
    return {
      incomingSources: 0,
      outgoingFeeders: 0,
      transformers: 0,
      lightningArresters: 0,
      batteryBanks: 0,
      capacitorBanks: 0
    };
  }

  private addSubstationCounts(
    countsBySubstation: Map<string, EquipmentCounts>,
    groups: Array<{ substationId: string; _count: { _all: number } }>,
    key: EquipmentCountKey
  ) {
    for (const group of groups) {
      const counts = countsBySubstation.get(group.substationId);
      if (counts) counts[key] += group._count._all;
    }
  }

  private initializeSummaryRollups(substations: SummarySubstation[]) {
    const rollups = new Map<string, { hierarchy: Record<string, string>; counts: EquipmentCounts }>();

    for (const substation of substations) {
      const discom = substation.subVertical.vertical.zone.discom;
      const zone = substation.subVertical.vertical.zone;
      const vertical = substation.subVertical.vertical;
      const subVertical = substation.subVertical;

      this.setSummaryRollup(rollups, `DISCOM:${discom.id}`, "DISCOM", { discomName: discom.name, discomCode: discom.code });
      this.setSummaryRollup(rollups, `ZONE:${zone.id}`, "ZONE", { discomName: discom.name, discomCode: discom.code, zoneName: zone.name, zoneCode: zone.code });
      this.setSummaryRollup(rollups, `VERTICAL:${vertical.id}`, "VERTICAL", { discomName: discom.name, discomCode: discom.code, zoneName: zone.name, zoneCode: zone.code, verticalName: vertical.name, verticalCode: vertical.code });
      this.setSummaryRollup(rollups, `SUB_VERTICAL:${subVertical.id}`, "SUB_VERTICAL", {
        discomName: discom.name,
        discomCode: discom.code,
        zoneName: zone.name,
        zoneCode: zone.code,
        verticalName: vertical.name,
        verticalCode: vertical.code,
        subVerticalName: subVertical.name,
        subVerticalCode: subVertical.code
      });
    }

    return rollups;
  }

  private setSummaryRollup(
    rollups: Map<string, { hierarchy: Record<string, string>; counts: EquipmentCounts }>,
    key: string,
    level: string,
    hierarchy: Record<string, string>
  ) {
    if (!rollups.has(key)) {
      rollups.set(key, {
        hierarchy: { groupLevel: level, ...hierarchy },
        counts: this.emptyEquipmentCounts()
      });
    }
  }

  private addSummaryCounts(
    rollups: Map<string, { hierarchy: Record<string, string>; counts: EquipmentCounts }>,
    substations: SummarySubstation[],
    groups: Array<{ substationId: string; _count: { _all: number } }>,
    key: EquipmentCountKey
  ) {
    const substationById = new Map(substations.map((substation) => [substation.id, substation]));

    for (const group of groups) {
      const substation = substationById.get(group.substationId);
      if (!substation) continue;

      const ids = [
        `DISCOM:${substation.subVertical.vertical.zone.discom.id}`,
        `ZONE:${substation.subVertical.vertical.zone.id}`,
        `VERTICAL:${substation.subVertical.vertical.id}`,
        `SUB_VERTICAL:${substation.subVertical.id}`
      ];

      for (const id of ids) {
        const rollup = rollups.get(id);
        if (rollup) rollup.counts[key] += group._count._all;
      }
    }
  }

  private decimalToNumber(value: Prisma.Decimal | null | undefined): number {
    return value ? Number(value) : 0;
  }
}

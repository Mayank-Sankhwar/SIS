import type { AreaType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

interface DashboardAccess {
  userId: string;
  role: string;
}

interface DashboardFilters {
  discomId?: string;
  zoneId?: string;
  verticalId?: string;
  subVerticalId?: string;
  substationId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ScopedWheres {
  discom: Prisma.DiscomWhereInput;
  zone: Prisma.ZoneWhereInput;
  vertical: Prisma.VerticalWhereInput;
  subVertical: Prisma.SubVerticalWhereInput;
  substation: Prisma.SubstationWhereInput;
  incomingSource: Prisma.IncomingSourceWhereInput;
  outgoingFeeder: Prisma.OutgoingFeederWhereInput;
  transformer: Prisma.TransformerWhereInput;
  lightningArrester: Prisma.LightningArresterWhereInput;
  batteryBank: Prisma.BatteryBankWhereInput;
  capacitorBank: Prisma.CapacitorBankWhereInput;
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

type HierarchyLevel = "discom" | "zone" | "vertical" | "subVertical";

const notDeleted = { deletedAt: null };

export class DashboardRepository {
  async getSummary(access: DashboardAccess) {
    const where = await this.buildScopedWheres(access);

    const [
      totalDiscoms,
      totalZones,
      totalVerticals,
      totalSubVerticals,
      totalSubstations,
      totalIncomingSources,
      totalOutgoingFeeders,
      totalTransformers,
      totalLightningArresters,
      totalBatteryBanks,
      totalCapacitorBanks,
      activeSubstations,
      inactiveSubstations,
      activeEquipmentCounts,
      inactiveEquipmentCounts
    ] = await Promise.all([
      prisma.discom.count({ where: where.discom }),
      prisma.zone.count({ where: where.zone }),
      prisma.vertical.count({ where: where.vertical }),
      prisma.subVertical.count({ where: where.subVertical }),
      prisma.substation.count({ where: where.substation }),
      prisma.incomingSource.count({ where: where.incomingSource }),
      prisma.outgoingFeeder.count({ where: where.outgoingFeeder }),
      prisma.transformer.count({ where: where.transformer }),
      prisma.lightningArrester.count({ where: where.lightningArrester }),
      prisma.batteryBank.count({ where: where.batteryBank }),
      prisma.capacitorBank.count({ where: where.capacitorBank }),
      prisma.substation.count({ where: { AND: [where.substation, { isActive: true }] } }),
      prisma.substation.count({ where: { AND: [where.substation, { isActive: false }] } }),
      this.countEquipmentByActiveState(where, true),
      this.countEquipmentByActiveState(where, false)
    ]);

    return {
      totalDiscoms,
      totalZones,
      totalVerticals,
      totalSubVerticals,
      totalSubstations,
      totalIncomingSources,
      totalOutgoingFeeders,
      totalTransformers,
      totalLightningArresters,
      totalBatteryBanks,
      totalCapacitorBanks,
      activeSubstations,
      inactiveSubstations,
      activeEquipment: activeEquipmentCounts,
      inactiveEquipment: inactiveEquipmentCounts
    };
  }

  async getEquipmentSummary(access: DashboardAccess) {
    const where = await this.buildScopedWheres(access);

    const [
      transformerCapacity,
      largestTransformer,
      smallestTransformer,
      batteryCapacity,
      capacitorCapacity,
      outgoingFeedersLoad,
      incomingSourcesByType,
      lightningArrestersByVoltage
    ] = await Promise.all([
      prisma.transformer.aggregate({
        where: where.transformer,
        _sum: { capacityMva: true },
        _avg: { capacityMva: true }
      }),
      prisma.transformer.findFirst({
        where: where.transformer,
        orderBy: { capacityMva: "desc" },
        select: {
          id: true,
          transformerCode: true,
          capacityMva: true,
          substation: { select: { id: true, name: true, code: true } }
        }
      }),
      prisma.transformer.findFirst({
        where: where.transformer,
        orderBy: { capacityMva: "asc" },
        select: {
          id: true,
          transformerCode: true,
          capacityMva: true,
          substation: { select: { id: true, name: true, code: true } }
        }
      }),
      prisma.batteryBank.aggregate({
        where: where.batteryBank,
        _sum: { capacityAh: true },
        _avg: { capacityAh: true }
      }),
      prisma.capacitorBank.aggregate({
        where: where.capacitorBank,
        _sum: { capacityMvar: true },
        _avg: { capacityMvar: true }
      }),
      prisma.outgoingFeeder.aggregate({
        where: where.outgoingFeeder,
        _sum: { connectedLoadMw: true }
      }),
      prisma.incomingSource.groupBy({
        by: ["sourceType"],
        where: where.incomingSource,
        _count: { _all: true }
      }),
      prisma.lightningArrester.groupBy({
        by: ["voltageRatingKv"],
        where: where.lightningArrester,
        _count: { _all: true }
      })
    ]);

    return {
      transformerCapacity: {
        totalMva: this.decimalToNumber(transformerCapacity._sum.capacityMva),
        averageMva: this.decimalToNumber(transformerCapacity._avg.capacityMva),
        largestTransformer: largestTransformer ? this.formatTransformer(largestTransformer) : null,
        smallestTransformer: smallestTransformer ? this.formatTransformer(smallestTransformer) : null
      },
      battery: {
        totalAh: this.decimalToNumber(batteryCapacity._sum.capacityAh),
        averageAh: this.decimalToNumber(batteryCapacity._avg.capacityAh)
      },
      capacitor: {
        totalMvar: this.decimalToNumber(capacitorCapacity._sum.capacityMvar),
        averageMvar: this.decimalToNumber(capacitorCapacity._avg.capacityMvar)
      },
      outgoingFeeders: {
        totalConnectedLoadMw: this.decimalToNumber(outgoingFeedersLoad._sum.connectedLoadMw)
      },
      incomingSources: {
        countBySourceType: incomingSourcesByType.map((item) => ({
          sourceType: item.sourceType ?? "UNSPECIFIED",
          count: item._count._all
        }))
      },
      lightningArresters: {
        countByVoltageRating: lightningArrestersByVoltage.map((item) => ({
          voltageRatingKv: this.decimalToNumber(item.voltageRatingKv),
          count: item._count._all
        }))
      }
    };
  }

  async getHierarchySummary(access: DashboardAccess) {
    const where = await this.buildScopedWheres(access);

    const [
      discoms,
      zones,
      verticals,
      subVerticals,
      substations,
      incomingSources,
      outgoingFeeders,
      transformers,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    ] = await Promise.all([
      prisma.discom.findMany({
        where: where.discom,
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" }
      }),
      prisma.zone.findMany({
        where: where.zone,
        select: { id: true, discomId: true }
      }),
      prisma.vertical.findMany({
        where: where.vertical,
        select: { id: true, zone: { select: { discomId: true } } }
      }),
      prisma.subVertical.findMany({
        where: where.subVertical,
        select: { id: true, vertical: { select: { zone: { select: { discomId: true } } } } }
      }),
      prisma.substation.findMany({
        where: where.substation,
        select: { id: true, subVertical: { select: { vertical: { select: { zone: { select: { discomId: true } } } } } } }
      }),
      prisma.incomingSource.groupBy({
        by: ["substationId"],
        where: where.incomingSource,
        _count: { _all: true }
      }),
      prisma.outgoingFeeder.groupBy({
        by: ["substationId"],
        where: where.outgoingFeeder,
        _count: { _all: true }
      }),
      prisma.transformer.groupBy({
        by: ["substationId"],
        where: where.transformer,
        _count: { _all: true }
      }),
      prisma.lightningArrester.groupBy({
        by: ["substationId"],
        where: where.lightningArrester,
        _count: { _all: true }
      }),
      prisma.batteryBank.groupBy({
        by: ["substationId"],
        where: where.batteryBank,
        _count: { _all: true }
      }),
      prisma.capacitorBank.groupBy({
        by: ["substationId"],
        where: where.capacitorBank,
        _count: { _all: true }
      })
    ]);

    const discomIdsBySubstationId = new Map(
      substations.map((substation) => [
        substation.id,
        substation.subVertical.vertical.zone.discomId
      ])
    );

    const equipmentByDiscom = this.initializeEquipmentCounts(discoms.map((discom) => discom.id));

    this.addGroupedEquipmentCounts(equipmentByDiscom, discomIdsBySubstationId, incomingSources, "incomingSources");
    this.addGroupedEquipmentCounts(equipmentByDiscom, discomIdsBySubstationId, outgoingFeeders, "outgoingFeeders");
    this.addGroupedEquipmentCounts(equipmentByDiscom, discomIdsBySubstationId, transformers, "transformers");
    this.addGroupedEquipmentCounts(equipmentByDiscom, discomIdsBySubstationId, lightningArresters, "lightningArresters");
    this.addGroupedEquipmentCounts(equipmentByDiscom, discomIdsBySubstationId, batteryBanks, "batteryBanks");
    this.addGroupedEquipmentCounts(equipmentByDiscom, discomIdsBySubstationId, capacitorBanks, "capacitorBanks");

    return {
      discoms: discoms.map((discom) => ({
        id: discom.id,
        name: discom.name,
        code: discom.code,
        zoneCount: zones.filter((zone) => zone.discomId === discom.id).length,
        verticalCount: verticals.filter((vertical) => vertical.zone.discomId === discom.id).length,
        subVerticalCount: subVerticals.filter(
          (subVertical) => subVertical.vertical.zone.discomId === discom.id
        ).length,
        substationCount: substations.filter(
          (substation) => substation.subVertical.vertical.zone.discomId === discom.id
        ).length,
        equipmentCounts: equipmentByDiscom.get(discom.id) ?? this.emptyEquipmentCounts()
      }))
    };
  }

  async getEquipmentDistribution(access: DashboardAccess, filters: DashboardFilters) {
    const where = await this.buildFilteredWheres(access, filters);
    const [
      substations,
      incomingSources,
      outgoingFeeders,
      transformers,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    ] = await Promise.all([
      this.findHierarchySubstations(where.substation),
      prisma.incomingSource.groupBy({ by: ["substationId"], where: where.incomingSource, _count: { _all: true } }),
      prisma.outgoingFeeder.groupBy({ by: ["substationId"], where: where.outgoingFeeder, _count: { _all: true } }),
      prisma.transformer.groupBy({ by: ["substationId"], where: where.transformer, _count: { _all: true } }),
      prisma.lightningArrester.groupBy({ by: ["substationId"], where: where.lightningArrester, _count: { _all: true } }),
      prisma.batteryBank.groupBy({ by: ["substationId"], where: where.batteryBank, _count: { _all: true } }),
      prisma.capacitorBank.groupBy({ by: ["substationId"], where: where.capacitorBank, _count: { _all: true } })
    ]);

    const rollups = this.initializeHierarchyEquipmentRollups(substations);
    this.addEquipmentRollupCounts(rollups, substations, incomingSources, "incomingSources");
    this.addEquipmentRollupCounts(rollups, substations, outgoingFeeders, "outgoingFeeders");
    this.addEquipmentRollupCounts(rollups, substations, transformers, "transformers");
    this.addEquipmentRollupCounts(rollups, substations, lightningArresters, "lightningArresters");
    this.addEquipmentRollupCounts(rollups, substations, batteryBanks, "batteryBanks");
    this.addEquipmentRollupCounts(rollups, substations, capacitorBanks, "capacitorBanks");

    return this.formatHierarchyRollups(rollups);
  }

  async getSubstationStatus(access: DashboardAccess, filters: DashboardFilters) {
    const where = await this.buildFilteredWheres(access, filters);
    const substations = await this.findHierarchySubstations(where.substation);
    const rollups = this.initializeStatusRollups(substations);

    for (const substation of substations) {
      for (const bucket of this.getHierarchyBuckets(rollups, substation)) {
        if (substation.isActive) {
          bucket.active += 1;
        } else {
          bucket.inactive += 1;
        }
      }
    }

    return this.formatStatusRollups(rollups);
  }

  async getTransformerCapacity(access: DashboardAccess, filters: DashboardFilters) {
    const where = await this.buildFilteredWheres(access, filters);
    const transformers = await prisma.transformer.findMany({
      where: where.transformer,
      select: {
        capacityMva: true,
        substation: { select: this.hierarchySubstationSelect() }
      }
    });

    const rollups = this.initializeNumericRollups(transformers.map((item) => item.substation));
    for (const transformer of transformers) {
      this.addNumericValue(rollups, transformer.substation, this.decimalToNumber(transformer.capacityMva));
    }

    return this.formatNumericRollups(rollups, "Mva");
  }

  async getFeederLoad(access: DashboardAccess, filters: DashboardFilters) {
    const where = await this.buildFilteredWheres(access, filters);
    const outgoingFeeders = await prisma.outgoingFeeder.findMany({
      where: where.outgoingFeeder,
      select: {
        connectedLoadMw: true,
        substation: { select: this.hierarchySubstationSelect() }
      }
    });

    const rollups = this.initializeNumericRollups(outgoingFeeders.map((item) => item.substation));
    for (const feeder of outgoingFeeders) {
      if (feeder.connectedLoadMw) {
        this.addNumericValue(rollups, feeder.substation, this.decimalToNumber(feeder.connectedLoadMw));
      }
    }

    return this.formatNumericRollups(rollups, "ConnectedLoadMw");
  }

  async getImportHistory(access: DashboardAccess, filters: DashboardFilters) {
    const imports = await prisma.importJob.findMany({
      where: this.importJobWhere(access, filters),
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        totalRows: true,
        successRows: true,
        failedRows: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        createdBy: { select: { id: true, name: true, email: true } },
        uploadedFile: { select: { id: true, originalFileName: true } }
      }
    });

    return imports.map((item) => ({
      id: item.id,
      status: item.status,
      rowsImported: item.successRows,
      rowsFailed: item.failedRows,
      totalRows: item.totalRows,
      uploadedBy: item.createdBy,
      uploadedFile: item.uploadedFile,
      executionTimeMs: item.startedAt && item.completedAt ? item.completedAt.getTime() - item.startedAt.getTime() : null,
      timestamp: item.createdAt
    }));
  }

  async getRecentImportErrors(access: DashboardAccess, filters: DashboardFilters) {
    const errors = await prisma.importError.findMany({
      where: { importJob: this.importJobWhere(access, filters) },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        sheetName: true,
        rowNumber: true,
        columnName: true,
        errorCode: true,
        errorMessage: true,
        createdAt: true,
        importJob: {
          select: {
            id: true,
            status: true,
            uploadedFile: { select: { id: true, originalFileName: true } }
          }
        }
      }
    });

    return errors.map((error) => ({
      id: error.id,
      sheet: error.sheetName,
      row: error.rowNumber,
      column: error.columnName,
      errorCode: error.errorCode,
      errorMessage: error.errorMessage,
      createdAt: error.createdAt,
      importJob: error.importJob
    }));
  }

  async getMap(access: DashboardAccess, filters: DashboardFilters) {
    const where = await this.buildFilteredWheres(access, filters);
    const activeSubstationWhere: Prisma.SubstationWhereInput = {
      AND: [
        where.substation,
        { isActive: true },
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    };

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
        where: activeSubstationWhere,
        select: {
          ...this.hierarchySubstationSelect(),
          voltageLevelKv: true,
          latitude: true,
          longitude: true
        },
        orderBy: { name: "asc" }
      }),
      prisma.incomingSource.groupBy({ by: ["substationId"], where: where.incomingSource, _count: { _all: true } }),
      prisma.outgoingFeeder.groupBy({ by: ["substationId"], where: where.outgoingFeeder, _count: { _all: true } }),
      prisma.transformer.groupBy({ by: ["substationId"], where: where.transformer, _count: { _all: true } }),
      prisma.lightningArrester.groupBy({ by: ["substationId"], where: where.lightningArrester, _count: { _all: true } }),
      prisma.batteryBank.groupBy({ by: ["substationId"], where: where.batteryBank, _count: { _all: true } }),
      prisma.capacitorBank.groupBy({ by: ["substationId"], where: where.capacitorBank, _count: { _all: true } })
    ]);

    const countsBySubstation = this.initializeEquipmentCounts(substations.map((substation) => substation.id));
    this.addSubstationEquipmentCounts(countsBySubstation, incomingSources, "incomingSources");
    this.addSubstationEquipmentCounts(countsBySubstation, outgoingFeeders, "outgoingFeeders");
    this.addSubstationEquipmentCounts(countsBySubstation, transformers, "transformers");
    this.addSubstationEquipmentCounts(countsBySubstation, lightningArresters, "lightningArresters");
    this.addSubstationEquipmentCounts(countsBySubstation, batteryBanks, "batteryBanks");
    this.addSubstationEquipmentCounts(countsBySubstation, capacitorBanks, "capacitorBanks");

    return substations.map((substation) => ({
      id: substation.id,
      name: substation.name,
      latitude: this.decimalToNumber(substation.latitude),
      longitude: this.decimalToNumber(substation.longitude),
      voltage: this.decimalToNumber(substation.voltageLevelKv),
      zone: substation.subVertical.vertical.zone,
      vertical: {
        id: substation.subVertical.vertical.id,
        name: substation.subVertical.vertical.name,
        code: substation.subVertical.vertical.code
      },
      subVertical: {
        id: substation.subVertical.id,
        name: substation.subVertical.name,
        code: substation.subVertical.code
      },
      equipmentCounts: countsBySubstation.get(substation.id) ?? this.emptyEquipmentCounts()
    }));
  }

  private async buildScopedWheres(access: DashboardAccess): Promise<ScopedWheres> {
    const baseWheres = this.baseWheres();

    if (access.role === "ADMIN") {
      return baseWheres;
    }

    const assignments = await prisma.userAreaMapping.findMany({
      where: {
        userId: access.userId,
        isActive: true,
        deletedAt: null
      },
      select: {
        areaType: true,
        discomId: true,
        zoneId: true,
        verticalId: true,
        subVerticalId: true,
        substationId: true
      }
    });

    return {
      discom: { AND: [baseWheres.discom, this.orNoAccess(this.toDiscomScopes(assignments))] },
      zone: { AND: [baseWheres.zone, this.orNoAccess(this.toZoneScopes(assignments))] },
      vertical: { AND: [baseWheres.vertical, this.orNoAccess(this.toVerticalScopes(assignments))] },
      subVertical: { AND: [baseWheres.subVertical, this.orNoAccess(this.toSubVerticalScopes(assignments))] },
      substation: { AND: [baseWheres.substation, this.orNoAccess(this.toSubstationScopes(assignments))] },
      incomingSource: { AND: [baseWheres.incomingSource, this.orNoAccess(this.toIncomingSourceScopes(assignments))] },
      outgoingFeeder: { AND: [baseWheres.outgoingFeeder, this.orNoAccess(this.toOutgoingFeederScopes(assignments))] },
      transformer: { AND: [baseWheres.transformer, this.orNoAccess(this.toTransformerScopes(assignments))] },
      lightningArrester: { AND: [baseWheres.lightningArrester, this.orNoAccess(this.toLightningArresterScopes(assignments))] },
      batteryBank: { AND: [baseWheres.batteryBank, this.orNoAccess(this.toBatteryBankScopes(assignments))] },
      capacitorBank: { AND: [baseWheres.capacitorBank, this.orNoAccess(this.toCapacitorBankScopes(assignments))] }
    };
  }

  private async buildFilteredWheres(access: DashboardAccess, filters: DashboardFilters): Promise<ScopedWheres> {
    const where = await this.buildScopedWheres(access);

    return {
      discom: { AND: [where.discom, this.discomFilter(filters)] },
      zone: { AND: [where.zone, this.zoneFilter(filters)] },
      vertical: { AND: [where.vertical, this.verticalFilter(filters)] },
      subVertical: { AND: [where.subVertical, this.subVerticalFilter(filters)] },
      substation: { AND: [where.substation, this.substationFilter(filters)] },
      incomingSource: { AND: [where.incomingSource, this.equipmentFilter<Prisma.IncomingSourceWhereInput>(filters)] },
      outgoingFeeder: { AND: [where.outgoingFeeder, this.equipmentFilter<Prisma.OutgoingFeederWhereInput>(filters)] },
      transformer: { AND: [where.transformer, this.equipmentFilter<Prisma.TransformerWhereInput>(filters)] },
      lightningArrester: { AND: [where.lightningArrester, this.equipmentFilter<Prisma.LightningArresterWhereInput>(filters)] },
      batteryBank: { AND: [where.batteryBank, this.equipmentFilter<Prisma.BatteryBankWhereInput>(filters)] },
      capacitorBank: { AND: [where.capacitorBank, this.equipmentFilter<Prisma.CapacitorBankWhereInput>(filters)] }
    };
  }

  private baseWheres(): ScopedWheres {
    return {
      discom: { ...notDeleted },
      zone: { ...notDeleted },
      vertical: { ...notDeleted },
      subVertical: { ...notDeleted },
      substation: { ...notDeleted },
      incomingSource: { ...notDeleted },
      outgoingFeeder: { ...notDeleted },
      transformer: { ...notDeleted },
      lightningArrester: { ...notDeleted },
      batteryBank: { ...notDeleted },
      capacitorBank: { ...notDeleted }
    };
  }

  private discomFilter(filters: DashboardFilters): Prisma.DiscomWhereInput {
    return {
      ...(filters.discomId ? { id: filters.discomId } : {}),
      ...(filters.zoneId ? { zones: { some: { id: filters.zoneId } } } : {}),
      ...(filters.verticalId ? { zones: { some: { verticals: { some: { id: filters.verticalId } } } } } : {}),
      ...(filters.subVerticalId ? { zones: { some: { verticals: { some: { subVerticals: { some: { id: filters.subVerticalId } } } } } } } : {}),
      ...(filters.substationId ? { zones: { some: { verticals: { some: { subVerticals: { some: { substations: { some: { id: filters.substationId } } } } } } } } } : {})
    };
  }

  private zoneFilter(filters: DashboardFilters): Prisma.ZoneWhereInput {
    return {
      ...(filters.discomId ? { discomId: filters.discomId } : {}),
      ...(filters.zoneId ? { id: filters.zoneId } : {}),
      ...(filters.verticalId ? { verticals: { some: { id: filters.verticalId } } } : {}),
      ...(filters.subVerticalId ? { verticals: { some: { subVerticals: { some: { id: filters.subVerticalId } } } } } : {}),
      ...(filters.substationId ? { verticals: { some: { subVerticals: { some: { substations: { some: { id: filters.substationId } } } } } } } : {})
    };
  }

  private verticalFilter(filters: DashboardFilters): Prisma.VerticalWhereInput {
    return {
      ...(filters.discomId ? { zone: { discomId: filters.discomId } } : {}),
      ...(filters.zoneId ? { zoneId: filters.zoneId } : {}),
      ...(filters.verticalId ? { id: filters.verticalId } : {}),
      ...(filters.subVerticalId ? { subVerticals: { some: { id: filters.subVerticalId } } } : {}),
      ...(filters.substationId ? { subVerticals: { some: { substations: { some: { id: filters.substationId } } } } } : {})
    };
  }

  private subVerticalFilter(filters: DashboardFilters): Prisma.SubVerticalWhereInput {
    return {
      ...(filters.discomId ? { vertical: { zone: { discomId: filters.discomId } } } : {}),
      ...(filters.zoneId ? { vertical: { zoneId: filters.zoneId } } : {}),
      ...(filters.verticalId ? { verticalId: filters.verticalId } : {}),
      ...(filters.subVerticalId ? { id: filters.subVerticalId } : {}),
      ...(filters.substationId ? { substations: { some: { id: filters.substationId } } } : {})
    };
  }

  private substationFilter(filters: DashboardFilters): Prisma.SubstationWhereInput {
    return {
      ...(filters.discomId ? { subVertical: { vertical: { zone: { discomId: filters.discomId } } } } : {}),
      ...(filters.zoneId ? { subVertical: { vertical: { zoneId: filters.zoneId } } } : {}),
      ...(filters.verticalId ? { subVertical: { verticalId: filters.verticalId } } : {}),
      ...(filters.subVerticalId ? { subVerticalId: filters.subVerticalId } : {}),
      ...(filters.substationId ? { id: filters.substationId } : {})
    };
  }

  private equipmentFilter<T>(filters: DashboardFilters): T {
    return {
      ...(filters.discomId ? { substation: { subVertical: { vertical: { zone: { discomId: filters.discomId } } } } } : {}),
      ...(filters.zoneId ? { substation: { subVertical: { vertical: { zoneId: filters.zoneId } } } } : {}),
      ...(filters.verticalId ? { substation: { subVertical: { verticalId: filters.verticalId } } } : {}),
      ...(filters.subVerticalId ? { substation: { subVerticalId: filters.subVerticalId } } : {}),
      ...(filters.substationId ? { substationId: filters.substationId } : {})
    } as T;
  }

  private importJobWhere(access: DashboardAccess, filters: DashboardFilters): Prisma.ImportJobWhereInput {
    const createdAt: Prisma.DateTimeFilter = {};

    if (filters.dateFrom) createdAt.gte = filters.dateFrom;
    if (filters.dateTo) createdAt.lte = filters.dateTo;

    return {
      ...(access.role === "ADMIN" ? {} : { createdById: access.userId }),
      ...(filters.dateFrom || filters.dateTo ? { createdAt } : {})
    };
  }

  private hierarchySubstationSelect() {
    return {
      id: true,
      name: true,
      code: true,
      isActive: true,
      subVertical: {
        select: {
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
        }
      }
    } satisfies Prisma.SubstationSelect;
  }

  private findHierarchySubstations(where: Prisma.SubstationWhereInput) {
    return prisma.substation.findMany({
      where,
      select: this.hierarchySubstationSelect(),
      orderBy: { name: "asc" }
    });
  }

  private async countEquipmentByActiveState(where: ScopedWheres, isActive: boolean) {
    const [
      incomingSources,
      outgoingFeeders,
      transformers,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    ] = await Promise.all([
      prisma.incomingSource.count({ where: { AND: [where.incomingSource, { isActive }] } }),
      prisma.outgoingFeeder.count({ where: { AND: [where.outgoingFeeder, { isActive }] } }),
      prisma.transformer.count({ where: { AND: [where.transformer, { isActive }] } }),
      prisma.lightningArrester.count({ where: { AND: [where.lightningArrester, { isActive }] } }),
      prisma.batteryBank.count({ where: { AND: [where.batteryBank, { isActive }] } }),
      prisma.capacitorBank.count({ where: { AND: [where.capacitorBank, { isActive }] } })
    ]);

    return incomingSources + outgoingFeeders + transformers + lightningArresters + batteryBanks + capacitorBanks;
  }

  private orNoAccess<T>(filters: T[]): { OR: T[] } | { id: string } {
    return filters.length > 0 ? { OR: filters } : { id: "__no_assigned_area__" };
  }

  private toDiscomScopes(assignments: UserAreaAssignment[]): Prisma.DiscomWhereInput[] {
    const filters: Prisma.DiscomWhereInput[] = [];

    for (const assignment of assignments) {
      if (assignment.areaType === "DISCOM" && assignment.discomId) filters.push({ id: assignment.discomId });
      if (assignment.areaType === "ZONE" && assignment.zoneId) filters.push({ zones: { some: { id: assignment.zoneId } } });
      if (assignment.areaType === "VERTICAL" && assignment.verticalId) filters.push({ zones: { some: { verticals: { some: { id: assignment.verticalId } } } } });
      if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) filters.push({ zones: { some: { verticals: { some: { subVerticals: { some: { id: assignment.subVerticalId } } } } } } });
      if (assignment.areaType === "SUBSTATION" && assignment.substationId) filters.push({ zones: { some: { verticals: { some: { subVerticals: { some: { substations: { some: { id: assignment.substationId } } } } } } } } });
    }

    return filters;
  }

  private toZoneScopes(assignments: UserAreaAssignment[]): Prisma.ZoneWhereInput[] {
    const filters: Prisma.ZoneWhereInput[] = [];

    for (const assignment of assignments) {
      if (assignment.areaType === "DISCOM" && assignment.discomId) filters.push({ discomId: assignment.discomId });
      if (assignment.areaType === "ZONE" && assignment.zoneId) filters.push({ id: assignment.zoneId });
      if (assignment.areaType === "VERTICAL" && assignment.verticalId) filters.push({ verticals: { some: { id: assignment.verticalId } } });
      if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) filters.push({ verticals: { some: { subVerticals: { some: { id: assignment.subVerticalId } } } } });
      if (assignment.areaType === "SUBSTATION" && assignment.substationId) filters.push({ verticals: { some: { subVerticals: { some: { substations: { some: { id: assignment.substationId } } } } } } });
    }

    return filters;
  }

  private toVerticalScopes(assignments: UserAreaAssignment[]): Prisma.VerticalWhereInput[] {
    const filters: Prisma.VerticalWhereInput[] = [];

    for (const assignment of assignments) {
      if (assignment.areaType === "DISCOM" && assignment.discomId) filters.push({ zone: { discomId: assignment.discomId } });
      if (assignment.areaType === "ZONE" && assignment.zoneId) filters.push({ zoneId: assignment.zoneId });
      if (assignment.areaType === "VERTICAL" && assignment.verticalId) filters.push({ id: assignment.verticalId });
      if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) filters.push({ subVerticals: { some: { id: assignment.subVerticalId } } });
      if (assignment.areaType === "SUBSTATION" && assignment.substationId) filters.push({ subVerticals: { some: { substations: { some: { id: assignment.substationId } } } } });
    }

    return filters;
  }

  private toSubVerticalScopes(assignments: UserAreaAssignment[]): Prisma.SubVerticalWhereInput[] {
    const filters: Prisma.SubVerticalWhereInput[] = [];

    for (const assignment of assignments) {
      if (assignment.areaType === "DISCOM" && assignment.discomId) filters.push({ vertical: { zone: { discomId: assignment.discomId } } });
      if (assignment.areaType === "ZONE" && assignment.zoneId) filters.push({ vertical: { zoneId: assignment.zoneId } });
      if (assignment.areaType === "VERTICAL" && assignment.verticalId) filters.push({ verticalId: assignment.verticalId });
      if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) filters.push({ id: assignment.subVerticalId });
      if (assignment.areaType === "SUBSTATION" && assignment.substationId) filters.push({ substations: { some: { id: assignment.substationId } } });
    }

    return filters;
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

  private toIncomingSourceScopes(assignments: UserAreaAssignment[]): Prisma.IncomingSourceWhereInput[] {
    return this.toEquipmentScopes(assignments);
  }

  private toOutgoingFeederScopes(assignments: UserAreaAssignment[]): Prisma.OutgoingFeederWhereInput[] {
    return this.toEquipmentScopes(assignments);
  }

  private toTransformerScopes(assignments: UserAreaAssignment[]): Prisma.TransformerWhereInput[] {
    return this.toEquipmentScopes(assignments);
  }

  private toLightningArresterScopes(assignments: UserAreaAssignment[]): Prisma.LightningArresterWhereInput[] {
    return this.toEquipmentScopes(assignments);
  }

  private toBatteryBankScopes(assignments: UserAreaAssignment[]): Prisma.BatteryBankWhereInput[] {
    return this.toEquipmentScopes(assignments);
  }

  private toCapacitorBankScopes(assignments: UserAreaAssignment[]): Prisma.CapacitorBankWhereInput[] {
    return this.toEquipmentScopes(assignments);
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

  private initializeEquipmentCounts(discomIds: string[]): Map<string, EquipmentCounts> {
    return new Map(discomIds.map((id) => [id, this.emptyEquipmentCounts()]));
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

  private addGroupedEquipmentCounts(
    equipmentByDiscom: Map<string, EquipmentCounts>,
    discomIdsBySubstationId: Map<string, string>,
    groups: Array<{ substationId: string; _count: { _all: number } }>,
    key: EquipmentCountKey
  ) {
    for (const group of groups) {
      const discomId = discomIdsBySubstationId.get(group.substationId);
      if (!discomId) continue;

      const counts = equipmentByDiscom.get(discomId);
      if (!counts) continue;

      counts[key] += group._count._all;
    }
  }

  private addSubstationEquipmentCounts(
    countsBySubstation: Map<string, EquipmentCounts>,
    groups: Array<{ substationId: string; _count: { _all: number } }>,
    key: EquipmentCountKey
  ) {
    for (const group of groups) {
      const counts = countsBySubstation.get(group.substationId);
      if (counts) counts[key] += group._count._all;
    }
  }

  private initializeHierarchyEquipmentRollups(
    substations: Array<Awaited<ReturnType<DashboardRepository["findHierarchySubstations"]>>[number]>
  ) {
    const rollups = this.emptyHierarchyMaps<EquipmentCounts>();

    for (const substation of substations) {
      this.setHierarchyBucket(rollups.discom, substation.subVertical.vertical.zone.discom, this.emptyEquipmentCounts());
      this.setHierarchyBucket(rollups.zone, substation.subVertical.vertical.zone, this.emptyEquipmentCounts());
      this.setHierarchyBucket(rollups.vertical, substation.subVertical.vertical, this.emptyEquipmentCounts());
      this.setHierarchyBucket(rollups.subVertical, substation.subVertical, this.emptyEquipmentCounts());
    }

    return rollups;
  }

  private addEquipmentRollupCounts(
    rollups: Record<HierarchyLevel, Map<string, { id: string; name: string; code: string; value: EquipmentCounts }>>,
    substations: Array<Awaited<ReturnType<DashboardRepository["findHierarchySubstations"]>>[number]>,
    groups: Array<{ substationId: string; _count: { _all: number } }>,
    key: EquipmentCountKey
  ) {
    const substationById = new Map(substations.map((substation) => [substation.id, substation]));

    for (const group of groups) {
      const substation = substationById.get(group.substationId);
      if (!substation) continue;

      for (const bucket of this.getHierarchyBuckets(rollups, substation)) {
        bucket[key] += group._count._all;
      }
    }
  }

  private initializeStatusRollups(
    substations: Array<Awaited<ReturnType<DashboardRepository["findHierarchySubstations"]>>[number]>
  ) {
    const rollups = this.emptyHierarchyMaps<{ active: number; inactive: number }>();

    for (const substation of substations) {
      this.setHierarchyBucket(rollups.discom, substation.subVertical.vertical.zone.discom, { active: 0, inactive: 0 });
      this.setHierarchyBucket(rollups.zone, substation.subVertical.vertical.zone, { active: 0, inactive: 0 });
      this.setHierarchyBucket(rollups.vertical, substation.subVertical.vertical, { active: 0, inactive: 0 });
    }

    return rollups;
  }

  private initializeNumericRollups(
    substations: Array<Awaited<ReturnType<DashboardRepository["findHierarchySubstations"]>>[number]>
  ) {
    const rollups = this.emptyHierarchyMaps<{ count: number; total: number; maximum: number | null; minimum: number | null }>();

    for (const substation of substations) {
      const empty = { count: 0, total: 0, maximum: null, minimum: null };
      this.setHierarchyBucket(rollups.discom, substation.subVertical.vertical.zone.discom, { ...empty });
      this.setHierarchyBucket(rollups.zone, substation.subVertical.vertical.zone, { ...empty });
      this.setHierarchyBucket(rollups.vertical, substation.subVertical.vertical, { ...empty });
      this.setHierarchyBucket(rollups.subVertical, substation.subVertical, { ...empty });
    }

    return rollups;
  }

  private addNumericValue(
    rollups: Record<HierarchyLevel, Map<string, { id: string; name: string; code: string; value: { count: number; total: number; maximum: number | null; minimum: number | null } }>>,
    substation: Awaited<ReturnType<DashboardRepository["findHierarchySubstations"]>>[number],
    value: number
  ) {
    for (const bucket of this.getHierarchyBuckets(rollups, substation)) {
      bucket.count += 1;
      bucket.total += value;
      bucket.maximum = bucket.maximum === null ? value : Math.max(bucket.maximum, value);
      bucket.minimum = bucket.minimum === null ? value : Math.min(bucket.minimum, value);
    }
  }

  private getHierarchyBuckets<T>(
    rollups: Record<HierarchyLevel, Map<string, { id: string; name: string; code: string; value: T }>>,
    substation: Awaited<ReturnType<DashboardRepository["findHierarchySubstations"]>>[number]
  ): T[] {
    return [
      rollups.discom.get(substation.subVertical.vertical.zone.discom.id)?.value,
      rollups.zone.get(substation.subVertical.vertical.zone.id)?.value,
      rollups.vertical.get(substation.subVertical.vertical.id)?.value,
      rollups.subVertical.get(substation.subVertical.id)?.value
    ].filter((bucket): bucket is T => Boolean(bucket));
  }

  private emptyHierarchyMaps<T>(): Record<HierarchyLevel, Map<string, { id: string; name: string; code: string; value: T }>> {
    return {
      discom: new Map(),
      zone: new Map(),
      vertical: new Map(),
      subVertical: new Map()
    };
  }

  private setHierarchyBucket<T>(
    map: Map<string, { id: string; name: string; code: string; value: T }>,
    node: { id: string; name: string; code: string },
    value: T
  ) {
    if (!map.has(node.id)) {
      map.set(node.id, { id: node.id, name: node.name, code: node.code, value });
    }
  }

  private formatHierarchyRollups<T>(
    rollups: Record<HierarchyLevel, Map<string, { id: string; name: string; code: string; value: T }>>
  ) {
    return {
      byDiscom: this.formatRollupMap(rollups.discom),
      byZone: this.formatRollupMap(rollups.zone),
      byVertical: this.formatRollupMap(rollups.vertical),
      bySubVertical: this.formatRollupMap(rollups.subVertical)
    };
  }

  private formatStatusRollups(
    rollups: Record<HierarchyLevel, Map<string, { id: string; name: string; code: string; value: { active: number; inactive: number } }>>
  ) {
    return {
      byDiscom: this.formatRollupMap(rollups.discom),
      byZone: this.formatRollupMap(rollups.zone),
      byVertical: this.formatRollupMap(rollups.vertical)
    };
  }

  private formatNumericRollups(
    rollups: Record<HierarchyLevel, Map<string, { id: string; name: string; code: string; value: { count: number; total: number; maximum: number | null; minimum: number | null } }>>,
    suffix: "Mva" | "ConnectedLoadMw"
  ) {
    const format = (map: Map<string, { id: string; name: string; code: string; value: { count: number; total: number; maximum: number | null; minimum: number | null } }>) =>
      this.formatRollupMap(map).map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        [`total${suffix}`]: item.value.total,
        [`average${suffix}`]: item.value.count > 0 ? item.value.total / item.value.count : 0,
        [`maximum${suffix}`]: item.value.maximum ?? 0,
        [`minimum${suffix}`]: item.value.minimum ?? 0
      }));

    return {
      byDiscom: format(rollups.discom),
      byZone: format(rollups.zone),
      byVertical: format(rollups.vertical),
      bySubVertical: format(rollups.subVertical)
    };
  }

  private formatRollupMap<T>(map: Map<string, { id: string; name: string; code: string; value: T }>) {
    return Array.from(map.values())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        value: item.value
      }));
  }

  private decimalToNumber(value: Prisma.Decimal | null | undefined): number {
    return value ? Number(value) : 0;
  }

  private formatTransformer(transformer: {
    id: string;
    transformerCode: string;
    capacityMva: Prisma.Decimal;
    substation: { id: string; name: string; code: string };
  }) {
    return {
      id: transformer.id,
      transformerCode: transformer.transformerCode,
      capacityMva: this.decimalToNumber(transformer.capacityMva),
      substation: transformer.substation
    };
  }
}

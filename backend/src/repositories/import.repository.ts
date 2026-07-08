import { ImportJobStatus, ImportType, type Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type { WorkbookValidationIssue } from "../dtos/import-workbook.dto.js";

export type PrismaTx = Prisma.TransactionClient;

export class ImportRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  createUploadedFile(
    tx: PrismaTx,
    data: {
      originalFileName: string;
      storedFileName: string;
      storagePath: string;
      mimeType: string;
      fileSizeBytes: bigint;
      checksum: string;
      uploadedById: string;
    }
  ) {
    return tx.uploadedFile.create({
      data,
      select: {
        id: true,
        originalFileName: true,
        mimeType: true,
        fileSizeBytes: true,
        checksum: true
      }
    });
  }

  createImportJob(tx: PrismaTx, data: { uploadedFileId: string; createdById: string }) {
    return tx.importJob.create({
      data: {
        uploadedFileId: data.uploadedFileId,
        importType: ImportType.SUBSTATION,
        status: ImportJobStatus.VALIDATING,
        startedAt: new Date(),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: {
        id: true,
        status: true,
        totalRows: true,
        failedRows: true
      }
    });
  }

  async createImportErrors(
    tx: PrismaTx,
    importJobId: string,
    validationErrors: WorkbookValidationIssue[]
  ): Promise<void> {
    if (validationErrors.length === 0) {
      return;
    }

    await tx.importError.createMany({
      data: validationErrors.map((error) => ({
        importJobId,
        sheetName: error.sheetName,
        rowNumber: error.rowNumber,
        columnName: error.columnName,
        fieldName: error.fieldName,
        rawValue: error.rawValue,
        errorCode: error.errorCode,
        errorMessage: error.errorMessage
      }))
    });
  }

  updateImportJobStatus(
    tx: PrismaTx,
    id: string,
    data: {
      status: ImportJobStatus;
      totalRows: number;
      failedRows: number;
      updatedById: string;
    }
  ) {
    return tx.importJob.update({
      where: { id },
      data: {
        status: data.status,
        totalRows: data.totalRows,
        failedRows: data.failedRows,
        completedAt: new Date(),
        updatedById: data.updatedById
      },
      select: {
        id: true,
        status: true,
        totalRows: true,
        failedRows: true
      }
    });
  }

  findDiscomByCode(tx: PrismaTx, code: string) {
    return tx.discom.findUnique({ where: { code }, select: { id: true, code: true } });
  }

  upsertDiscom(tx: PrismaTx, data: { name: string; code: string; userId: string }) {
    return tx.discom.upsert({
      where: { code: data.code },
      create: { name: data.name, code: data.code, createdById: data.userId, updatedById: data.userId },
      update: { name: data.name, updatedById: data.userId, deletedAt: null, deletedById: null, isActive: true },
      select: { id: true, code: true }
    });
  }

  createDiscom(tx: PrismaTx, data: { name: string; code: string; userId: string }) {
    return tx.discom.create({
      data: { name: data.name, code: data.code, createdById: data.userId, updatedById: data.userId },
      select: { id: true, code: true }
    });
  }

  findZoneByCode(tx: PrismaTx, discomId: string, code: string) {
    return tx.zone.findUnique({ where: { discomId_code: { discomId, code } }, select: { id: true, code: true } });
  }

  findAnyZoneByCode(tx: PrismaTx, code: string) {
    return tx.zone.findFirst({ where: { code, deletedAt: null }, select: { id: true, code: true } });
  }

  upsertZone(tx: PrismaTx, data: { discomId: string; name: string; code: string; userId: string }) {
    return tx.zone.upsert({
      where: { discomId_code: { discomId: data.discomId, code: data.code } },
      create: {
        discomId: data.discomId,
        name: data.name,
        code: data.code,
        createdById: data.userId,
        updatedById: data.userId
      },
      update: { name: data.name, updatedById: data.userId, deletedAt: null, deletedById: null, isActive: true },
      select: { id: true, code: true }
    });
  }

  createZone(tx: PrismaTx, data: { discomId: string; name: string; code: string; userId: string }) {
    return tx.zone.create({
      data: {
        discomId: data.discomId,
        name: data.name,
        code: data.code,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true, code: true }
    });
  }

  findVerticalByCode(tx: PrismaTx, zoneId: string, code: string) {
    return tx.vertical.findUnique({ where: { zoneId_code: { zoneId, code } }, select: { id: true, code: true } });
  }

  findAnyVerticalByCode(tx: PrismaTx, code: string) {
    return tx.vertical.findFirst({ where: { code, deletedAt: null }, select: { id: true, code: true } });
  }

  upsertVertical(tx: PrismaTx, data: { zoneId: string; name: string; code: string; userId: string }) {
    return tx.vertical.upsert({
      where: { zoneId_code: { zoneId: data.zoneId, code: data.code } },
      create: {
        zoneId: data.zoneId,
        name: data.name,
        code: data.code,
        createdById: data.userId,
        updatedById: data.userId
      },
      update: { name: data.name, updatedById: data.userId, deletedAt: null, deletedById: null, isActive: true },
      select: { id: true, code: true }
    });
  }

  createVertical(tx: PrismaTx, data: { zoneId: string; name: string; code: string; userId: string }) {
    return tx.vertical.create({
      data: {
        zoneId: data.zoneId,
        name: data.name,
        code: data.code,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true, code: true }
    });
  }

  findSubVerticalByCode(tx: PrismaTx, verticalId: string, code: string) {
    return tx.subVertical.findUnique({
      where: { verticalId_code: { verticalId, code } },
      select: { id: true, code: true }
    });
  }

  findAnySubVerticalByCode(tx: PrismaTx, code: string) {
    return tx.subVertical.findFirst({ where: { code, deletedAt: null }, select: { id: true, code: true } });
  }

  upsertSubVertical(tx: PrismaTx, data: { verticalId: string; name: string; code: string; userId: string }) {
    return tx.subVertical.upsert({
      where: { verticalId_code: { verticalId: data.verticalId, code: data.code } },
      create: {
        verticalId: data.verticalId,
        name: data.name,
        code: data.code,
        createdById: data.userId,
        updatedById: data.userId
      },
      update: { name: data.name, updatedById: data.userId, deletedAt: null, deletedById: null, isActive: true },
      select: { id: true, code: true }
    });
  }

  createSubVertical(tx: PrismaTx, data: { verticalId: string; name: string; code: string; userId: string }) {
    return tx.subVertical.create({
      data: {
        verticalId: data.verticalId,
        name: data.name,
        code: data.code,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true, code: true }
    });
  }

  findSubstationByCode(tx: PrismaTx, subVerticalId: string, code: string) {
    return tx.substation.findUnique({
      where: { subVerticalId_code: { subVerticalId, code } },
      select: { id: true, code: true }
    });
  }

  findAnySubstationByCode(tx: PrismaTx, code: string) {
    return tx.substation.findFirst({ where: { code, deletedAt: null }, select: { id: true, code: true } });
  }

  upsertSubstation(
    tx: PrismaTx,
    data: {
      subVerticalId: string;
      name: string;
      code: string;
      voltageLevelKv: number;
      address?: string;
      latitude?: number;
      longitude?: number;
      commissioningDate?: Date;
      isActive?: boolean;
      userId: string;
    }
  ) {
    const payload = {
      name: data.name,
      voltageLevelKv: data.voltageLevelKv,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      commissioningDate: data.commissioningDate,
      isActive: data.isActive ?? true,
      updatedById: data.userId,
      deletedAt: null,
      deletedById: null
    };

    return tx.substation.upsert({
      where: { subVerticalId_code: { subVerticalId: data.subVerticalId, code: data.code } },
      create: { ...payload, subVerticalId: data.subVerticalId, code: data.code, createdById: data.userId },
      update: payload,
      select: { id: true, code: true }
    });
  }

  createSubstation(tx: PrismaTx, data: Parameters<ImportRepository["upsertSubstation"]>[1]) {
    return tx.substation.create({
      data: {
        subVerticalId: data.subVerticalId,
        name: data.name,
        code: data.code,
        voltageLevelKv: data.voltageLevelKv,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        commissioningDate: data.commissioningDate,
        isActive: data.isActive ?? true,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true, code: true }
    });
  }

  findIncomingSource(tx: PrismaTx, substationId: string, sourceName: string) {
    return tx.incomingSource.findUnique({
      where: { substationId_sourceName: { substationId, sourceName } },
      select: { id: true }
    });
  }

  upsertIncomingSource(
    tx: PrismaTx,
    data: {
      substationId: string;
      sourceName: string;
      sourceType?: string;
      voltageLevelKv: number;
      feederName?: string;
      meterNumber?: string;
      isActive?: boolean;
      userId: string;
    }
  ) {
    const payload = {
      sourceType: data.sourceType,
      voltageLevelKv: data.voltageLevelKv,
      feederName: data.feederName,
      meterNumber: data.meterNumber,
      isActive: data.isActive ?? true,
      updatedById: data.userId,
      deletedAt: null,
      deletedById: null
    };
    return tx.incomingSource.upsert({
      where: { substationId_sourceName: { substationId: data.substationId, sourceName: data.sourceName } },
      create: { ...payload, substationId: data.substationId, sourceName: data.sourceName, createdById: data.userId },
      update: payload,
      select: { id: true }
    });
  }

  createIncomingSource(tx: PrismaTx, data: Parameters<ImportRepository["upsertIncomingSource"]>[1]) {
    return tx.incomingSource.create({
      data: {
        substationId: data.substationId,
        sourceName: data.sourceName,
        sourceType: data.sourceType,
        voltageLevelKv: data.voltageLevelKv,
        feederName: data.feederName,
        meterNumber: data.meterNumber,
        isActive: data.isActive ?? true,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true }
    });
  }

  findTransformer(tx: PrismaTx, substationId: string, transformerCode: string) {
    return tx.transformer.findUnique({
      where: { substationId_transformerCode: { substationId, transformerCode } },
      select: { id: true }
    });
  }

  upsertTransformer(
    tx: PrismaTx,
    data: {
      substationId: string;
      transformerCode: string;
      capacityMva: number;
      primaryVoltageKv: number;
      secondaryVoltageKv: number;
      make?: string;
      serialNumber?: string;
      commissioningDate?: Date;
      isActive?: boolean;
      userId: string;
    }
  ) {
    const payload = {
      capacityMva: data.capacityMva,
      primaryVoltageKv: data.primaryVoltageKv,
      secondaryVoltageKv: data.secondaryVoltageKv,
      make: data.make,
      serialNumber: data.serialNumber,
      commissioningDate: data.commissioningDate,
      isActive: data.isActive ?? true,
      updatedById: data.userId,
      deletedAt: null,
      deletedById: null
    };
    return tx.transformer.upsert({
      where: { substationId_transformerCode: { substationId: data.substationId, transformerCode: data.transformerCode } },
      create: { ...payload, substationId: data.substationId, transformerCode: data.transformerCode, createdById: data.userId },
      update: payload,
      select: { id: true }
    });
  }

  createTransformer(tx: PrismaTx, data: Parameters<ImportRepository["upsertTransformer"]>[1]) {
    return tx.transformer.create({
      data: {
        substationId: data.substationId,
        transformerCode: data.transformerCode,
        capacityMva: data.capacityMva,
        primaryVoltageKv: data.primaryVoltageKv,
        secondaryVoltageKv: data.secondaryVoltageKv,
        make: data.make,
        serialNumber: data.serialNumber,
        commissioningDate: data.commissioningDate,
        isActive: data.isActive ?? true,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true }
    });
  }

  findOutgoingFeeder(tx: PrismaTx, substationId: string, feederName: string) {
    return tx.outgoingFeeder.findUnique({
      where: { substationId_feederName: { substationId, feederName } },
      select: { id: true }
    });
  }

  upsertOutgoingFeeder(
    tx: PrismaTx,
    data: {
      substationId: string;
      feederName: string;
      feederCode?: string;
      voltageLevelKv: number;
      feederType?: string;
      connectedLoadMw?: number;
      isActive?: boolean;
      userId: string;
    }
  ) {
    const payload = {
      feederCode: data.feederCode,
      voltageLevelKv: data.voltageLevelKv,
      feederType: data.feederType,
      connectedLoadMw: data.connectedLoadMw,
      isActive: data.isActive ?? true,
      updatedById: data.userId,
      deletedAt: null,
      deletedById: null
    };
    return tx.outgoingFeeder.upsert({
      where: { substationId_feederName: { substationId: data.substationId, feederName: data.feederName } },
      create: { ...payload, substationId: data.substationId, feederName: data.feederName, createdById: data.userId },
      update: payload,
      select: { id: true }
    });
  }

  createOutgoingFeeder(tx: PrismaTx, data: Parameters<ImportRepository["upsertOutgoingFeeder"]>[1]) {
    return tx.outgoingFeeder.create({
      data: {
        substationId: data.substationId,
        feederName: data.feederName,
        feederCode: data.feederCode,
        voltageLevelKv: data.voltageLevelKv,
        feederType: data.feederType,
        connectedLoadMw: data.connectedLoadMw,
        isActive: data.isActive ?? true,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true }
    });
  }

  findLightningArrester(tx: PrismaTx, substationId: string, arresterCode: string) {
    return tx.lightningArrester.findUnique({
      where: { substationId_arresterCode: { substationId, arresterCode } },
      select: { id: true }
    });
  }

  upsertLightningArrester(
    tx: PrismaTx,
    data: {
      substationId: string;
      arresterCode: string;
      locationDescription?: string;
      voltageRatingKv: number;
      make?: string;
      serialNumber?: string;
      installationDate?: Date;
      isActive?: boolean;
      userId: string;
    }
  ) {
    const payload = {
      locationDescription: data.locationDescription,
      voltageRatingKv: data.voltageRatingKv,
      make: data.make,
      serialNumber: data.serialNumber,
      installationDate: data.installationDate,
      isActive: data.isActive ?? true,
      updatedById: data.userId,
      deletedAt: null,
      deletedById: null
    };
    return tx.lightningArrester.upsert({
      where: { substationId_arresterCode: { substationId: data.substationId, arresterCode: data.arresterCode } },
      create: { ...payload, substationId: data.substationId, arresterCode: data.arresterCode, createdById: data.userId },
      update: payload,
      select: { id: true }
    });
  }

  createLightningArrester(tx: PrismaTx, data: Parameters<ImportRepository["upsertLightningArrester"]>[1]) {
    return tx.lightningArrester.create({
      data: {
        substationId: data.substationId,
        arresterCode: data.arresterCode,
        locationDescription: data.locationDescription,
        voltageRatingKv: data.voltageRatingKv,
        make: data.make,
        serialNumber: data.serialNumber,
        installationDate: data.installationDate,
        isActive: data.isActive ?? true,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true }
    });
  }

  findBatteryBank(tx: PrismaTx, substationId: string, batteryBankCode: string) {
    return tx.batteryBank.findUnique({
      where: { substationId_batteryBankCode: { substationId, batteryBankCode } },
      select: { id: true }
    });
  }

  upsertBatteryBank(
    tx: PrismaTx,
    data: {
      substationId: string;
      batteryBankCode: string;
      batteryType?: string;
      voltageV: number;
      capacityAh: number;
      cellCount?: number;
      make?: string;
      installationDate?: Date;
      isActive?: boolean;
      userId: string;
    }
  ) {
    const payload = {
      batteryType: data.batteryType,
      voltageV: data.voltageV,
      capacityAh: data.capacityAh,
      cellCount: data.cellCount,
      make: data.make,
      installationDate: data.installationDate,
      isActive: data.isActive ?? true,
      updatedById: data.userId,
      deletedAt: null,
      deletedById: null
    };
    return tx.batteryBank.upsert({
      where: { substationId_batteryBankCode: { substationId: data.substationId, batteryBankCode: data.batteryBankCode } },
      create: { ...payload, substationId: data.substationId, batteryBankCode: data.batteryBankCode, createdById: data.userId },
      update: payload,
      select: { id: true }
    });
  }

  createBatteryBank(tx: PrismaTx, data: Parameters<ImportRepository["upsertBatteryBank"]>[1]) {
    return tx.batteryBank.create({
      data: {
        substationId: data.substationId,
        batteryBankCode: data.batteryBankCode,
        batteryType: data.batteryType,
        voltageV: data.voltageV,
        capacityAh: data.capacityAh,
        cellCount: data.cellCount,
        make: data.make,
        installationDate: data.installationDate,
        isActive: data.isActive ?? true,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true }
    });
  }

  findCapacitorBank(tx: PrismaTx, substationId: string, capacitorBankCode: string) {
    return tx.capacitorBank.findUnique({
      where: { substationId_capacitorBankCode: { substationId, capacitorBankCode } },
      select: { id: true }
    });
  }

  upsertCapacitorBank(
    tx: PrismaTx,
    data: {
      substationId: string;
      capacitorBankCode: string;
      capacityMvar: number;
      voltageLevelKv: number;
      stepsCount?: number;
      make?: string;
      installationDate?: Date;
      isActive?: boolean;
      userId: string;
    }
  ) {
    const payload = {
      capacityMvar: data.capacityMvar,
      voltageLevelKv: data.voltageLevelKv,
      stepsCount: data.stepsCount,
      make: data.make,
      installationDate: data.installationDate,
      isActive: data.isActive ?? true,
      updatedById: data.userId,
      deletedAt: null,
      deletedById: null
    };
    return tx.capacitorBank.upsert({
      where: { substationId_capacitorBankCode: { substationId: data.substationId, capacitorBankCode: data.capacitorBankCode } },
      create: { ...payload, substationId: data.substationId, capacitorBankCode: data.capacitorBankCode, createdById: data.userId },
      update: payload,
      select: { id: true }
    });
  }

  createCapacitorBank(tx: PrismaTx, data: Parameters<ImportRepository["upsertCapacitorBank"]>[1]) {
    return tx.capacitorBank.create({
      data: {
        substationId: data.substationId,
        capacitorBankCode: data.capacitorBankCode,
        capacityMvar: data.capacityMvar,
        voltageLevelKv: data.voltageLevelKv,
        stepsCount: data.stepsCount,
        make: data.make,
        installationDate: data.installationDate,
        isActive: data.isActive ?? true,
        createdById: data.userId,
        updatedById: data.userId
      },
      select: { id: true }
    });
  }
}

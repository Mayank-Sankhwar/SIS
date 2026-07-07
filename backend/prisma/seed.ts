import bcrypt from "bcrypt";
import {
  AreaType,
  ImportJobStatus,
  ImportType,
  PrismaClient,
  RoleName
} from "@prisma/client";
import type { Substation, SubVertical, User, Vertical, Zone } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "Password@123";
const SALT_ROUNDS = 12;

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function upsertUserAreaMapping(
  tx: Tx,
  data: {
    userId: string;
    areaType: AreaType;
    discomId?: string;
    zoneId?: string;
    verticalId?: string;
    subVerticalId?: string;
    substationId?: string;
    isPrimary: boolean;
    createdById?: string;
    updatedById?: string;
  }
) {
  const existing = await tx.userAreaMapping.findFirst({
    where: {
      userId: data.userId,
      areaType: data.areaType,
      discomId: data.discomId,
      zoneId: data.zoneId,
      verticalId: data.verticalId,
      subVerticalId: data.subVerticalId,
      substationId: data.substationId
    }
  });

  if (existing) {
    return tx.userAreaMapping.update({
      where: { id: existing.id },
      data: {
        isPrimary: data.isPrimary,
        isActive: true,
        updatedById: data.updatedById,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  return tx.userAreaMapping.create({
    data: {
      userId: data.userId,
      areaType: data.areaType,
      discomId: data.discomId,
      zoneId: data.zoneId,
      verticalId: data.verticalId,
      subVerticalId: data.subVerticalId,
      substationId: data.substationId,
      isPrimary: data.isPrimary,
      isActive: true,
      createdById: data.createdById,
      updatedById: data.updatedById
    }
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  await prisma.$transaction(
    async (tx) => {
      const roles = {
        ADMIN: await tx.role.upsert({
          where: { name: RoleName.ADMIN },
          update: {},
          create: { name: RoleName.ADMIN }
        }),
        EE: await tx.role.upsert({
          where: { name: RoleName.EE },
          update: {},
          create: { name: RoleName.EE }
        }),
        AE: await tx.role.upsert({
          where: { name: RoleName.AE },
          update: {},
          create: { name: RoleName.AE }
        }),
        JE: await tx.role.upsert({
          where: { name: RoleName.JE },
          update: {},
          create: { name: RoleName.JE }
        })
      };

      const admin = await tx.user.upsert({
        where: { email: "super.admin@sis.gov.in" },
        update: {
          roleId: roles.ADMIN.id,
          parentUserId: null,
          name: "Super Admin",
          passwordHash,
          isActive: true,
          updatedById: null,
          deletedAt: null,
          deletedById: null
        },
        create: {
          roleId: roles.ADMIN.id,
          name: "Super Admin",
          email: "super.admin@sis.gov.in",
          mobileNumber: "9000000001",
          passwordHash,
          isActive: true
        }
      });

      const discom = await tx.discom.upsert({
        where: { code: "NDISCOM" },
        update: {
          name: "Northern Power Distribution Company",
          isActive: true,
          updatedById: admin.id,
          deletedAt: null,
          deletedById: null
        },
        create: {
          name: "Northern Power Distribution Company",
          code: "NDISCOM",
          isActive: true,
          createdById: admin.id,
          updatedById: admin.id
        }
      });

      await upsertUserAreaMapping(tx, {
        userId: admin.id,
        areaType: AreaType.DISCOM,
        discomId: discom.id,
        isPrimary: true,
        createdById: admin.id,
        updatedById: admin.id
      });

      const zones: Zone[] = [];
      const verticals: Vertical[] = [];
      const subVerticals: SubVertical[] = [];
      const substations: Array<Substation & { subVerticalCode: string }> = [];

      for (let zoneIndex = 1; zoneIndex <= 2; zoneIndex += 1) {
        const zoneCode = `ZONE-${zoneIndex}`;
        const existingZone = await tx.zone.findFirst({
          where: { discomId: discom.id, code: zoneCode }
        });
        const zone = existingZone
          ? await tx.zone.update({
              where: { id: existingZone.id },
              data: {
                name: `Operations Zone ${zoneIndex}`,
                isActive: true,
                updatedById: admin.id,
                deletedAt: null,
                deletedById: null
              }
            })
          : await tx.zone.create({
              data: {
                discomId: discom.id,
                name: `Operations Zone ${zoneIndex}`,
                code: zoneCode,
                isActive: true,
                createdById: admin.id,
                updatedById: admin.id
              }
            });
        zones.push(zone);

        for (let verticalIndex = 1; verticalIndex <= 2; verticalIndex += 1) {
          const verticalCode = `${zoneCode}-VERT-${verticalIndex}`;
          const existingVertical = await tx.vertical.findFirst({
            where: { zoneId: zone.id, code: verticalCode }
          });
          const vertical = existingVertical
            ? await tx.vertical.update({
                where: { id: existingVertical.id },
                data: {
                  name: `Distribution Vertical ${zoneIndex}.${verticalIndex}`,
                  isActive: true,
                  updatedById: admin.id,
                  deletedAt: null,
                  deletedById: null
                }
              })
            : await tx.vertical.create({
                data: {
                  zoneId: zone.id,
                  name: `Distribution Vertical ${zoneIndex}.${verticalIndex}`,
                  code: verticalCode,
                  isActive: true,
                  createdById: admin.id,
                  updatedById: admin.id
                }
              });
          verticals.push(vertical);

          for (let subVerticalIndex = 1; subVerticalIndex <= 2; subVerticalIndex += 1) {
            const subVerticalCode = `${verticalCode}-SV-${subVerticalIndex}`;
            const existingSubVertical = await tx.subVertical.findFirst({
              where: { verticalId: vertical.id, code: subVerticalCode }
            });
            const subVertical = existingSubVertical
              ? await tx.subVertical.update({
                  where: { id: existingSubVertical.id },
                  data: {
                    name: `Sub Division ${zoneIndex}.${verticalIndex}.${subVerticalIndex}`,
                    isActive: true,
                    updatedById: admin.id,
                    deletedAt: null,
                    deletedById: null
                  }
                })
              : await tx.subVertical.create({
                  data: {
                    verticalId: vertical.id,
                    name: `Sub Division ${zoneIndex}.${verticalIndex}.${subVerticalIndex}`,
                    code: subVerticalCode,
                    isActive: true,
                    createdById: admin.id,
                    updatedById: admin.id
                  }
                });
            subVerticals.push(subVertical);

            for (let substationIndex = 1; substationIndex <= 2; substationIndex += 1) {
              const substationCode = `${subVerticalCode}-SS-${substationIndex}`;
              const substationName = `Substation ${zoneIndex}.${verticalIndex}.${subVerticalIndex}.${substationIndex}`;
              const existingSubstation = await tx.substation.findFirst({
                where: { subVerticalId: subVertical.id, code: substationCode }
              });
              const substation = existingSubstation
                ? await tx.substation.update({
                    where: { id: existingSubstation.id },
                    data: {
                      name: substationName,
                      voltageLevelKv: substationIndex === 1 ? 33 : 132,
                      address: `Feeder Road ${substationIndex}, Operations Zone ${zoneIndex}`,
                      latitude: 28.6100 + zoneIndex / 100 + verticalIndex / 1000,
                      longitude: 77.2000 + subVerticalIndex / 100 + substationIndex / 1000,
                      commissioningDate: new Date(`201${zoneIndex}-0${verticalIndex + 1}-15`),
                      isActive: true,
                      updatedById: admin.id,
                      deletedAt: null,
                      deletedById: null
                    }
                  })
                : await tx.substation.create({
                    data: {
                      subVerticalId: subVertical.id,
                      name: substationName,
                      code: substationCode,
                      voltageLevelKv: substationIndex === 1 ? 33 : 132,
                      address: `Feeder Road ${substationIndex}, Operations Zone ${zoneIndex}`,
                      latitude: 28.6100 + zoneIndex / 100 + verticalIndex / 1000,
                      longitude: 77.2000 + subVerticalIndex / 100 + substationIndex / 1000,
                      commissioningDate: new Date(`201${zoneIndex}-0${verticalIndex + 1}-15`),
                      isActive: true,
                      createdById: admin.id,
                      updatedById: admin.id
                    }
                  });
              substations.push({ ...substation, subVerticalCode });
            }
          }
        }
      }

      const eeUsers: User[] = [];
      for (let index = 0; index < zones.length; index += 1) {
        const ee = await tx.user.upsert({
          where: { email: `ee.${index + 1}@sis.gov.in` },
          update: {
            roleId: roles.EE.id,
            parentUserId: admin.id,
            name: `Executive Engineer ${index + 1}`,
            passwordHash,
            isActive: true,
            updatedById: admin.id,
            deletedAt: null,
            deletedById: null
          },
          create: {
            roleId: roles.EE.id,
            parentUserId: admin.id,
            name: `Executive Engineer ${index + 1}`,
            email: `ee.${index + 1}@sis.gov.in`,
            mobileNumber: `900000001${index + 1}`,
            passwordHash,
            isActive: true,
            createdById: admin.id,
            updatedById: admin.id
          }
        });
        eeUsers.push(ee);
        await upsertUserAreaMapping(tx, {
          userId: ee.id,
          areaType: AreaType.ZONE,
          zoneId: zones[index].id,
          isPrimary: true,
          createdById: admin.id,
          updatedById: admin.id
        });
      }

      const aeUsers: User[] = [];
      for (let index = 0; index < verticals.length; index += 1) {
        const parentEe = eeUsers[Math.floor(index / 2)];
        const ae = await tx.user.upsert({
          where: { email: `ae.${index + 1}@sis.gov.in` },
          update: {
            roleId: roles.AE.id,
            parentUserId: parentEe.id,
            name: `Assistant Engineer ${index + 1}`,
            passwordHash,
            isActive: true,
            updatedById: admin.id,
            deletedAt: null,
            deletedById: null
          },
          create: {
            roleId: roles.AE.id,
            parentUserId: parentEe.id,
            name: `Assistant Engineer ${index + 1}`,
            email: `ae.${index + 1}@sis.gov.in`,
            mobileNumber: `900000002${index + 1}`,
            passwordHash,
            isActive: true,
            createdById: admin.id,
            updatedById: admin.id
          }
        });
        aeUsers.push(ae);
        await upsertUserAreaMapping(tx, {
          userId: ae.id,
          areaType: AreaType.VERTICAL,
          verticalId: verticals[index].id,
          isPrimary: true,
          createdById: admin.id,
          updatedById: admin.id
        });
      }

      const jeUsers: User[] = [];
      for (let index = 0; index < subVerticals.length; index += 1) {
        const parentAe = aeUsers[Math.floor(index / 2)];
        const je = await tx.user.upsert({
          where: { email: `je.${index + 1}@sis.gov.in` },
          update: {
            roleId: roles.JE.id,
            parentUserId: parentAe.id,
            name: `Junior Engineer ${index + 1}`,
            passwordHash,
            isActive: true,
            updatedById: admin.id,
            deletedAt: null,
            deletedById: null
          },
          create: {
            roleId: roles.JE.id,
            parentUserId: parentAe.id,
            name: `Junior Engineer ${index + 1}`,
            email: `je.${index + 1}@sis.gov.in`,
            mobileNumber: `900000003${index + 1}`,
            passwordHash,
            isActive: true,
            createdById: admin.id,
            updatedById: admin.id
          }
        });
        jeUsers.push(je);

        const managedSubstations = substations.filter(
          (substation) => substation.subVerticalId === subVerticals[index].id
        );
        for (let substationIndex = 0; substationIndex < managedSubstations.length; substationIndex += 1) {
          await upsertUserAreaMapping(tx, {
            userId: je.id,
            areaType: AreaType.SUBSTATION,
            substationId: managedSubstations[substationIndex].id,
            isPrimary: substationIndex === 0,
            createdById: admin.id,
            updatedById: admin.id
          });
        }
      }

      for (const [index, substation] of substations.entries()) {
        const substationVoltage = Number(substation.voltageLevelKv);

        for (let incomingIndex = 1; incomingIndex <= 2; incomingIndex += 1) {
          const sourceName = `${substation.code}-IN-${incomingIndex}`;
          const existing = await tx.incomingSource.findFirst({
            where: { substationId: substation.id, sourceName }
          });
          const data = {
            sourceType: incomingIndex === 1 ? "GRID" : "INTERCONNECTOR",
            voltageLevelKv: substationVoltage,
            feederName: `Incoming Feeder ${incomingIndex}`,
            meterNumber: `MTR-${index + 1}-${incomingIndex}`,
            isActive: true,
            updatedById: admin.id,
            deletedAt: null,
            deletedById: null
          };
          if (existing) {
            await tx.incomingSource.update({ where: { id: existing.id }, data });
          } else {
            await tx.incomingSource.create({
              data: {
                substationId: substation.id,
                sourceName,
                ...data,
                createdById: admin.id
              }
            });
          }
        }

        for (let transformerIndex = 1; transformerIndex <= 2; transformerIndex += 1) {
          const transformerCode = `${substation.code}-PTR-${transformerIndex}`;
          const existing = await tx.transformer.findFirst({
            where: { substationId: substation.id, transformerCode }
          });
          const data = {
            capacityMva: transformerIndex === 1 ? 10 : 20,
            primaryVoltageKv: substationVoltage,
            secondaryVoltageKv: substationVoltage === 132 ? 33 : 11,
            make: transformerIndex === 1 ? "Bharat Heavy Electricals" : "Crompton Greaves",
            serialNumber: `TR-${index + 1}-${transformerIndex}`,
            commissioningDate: new Date("2018-04-01"),
            isActive: true,
            updatedById: admin.id,
            deletedAt: null,
            deletedById: null
          };
          if (existing) {
            await tx.transformer.update({ where: { id: existing.id }, data });
          } else {
            await tx.transformer.create({
              data: {
                substationId: substation.id,
                transformerCode,
                ...data,
                createdById: admin.id
              }
            });
          }
        }

        for (let feederIndex = 1; feederIndex <= 5; feederIndex += 1) {
          const feederName = `${substation.code}-OUT-FDR-${feederIndex}`;
          const existing = await tx.outgoingFeeder.findFirst({
            where: { substationId: substation.id, feederName }
          });
          const data = {
            feederCode: `FDR-${index + 1}-${feederIndex}`,
            voltageLevelKv: substationVoltage === 132 ? 33 : 11,
            feederType: feederIndex <= 3 ? "URBAN" : "RURAL",
            connectedLoadMw: 2.5 + feederIndex,
            isActive: true,
            updatedById: admin.id,
            deletedAt: null,
            deletedById: null
          };
          if (existing) {
            await tx.outgoingFeeder.update({ where: { id: existing.id }, data });
          } else {
            await tx.outgoingFeeder.create({
              data: {
                substationId: substation.id,
                feederName,
                ...data,
                createdById: admin.id
              }
            });
          }
        }

        for (let arresterIndex = 1; arresterIndex <= 4; arresterIndex += 1) {
          const arresterCode = `${substation.code}-LA-${arresterIndex}`;
          const existing = await tx.lightningArrester.findFirst({
            where: { substationId: substation.id, arresterCode }
          });
          const data = {
            locationDescription: `Bay ${arresterIndex}`,
            voltageRatingKv: substationVoltage,
            make: arresterIndex % 2 === 0 ? "Siemens" : "ABB",
            serialNumber: `LA-${index + 1}-${arresterIndex}`,
            installationDate: new Date("2019-06-01"),
            isActive: true,
            updatedById: admin.id,
            deletedAt: null,
            deletedById: null
          };
          if (existing) {
            await tx.lightningArrester.update({ where: { id: existing.id }, data });
          } else {
            await tx.lightningArrester.create({
              data: {
                substationId: substation.id,
                arresterCode,
                ...data,
                createdById: admin.id
              }
            });
          }
        }

        const existingBatteryBank = await tx.batteryBank.findFirst({
          where: { substationId: substation.id, batteryBankCode: `${substation.code}-BB-1` }
        });
        const batteryBankData = {
          batteryType: "VRLA",
          voltageV: 220,
          capacityAh: 300,
          cellCount: 110,
          make: "Exide",
          installationDate: new Date("2020-01-15"),
          isActive: true,
          updatedById: admin.id,
          deletedAt: null,
          deletedById: null
        };
        if (existingBatteryBank) {
          await tx.batteryBank.update({ where: { id: existingBatteryBank.id }, data: batteryBankData });
        } else {
          await tx.batteryBank.create({
            data: {
              substationId: substation.id,
              batteryBankCode: `${substation.code}-BB-1`,
              ...batteryBankData,
              createdById: admin.id
            }
          });
        }

        const existingCapacitorBank = await tx.capacitorBank.findFirst({
          where: { substationId: substation.id, capacitorBankCode: `${substation.code}-CB-1` }
        });
        const capacitorBankData = {
          capacityMvar: substationVoltage === 132 ? 12.5 : 5,
          voltageLevelKv: substationVoltage === 132 ? 33 : 11,
          stepsCount: 5,
          make: "Schneider Electric",
          installationDate: new Date("2020-03-20"),
          isActive: true,
          updatedById: admin.id,
          deletedAt: null,
          deletedById: null
        };
        if (existingCapacitorBank) {
          await tx.capacitorBank.update({ where: { id: existingCapacitorBank.id }, data: capacitorBankData });
        } else {
          await tx.capacitorBank.create({
            data: {
              substationId: substation.id,
              capacitorBankCode: `${substation.code}-CB-1`,
              ...capacitorBankData,
              createdById: admin.id
            }
          });
        }
      }

      const uploadedFile = await tx.uploadedFile.findFirst({
        where: { checksum: "seed-substation-import-001" }
      });
      const file = uploadedFile
        ? await tx.uploadedFile.update({
            where: { id: uploadedFile.id },
            data: {
              originalFileName: "substation_master_seed.xlsx",
              storedFileName: "seed-substation-import-001.xlsx",
              storagePath: "imports/seed/substation_master_seed.xlsx",
              mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              fileSizeBytes: 248576n,
              uploadedById: admin.id,
              deletedAt: null,
              deletedById: null
            }
          })
        : await tx.uploadedFile.create({
            data: {
              originalFileName: "substation_master_seed.xlsx",
              storedFileName: "seed-substation-import-001.xlsx",
              storagePath: "imports/seed/substation_master_seed.xlsx",
              mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              fileSizeBytes: 248576n,
              checksum: "seed-substation-import-001",
              uploadedById: admin.id
            }
          });

      const existingImportJob = await tx.importJob.findFirst({
        where: {
          uploadedFileId: file.id,
          importType: ImportType.SUBSTATION
        }
      });
      const importJob = existingImportJob
        ? await tx.importJob.update({
            where: { id: existingImportJob.id },
            data: {
              status: ImportJobStatus.COMPLETED,
              totalRows: 16,
              successRows: 13,
              failedRows: 3,
              startedAt: new Date("2026-07-07T09:00:00.000Z"),
              completedAt: new Date("2026-07-07T09:02:30.000Z"),
              updatedById: admin.id
            }
          })
        : await tx.importJob.create({
            data: {
              uploadedFileId: file.id,
              importType: ImportType.SUBSTATION,
              status: ImportJobStatus.COMPLETED,
              totalRows: 16,
              successRows: 13,
              failedRows: 3,
              startedAt: new Date("2026-07-07T09:00:00.000Z"),
              completedAt: new Date("2026-07-07T09:02:30.000Z"),
              createdById: admin.id,
              updatedById: admin.id
            }
          });

      const errors = [
        {
          rowNumber: 7,
          columnName: "voltage_level_kv",
          fieldName: "voltageLevelKv",
          rawValue: "33KVV",
          errorCode: "INVALID_DECIMAL",
          errorMessage: "Voltage level must be a numeric kV value."
        },
        {
          rowNumber: 11,
          columnName: "substation_code",
          fieldName: "code",
          rawValue: "",
          errorCode: "REQUIRED_FIELD",
          errorMessage: "Substation code is required."
        },
        {
          rowNumber: 14,
          columnName: "latitude",
          fieldName: "latitude",
          rawValue: "north",
          errorCode: "INVALID_COORDINATE",
          errorMessage: "Latitude must be a valid decimal coordinate."
        }
      ];

      for (const error of errors) {
        const existingError = await tx.importError.findFirst({
          where: {
            importJobId: importJob.id,
            rowNumber: error.rowNumber,
            errorCode: error.errorCode
          }
        });
        if (existingError) {
          await tx.importError.update({
            where: { id: existingError.id },
            data: {
              sheetName: "Substations",
              columnName: error.columnName,
              fieldName: error.fieldName,
              rawValue: error.rawValue,
              errorMessage: error.errorMessage
            }
          });
        } else {
          await tx.importError.create({
            data: {
              importJobId: importJob.id,
              sheetName: "Substations",
              ...error
            }
          });
        }
      }
    },
    {
      maxWait: 10_000,
      timeout: 120_000
    }
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.info("Seed completed successfully.");
  })
  .catch(async (error) => {
    console.error("Seed failed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });

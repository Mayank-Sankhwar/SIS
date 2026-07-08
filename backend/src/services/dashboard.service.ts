import { DashboardRepository } from "../repositories/dashboard.repository.js";

interface DashboardAccess {
  userId: string;
  role: string;
}

export interface DashboardFilters {
  discomId?: string;
  zoneId?: string;
  verticalId?: string;
  subVerticalId?: string;
  substationId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class DashboardService {
  constructor(private readonly dashboardRepository = new DashboardRepository()) {}

  getSummary(access: DashboardAccess): Promise<unknown> {
    return this.dashboardRepository.getSummary(access);
  }

  getEquipmentSummary(access: DashboardAccess): Promise<unknown> {
    return this.dashboardRepository.getEquipmentSummary(access);
  }

  getHierarchySummary(access: DashboardAccess): Promise<unknown> {
    return this.dashboardRepository.getHierarchySummary(access);
  }

  getEquipmentDistribution(access: DashboardAccess, filters: DashboardFilters): Promise<unknown> {
    return this.dashboardRepository.getEquipmentDistribution(access, filters);
  }

  getSubstationStatus(access: DashboardAccess, filters: DashboardFilters): Promise<unknown> {
    return this.dashboardRepository.getSubstationStatus(access, filters);
  }

  getTransformerCapacity(access: DashboardAccess, filters: DashboardFilters): Promise<unknown> {
    return this.dashboardRepository.getTransformerCapacity(access, filters);
  }

  getFeederLoad(access: DashboardAccess, filters: DashboardFilters): Promise<unknown> {
    return this.dashboardRepository.getFeederLoad(access, filters);
  }

  getImportHistory(access: DashboardAccess, filters: DashboardFilters): Promise<unknown> {
    return this.dashboardRepository.getImportHistory(access, filters);
  }

  getRecentImportErrors(access: DashboardAccess, filters: DashboardFilters): Promise<unknown> {
    return this.dashboardRepository.getRecentImportErrors(access, filters);
  }

  getMap(access: DashboardAccess, filters: DashboardFilters): Promise<unknown> {
    return this.dashboardRepository.getMap(access, filters);
  }
}

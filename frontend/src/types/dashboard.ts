export type DashboardFilterKey = 'discomId' | 'zoneId' | 'verticalId' | 'subVerticalId' | 'substationId'

export type DashboardFilters = Partial<Record<DashboardFilterKey, string>> & {
  dateFrom?: string
  dateTo?: string
}

export interface EquipmentCounts {
  incomingSources: number
  outgoingFeeders: number
  transformers: number
  lightningArresters: number
  batteryBanks: number
  capacitorBanks: number
}

export interface DashboardSummary {
  totalDiscoms: number
  totalZones: number
  totalVerticals: number
  totalSubVerticals: number
  totalSubstations: number
  totalIncomingSources: number
  totalOutgoingFeeders: number
  totalTransformers: number
  totalLightningArresters: number
  totalBatteryBanks: number
  totalCapacitorBanks: number
  activeSubstations: number
  inactiveSubstations: number
  activeEquipment: number
  inactiveEquipment: number
}

export interface DashboardEntity {
  id: string
  name: string
  code: string
}

export interface DashboardTransformerInfo {
  id: string
  transformerCode: string
  capacityMva: number
  substation: DashboardEntity
}

export interface EquipmentSummary {
  transformerCapacity: {
    totalMva: number
    averageMva: number
    largestTransformer: DashboardTransformerInfo | null
    smallestTransformer: DashboardTransformerInfo | null
  }
  battery: {
    totalAh: number
    averageAh: number
  }
  capacitor: {
    totalMvar: number
    averageMvar: number
  }
  outgoingFeeders: {
    totalConnectedLoadMw: number
  }
  incomingSources: {
    countBySourceType: Array<{
      sourceType: string
      count: number
    }>
  }
  lightningArresters: {
    countByVoltageRating: Array<{
      voltageRatingKv: number
      count: number
    }>
  }
}

export interface HierarchySummaryDiscom extends DashboardEntity {
  zoneCount: number
  verticalCount: number
  subVerticalCount: number
  substationCount: number
  equipmentCounts: EquipmentCounts
}

export interface HierarchySummary {
  discoms: HierarchySummaryDiscom[]
}

export interface EquipmentDistributionRollup extends DashboardEntity {
  value: EquipmentCounts
}

export interface EquipmentDistribution {
  byDiscom: EquipmentDistributionRollup[]
  byZone: EquipmentDistributionRollup[]
  byVertical: EquipmentDistributionRollup[]
  bySubVertical: EquipmentDistributionRollup[]
}

export interface SubstationStatusRollup extends DashboardEntity {
  value: {
    active: number
    inactive: number
  }
}

export interface SubstationStatus {
  byDiscom: SubstationStatusRollup[]
  byZone: SubstationStatusRollup[]
  byVertical: SubstationStatusRollup[]
}

export interface TransformerCapacityRollup extends DashboardEntity {
  totalMva: number
  averageMva: number
  maximumMva: number
  minimumMva: number
}

export interface TransformerCapacity {
  byDiscom: TransformerCapacityRollup[]
  byZone: TransformerCapacityRollup[]
  byVertical: TransformerCapacityRollup[]
  bySubVertical: TransformerCapacityRollup[]
}

export interface FeederLoadRollup extends DashboardEntity {
  totalConnectedLoadMw: number
  averageConnectedLoadMw: number
  maximumConnectedLoadMw: number
  minimumConnectedLoadMw: number
}

export interface FeederLoad {
  byDiscom: FeederLoadRollup[]
  byZone: FeederLoadRollup[]
  byVertical: FeederLoadRollup[]
  bySubVertical: FeederLoadRollup[]
}

export interface DashboardUser {
  id: string
  name: string
  email: string
}

export interface DashboardUploadedFile {
  id: string
  originalFileName: string
}

export interface ImportHistoryItem {
  id: string
  status: string
  rowsImported: number
  rowsFailed: number
  totalRows: number
  uploadedBy: DashboardUser
  uploadedFile: DashboardUploadedFile
  executionTimeMs: number | null
  timestamp: string
}

export interface RecentImportError {
  id: string
  sheet: string
  row: number
  column: string
  errorCode: string
  errorMessage: string
  createdAt: string
  importJob: {
    id: string
    status: string
    uploadedFile: DashboardUploadedFile
  }
}

export interface DashboardMapMarker {
  id: string
  name: string
  latitude: number
  longitude: number
  voltage: number
  zone: DashboardEntity & {
    discom: DashboardEntity
  }
  vertical: DashboardEntity
  subVertical: DashboardEntity
  equipmentCounts: EquipmentCounts
}

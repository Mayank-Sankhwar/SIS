import EquipmentManagementPage from './EquipmentManagementPage'
import { equipmentConfigs } from './equipmentConfigs'

export default function CapacitorBanksPage() {
  return <EquipmentManagementPage config={equipmentConfigs['capacitor-banks']} />
}

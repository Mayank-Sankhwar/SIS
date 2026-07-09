import EquipmentManagementPage from './EquipmentManagementPage'
import { equipmentConfigs } from './equipmentConfigs'

export default function BatteryBanksPage() {
  return <EquipmentManagementPage config={equipmentConfigs['battery-banks']} />
}

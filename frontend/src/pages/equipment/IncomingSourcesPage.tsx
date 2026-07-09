import EquipmentManagementPage from './EquipmentManagementPage'
import { equipmentConfigs } from './equipmentConfigs'

export default function IncomingSourcesPage() {
  return <EquipmentManagementPage config={equipmentConfigs['incoming-sources']} />
}

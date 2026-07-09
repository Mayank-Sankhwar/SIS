import EquipmentManagementPage from './EquipmentManagementPage'
import { equipmentConfigs } from './equipmentConfigs'

export default function LightningArrestersPage() {
  return <EquipmentManagementPage config={equipmentConfigs['lightning-arresters']} />
}

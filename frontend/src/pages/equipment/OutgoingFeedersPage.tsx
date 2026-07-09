import EquipmentManagementPage from './EquipmentManagementPage'
import { equipmentConfigs } from './equipmentConfigs'

export default function OutgoingFeedersPage() {
  return <EquipmentManagementPage config={equipmentConfigs['outgoing-feeders']} />
}

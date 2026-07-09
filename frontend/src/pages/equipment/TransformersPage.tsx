import EquipmentManagementPage from './EquipmentManagementPage'
import { equipmentConfigs } from './equipmentConfigs'

export default function TransformersPage() {
  return <EquipmentManagementPage config={equipmentConfigs.transformers} />
}

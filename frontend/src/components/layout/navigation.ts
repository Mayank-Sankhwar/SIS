import {
  Banknote,
  BarChart3,
  BatteryCharging,
  BellElectric,
  Boxes,
  Building2,
  Cable,
  CircleGauge,
  FileClock,
  FileSpreadsheet,
  FileText,
  Landmark,
  Network,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type NavigationGroup = {
  label?: string
  icon?: LucideIcon
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    items: [{ label: 'Dashboard', href: '/dashboard', icon: CircleGauge }],
  },
  {
    label: 'Hierarchy',
    icon: Network,
    items: [
      { label: 'Discoms', href: '/hierarchy/discoms', icon: Landmark },
      { label: 'Zones', href: '/hierarchy/zones', icon: Building2 },
      { label: 'Verticals', href: '/hierarchy/verticals', icon: Users },
      { label: 'Sub Verticals', href: '/hierarchy/sub-verticals', icon: Network },
    ],
  },
  {
    label: 'Assets',
    icon: Boxes,
    items: [
      { label: 'Substations', href: '/assets/substations', icon: Zap },
      { label: 'Incoming Sources', href: '/assets/incoming-sources', icon: Cable },
      { label: 'Outgoing Feeders', href: '/assets/outgoing-feeders', icon: BellElectric },
      { label: 'Transformers', href: '/assets/transformers', icon: Boxes },
      { label: 'Lightning Arresters', href: '/assets/lightning-arresters', icon: ShieldCheck },
      { label: 'Battery Banks', href: '/assets/battery-banks', icon: BatteryCharging },
      { label: 'Capacitor Banks', href: '/assets/capacitor-banks', icon: Banknote },
    ],
  },
  {
    label: 'Imports',
    icon: Upload,
    items: [
      { label: 'Excel Upload', href: '/imports/excel-upload', icon: FileSpreadsheet },
      { label: 'Import History', href: '/imports/history', icon: FileClock },
    ],
  },
  {
    items: [
      { label: 'Reports', href: '/reports', icon: FileText },
      { label: 'Users', href: '/admin/users', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  hierarchy: 'Hierarchy',
  discoms: 'Discoms',
  zones: 'Zones',
  verticals: 'Verticals',
  'sub-verticals': 'Sub Verticals',
  assets: 'Assets',
  substations: 'Substations',
  'incoming-sources': 'Incoming Sources',
  'outgoing-feeders': 'Outgoing Feeders',
  transformers: 'Transformers',
  'lightning-arresters': 'Lightning Arresters',
  'battery-banks': 'Battery Banks',
  'capacitor-banks': 'Capacitor Banks',
  imports: 'Imports',
  'excel-upload': 'Excel Upload',
  history: 'Import History',
  reports: 'Reports',
  administration: 'Administration',
  settings: 'Settings',
}

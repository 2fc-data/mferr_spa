/**
 * @copyright 2025 codewithsadee
 * @license Apache-2.0
 */

/**
 * Assets
 */
import {
  BookOpenIcon,
  ChartPieIcon,
  // CopyCheckIcon,
  CopyIcon,
  // FolderKanbanIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  NetworkIcon,
  Scale,
  Landmark,
  Layers,
  MapPin,
  ClipboardList,
  Gavel,
  CheckCircle2,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  LogOutIcon,
  PencilIcon,
  SettingsIcon,
  FolderOpenIcon,
  ClipboardCheck,
} from 'lucide-react';

export const APP_SIDEBAR = {
  primaryNav: [
    {
      title: 'CRM de Planejamento',
      url: '/Dashboard',
      Icon: ClipboardCheck,
      requiredRule: 'dashboard.view',
    },
    {
      title: 'Análise Exploratória',
      url: '/Dashboard/exploratoria',
      Icon: LayoutDashboardIcon,
      requiredRule: 'dashboard.view',
    },
    {
      title: 'Análise Preditiva',
      url: '/Dashboard/jurimetria',
      Icon: ChartPieIcon,
      requiredRule: 'dashboard.view',
    },
    {
      title: 'Rede Jurídica',
      url: '/Dashboard/rede',
      Icon: NetworkIcon,
      requiredRule: 'dashboard.view',
    }
  ],
  adminNav: [
    { title: 'Processos', url: '/Dashboard/causes', Icon: FolderOpenIcon, requiredRule: 'causes.view' },
    { title: 'Usuários', url: '/Dashboard/users', Icon: UsersIcon, requiredRule: 'users.view' },
    { title: 'Checklists', url: '/Dashboard/checklists', Icon: ClipboardCheck, requiredRule: 'settings.manage' },
    { title: 'Áreas', url: '/Dashboard/areas', Icon: Scale, requiredRule: 'settings.manage' },
    { title: 'Cidades', url: '/Dashboard/cities', Icon: MapPin, requiredRule: 'settings.manage' },
    { title: 'Fases', url: '/Dashboard/stages', Icon: Layers, requiredRule: 'settings.manage' },
    { title: 'Perfis', url: '/Dashboard/profiles', Icon: ShieldCheckIcon, requiredRule: 'settings.manage' },
    { title: 'Regras', url: '/Dashboard/rule', Icon: ShieldCheckIcon, requiredRule: 'settings.manage' },
    { title: 'Resultados', url: '/Dashboard/outcomes', Icon: CheckCircle2, requiredRule: 'settings.manage' },
    { title: 'Status', url: '/Dashboard/status', Icon: ClipboardList, requiredRule: 'settings.manage' },
    { title: 'Tribunais', url: '/Dashboard/courts', Icon: Landmark, requiredRule: 'settings.manage' },
    { title: 'Varas', url: '/Dashboard/divisions', Icon: Gavel, requiredRule: 'settings.manage' },
  ],
  secondaryNav: [
    {
      title: 'Support',
      url: '#',
      Icon: LifeBuoyIcon,
    },
    {
      title: 'Settings',
      url: '#',
      Icon: SettingsIcon,
    },
  ],
  curProfile: {
    src: 'https://randomuser.me/api/portraits/men/47.jpg',
    name: 'Salvador Pearson',
    email: 'salvador.pearson@example.com',
  },
  allProfiles: [
    {
      src: 'https://randomuser.me/api/portraits/men/47.jpg',
      name: 'Salvador Pearson',
      email: 'salvador.pearson@example.com',
    },
    {
      src: 'https://randomuser.me/api/portraits/women/43.jpg',
      name: 'Violet Hicks',
      email: 'violet.hicks@example.com',
    },
  ],
  userMenu: {
    itemsPrimary: [
      {
        title: 'View profile',
        url: '#',
        Icon: UserIcon,
        kbd: '⌘K->P',
      },
      {
        title: 'Account settings',
        url: '#',
        Icon: SettingsIcon,
        kbd: '⌘S',
      },
      {
        title: 'Documentation',
        url: '#',
        Icon: BookOpenIcon,
      },
    ],
    itemsSecondary: [
      {
        title: 'Sign out',
        url: '#',
        Icon: LogOutIcon,
        kbd: '⌥⇧Q',
      },
    ],
  },
};

export const DASHBOARD_CARD_MENU = [
  {
    label: 'Editar',
    Icon: PencilIcon,
  },
  {
    label: 'Copiar',
    Icon: CopyIcon,
  },
  {
    label: 'Apagar',
    Icon: TrashIcon,
  },
];
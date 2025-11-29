import { RoleEnum } from 'src/constants/role';
import { routesName } from 'src/constants/routes';

import SvgColor from 'src/components/svg-color';
// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'Tableau de bord',
    path: routesName.admin,
    childrenPath: [routesName.admin],
    icon: icon('ic_analytics'),
    protected: [RoleEnum.SUPERADMIN, RoleEnum.ADMIN],
  },
  {
    title: 'Administration Admins',
    path: routesName.adminAdministrationAdmins,
    childrenPath: [routesName.adminAdministrationAdmins],
    icon: icon('ic_user'),
    protected: [RoleEnum.SUPERADMIN],
  },
  {
    title: 'Utilisateurs',
    path: routesName.adminUsers,
    childrenPath: [routesName.adminUsers, routesName.adminUserDetails],
    icon: icon('ic_user'),
    protected: [RoleEnum.SUPERADMIN, RoleEnum.ADMIN],
  },
  {
    title: 'Stations',
    path: routesName.adminStations,
    childrenPath: [routesName.adminStations, routesName.adminStationDetails],
    icon: icon('ic_blog'),
    protected: [RoleEnum.SUPERADMIN, RoleEnum.ADMIN, RoleEnum.STATION],
  },
  {
    title: 'Sessions',
    path: routesName.adminSessions,
    childrenPath: [routesName.adminSessions, routesName.adminSessionDetails],
    icon: icon('ic_blog'),
    protected: [RoleEnum.SUPERADMIN, RoleEnum.ADMIN, RoleEnum.STATION],
  },
  {
    title: 'Files Actives',
    path: routesName.adminFileActive,
    childrenPath: [routesName.adminFileActive, routesName.adminFileActiveBySession],
    icon: icon('ic_blog'),
    protected: [RoleEnum.SUPERADMIN, RoleEnum.ADMIN, RoleEnum.STATION],
  },
  {
    title: 'Actions Critiques',
    path: routesName.adminCritical,
    childrenPath: [routesName.adminCritical],
    icon: icon('ic_lock'),
    protected: [RoleEnum.SUPERADMIN],
  },
  {
    title: 'Configuration Système',
    path: routesName.adminConfiguration,
    childrenPath: [routesName.adminConfiguration],
    icon: icon('ic_settings'),
    protected: [RoleEnum.SUPERADMIN],
  },
  {
    title: 'Rapports & Statistiques',
    path: routesName.adminReports,
    childrenPath: [routesName.adminReports],
    icon: icon('ic_analytics'),
    protected: [RoleEnum.SUPERADMIN],
  },
  {
    title: 'Rôles & Permissions',
    path: routesName.adminRolesPermissions,
    childrenPath: [routesName.adminRolesPermissions],
    icon: icon('ic_lock'),
    protected: [RoleEnum.SUPERADMIN],
  },
  {
    title: 'Tableau de bord Station',
    path: routesName.admin,
    childrenPath: [routesName.admin],
    icon: icon('ic_analytics'),
    protected: [RoleEnum.STATION],
  },
];

export default navConfig;

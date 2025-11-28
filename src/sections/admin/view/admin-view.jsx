import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';

import { useRouter, usePathname } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

import UserListView from '../users/user-list-view';
import UserCreateView from '../users/user-create-view';
import AdminDashboardView from '../admin-dashboard-view';
import SchoolListView from '../schools/school-list-view';
import SchoolStatsView from '../schools/school-stats-view';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'dashboard',
    label: 'Tableau de bord',
    icon: <Iconify icon="solar:home-2-bold" />,
    href: '/admin',
  },
  {
    value: 'users',
    label: 'Utilisateurs',
    icon: <Iconify icon="solar:users-group-rounded-bold" />,
    href: '/admin/users',
  },
  {
    value: 'schools',
    label: 'Écoles',
    icon: <Iconify icon="solar:buildings-bold" />,
    href: '/admin/schools',
  },
  {
    value: 'stats',
    label: 'Statistiques',
    icon: <Iconify icon="solar:chart-bold" />,
    href: '/admin/schools/stats',
  },
];

export default function AdminView() {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentTab = () => {
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/schools/stats')) return 'stats';
    if (pathname.includes('/admin/schools')) return 'schools';
    return 'dashboard';
  };

  const handleTabChange = (event, newValue) => {
    const tab = TABS.find((t) => t.value === newValue);
    if (tab) {
      router.push(tab.href);
    }
  };

  const renderContent = () => {
    if (pathname === '/admin') {
      return <AdminDashboardView />;
    }
    if (pathname === '/admin/users') {
      return <UserListView />;
    }
    if (pathname === '/admin/users/create') {
      return <UserCreateView />;
    }
    if (pathname === '/admin/schools') {
      return <SchoolListView />;
    }
    if (pathname === '/admin/schools/stats') {
      return <SchoolStatsView />;
    }
    return <AdminDashboardView />;
  };

  return (
    <Box>
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1}>
          <Tabs value={getCurrentTab()} onChange={handleTabChange} sx={{ minHeight: 'auto' }}>
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 'auto', py: 1, px: 2 }}
              />
            ))}
          </Tabs>
        </Stack>
      </Card>

      {renderContent()}
    </Box>
  );
}
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { RouterLink } from 'src/routes/components';

import { useNotification } from 'src/hooks/useNotification';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDeleteDialog, ConfirmActionDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export default function AdminUsersView() {
  const { showApiResponse } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState('all'); // 'all' ou 'admins'
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null, loading: false });
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', user: null, loading: false });

  const loadUsers = async () => {
    setLoading(true);
    try {
      let result;
      
      if (currentTab === 'admins') {
        // Utiliser l'API spécifique pour les administrateurs
        result = await ConsumApi.getAdmins({
          page: page + 1,
          limit: rowsPerPage,
        });
        
        if (result.success) {
          // Adapter la structure de réponse si nécessaire
          setUsers(result.data.admins || result.data.users || result.data.data || []);
          setTotal(result.data.total || 0);
        }
      } else {
        // Utiliser l'API admin pour tous les utilisateurs
        result = await ConsumApi.getUsers({
          page: page + 1,
          limit: rowsPerPage,
        });
        
        if (result.success) {
          setUsers(result.data.users || []);
          setTotal(result.data.total || 0);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, currentTab]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0); // Réinitialiser la page lors du changement d'onglet
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = users.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDeleteClick = (user) => {
    setDeleteDialog({ open: true, user, loading: false });
  };

  const handleDeleteConfirm = async () => {
    const { user } = deleteDialog;
    setDeleteDialog({ ...deleteDialog, loading: true });
    
    try {
      const result = await ConsumApi.deleteUser(user.id);
      showApiResponse(result, {
        successTitle: 'Utilisateur supprimé',
        errorTitle: 'Erreur de suppression',
      });
      
      if (result.success) {
        setDeleteDialog({ open: false, user: null, loading: false });
        loadUsers();
      } else {
        setDeleteDialog({ ...deleteDialog, loading: false });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de la suppression' 
      }, {
        errorTitle: 'Erreur'
      });
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      handleDeleteClick(user);
    }
  };

  const handleActionClick = (type, user) => {
    setActionDialog({ open: true, type, user, loading: false });
  };

  const handleActionConfirm = async () => {
    const { type, user } = actionDialog;
    setActionDialog({ ...actionDialog, loading: true });
    
    try {
      let result;
      switch (type) {
        case 'togglePremium':
          result = await ConsumApi.updateUser(user.id, {
            premiumActive: !user.premiumActive
          });
          break;
        default:
          return;
      }
      
      showApiResponse(result, {
        successTitle: getActionText(type),
        errorTitle: 'Erreur lors de l\'action',
      });
      
      if (result.success) {
        setActionDialog({ open: false, type: '', user: null, loading: false });
        loadUsers();
      } else {
        setActionDialog({ ...actionDialog, loading: false });
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de l\'action' 
      }, {
        errorTitle: 'Erreur'
      });
      setActionDialog({ ...actionDialog, loading: false });
    }
  };

  const getActionText = (type) => {
    switch (type) {
      case 'togglePremium': return 'Statut premium modifié';
      default: return 'Action effectuée';
    }
  };

  const getActionMessage = (type, user) => {
    switch (type) {
      case 'togglePremium': 
        return user.premiumActive 
          ? `Êtes-vous sûr de vouloir désactiver le statut premium pour "${user.email}" ?`
          : `Êtes-vous sûr de vouloir activer le statut premium pour "${user.email}" ?`;
      default: return 'Êtes-vous sûr de vouloir effectuer cette action ?';
    }
  };

  const getActionTitle = (type) => {
    switch (type) {
      case 'togglePremium': return 'Modifier le statut premium';
      default: return 'Confirmer l\'action';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'togglePremium': return 'warning';
      default: return 'primary';
    }
  };

  const handleTogglePremium = (userId, currentStatus) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      handleActionClick('togglePremium', user);
    }
  };

  const isNotFound = !users.length && !loading;

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Gestion des Utilisateurs</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Gérez les utilisateurs de la plateforme
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          href="/admin/users/create"
          variant="contained"
          startIcon={<Iconify icon="solar:user-plus-bold" />}
        >
          Créer un utilisateur
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ px: 2.5, pt: 1 }}>
          <Tab
            value="all"
            label="Tous les utilisateurs"
            icon={<Iconify icon="solar:users-group-rounded-bold" />}
            iconPosition="start"
          />
          <Tab
            value="admins"
            label="Administrateurs"
            icon={<Iconify icon="solar:user-id-bold" />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < users.length}
                      checked={users.length > 0 && selected.length === users.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Premium</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((user) => (
                  <TableRow
                    hover
                    key={user.id}
                    selected={selected.indexOf(user.id) !== -1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.indexOf(user.id) !== -1}
                        onChange={(event) => handleClick(event, user.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" noWrap>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{user.email}</TableCell>

                    <TableCell>{user.phoneNumber || '-'}</TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          color: user.role === 'ADMIN' ? 'error.main' : 'success.main',
                          fontWeight: 'fontWeightSemiBold',
                        }}
                      >
                        {user.role}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          color: user.emailVerified ? 'success.main' : 'warning.main',
                          fontWeight: 'fontWeightSemiBold',
                        }}
                      >
                        {user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant={user.premiumActive ? 'contained' : 'outlined'}
                        color={user.premiumActive ? 'success' : 'default'}
                        onClick={() => handleTogglePremium(user.id, user.premiumActive)}
                      >
                        {user.premiumActive ? 'Actif' : 'Inactif'}
                      </Button>
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          component={RouterLink}
                          href={`/admin/users/${user.id}/edit`}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Supprimer">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {isNotFound && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Iconify 
                          icon={currentTab === 'admins' ? 'solar:user-id-bold' : 'solar:users-group-rounded-bold'} 
                          width={64} 
                          sx={{ color: 'text.disabled' }} 
                        />
                        <Typography variant="h6" color="text.secondary">
                          {currentTab === 'admins' ? 'Aucun administrateur trouvé' : 'Aucun utilisateur trouvé'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentTab === 'admins' 
                            ? 'Aucun administrateur n\'a été créé pour le moment.' 
                            : 'Aucun utilisateur n\'a été créé pour le moment.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
        itemName={deleteDialog.user?.email}
        loading={deleteDialog.loading}
      />

      <ConfirmActionDialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '', user: null, loading: false })}
        onConfirm={handleActionConfirm}
        title={getActionTitle(actionDialog.type)}
        message={actionDialog.user ? getActionMessage(actionDialog.type, actionDialog.user) : ''}
        itemName={actionDialog.user?.email}
        loading={actionDialog.loading}
        confirmText="Confirmer"
        confirmColor={getActionColor(actionDialog.type)}
        icon="eva:settings-2-fill"
      />
    </>
  );
}

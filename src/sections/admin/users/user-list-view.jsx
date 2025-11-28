import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function UserListView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [roleFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        role: roleFilter || undefined,
      });

      if (result.success) {
        setUsers(result.data.users || []);
        setTotal(result.data.total || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, roleFilter]);

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

  const handleDeleteUser = async (userId) => {
    try {
      const result = await ConsumApi.deleteUser(userId);
      if (result.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleTogglePremium = async (userId, currentStatus) => {
    try {
      const result = await ConsumApi.updateUser(userId, {
        premiumActive: !currentStatus,
      });
      if (result.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const isNotFound = !users.length && !loading;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Gestion des Utilisateurs</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Gérez les utilisateurs de la plateforme
        </Typography>
      </Box>

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
                  <TableRow hover key={user.id} selected={selected.indexOf(user.id) !== -1}>
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
                        <IconButton component={RouterLink} href={`/admin/users/${user.id}/edit`}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Supprimer">
                        <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
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
                    <TableCell colSpan={8} sx={{ py: 3 }}>
                      <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        Aucun utilisateur trouvé
                      </Typography>
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
    </>
  );
}

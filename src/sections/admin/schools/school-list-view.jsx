import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { RouterLink } from 'src/routes/components';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function SchoolListView() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [hasPaidFilter, setHasPaidFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // const confirm = useBoolean();

  const loadSchools = async () => {
    setLoading(true);
    try {
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      if (verifiedFilter !== '') filters.verified = verifiedFilter === 'true';
      if (hasPaidFilter !== '') filters.hasPaid = hasPaidFilter === 'true';
      if (regionFilter) filters.region = regionFilter;

      const result = await ConsumApi.getSchools(filters);
      
      if (result.success) {
        setSchools(result.data.schools || []);
        setTotal(result.data.total || 0);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [page, rowsPerPage, verifiedFilter, hasPaidFilter, regionFilter]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = schools.map((n) => n.id);
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

  const handleValidateSchool = async (schoolId) => {
    try {
      const result = await ConsumApi.validateSchool(schoolId);
      if (result.success) {
        loadSchools();
      }
    } catch (error) {
      console.error('Error validating school:', error);
    }
  };

  const handleRejectSchool = async (schoolId) => {
    try {
      const result = await ConsumApi.rejectSchool(schoolId);
      if (result.success) {
        loadSchools();
      }
    } catch (error) {
      console.error('Error rejecting school:', error);
    }
  };

  const handleTogglePremium = async (schoolId, currentStatus) => {
    try {
      if (currentStatus) {
        await ConsumApi.deactivateSchoolPremium(schoolId);
      } else {
        await ConsumApi.activateSchoolPremium(schoolId);
      }
      loadSchools();
    } catch (error) {
      console.error('Error toggling premium:', error);
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    try {
      const result = await ConsumApi.deleteSchool(schoolId);
      if (result.success) {
        loadSchools();
      }
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  };

  const isNotFound = !schools.length && !loading;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Gestion des Écoles</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Gérez les écoles de la plateforme
        </Typography>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Vérification</InputLabel>
            <Select
              value={verifiedFilter}
              label="Vérification"
              onChange={(e) => setVerifiedFilter(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="true">Vérifiées</MenuItem>
              <MenuItem value="false">Non vérifiées</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Premium</InputLabel>
            <Select
              value={hasPaidFilter}
              label="Premium"
              onChange={(e) => setHasPaidFilter(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="true">Payant</MenuItem>
              <MenuItem value="false">Gratuit</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Région"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            placeholder="Filtrer par région"
            sx={{ minWidth: 200 }}
          />
        </Stack>
      </Card>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < schools.length}
                      checked={schools.length > 0 && selected.length === schools.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>École</TableCell>
                  <TableCell>Région</TableCell>
                  <TableCell>Vérification</TableCell>
                  <TableCell>Premium</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {schools.map((school) => (
                  <TableRow
                    hover
                    key={school.id}
                    selected={selected.indexOf(school.id) !== -1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.indexOf(school.id) !== -1}
                        onChange={(event) => handleClick(event, school.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {school.logoUrl && (
                          <Box
                            component="img"
                            src={school.logoUrl}
                            sx={{ width: 40, height: 40, borderRadius: 1, mr: 2 }}
                          />
                        )}
                        <Box>
                          <Typography variant="subtitle2" noWrap>
                            {school.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {school.slogan}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {school.region}, {school.city}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={school.isVerified ? 'Vérifiée' : 'En attente'}
                        color={school.isVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={school.hasPaid ? 'Premium' : 'Gratuit'}
                        color={school.hasPaid ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        Créée le {new Date(school.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      {!school.isVerified && (
                        <>
                          <Tooltip title="Valider">
                            <IconButton
                              color="success"
                              onClick={() => handleValidateSchool(school.id)}
                            >
                              <Iconify icon="solar:check-circle-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeter">
                            <IconButton
                              color="error"
                              onClick={() => handleRejectSchool(school.id)}
                            >
                              <Iconify icon="solar:close-circle-bold" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      <Tooltip title="Toggle Premium">
                        <IconButton
                          color={school.hasPaid ? 'warning' : 'success'}
                          onClick={() => handleTogglePremium(school.id, school.hasPaid)}
                        >
                          <Iconify icon={school.hasPaid ? 'solar:star-bold' : 'solar:star-outline'} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Modifier">
                        <IconButton
                          component={RouterLink}
                          href={`/admin/schools/${school.id}/edit`}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Supprimer">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteSchool(school.id)}
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
                    <TableCell colSpan={7} sx={{ py: 3 }}>
                      <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        Aucune école trouvée
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
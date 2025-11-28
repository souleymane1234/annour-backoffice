import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import {
    Box,
    Card,
    Chip,
    Table,
    Stack,
    Alert,
    Button,
    Dialog,
    TableRow,
    Container,
    TableBody,
    TableCell,
    TableHead,
    TextField,
    Typography,
    IconButton,
    DialogTitle, DialogContent,
    DialogActions,
    TableContainer,
    InputAdornment,
    TablePagination
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import { fNumber } from 'src/utils/format-number';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function WebTVCategoriesView() {
  const router = useRouter();
  const { contextHolder, showApiResponse } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage, search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getWebTVCategories({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      
      console.log('API Response:', result); // Debug log
      
      const processedResult = showApiResponse(result, { showNotification: false });

      console.log('Processed Result:', processedResult); // Debug log

      if (processedResult.success) {
        // La structure de l'API est: { success, message, data: { data: [...], total, page, limit, totalPages } }
        const apiData = processedResult.data;
        setCategories(apiData.data || []);
        setTotal(apiData.total || 0);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement des catégories' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await ConsumApi.deleteWebTVCategory(deleteDialog.category.id);
      const processedResult = showApiResponse(result, { 
        successTitle: 'Suppression réussie',
        errorTitle: 'Erreur de suppression'
      });
      
      if (processedResult.success) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la suppression' });
    } finally {
      setDeleteDialog({ open: false, category: null });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            Chargement...
          </TableCell>
        </TableRow>
      );
    }

    if (categories.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            Aucune catégorie trouvée
          </TableCell>
        </TableRow>
      );
    }

    return categories.map((category) => (
      <TableRow key={category.id} hover>
        <TableCell>
          <Typography variant="subtitle2">{category.name}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {category.description || 'Aucune description'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={fNumber(category.videosCount || 0)}
            color="primary"
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              onClick={() => router.push(routesName.adminWebTVCategoryDetails.replace(':id', category.id))}
            >
              <Iconify icon="eva:eye-fill" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => router.push(routesName.adminWebTVCategoryEdit.replace(':id', category.id))}
            >
              <Iconify icon="eva:edit-fill" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteDialog({ open: true, category })}
            >
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <Helmet>
        <title>WebTV - Catégories</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Catégories WebTV</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(routesName.adminWebTVCategoryCreate)}
          >
            Nouvelle Catégorie
          </Button>
        </Stack>

        <Card>
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Nombre de Vidéos</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, category: null })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer la catégorie &quot;{deleteDialog.category?.name}&quot; ?
              {deleteDialog.category?.videosCount > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Cette catégorie contient {deleteDialog.category.videosCount} vidéo(s). 
                  La suppression ne sera possible que si elle ne contient aucune vidéo.
                </Alert>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, category: null })}>Annuler</Button>
            <Button onClick={handleDeleteCategory} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}

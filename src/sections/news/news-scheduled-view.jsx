import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { RouterLink } from 'src/routes/components';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function NewsScheduledView() {
  const navigate = useNavigate();
  const { contextHolder, showApiResponse, showError } = useNotification();
  
  const [scheduledNews, setScheduledNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', newsId: null });

  useEffect(() => {
    loadScheduledNews();
  }, []);

  const loadScheduledNews = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getScheduledNews();
      if (result.success) {
        setScheduledNews(result.data || []);
      }
    } catch (error) {
      console.error('Error loading scheduled news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = (id) => {
    setConfirmDialog({ open: true, type: 'publish', newsId: id });
  };

  const handleCancelSchedule = (id) => {
    setConfirmDialog({ open: true, type: 'cancel', newsId: id });
  };

  const handleConfirmAction = async () => {
    const { type, newsId } = confirmDialog;
    setConfirmDialog({ open: false, type: '', newsId: null });

    try {
      let result;
      if (type === 'publish') {
        result = await ConsumApi.moderateNews(newsId, 'PUBLISH');
        showApiResponse(result, {
          successTitle: 'Actualité publiée',
          errorTitle: 'Erreur de publication',
        });
      } else {
        result = await ConsumApi.updateNews(newsId, { publishedAt: null, isPublished: false });
        showApiResponse(result, {
          successTitle: 'Programmation annulée',
          errorTitle: 'Erreur d\'annulation',
        });
      }

      if (result.success) {
        loadScheduledNews();
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Erreur', 'Une erreur est survenue');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilPublish = (publishedAt) => {
    if (!publishedAt) return '';
    const now = new Date();
    const publishDate = new Date(publishedAt);
    const diff = publishDate - now;

    if (diff < 0) return 'En retard';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `Dans ${days}j ${hours}h`;
    if (hours > 0) return `Dans ${hours}h ${minutes}min`;
    return `Dans ${minutes} minutes`;
  };

  return (
    <>
      {contextHolder}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Actualités programmées</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Gérez les actualités avec une date de publication future
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(routesName.adminNews)}
          >
            Retour
          </Button>
          <Button
            component={RouterLink}
            href={routesName.adminNewsCreate}
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            Programmer une actualité
          </Button>
        </Box>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Titre</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Date de publication</TableCell>
                    <TableCell>Temps restant</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {scheduledNews.map((newsItem) => (
                    <TableRow hover key={newsItem.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {newsItem.mainImage && (
                            <Box
                              component="img"
                              src={newsItem.mainImage}
                              sx={{
                                width: 60,
                                height: 45,
                                objectFit: 'cover',
                                borderRadius: 1,
                              }}
                            />
                          )}
                          <Box>
                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 300 }}>
                              {newsItem.title}
                            </Typography>
                            {newsItem.summary && (
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                {newsItem.summary}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {newsItem.category?.name ? (
                          <Chip label={newsItem.category.name} size="small" color="primary" variant="outlined" />
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{formatDate(newsItem.publishedAt)}</Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getTimeUntilPublish(newsItem.publishedAt)}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton
                            component={RouterLink}
                            href={`${routesName.adminNews}/${newsItem.id}/edit`}
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Publier maintenant">
                          <IconButton
                            color="success"
                            onClick={() => handlePublishNow(newsItem.id)}
                          >
                            <Iconify icon="solar:check-circle-bold" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Annuler la programmation">
                          <IconButton
                            color="error"
                            onClick={() => handleCancelSchedule(newsItem.id)}
                          >
                            <Iconify icon="solar:close-circle-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {scheduledNews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Iconify icon="solar:calendar-bold" width={64} sx={{ mb: 2, color: 'text.secondary' }} />
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Aucune actualité programmée
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Les actualités avec une date de publication future apparaîtront ici
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', newsId: null })}
      >
        <DialogTitle>
          {confirmDialog.type === 'publish' ? 'Publier maintenant' : 'Annuler la programmation'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'publish'
              ? 'Voulez-vous publier cette actualité immédiatement ?'
              : 'Voulez-vous annuler la programmation de cette actualité ? Elle sera remise en brouillon.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', newsId: null })}>
            Annuler
          </Button>
          <Button onClick={handleConfirmAction} color="primary" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


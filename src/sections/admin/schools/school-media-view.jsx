import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import MuiCardActions from '@mui/material/CardActions';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import { useNotification } from 'src/hooks/useNotification';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import { ConfirmDeleteDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export default function SchoolMediaView() {
  const { id } = useParams();
  const { showApiResponse } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState([]);
  const [school, setSchool] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, mediaItem: null, loading: false });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image',
    url: '',
  });

  const mediaTypes = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Vidéo' },
    { value: 'document', label: 'Document' },
    { value: 'audio', label: 'Audio' },
  ];

  const loadSchoolMedia = async () => {
    setLoading(true);
    try {
      // Charger les détails de l'école
      const schoolResult = await ConsumApi.getSchoolById(id);
      if (schoolResult.success) {
        setSchool(schoolResult.data);
      }

      // Charger les médias de l'école
      const mediaResult = await ConsumApi.getSchoolMedia(id);
      
      if (mediaResult.success) {
        setMedia(mediaResult.data.media || []);
      } else {
        // Fallback vers des données mockées
        const mockMedia = [
          {
            id: 1,
            title: 'Campus principal',
            description: 'Vue panoramique du campus principal de l\'école',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-03-15T14:30:00Z',
            size: '2.5 MB',
            dimensions: '1920x1080',
          },
          {
            id: 2,
            title: 'Présentation de l\'école',
            description: 'Vidéo de présentation des programmes et de la vie étudiante',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            createdAt: '2024-01-20T09:00:00Z',
            updatedAt: '2024-03-10T11:15:00Z',
            size: '45.2 MB',
            duration: '3:45',
          },
          {
            id: 3,
            title: 'Brochure des programmes',
            description: 'Document PDF présentant tous les programmes disponibles',
            type: 'document',
            url: 'https://example.com/brochure.pdf',
            createdAt: '2024-02-01T08:30:00Z',
            updatedAt: '2024-03-05T16:45:00Z',
            size: '8.7 MB',
            pages: 24,
          },
          {
            id: 4,
            title: 'Hymne de l\'école',
            description: 'Hymne officiel de l\'école interprété par les étudiants',
            type: 'audio',
            url: 'https://example.com/hymne.mp3',
            createdAt: '2024-02-15T14:00:00Z',
            updatedAt: '2024-02-20T10:30:00Z',
            size: '4.1 MB',
            duration: '2:30',
          },
        ];
        setMedia(mockMedia);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
      // Données mockées en cas d'erreur
      const mockSchool = {
        id: parseInt(id, 10),
        name: 'École Supérieure de Commerce',
        region: 'Abidjan',
        city: 'Cocody',
      };
      setSchool(mockSchool);
      
      const mockMedia = [
        {
          id: 1,
          title: 'Campus principal',
          description: 'Vue panoramique du campus principal de l\'école',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-03-15T14:30:00Z',
          size: '2.5 MB',
          dimensions: '1920x1080',
        },
        {
          id: 2,
          title: 'Présentation de l\'école',
          description: 'Vidéo de présentation des programmes et de la vie étudiante',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-03-10T11:15:00Z',
          size: '45.2 MB',
          duration: '3:45',
        },
      ];
      setMedia(mockMedia);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSchoolMedia();
    }
  }, [id]);

  const handleOpenDialog = (mediaItem = null) => {
    if (mediaItem) {
      setEditingMedia(mediaItem);
      setFormData({
        title: mediaItem.title,
        description: mediaItem.description,
        type: mediaItem.type,
        url: mediaItem.url,
      });
    } else {
      setEditingMedia(null);
      setFormData({
        title: '',
        description: '',
        type: 'image',
        url: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedia(null);
    setFormData({
      title: '',
      description: '',
      type: 'image',
      url: '',
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSaveMedia = async () => {
    try {
      if (editingMedia) {
        // Mise à jour d'un média existant (non implémenté dans l'API)
        console.log('Mise à jour de média non implémentée');
      } else {
        // Création d'un nouveau média (non implémenté dans l'API)
        console.log('Création de média non implémentée');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du média:', error);
    }
  };

  const handleDeleteClick = (mediaItem) => {
    setDeleteDialog({ open: true, mediaItem, loading: false });
  };

  const handleDeleteConfirm = async () => {
    const { mediaItem } = deleteDialog;
    setDeleteDialog({ ...deleteDialog, loading: true });
    
    try {
      const result = await ConsumApi.deleteSchoolMedia(mediaItem.id);
      showApiResponse(result, {
        successTitle: 'Média supprimé',
        errorTitle: 'Erreur de suppression',
      });
      
      if (result.success) {
        setDeleteDialog({ open: false, mediaItem: null, loading: false });
        setMedia(prev => prev.filter(m => m.id !== mediaItem.id));
      } else {
        setDeleteDialog({ ...deleteDialog, loading: false });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du média:', error);
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de la suppression' 
      }, {
        errorTitle: 'Erreur'
      });
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    const mediaItem = media.find(m => m.id === mediaId);
    if (mediaItem) {
      handleDeleteClick(mediaItem);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':
        return 'solar:gallery-bold';
      case 'video':
        return 'solar:video-camera-bold';
      case 'document':
        return 'solar:document-bold';
      case 'audio':
        return 'solar:music-note-bold';
      default:
        return 'solar:file-bold';
    }
  };

  const getMediaColor = (type) => {
    switch (type) {
      case 'image':
        return 'primary';
      case 'video':
        return 'error';
      case 'document':
        return 'warning';
      case 'audio':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des médias...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            component={RouterLink}
            href={`/admin/schools/${id}`}
          >
            Retour
          </Button>
          <Typography variant="h4">
            Médias - {school?.name || 'École'}
          </Typography>
        </Stack>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {media.length} média(s) au total
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un média
          </Button>
        </Stack>
      </Box>

      {/* Liste des médias */}
      <Grid container spacing={3}>
        {media.map((mediaItem) => (
          <Grid item xs={12} sm={6} md={4} key={mediaItem.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {mediaItem.type === 'image' && (
                <CardMedia
                  component="img"
                  height="200"
                  image={mediaItem.url}
                  alt={mediaItem.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              
              {mediaItem.type !== 'image' && (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                  }}
                >
                  <Iconify
                    icon={getMediaIcon(mediaItem.type)}
                    width={64}
                    height={64}
                    color="grey.500"
                  />
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Chip
                    label={mediaItem.type}
                    size="small"
                    color={getMediaColor(mediaItem.type)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {mediaItem.size}
                  </Typography>
                </Stack>
                
                <Typography variant="h6" gutterBottom>
                  {mediaItem.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {mediaItem.description}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  {mediaItem.dimensions && (
                    <Typography variant="caption" color="text.secondary">
                      📐 {mediaItem.dimensions}
                    </Typography>
                  )}
                  {mediaItem.duration && (
                    <Typography variant="caption" color="text.secondary">
                      ⏱️ {mediaItem.duration}
                    </Typography>
                  )}
                  {mediaItem.pages && (
                    <Typography variant="caption" color="text.secondary">
                      📄 {mediaItem.pages} pages
                    </Typography>
                  )}
                </Stack>
                
                <Typography variant="caption" color="text.secondary">
                  Ajouté le {new Date(mediaItem.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <MuiCardActions>
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:eye-bold" />}
                  onClick={() => window.open(mediaItem.url, '_blank')}
                >
                  Voir
                </Button>
                
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  onClick={() => handleOpenDialog(mediaItem)}
                >
                  Modifier
                </Button>
                
                <Tooltip title="Supprimer">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteMedia(mediaItem.id)}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              </MuiCardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {media.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Iconify icon="solar:gallery-bold" width={64} height={64} color="grey.400" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Aucun média trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Commencez par ajouter des médias pour cette école
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un média
          </Button>
        </Box>
      )}

      {/* Dialog d'édition/création */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMedia ? 'Modifier le média' : 'Ajouter un média'}
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Titre du média"
              value={formData.title}
              onChange={handleInputChange('title')}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange('description')}
            />
            
            <FormControl fullWidth>
              <InputLabel>Type de média</InputLabel>
              <Select
                value={formData.type}
                label="Type de média"
                onChange={handleInputChange('type')}
              >
                {mediaTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="URL du média"
              value={formData.url}
              onChange={handleInputChange('url')}
              placeholder="https://example.com/media.jpg"
              required
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveMedia}
            disabled={!formData.title || !formData.url}
          >
            {editingMedia ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, mediaItem: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le média"
        message="Êtes-vous sûr de vouloir supprimer ce média ?"
        itemName={deleteDialog.mediaItem?.title}
        loading={deleteDialog.loading}
      />
    </Box>
  );
}

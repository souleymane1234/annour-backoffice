import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useNotification } from 'src/hooks/useNotification';

import { uploadFile, uploadImage, uploadVideo, getFileType, formatFileSize } from 'src/utils/upload-media';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// Helper functions to extract video IDs and create embed URLs
const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getVimeoVideoId = (url) => {
  if (!url) return null;
  
  // Pattern for player.vimeo.com/video/123456789
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) return playerMatch[1];
  
  // Pattern for vimeo.com/123456789
  const directMatch = url.match(/vimeo\.com\/(\d+)/);
  if (directMatch) return directMatch[1];
  
  // Pattern for vimeo.com/channels/channelname/123456789
  const channelMatch = url.match(/vimeo\.com\/channels\/[^/]+\/(\d+)/);
  if (channelMatch) return channelMatch[1];
  
  // Pattern for vimeo.com/groups/groupname/videos/123456789
  const groupMatch = url.match(/vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/);
  if (groupMatch) return groupMatch[1];
  
  // Pattern for vimeo.com/ondemand/name/123456789
  const ondemandMatch = url.match(/vimeo\.com\/ondemand\/[^/]+\/(\d+)/);
  if (ondemandMatch) return ondemandMatch[1];
  
  return null;
};

const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  
  // Check if it's YouTube
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }
  
  // Check if it's Vimeo
  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }
  
  // If not YouTube or Vimeo, it's a direct video URL (will use HTML5 player)
  return null;
};

const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
};

const MEDIA_TYPE_LABELS = {
  IMAGE: 'Image',
  VIDEO: 'Vidéo',
  DOCUMENT: 'Document',
};

const MEDIA_TYPE_ICONS = {
  IMAGE: 'solar:gallery-bold',
  VIDEO: 'solar:videocamera-bold',
  DOCUMENT: 'solar:document-text-bold',
};

const getAcceptType = (mediaType) => {
  if (mediaType === 'IMAGE') return 'image/*';
  if (mediaType === 'VIDEO') return 'video/*';
  return '*/*';
};

export default function NewsMediaView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { contextHolder, showError, showApiResponse } = useNotification();

  const [news, setNews] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', mediaId: null });
  const [editingMedia, setEditingMedia] = useState(null);
  const [mediaType, setMediaType] = useState('IMAGE');
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Bulk media
  const [bulkMediaType, setBulkMediaType] = useState('IMAGE');
  const [bulkFiles, setBulkFiles] = useState([]);

  useEffect(() => {
    loadNews();
    loadMedia();
  }, [id]);

  const loadNews = async () => {
    try {
      const result = await ConsumApi.getNewsById(id);
      if (result.success) {
        setNews(result.data);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getNewsMediaByNewsId(id);
      if (result.success) {
        setMediaList(result.data || []);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (media = null) => {
    setEditingMedia(media);
    setMediaType(media?.type || 'IMAGE');
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedia(null);
    setMediaType('IMAGE');
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect media type from file
      const fileType = getFileType(file);
      if (fileType === 'image') {
        setMediaType('IMAGE');
      } else if (fileType === 'video') {
        setMediaType('VIDEO');
      } else {
        setMediaType('DOCUMENT');
      }
    }
  };

  const handleBulkFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setBulkFiles(files);
      // Auto-detect media type from first file
      const fileType = getFileType(files[0]);
      if (fileType === 'image') {
        setBulkMediaType('IMAGE');
      } else if (fileType === 'video') {
        setBulkMediaType('VIDEO');
      } else {
        setBulkMediaType('DOCUMENT');
      }
    }
  };

  const handleSaveMedia = async () => {
    // Require file selection
    if (!selectedFile) {
      showError('Erreur', 'Veuillez sélectionner un fichier');
      return;
    }

    setSaving(true);
    setUploading(true);

    try {
      // Upload file using the appropriate function based on media type
      let uploadResult;
      if (mediaType === 'IMAGE') {
        uploadResult = await uploadImage(selectedFile);
      } else if (mediaType === 'VIDEO') {
        uploadResult = await uploadVideo(selectedFile);
      } else {
        uploadResult = await uploadFile(selectedFile);
      }
      
      if (!uploadResult.success) {
        showApiResponse(uploadResult, {
          errorTitle: 'Erreur d\'upload',
        });
        return;
      }
      
      // Use the URL returned by the utility
      const finalUrl = uploadResult.url;
      
      if (!finalUrl) {
        showError('Erreur', 'L\'URL du fichier uploadé n\'a pas été retournée');
        return;
      }

      let result;
      if (editingMedia) {
        result = await ConsumApi.updateNewsMedia(editingMedia.id, finalUrl, mediaType);
        showApiResponse(result, {
          successTitle: 'Média modifié',
          errorTitle: 'Erreur de modification',
        });
      } else {
        result = await ConsumApi.addNewsMedia(id, finalUrl, mediaType);
        showApiResponse(result, {
          successTitle: 'Média ajouté',
          errorTitle: 'Erreur d\'ajout',
        });
      }

      if (result.success) {
        loadMedia();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving media:', error);
      showError('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleOpenBulkDialog = () => {
    setBulkMediaType('IMAGE');
    setBulkFiles([]);
    setOpenBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
    setBulkMediaType('IMAGE');
    setBulkFiles([]);
  };

  const handleSaveBulkMedia = async () => {
    // Require files selection
    if (bulkFiles.length === 0) {
      showError('Erreur', 'Veuillez sélectionner des fichiers');
      return;
    }

    setSaving(true);
    setUploading(true);
    
    try {
      // Upload files using the appropriate function based on media type
      const uploadPromises = bulkFiles.map((file) => {
        if (bulkMediaType === 'IMAGE') {
          return uploadImage(file);
        }
        if (bulkMediaType === 'VIDEO') {
          return uploadVideo(file);
        }
        return uploadFile(file);
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      
      // Check if all uploads succeeded
      const allSuccess = uploadResults.every((result) => result.success);
      const urls = uploadResults
        .filter((result) => result.success && result.url)
        .map((result) => result.url);
      
      if (!allSuccess || urls.length === 0) {
        const failedCount = uploadResults.filter((result) => !result.success).length;
        showError('Erreur d\'upload', `${urls.length} fichier(s) uploadé(s), ${failedCount} échec(s)`);
        return;
      }
      
      // Use the URLs returned by the utility
      const mediaItems = urls.map((url) => ({
        url,
        type: bulkMediaType,
      }));

      const result = await ConsumApi.addNewsMediaBulk(id, mediaItems);
      showApiResponse(result, {
        successTitle: 'Médias ajoutés',
        errorTitle: 'Erreur d\'ajout en masse',
      });

      if (result.success) {
        loadMedia();
        handleCloseBulkDialog();
      }
    } catch (error) {
      console.error('Error saving bulk media:', error);
      showError('Erreur', 'Une erreur est survenue lors de l\'ajout des médias');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDeleteMedia = (mediaId) => {
    setConfirmDialog({ open: true, type: 'single', mediaId });
  };

  const handleDeleteAllMedia = () => {
    setConfirmDialog({ open: true, type: 'all', mediaId: null });
  };

  const handleConfirmDelete = async () => {
    const { type, mediaId } = confirmDialog;
    setConfirmDialog({ open: false, type: '', mediaId: null });
    setDeleting(true);

    try {
      let result;
      if (type === 'single') {
        result = await ConsumApi.deleteNewsMedia(mediaId);
        showApiResponse(result, {
          successTitle: 'Média supprimé',
          errorTitle: 'Erreur de suppression',
        });
      } else {
        result = await ConsumApi.deleteAllNewsMedia(id);
        showApiResponse(result, {
          successTitle: 'Tous les médias supprimés',
          errorTitle: 'Erreur de suppression',
        });
      }

      if (result.success) {
        await loadMedia();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      showError('Erreur', 'Une erreur est survenue lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const renderMediaPreview = (media) => {
    if (media.type === 'IMAGE') {
      return (
        <Box
          component="img"
          src={media.url}
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            borderRadius: 1,
          }}
          onError={(e) => {
            e.target.src = '/assets/placeholder.svg';
          }}
        />
      );
    }

    if (media.type === 'VIDEO') {
      const embedUrl = getVideoEmbedUrl(media.url);

      if (embedUrl) {
        // YouTube or Vimeo embed
        return (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: 1,
            }}
          >
            <Box
              component="iframe"
              src={embedUrl}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        );
      }

      // Direct video URL - use HTML5 video player
      return (
        <Box
          sx={{
            width: '100%',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'grey.900',
          }}
        >
          <Box
            component="video"
            src={media.url}
            controls
            sx={{
              width: '100%',
              height: 200,
              display: 'block',
            }}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          borderRadius: 1,
        }}
      >
        <Iconify icon="solar:document-text-bold" width={64} />
      </Box>
    );
  };

  if (loading && !news) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {contextHolder}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Gestion des médias</Typography>
          {news && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {news.title}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(routesName.adminNews)}
          >
            Retour
          </Button>
          {mediaList.length > 0 && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={handleDeleteAllMedia}
              disabled={deleting}
            >
              Tout supprimer
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
            onClick={handleOpenBulkDialog}
          >
            Ajout en masse
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un média
          </Button>
        </Box>
      </Box>

      {(loading || deleting) ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 300, gap: 2 }}>
          <CircularProgress />
          {deleting && (
            <Typography variant="body2" color="text.secondary">
              Suppression en cours...
            </Typography>
          )}
        </Box>
      ) : (
        <>
          {mediaList.length === 0 ? (
            <Card sx={{ p: 5, textAlign: 'center' }}>
              <Iconify icon="solar:gallery-bold" width={64} sx={{ mb: 2, color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Aucun média
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Commencez par ajouter des images, vidéos ou documents
              </Typography>
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => handleOpenDialog()}
              >
                Ajouter un média
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {mediaList.map((media) => (
                <Grid item xs={12} sm={6} md={4} key={media.id}>
                  <Card sx={{ p: 2 }}>
                    {renderMediaPreview(media)}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={<Iconify icon={MEDIA_TYPE_ICONS[media.type]} />}
                        label={MEDIA_TYPE_LABELS[media.type]}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Box>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => handleOpenDialog(media)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteMedia(media.id)}
                            disabled={deleting}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {media.url}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Add/Edit Media Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMedia ? 'Modifier le média' : 'Ajouter un média'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                {editingMedia ? 'Changer le fichier' : 'Sélectionner un fichier'}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
                fullWidth
              >
                {selectedFile ? selectedFile.name : 'Choisir un fichier'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept={getAcceptType(mediaType)}
                />
              </Button>
              {selectedFile && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon={MEDIA_TYPE_ICONS[mediaType]} width={20} />
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setSelectedFile(null)}
                    sx={{ ml: 'auto' }}
                  >
                    Retirer
                  </Button>
                </Box>
              )}
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Type de média</InputLabel>
              <Select
                value={mediaType}
                label="Type de média"
                onChange={(e) => setMediaType(e.target.value)}
              >
                <MenuItem value={MEDIA_TYPES.IMAGE}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={MEDIA_TYPE_ICONS.IMAGE} />
                    Image
                  </Box>
                </MenuItem>
                <MenuItem value={MEDIA_TYPES.VIDEO}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={MEDIA_TYPE_ICONS.VIDEO} />
                    Vidéo
                  </Box>
                </MenuItem>
                <MenuItem value={MEDIA_TYPES.DOCUMENT}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={MEDIA_TYPE_ICONS.DOCUMENT} />
                    Document
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSaveMedia}
            variant="contained"
            disabled={!selectedFile || saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {(() => {
              if (uploading) return 'Upload en cours...';
              if (saving) return 'Enregistrement...';
              return 'Enregistrer';
            })()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Add Media Dialog */}
      <Dialog open={openBulkDialog} onClose={handleCloseBulkDialog} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter plusieurs médias</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Sélectionner des fichiers
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
                fullWidth
              >
                {bulkFiles.length > 0 ? `${bulkFiles.length} fichier(s) sélectionné(s)` : 'Choisir des fichiers'}
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleBulkFileChange}
                  accept={getAcceptType(bulkMediaType)}
                />
              </Button>
              {bulkFiles.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {bulkFiles.length} fichier(s) sélectionné(s)
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                    {bulkFiles.map((file, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Iconify icon={MEDIA_TYPE_ICONS[bulkMediaType]} width={16} />
                        <Typography variant="caption" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setBulkFiles([])}
                    sx={{ mt: 1 }}
                  >
                    Retirer tous les fichiers
                  </Button>
                </Box>
              )}
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Type de média (pour tous)</InputLabel>
              <Select
                value={bulkMediaType}
                label="Type de média (pour tous)"
                onChange={(e) => setBulkMediaType(e.target.value)}
              >
                <MenuItem value={MEDIA_TYPES.IMAGE}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={MEDIA_TYPE_ICONS.IMAGE} />
                    Images
                  </Box>
                </MenuItem>
                <MenuItem value={MEDIA_TYPES.VIDEO}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={MEDIA_TYPE_ICONS.VIDEO} />
                    Vidéos
                  </Box>
                </MenuItem>
                <MenuItem value={MEDIA_TYPES.DOCUMENT}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={MEDIA_TYPE_ICONS.DOCUMENT} />
                    Documents
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                💡 Astuce : Sélectionnez les fichiers à uploader. L&apos;URL sera automatiquement récupérée après l&apos;upload.
                {bulkFiles.length > 0 && ` ${bulkFiles.length} fichier(s) sélectionné(s).`}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDialog}>Annuler</Button>
          <Button
            onClick={handleSaveBulkMedia}
            variant="contained"
            disabled={bulkFiles.length === 0 || saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Iconify icon="solar:upload-minimalistic-bold" />}
          >
            {(() => {
              if (uploading) return 'Upload en cours...';
              if (saving) return 'Enregistrement...';
              return 'Ajouter tous les médias';
            })()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', mediaId: null })}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'all'
              ? 'Êtes-vous sûr de vouloir supprimer TOUS les médias de cette actualité ? Cette action est irréversible.'
              : 'Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', mediaId: null })}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


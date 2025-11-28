import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import {
  Box,
  Card,
  Stack,
  Button,
  Select,
  Switch,
  MenuItem,
  Container,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import { uploadVideo, uploadImage } from 'src/utils/upload-media';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

// ----------------------------------------------------------------------

export default function WebTVVideoEditView() {
  const router = useRouter();
  const { id } = useParams();
  const { contextHolder, showApiResponse } = useNotification();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    sourceType: 'YOUTUBE',
    categoryId: '',
    premiumRequired: false,
    status: 'EN_ATTENTE',
    duration: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchVideo();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const result = await ConsumApi.getWebTVCategories({ limit: 100 });
      const processedResult = showApiResponse(result, { showNotification: false });
      if (processedResult.success) {
        const apiData = processedResult.data;
        setCategories(apiData.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement des catégories' });
    }
  };

  const fetchVideo = async () => {
    try {
      setInitialLoading(true);
      const result = await ConsumApi.getWebTVVideoById(id);
      const processedResult = showApiResponse(result, { showNotification: false });
      
      if (processedResult.success) {
        const video = processedResult.data;
        setFormData({
          title: video.title || '',
          description: video.description || '',
          url: video.url || '',
          thumbnailUrl: video.thumbnailUrl || '',
          sourceType: video.sourceType || 'YOUTUBE',
          categoryId: video.categoryId || '',
          premiumRequired: video.premiumRequired || false,
          status: video.status || 'EN_ATTENTE',
          duration: video.duration ? video.duration.toString() : '',
          tags: video.tags ? video.tags.join(', ') : '',
        });
      } else {
        showApiResponse({ success: false, message: 'Vidéo non trouvée' });
        setTimeout(() => {
          router.push(routesName.adminWebTVVideos);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement' });
      setTimeout(() => {
        router.push(routesName.adminWebTVVideos);
      }, 2000);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    // Si on change le type de source vers autre chose que UPLOAD, réinitialiser le fichier sélectionné
    if (field === 'sourceType' && value !== 'UPLOAD') {
      setSelectedFile(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      showApiResponse({ 
        success: false, 
        message: 'Veuillez sélectionner un fichier vidéo valide' 
      });
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      sourceType: 'UPLOAD',
    }));
  };

  const handleThumbnailFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showApiResponse({ 
        success: false, 
        message: 'Veuillez sélectionner un fichier image valide' 
      });
      event.target.value = '';
      return;
    }

    setSelectedThumbnailFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.title.trim()) {
      showApiResponse({ success: false, message: 'Le titre de la vidéo est requis' });
      return;
    }

    if (!formData.categoryId) {
      showApiResponse({ success: false, message: 'La catégorie est requise' });
      return;
    }

    // Si c'est un upload direct, vérifier qu'un fichier est sélectionné ou qu'une URL existe déjà
    if (formData.sourceType === 'UPLOAD') {
      if (!selectedFile && !formData.url.trim()) {
        showApiResponse({ success: false, message: 'Veuillez sélectionner une nouvelle vidéo ou conserver l\'URL actuelle' });
        return;
      }
    } else if (!formData.url.trim()) {
      // Si ce n'est pas un upload, vérifier qu'une URL est fournie
      showApiResponse({ success: false, message: 'L\'URL de la vidéo est requise' });
      return;
    }

    try {
      setLoading(true);
      let videoUrl = formData.url.trim();
      let thumbnailUrl = formData.thumbnailUrl.trim();

      // Si c'est un upload direct et qu'un nouveau fichier est sélectionné, uploader le fichier d'abord
      if (formData.sourceType === 'UPLOAD' && selectedFile) {
        const uploadResult = await uploadVideo(selectedFile);
        
        if (!uploadResult.success || !uploadResult.url) {
          showApiResponse({ 
            success: false, 
            message: uploadResult.message || 'Erreur lors de l\'upload de la vidéo',
            errors: uploadResult.errors || []
          });
          setLoading(false);
          return;
        }
        
        videoUrl = uploadResult.url;
      }

      // Si un nouveau fichier de miniature est sélectionné, uploader le fichier
      if (selectedThumbnailFile) {
        const thumbnailUploadResult = await uploadImage(selectedThumbnailFile);
        
        if (!thumbnailUploadResult.success || !thumbnailUploadResult.url) {
          showApiResponse({ 
            success: false, 
            message: thumbnailUploadResult.message || 'Erreur lors de l\'upload de la miniature',
            errors: thumbnailUploadResult.errors || []
          });
          setLoading(false);
          return;
        }
        
        thumbnailUrl = thumbnailUploadResult.url;
      }

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        url: videoUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        sourceType: formData.sourceType,
        categoryId: formData.categoryId,
        premiumRequired: formData.premiumRequired,
        status: formData.status,
        duration: formData.duration ? parseInt(formData.duration, 10) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
      };

      const result = await ConsumApi.updateWebTVVideo(id, submitData);
      const processedResult = showApiResponse(result, { 
        successTitle: 'Modification réussie',
        errorTitle: 'Erreur de modification'
      });

      if (processedResult.success) {
        setTimeout(() => {
          router.push(routesName.adminWebTVVideos);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating video:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la modification' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>WebTV - Modifier Vidéo</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Modifier la Vidéo WebTV
        </Typography>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Titre de la vidéo"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  required
                  helperText="Le titre de la vidéo est requis"
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={4}
                  helperText="Description optionnelle de la vidéo"
                />

                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="thumbnail-upload-input"
                    type="file"
                    onChange={handleThumbnailFileSelect}
                    disabled={loading}
                  />
                  <label htmlFor="thumbnail-upload-input">
                    <Button
                      variant="outlined"
                      component="span"
                      disabled={loading}
                      fullWidth
                    >
                      {selectedThumbnailFile ? `Nouvelle miniature sélectionnée: ${selectedThumbnailFile.name}` : 'Sélectionner une nouvelle miniature'}
                    </Button>
                  </label>
                  {selectedThumbnailFile && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      La nouvelle miniature sera uploadée lors de l&apos;enregistrement
                    </Typography>
                  )}
                  {!selectedThumbnailFile && (
                    <TextField
                      fullWidth
                      label="URL de la miniature (optionnel)"
                      value={formData.thumbnailUrl}
                      onChange={handleInputChange('thumbnailUrl')}
                      helperText="Ou entrez une URL d'image directement"
                      disabled={loading}
                      sx={{ mt: 2 }}
                    />
                  )}
                  {formData.thumbnailUrl && !selectedThumbnailFile && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      URL actuelle: {formData.thumbnailUrl}
                    </Typography>
                  )}
                </Box>

                {formData.sourceType !== 'UPLOAD' ? (
                  <TextField
                    fullWidth
                    label="URL de la vidéo"
                    value={formData.url}
                    onChange={handleInputChange('url')}
                    required
                    helperText="URL YouTube, Vimeo ou lien direct vers la vidéo"
                    disabled={loading}
                  />
                ) : (
                  <Box>
                    <input
                      accept="video/*"
                      style={{ display: 'none' }}
                      id="video-upload-input"
                      type="file"
                      onChange={handleFileSelect}
                      disabled={loading}
                    />
                    <label htmlFor="video-upload-input">
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={loading}
                        fullWidth
                      >
                        {selectedFile ? `Nouveau fichier sélectionné: ${selectedFile.name}` : 'Sélectionner une nouvelle vidéo'}
                      </Button>
                    </label>
                    {selectedFile && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        La nouvelle vidéo sera uploadée lors de l&apos;enregistrement
                      </Typography>
                    )}
                    {formData.url && !selectedFile && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        URL actuelle: {formData.url}
                      </Typography>
                    )}
                  </Box>
                )}

                <FormControl fullWidth required>
                  <InputLabel>Type de source</InputLabel>
                  <Select
                    value={formData.sourceType}
                    onChange={handleInputChange('sourceType')}
                    label="Type de source"
                  >
                    <MenuItem value="YOUTUBE">YouTube</MenuItem>
                    <MenuItem value="VIMEO">Vimeo</MenuItem>
                    <MenuItem value="UPLOAD">Upload direct</MenuItem>
                    <MenuItem value="AUTRE">Autre</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={handleInputChange('categoryId')}
                    label="Catégorie"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    label="Statut"
                  >
                    <MenuItem value="EN_ATTENTE">En attente</MenuItem>
                    <MenuItem value="EN_LIGNE">En ligne</MenuItem>
                    <MenuItem value="HORS_LIGNE">Hors ligne</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Durée (en secondes)"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange('duration')}
                  helperText="Durée optionnelle de la vidéo en secondes"
                />

                <TextField
                  fullWidth
                  label="Tags"
                  value={formData.tags}
                  onChange={handleInputChange('tags')}
                  helperText="Tags séparés par des virgules (ex: javascript, tutoriel, programmation)"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.premiumRequired}
                      onChange={handleInputChange('premiumRequired')}
                    />
                  }
                  label="Vidéo premium requise"
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push(routesName.adminWebTVVideos)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      loading ||
                      !formData.title.trim() ||
                      !formData.categoryId ||
                      (formData.sourceType === 'UPLOAD'
                        ? !selectedFile && !formData.url.trim()
                        : !formData.url.trim())
                    }
                  >
                    {loading ? 'Modification...' : 'Modifier la Vidéo'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>

      </Container>
    </>
  );
}

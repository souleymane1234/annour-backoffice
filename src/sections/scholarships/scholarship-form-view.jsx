import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import {
    Box,
    Card,
    Alert,
    Stack,
    Button,
    Dialog,
    Select,
    MenuItem,
    Container,
    TextField,
    InputLabel,
    Typography,
    Breadcrumbs,
    DialogTitle,
    FormControl,
    DialogActions,
    DialogContent,
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'OUVERTE', label: 'Ouverte' },
  { value: 'FERMEE', label: 'Fermée' },
  { value: 'EN_ATTENTE', label: 'En attente' },
];

// ----------------------------------------------------------------------

export default function ScholarshipFormView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showApiResponse, showWarning, contextHolder } = useNotification();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    hostCountry: '',
    description: '',
    dateLimite: null,
    status: 'OUVERTE',
  });
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '' });

  useEffect(() => {
    if (isEdit) {
      fetchScholarship();
    }
  }, [id]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getScholarshipById(id);
      
      if (result.success) {
        const scholarship = result.data;
        setFormData({
          title: scholarship.title || '',
          hostCountry: scholarship.hostCountry || '',
          description: scholarship.description || '',
          dateLimite: scholarship.dateLimite ? new Date(scholarship.dateLimite) : null,
          status: scholarship.status || 'OUVERTE',
        });
      } else {
        showApiResponse(result, { 
          errorTitle: 'Erreur de chargement',
          successTitle: 'Chargement réussi'
        });
        navigate(routesName.adminScholarships);
      }
    } catch (error) {
      showApiResponse({ success: false, message: 'Erreur lors du chargement de la bourse' }, {
        errorTitle: 'Erreur de chargement'
      });
      navigate(routesName.adminScholarships);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateLimite: date,
    });
    if (errors.dateLimite) {
      setErrors({
        ...errors,
        dateLimite: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.hostCountry.trim()) {
      newErrors.hostCountry = 'Le pays d\'accueil est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.dateLimite) {
      newErrors.dateLimite = 'La date limite est requise';
    } else if (formData.dateLimite < new Date()) {
      newErrors.dateLimite = 'La date limite doit être dans le futur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showWarning('Attention', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setConfirmDialog({ open: true, type: 'submit' });
  };

  const handleConfirmSubmit = async () => {
    if (loading) return; // Empêcher les soumissions multiples
    
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        dateLimite: formData.dateLimite.toISOString(),
      };

      let result;
      if (isEdit) {
        result = await ConsumApi.updateScholarship(id, submitData);
      } else {
        result = await ConsumApi.createScholarship(submitData);
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        navigate(routesName.adminScholarships);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: `Erreur lors de la ${isEdit ? 'modification' : 'création'} de la bourse` 
      }, {
        errorTitle: 'Erreur'
      });
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, type: '' });
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.hostCountry || formData.description) {
      setConfirmDialog({ open: true, type: 'cancel' });
    } else {
      navigate(routesName.adminScholarships);
    }
  };

  const handleConfirmCancel = () => {
    navigate(routesName.adminScholarships);
  };

  const getButtonText = () => {
    if (loading) return 'Enregistrement...';
    return isEdit ? 'Modifier la bourse' : 'Créer la bourse';
  };

  const getConfirmButtonText = () => {
    if (loading) return 'Traitement...';
    return confirmDialog.type === 'submit' ? 'Confirmer' : 'Quitter';
  };

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Modifier la Bourse' : 'Nouvelle Bourse'}</title>
      </Helmet>
      {contextHolder}

      <Container maxWidth="md">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              {isEdit ? 'Modifier la Bourse' : 'Nouvelle Bourse'}
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bourses et Études
              </Typography>
              <Typography variant="body2" color="text.primary">
                {isEdit ? 'Modifier' : 'Nouvelle Bourse'}
              </Typography>
            </Breadcrumbs>
          </div>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCancel}
          >
            Retour
          </Button>
        </Stack>

        <Card>
          <Box sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Titre de la bourse */}
                <TextField
                  fullWidth
                  label="Titre de la bourse"
                  value={formData.title}
                  onChange={handleChange('title')}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                  required
                  placeholder="Ex: Bourse d'excellence pour études en France"
                />

                {/* Pays d'accueil */}
                <TextField
                  fullWidth
                  label="Pays d'accueil"
                  value={formData.hostCountry}
                  onChange={handleChange('hostCountry')}
                  error={Boolean(errors.hostCountry)}
                  helperText={errors.hostCountry}
                  required
                  placeholder="Ex: France, Canada, Allemagne..."
                />

                {/* Statut */}
                <FormControl fullWidth required error={Boolean(errors.status)}>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleChange('status')}
                    label="Statut"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Date limite */}
                <TextField
                  fullWidth
                  label="Date limite de candidature"
                  type="datetime-local"
                  value={formData.dateLimite ? formData.dateLimite.toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleDateChange(new Date(e.target.value))}
                  error={Boolean(errors.dateLimite)}
                  helperText={errors.dateLimite}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                {/* Description */}
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Description de la bourse"
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                  required
                  placeholder="Décrivez la bourse, les critères d'éligibilité, les avantages offerts, les documents requis..."
                />

                {/* Information */}
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Conseils pour une bonne description :</strong>
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    • Incluez les critères d&apos;éligibilité (niveau d&apos;études, âge, nationalité...)<br/>
                    • Détaillez les avantages offerts (montant, logement, transport...)<br/>
                    • Listez les documents requis (CV, lettres de recommandation...)<br/>
                    • Mentionnez la durée et les conditions de la bourse
                  </Typography>
                </Alert>

                {/* Boutons d'action */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                    startIcon={<Iconify icon="eva:arrow-back-fill" />}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<Iconify icon="eva:save-fill" />}
                  >
                    {getButtonText()}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Card>

        {/* Dialog de confirmation */}
        <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: '' })}>
          <DialogTitle>
            {confirmDialog.type === 'submit' && 'Confirmer la création'}
            {confirmDialog.type === 'cancel' && 'Annuler les modifications'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.type === 'submit' && 
                `Êtes-vous sûr de vouloir ${isEdit ? 'modifier' : 'créer'} cette bourse ?`
              }
              {confirmDialog.type === 'cancel' && 
                'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?'
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, type: '' })}>
              Annuler
            </Button>
            <Button 
              onClick={confirmDialog.type === 'submit' ? handleConfirmSubmit : handleConfirmCancel}
              variant="contained"
              color={confirmDialog.type === 'cancel' ? 'error' : 'primary'}
              disabled={loading}
            >
              {getConfirmButtonText()}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

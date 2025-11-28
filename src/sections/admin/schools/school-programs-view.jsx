import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';

import { RouterLink } from 'src/routes/components';

import { useNotification } from 'src/hooks/useNotification';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDeleteDialog, ConfirmActionDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export default function SchoolProgramsView() {
  const { id } = useParams();
  const { showApiResponse } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [school, setSchool] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, program: null, loading: false });
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', program: null, loading: false });
  const [formData, setFormData] = useState({
    programName: '',
    description: '',
    level: '',
    duration: '',
    isActive: true,
  });

  const levels = [
    'Certificat',
    'Licence',
    'Master',
    'Doctorat',
  ];

  const durations = [
    '6 mois',
    '1 an',
    '2 ans',
    '3 ans',
    '4 ans',
    '5 ans',
  ];

  const loadSchoolPrograms = async () => {
    setLoading(true);
    try {
      // Charger les détails de l'école
      const schoolResult = await ConsumApi.getSchoolById(id);
      if (schoolResult.success) {
        setSchool(schoolResult.data);
      }

      // Charger les programmes de l'école
      const programsResult = await ConsumApi.getSchoolPrograms(id);
      
      if (programsResult.success) {
        setPrograms(programsResult.data.programs || []);
      } else {
        // Fallback vers des données mockées
        const mockPrograms = [
          {
            id: 1,
            programName: 'Master en Management',
            description: 'Formation complète en management d\'entreprise avec focus sur le leadership et la stratégie.',
            level: 'Master',
            duration: '2 ans',
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-03-15T14:30:00Z',
            studentsCount: 320,
            averageRating: 4.8,
          },
          {
            id: 2,
            programName: 'Licence en Marketing',
            description: 'Formation en marketing digital et traditionnel, communication et publicité.',
            level: 'Licence',
            duration: '3 ans',
            isActive: true,
            createdAt: '2024-01-20T09:00:00Z',
            updatedAt: '2024-03-10T11:15:00Z',
            studentsCount: 280,
            averageRating: 4.6,
          },
          {
            id: 3,
            programName: 'Master en Finance',
            description: 'Formation approfondie en finance d\'entreprise, gestion des risques et investissements.',
            level: 'Master',
            duration: '2 ans',
            isActive: true,
            createdAt: '2024-02-01T08:30:00Z',
            updatedAt: '2024-03-05T16:45:00Z',
            studentsCount: 250,
            averageRating: 4.7,
          },
          {
            id: 4,
            programName: 'Certificat en Comptabilité',
            description: 'Formation courte en comptabilité générale et analytique.',
            level: 'Certificat',
            duration: '6 mois',
            isActive: false,
            createdAt: '2024-02-15T14:00:00Z',
            updatedAt: '2024-02-20T10:30:00Z',
            studentsCount: 45,
            averageRating: 4.2,
          },
        ];
        setPrograms(mockPrograms);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      // Données mockées en cas d'erreur
      const mockSchool = {
        id: parseInt(id, 10),
        name: 'École Supérieure de Commerce',
        region: 'Abidjan',
        city: 'Cocody',
      };
      setSchool(mockSchool);
      
      const mockPrograms = [
        {
          id: 1,
          programName: 'Master en Management',
          description: 'Formation complète en management d\'entreprise avec focus sur le leadership et la stratégie.',
          level: 'Master',
          duration: '2 ans',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-03-15T14:30:00Z',
          studentsCount: 320,
          averageRating: 4.8,
        },
        {
          id: 2,
          programName: 'Licence en Marketing',
          description: 'Formation en marketing digital et traditionnel, communication et publicité.',
          level: 'Licence',
          duration: '3 ans',
          isActive: true,
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-03-10T11:15:00Z',
          studentsCount: 280,
          averageRating: 4.6,
        },
      ];
      setPrograms(mockPrograms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSchoolPrograms();
    }
  }, [id]);

  const handleOpenDialog = (program = null) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        programName: program.programName,
        description: program.description,
        level: program.level,
        duration: program.duration,
        isActive: program.isActive,
      });
    } else {
      setEditingProgram(null);
      setFormData({
        programName: '',
        description: '',
        level: '',
        duration: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProgram(null);
    setFormData({
      programName: '',
      description: '',
      level: '',
      duration: '',
      isActive: true,
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProgram = async () => {
    try {
      if (editingProgram) {
        // Mise à jour d'un programme existant
        const result = await ConsumApi.updateSchoolProgram(editingProgram.id, {
          programName: formData.programName,
          description: formData.description,
        });
        
        if (result.success) {
          // Mettre à jour la liste locale
          setPrograms(prev => prev.map(program => 
            program.id === editingProgram.id 
              ? { ...program, ...formData }
              : program
          ));
        }
      } else {
        // Création d'un nouveau programme (non implémenté dans l'API)
        console.log('Création de programme non implémentée');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du programme:', error);
    }
  };

  const handleDeleteClick = (program) => {
    setDeleteDialog({ open: true, program, loading: false });
  };

  const handleDeleteConfirm = async () => {
    const { program } = deleteDialog;
    setDeleteDialog({ ...deleteDialog, loading: true });
    
    try {
      const result = await ConsumApi.deleteSchoolProgram(program.id);
      showApiResponse(result, {
        successTitle: 'Programme supprimé',
        errorTitle: 'Erreur de suppression',
      });
      
      if (result.success) {
        setDeleteDialog({ open: false, program: null, loading: false });
        setPrograms(prev => prev.filter(p => p.id !== program.id));
      } else {
        setDeleteDialog({ ...deleteDialog, loading: false });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du programme:', error);
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de la suppression' 
      }, {
        errorTitle: 'Erreur'
      });
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  const handleDeleteProgram = async (programId) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      handleDeleteClick(program);
    }
  };

  const handleActionClick = (type, program) => {
    setActionDialog({ open: true, type, program, loading: false });
  };

  const handleActionConfirm = async () => {
    const { type, program } = actionDialog;
    setActionDialog({ ...actionDialog, loading: true });
    
    try {
      let result;
      switch (type) {
        case 'toggleActive':
          result = await ConsumApi.updateSchoolProgram(program.id, {
            programName: program.programName,
            description: program.description,
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
        setActionDialog({ open: false, type: '', program: null, loading: false });
        // Mettre à jour le statut local
        setPrograms(prev => prev.map(p => 
          p.id === program.id 
            ? { ...p, isActive: !program.isActive }
            : p
        ));
      } else {
        setActionDialog({ ...actionDialog, loading: false });
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
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
      case 'toggleActive': return 'Statut du programme modifié';
      default: return 'Action effectuée';
    }
  };

  const getActionMessage = (type, program) => {
    switch (type) {
      case 'toggleActive': 
        return program.isActive 
          ? `Êtes-vous sûr de vouloir désactiver le programme "${program.programName}" ?`
          : `Êtes-vous sûr de vouloir activer le programme "${program.programName}" ?`;
      default: return 'Êtes-vous sûr de vouloir effectuer cette action ?';
    }
  };

  const getActionTitle = (type) => {
    switch (type) {
      case 'toggleActive': return 'Modifier le statut du programme';
      default: return 'Confirmer l\'action';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'toggleActive': return 'warning';
      default: return 'primary';
    }
  };

  const handleToggleActive = (programId, currentStatus) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      handleActionClick('toggleActive', program);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des programmes...
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
            Programmes - {school?.name || 'École'}
          </Typography>
        </Stack>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {programs.length} programme(s) au total
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un programme
          </Button>
        </Stack>
      </Box>

      {/* Liste des programmes */}
      <Card>
        <TableContainer>
          <Scrollbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Programme</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell>Étudiants</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {program.programName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {program.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={program.level} 
                        size="small" 
                        color={program.level === 'Master' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">{program.duration}</Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {program.studentsCount || 0} étudiants
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="primary.main">
                        ⭐ {program.averageRating || 0}/5
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={program.isActive ? 'Actif' : 'Inactif'}
                        color={program.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title={program.isActive ? 'Désactiver' : 'Activer'}>
                          <IconButton
                            color={program.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleActive(program.id, program.isActive)}
                          >
                            <Iconify icon={program.isActive ? 'solar:pause-circle-bold' : 'solar:play-circle-bold'} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Modifier">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(program)}
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteProgram(program.id)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      {/* Dialog d'édition/création */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProgram ? 'Modifier le programme' : 'Ajouter un programme'}
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nom du programme"
              value={formData.programName}
              onChange={handleInputChange('programName')}
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
            
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={formData.level}
                  label="Niveau"
                  onChange={handleInputChange('level')}
                >
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Durée</InputLabel>
                <Select
                  value={formData.duration}
                  label="Durée"
                  onChange={handleInputChange('duration')}
                >
                  {durations.map((duration) => (
                    <MenuItem key={duration} value={duration}>
                      {duration}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleInputChange('isActive')}
                  color="success"
                />
              }
              label="Programme actif"
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveProgram}
            disabled={!formData.programName || !formData.level || !formData.duration}
          >
            {editingProgram ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, program: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le programme"
        message="Êtes-vous sûr de vouloir supprimer ce programme ?"
        itemName={deleteDialog.program?.programName}
        loading={deleteDialog.loading}
      />

      <ConfirmActionDialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '', program: null, loading: false })}
        onConfirm={handleActionConfirm}
        title={getActionTitle(actionDialog.type)}
        message={actionDialog.program ? getActionMessage(actionDialog.type, actionDialog.program) : ''}
        itemName={actionDialog.program?.programName}
        loading={actionDialog.loading}
        confirmText="Confirmer"
        confirmColor={getActionColor(actionDialog.type)}
        icon="eva:settings-2-fill"
      />
    </Box>
  );
}

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import ConsumApi from 'src/services_workers/consum_api';

// ----------------------------------------------------------------------

const ROLES = [
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'ECOLE', label: 'École' },
  { value: 'ADMIN', label: 'Administrateur' },
];

export default function UserCreateView() {
  const router = useRouter();
  const { contextHolder, showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    role: 'ETUDIANT',
    emailVerified: true,
    premiumActive: false,
  });

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await ConsumApi.createUser(formData);

      if (result.success) {
        showSuccess('Utilisateur créé avec succès');
        router.push('/admin/users');
      } else {
        showError(result.message || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Créer un Utilisateur</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Créez un nouvel utilisateur pour la plateforme
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                type="email"
              />
              <TextField
                fullWidth
                label="Mot de passe"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                type="password"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Numéro de téléphone"
                value={formData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
                placeholder="+225 07 00 00 00 01"
              />
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select value={formData.role} label="Rôle" onChange={handleInputChange('role')}>
                  {ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.emailVerified}
                    onChange={handleInputChange('emailVerified')}
                  />
                }
                label="Email vérifié"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.premiumActive}
                    onChange={handleInputChange('premiumActive')}
                  />
                }
                label="Premium actif"
              />
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Création...' : 'Créer l&apos;utilisateur'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
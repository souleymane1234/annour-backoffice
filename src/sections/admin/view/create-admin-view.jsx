import { message } from 'antd';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import DialogContentText from '@mui/material/DialogContentText';

import { useRouter } from 'src/routes/hooks';

import { users, flags } from 'src/_mock/user';
import ConsumApi from 'src/services_workers/consum_api';
import { AdminStorage } from 'src/storages/admins_storage';

import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

export default function CreateAdminView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [avatarChoice, setAvatarChoice] = useState(8);
  const [role, setRole] = useState(0);
  const [departements, setDepartements] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleChoice, setRoleChoice] = useState(0);
  const [departement, selectDepartement] = useState('');
  const [nameDepartement, changeNameDepartement] = useState('');
  const [fullName, changeFullName] = useState('');
  const [email, changeEmail] = useState('');
  const [contact, changeContact] = useState('');
  const [password, changePassword] = useState('');
  const [openCreateDepartement, setOpenCreateDepartement] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allDepartement = await ConsumApi.getAllDepartement();
    const allRoles = await ConsumApi.getAllRole();
    const { role: roleLocal } = AdminStorage.getInfoAdmin();
    setRole(roleLocal);
    if (allDepartement.success) {
      setRoles(
        allRoles.data.filter((roleItem) => roleItem.nom_role.toLocaleUpperCase() !== 'SUPERAMDIN')
      );
      setDepartements(
        allDepartement.data
          .filter(
            (departementItem) =>
              departementItem.nom_departement.toLocaleLowerCase() !== "cote d'ivoire"
          )
          .sort((a, b) => a.nom_departement - b.nom_departement)
      );
    } else {
      message.error(allDepartement.message);
      if (allDepartement.message === 'Session Expiré veuillez vous réconnecter') {
        setTimeout(() => {
          router.reload();
        }, 1000);
      }
    }
  };

  const createDepartement = async () => {
    if (nameDepartement.trim().length > 2) {
      message.loading('Création en cours');
      const allDepartement = await ConsumApi.createDepartement({
        nom_departement: nameDepartement.trim(),
      });
      if (allDepartement.success) {
        message.success(`${nameDepartement.trim().toLocaleUpperCase()} a été ajouté.`);
        changeNameDepartement('');
        setDepartements(
          allDepartement.data
            .filter(
              (departementItem) =>
                departementItem.nom_departement.toLocaleLowerCase() !== "cote d'ivoire"
            )
            .sort((a, b) => a.nom_departement - b.nom_departement)
        );
      } else {
        message.error(allDepartement.message);
        if (allDepartement.message === 'Session Expiré veuillez vous réconnecter') {
          handleToogleDialogCreateDepartement();
          setTimeout(() => {
            router.reload();
          }, 1000);
        }
      }
      handleToogleDialogCreateDepartement();
    } else {
      message.error('Veuillez entrer un nom de département valide');
    }
  };

  const createAdmin = async () => {
    if (
      fullName.trim().length > 2 &&
      email.trim().indexOf('@') !== -1 &&
      contact.trim().length >= 6 &&
      departement !== '' &&
      password.trim().length > 2
    ) {
      message.loading('Création en cours');
      const arrayScoopGravatars =
        roleChoice === 2
          ? flags[avatarChoice].avatarUrl.split('/')
          : users[avatarChoice].avatarUrl.split('/');
      const gravatars = arrayScoopGravatars[arrayScoopGravatars.length - 1];
      const adminCreated = await ConsumApi.createAdmin({
        nom_complet: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        departement_id: departement,
        role_id: roleChoice,
        contact: contact.trim(),
        gravatars,
      });
      if (adminCreated.success) {
        message.success(`${fullName.trim().toLocaleUpperCase()} a été crée.`);
        selectDepartement('');
        changeFullName('');
        changeEmail('');
        changeContact('');
        changePassword('');
        setRoleChoice(0);
        setAvatarChoice(0);
        setShowPassword(false);
      } else {
        message.error(adminCreated.message);
        if (adminCreated.message === 'Session Expiré veuillez vous réconnecter') {
          setTimeout(() => {
            router.reload();
          }, 1000);
        }
      }
    } else {
      message.error('Veuillez remplir le formulaire correctement');
    }
  };

  const handleToogleDialogCreateDepartement = () => {
    setOpenCreateDepartement(!openCreateDepartement);
  };

  const handleAvatarModalOpen = () => {
    setIsAvatarModalOpen(!isAvatarModalOpen);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="center" mb={1}>
        <IconButton onClick={() => router.back()}>
          <Iconify icon="typcn:arrow-back-outline" />
        </IconButton>
        <Typography variant="h4">Création Administrateur</Typography>
      </Stack>

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 720,
          }}
        >
          <Stack spacing={3}>
            {role === 1 && (
              <>
                <InputLabel id="demo-simple-select-label">Type Administrateur</InputLabel>
                <Grid container spacing={1} alignItems="center" justifyContent="center">
                  <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={roleChoice}
                      placeholder="Type Admin"
                      label="Type Admin"
                      sx={{ width: '100%' }}
                      onChange={(event) => {
                        setAvatarChoice(0);
                        setRoleChoice(parseInt(event.target.value, 10));
                      }}
                    >
                      {roles.map((roleItem) => (
                        <MenuItem key={roleItem.id} value={roleItem.id}>
                          {roleItem.nom_role.trim().toLocaleUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>
              </>
            )}
            <Stack direction="row" alignItems="center" justifyContent="center" mb={1}>
              <Avatar
                alt="defaultProfil"
                src={
                  roleChoice === 2 ? flags[avatarChoice].avatarUrl : users[avatarChoice].avatarUrl
                }
                sx={{ height: 100, width: 100, mr: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAvatarModalOpen}
                color="inherit"
                startIcon={<Iconify icon="ic:twotone-camera" />}
              >
                Changer de profil
              </Button>
            </Stack>

            <TextField
              value={fullName}
              onChange={(event) => {
                changeFullName(event.target.value);
              }}
              name="name"
              label="Nom Complet"
            />
            <TextField
              value={email}
              onChange={(event) => {
                changeEmail(event.target.value);
              }}
              name="Email"
              label="Email"
              type="email"
            />
            <TextField
              value={contact}
              onChange={(event) => {
                changeContact(event.target.value);
              }}
              name="contact"
              label="Contact"
              type="tel"
            />
            <InputLabel id="demo-simple-select-label">Département</InputLabel>
            <Grid container spacing={1} alignItems="center" justifyContent="center">
              <Grid size={{ xs: 12, sm: 7, md: 7 }}>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={departement}
                  placeholder="Département"
                  label="Département"
                  sx={{ width: '100%' }}
                  onChange={(event) => {
                    selectDepartement(event.target.value);
                  }}
                >
                  {departements.map((departementItem) => (
                    <MenuItem key={departementItem.id} value={departementItem.id}>
                      {departementItem.nom_departement.trim().toLocaleUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 5 }}>
                <Button variant="text" onClick={handleToogleDialogCreateDepartement}>
                  Departement introuvable ?
                </Button>
              </Grid>
            </Grid>

            <TextField
              value={password}
              onChange={(event) => {
                changePassword(event.target.value);
              }}
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="inherit"
              onClick={createAdmin}
            >
              Enregistrer
            </LoadingButton>
          </Stack>
        </Card>
      </Stack>
      <Dialog
        disableEscapeKeyDown
        open={openCreateDepartement}
        onClose={handleToogleDialogCreateDepartement}
      >
        <DialogTitle>Création de département</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Veuillez faire entrer le nom du département que vous voulez créer
          </DialogContentText>
          <TextField
            value={nameDepartement}
            onChange={(event) => {
              changeNameDepartement(event.target.value);
            }}
            sx={{ width: '80%' }}
            name="name"
            label="Nom du département"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToogleDialogCreateDepartement}>Annuler</Button>
          <Button onClick={createDepartement}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isAvatarModalOpen}
        onClose={handleAvatarModalOpen}
        aria-labelledby="alert-dialog-avatar"
        aria-describedby="alert-dialog-avatar-choice"
      >
        <DialogTitle id="alert-dialog-avatar">
          Veuillez sélectionner un avatar pour cet administrateur
        </DialogTitle>
        <Grid container spacing={2} sx={{ padding: 1 }}>
          {roleChoice === 2
            ? flags.map((flag, index) => (
                <Avatar
                  key={`avatar-${index}`}
                  onClick={() => {
                    setAvatarChoice(index);
                    handleAvatarModalOpen();
                  }}
                  sx={{ width: 76, height: 76, margin: 1 }}
                  alt={flag.avatarUrl}
                  src={flag.avatarUrl}
                />
              ))
            : users.map((user, index) => (
                <Avatar
                  key={`avatar-${index}`}
                  onClick={() => {
                    setAvatarChoice(index);
                    handleAvatarModalOpen();
                  }}
                  sx={{ width: 76, height: 76, margin: 1 }}
                  alt={user.name}
                  src={user.avatarUrl}
                />
              ))}
        </Grid>
        <DialogActions>
          <Button onClick={handleAvatarModalOpen}>Annuler</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

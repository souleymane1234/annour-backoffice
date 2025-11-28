import { useState, useEffect } from 'react';
import {
  Tag,
  Flex,
  Menu,
  Badge,
  Table,
  Space,
  message,
  Divider,
  Dropdown,
  Typography as Typo,
} from 'antd';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';
import { Box, Grid, Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Visibility from '@mui/icons-material/Visibility';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogContentText from '@mui/material/DialogContentText';
import PasswordTwoToneIcon from '@mui/icons-material/PasswordTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import { red, grey, green, yellow, blueGrey } from '@mui/material/colors';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import DoDisturbOffTwoToneIcon from '@mui/icons-material/DoDisturbOffTwoTone';
import RequestQuoteTwoToneIcon from '@mui/icons-material/RequestQuoteTwoTone';
import AccountBalanceWalletTwoToneIcon from '@mui/icons-material/AccountBalanceWalletTwoTone';

import { useRouter } from 'src/routes/hooks';

import {
  usePartners,
  useCreatePartner,
  useCreateOrUpdateConfigPartner,
} from 'src/hooks/use-partners';

// import {apiUrlAsset} from 'src/constants/apiUrl';
import ConsumApi from 'src/services_workers/consum_api';
import { useAdminStore } from 'src/store/useAdminStore';
import { apiUrlAsset, apiUrlConsulteRessource } from 'src/constants/apiUrl';

// import CVDocument from 'src/components/generator-cv/generator-cv'
// import {AdminStorage} from 'src/storages/admins_storage';

import { RoleEnum } from 'src/enum/RoleEnum';

// import Iconify from 'src/components/iconify';
const { Text } = Typo;
// ----------------------------------------------------------------------

export default function JobOfferView() {
  const router = useRouter();
  const { admin } = useAdminStore();
  const [isMobileMoney, setIsMobileMoney] = useState('non');
  const [showPassword, setShowPassword] = useState(false);
  const [openCreatePartner, setOpenCreatePartner] = useState(false);
  const [openCreateOrUpdateConfig, setOpenCreateOrUpdateConfig] = useState(false);

  const [messageApi, contextMessageHolder] = message.useMessage();
  const [configPartnerairChoice, changeConfigPartnerairChoice] = useState({
    admin_id: null,
    domaine: '',
    x_user: '',
    x_token: '',
    url_generate_otp: '',
    url_billing: '',
    isMobileMoney: false,
  });
  // const [, changePricingChoice] = useState([]);
  const [logo, changeLogo] = useState('');
  const [numberTel, changeNumberTel] = useState('');
  const [email, changeEmail] = useState('');
  const [fullName, changeFullName] = useState('');
  const [password, changePassword] = useState('');
  const { data: partners, isLoading, isError, error, refetch } = usePartners();
  const { mutate: createPartnersMutation, isLoading: isCreating } = useCreatePartner();
  const { mutate: createOrUpdateConfigPartner, isLoading: isUpdatingConfig } =
    useCreateOrUpdateConfigPartner();

  const handleChangeIsMobileMoney = (event) => {
    setIsMobileMoney(event.target.value);
    changeConfigPartnerairChoice((oldConfig) => ({
      ...oldConfig,
      isMobileMoney: event.target.value === 'oui',
    }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router]);

  const columns = [
    {
      title: 'Structure',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (_, company) => (
        <Stack
          sx={{ maxWidth: 200 }}
          alignItems="center"
          justifyContent="center"
          key={`domaine-${company.id}`}
        >
          <Avatar alt={`${company.fullName}`} src={`${apiUrlAsset.avatars}/${company.logo}`} />
          <Typo>
            <Text>{company.fullName}</Text>
            <Divider style={{ margin: 0 }} />
            <Text strong>{company.email}</Text>
          </Typo>
        </Stack>
      ),
    },
    {
      title: 'Domaine',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.config?.domaine.localeCompare(b.config?.domaine),
      render: (_, { config, id }) => (
        <Typo key={`domaine-${id}`}>
          <Text>{config ? config.domaine : 'N/A'}</Text>
        </Typo>
      ),
    },

    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: (a, b) => a.isActive.toString().localeCompare(b.isActive.toString()),
      render: (isActive) => {
        let status;
        let color;

        if (isActive) {
          status = 'Actif';
          color = 'green';
        } else {
          status = 'Desactivé';
          color = 'orange';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: '_id',
      render: (_, { id, isActive, config, forfaits, role }) => (
        <Space size="middle">
          <Dropdown overlay={menuItems(id, isActive, config, forfaits, role)} trigger={['click']}>
            <span
              role="button"
              style={{ cursor: 'pointer' }}
              tabIndex={0}
              onClick={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                }
              }}
            >
              <MoreHorizIcon />
            </span>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const handleToogleDialogCreatePartners = () => {
    setOpenCreatePartner(!openCreatePartner);
  };

  const handleToogleDialogCreateOrUpdateConfig = () => {
    setOpenCreateOrUpdateConfig((show) => !show);
  };

  const menuItems = (_id, isActive, config, forfaits, role) => (
    <Menu>
      <Menu.Item key={`newPassword${_id}`} onClick={() => viewJobDetails(_id)}>
        <Flex gap="middle" align="center" justify="space-between">
          Génerer mot de passe <PasswordTwoToneIcon sx={{ color: grey[500] }} />
        </Flex>
      </Menu.Item>
      {role === RoleEnum.ADMIN_PARTENAIRE && (
        <Menu.Item
          key={`updateConfigItem${_id}`}
          onClick={() => handleActionEditConfig(_id, config)}
        >
          <Flex gap="middle" align="center" justify="space-between">
            Modifier Config <AccountTreeTwoToneIcon sx={{ color: blueGrey[500] }} />
          </Flex>
        </Menu.Item>
      )}
      {role === RoleEnum.ADMIN_PARTENAIRE && (
        <Menu.Item key={`updatePricingItem${_id}`} onClick={() => handleActionJob(_id, forfaits)}>
          <Flex gap="middle" align="center" justify="space-between">
            {forfaits.length > 0 ? 'Modifier' : 'Ajouter'} les forfaits{' '}
            <RequestQuoteTwoToneIcon sx={{ color: yellow[500] }} />
          </Flex>
        </Menu.Item>
      )}
      {isActive ? (
        <Menu.Item
          className="hover-danger"
          key={`removeItem${_id}`}
          onClick={() => handleActionJob(_id, false)}
        >
          <Flex gap="middle" align="center" justify="space-between">
            Desactiver <DoDisturbOffTwoToneIcon sx={{ color: red[500] }} />
          </Flex>
        </Menu.Item>
      ) : (
        <Menu.Item key={`activateItem${_id}`} onClick={() => handleActionJob(_id, true)}>
          <Flex gap="middle" align="center" justify="space-between">
            Activer <VisibilityTwoToneIcon sx={{ color: green[500] }} />
          </Flex>
        </Menu.Item>
      )}
    </Menu>
  );

  const handleActionEditConfig = async (id, config) => {
    if (config) {
      changeConfigPartnerairChoice(config);
      setIsMobileMoney(config.isMobileMoney ? 'oui' : 'non');
    }
    changeConfigPartnerairChoice((oldConfig) => ({ ...oldConfig, admin_id: id }));
    handleToogleDialogCreateOrUpdateConfig();
  };

  // const handleActionEditPricing = async (adminId, forfaits,config) => {
  //   if (forfaits.length > 0) {
  //     changePricingChoice(forfaits.map(({id, periode, type, price, freemium, durationForfait}) => ({id, periode, type, price, freemium, durationForfait})));
  //     setIsMobileMoney(config.isMobileMoney ? 'oui':'non')
  //   }
  //   changeConfigPartnerairChoice((oldConfig) => ({...oldConfig, admin_id: adminId}));
  //   handleToogleDialogCreateOrUpdateConfig();
  // }

  const handleActionJob = async (_id, approbation) => {
    try {
      messageApi.loading('Nous enregistrons votre choix');
      const response = await ConsumApi.validateJobOffre({ _id, isActive: approbation });

      if (response.success) {
        await refetch();
        messageApi.success(approbation ? 'Offre mis en ligne' : 'Offres réjetté');
      } else {
        messageApi.error(response.error);
      }
    } catch (e) {
      // const {data} = e.response;
      messageApi.error("Une erreur s'est produite, veuillez reprendre ultérieurement");
      // setStateCreateJob(false)

      // for (const errorMessage of response.data.message) {
      //   messageApi.error(errorMessage)
      // }
    }
  };

  const viewJobDetails = async (_id) => {
    window.open(apiUrlConsulteRessource.viewJob(_id), '_blank');
  };

  const createPartners = async () => {
    const isReady =
      [fullName.trim(), logo.trim(), email.trim(), password.trim(), numberTel.trim()].filter(
        (verification) => verification.length < 3
      ).length === 0;
    if (isReady) {
      messageApi.loading('Création en cours');
      createPartnersMutation(
        {
          fullName: fullName.trim(),
          logo: logo.trim(),
          email: email.trim(),
          password: password.trim(),
          number: numberTel.trim(),
          role:
            admin.role === RoleEnum.SUPER_ADMIN
              ? RoleEnum.ADMIN_PARTENAIRE
              : RoleEnum.ADMIN_SECOND_GESTION_PARTENAIRE,
        },
        {
          onSuccess: async () => {
            handleToogleDialogCreatePartners();
            changeFullName('');
            changeEmail('');
            changeNumberTel('');
            changePassword('');
            await refetch();
            messageApi.destroy();
            messageApi.success('Partenaire créé avec succès !');
          },
          onError: (e) => {
            messageApi.error(e.message);
          },
        }
      );
    } else {
      messageApi.error('Veuillez renseigner les informations correctement');
    }
  };

  const createOrUpdateConfigPartners = async () => {
    const isReady = configPartnerairChoice.domaine.trim().length > 0;
    if (isReady) {
      messageApi.loading('Enregistrement en cours');
      createOrUpdateConfigPartner(configPartnerairChoice, {
        onSuccess: async () => {
          handleToogleDialogCreateOrUpdateConfig();
          changeConfigPartnerairChoice({
            admin_id: null,
            domaine: '',
            x_user: '',
            x_token: '',
            url_generate_otp: '',
            url_billing: '',
            isMobileMoney: false,
          });
          await refetch();
          messageApi.destroy();
          messageApi.success('Config modifiée avec succès !');
        },
        onError: (e) => {
          messageApi.error(e.message);
        },
      });
    } else {
      messageApi.error('Veuillez renseigner les informations correctement');
    }
  };

  if (isError) {
    console.error('Erreur lors de la récupération des partenaires :', error.message);
  }

  return (
    <Container maxWidth="xl">
      {contextMessageHolder}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" sx={{ mb: 5 }}>
            Liste Partenaires
          </Typography>
          <Button onClick={handleToogleDialogCreatePartners}>
            {admin && admin.role === RoleEnum.SUPER_ADMIN
              ? 'Créer un Partenaire'
              : 'Ajouter un sous-compte'}
          </Button>
        </Stack>
      </Box>

      {isLoading && (
        <>
          <Card sx={{ width: '100%', height: 300, marginBottom: 2 }}>
            <Skeleton variant="rectangular" width="100%" height="100%" animation="pulse" />
          </Card>
          <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
            <Skeleton
              variant="rectangular"
              sx={{ width: '18%', height: 50, borderRadius: 1, marginRight: 2 }}
              animation="pulse"
            />
            <Skeleton
              variant="rectangular"
              sx={{ width: '12%', height: 37, borderRadius: 1 }}
              animation="pulse"
            />
          </Stack>

          <Grid container spacing={2} sx={{ width: '100%' }}>
            {Array.from(new Array(4)).map((item, index) => (
              <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, md: 6 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="flex-start">
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: '40%', height: 160, borderRadius: 1, marginRight: 2 }}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: '50%', height: 100, borderRadius: 1 }}
                    animation="wave"
                  />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {!isLoading && !isError && partners && (
        <>
          <Table
            dataSource={partners}
            columns={columns}
            expandable={{
              expandedRowRender: ({ config }) => (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Typography variant="subtitle2">Client ID</Typography>
                    <Typography variant="body2">{config.x_user}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Typography variant="subtitle2">Client Secret</Typography>
                    <Typography variant="body2">{config.x_token}</Typography>
                  </Grid>
                  {config.isMobileMoney && (
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={2}
                      >
                        <Typography variant="subtitle2">Type E-Payment</Typography>
                        <AccountBalanceWalletTwoToneIcon sx={{ color: green[700] }} />
                      </Stack>
                    </Grid>
                  )}
                  {!config.isMobileMoney && (
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Typography variant="subtitle2">Otp Url</Typography>
                      <Typography variant="body2">{config.url_generate_otp}</Typography>
                    </Grid>
                  )}
                  {!config.isMobileMoney && (
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Typography variant="subtitle2">Paiement Url</Typography>
                      <Typography variant="body2">{config.url_billing}</Typography>
                    </Grid>
                  )}
                </Grid>
              ),
              rowExpandable: (record) => record.config,
            }}
          />

          <Dialog
            maxWidth="xl"
            fullWidth
            disableEscapeKeyDown
            open={openCreatePartner}
            onClose={handleToogleDialogCreatePartners}
          >
            <DialogTitle>
              {admin && admin.role === RoleEnum.SUPER_ADMIN
                ? 'Nouveau partenaire'
                : 'Ajouter Sous-compte'}
            </DialogTitle>

            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                Veuillez faire entrer les informations du compte
              </DialogContentText>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                  <Typography>Veuillez sélectionner une photo de profil pour le compte</Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ width: '100%', height: 100 }}
                  >
                    {Array.from(
                      { length: 25 },
                      (_, index) =>
                        `${admin && admin.role === RoleEnum.SUPER_ADMIN ? 'avatar' : 'avatar'}_${index + 1}.jpg`
                    ).map((avatar) => (
                      <Badge
                        dot={logo === avatar}
                        onClick={(e) => {
                          changeLogo(avatar);
                        }}
                      >
                        <Avatar
                          sx={{ cursor: 'pointer' }}
                          src={`${apiUrlAsset.avatars}/${avatar}`}
                          alt={`${apiUrlAsset.avatars}/${avatar}`}
                        />
                      </Badge>
                    ))}
                  </Stack>
                </Grid>

                {/* Nom complet */}
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <TextField
                    value={fullName}
                    onChange={(event) => changeFullName(event.target.value)}
                    fullWidth
                    label="Nom complet du gestionnaire du compte"
                    name="fullName"
                  />
                </Grid>

                {/* Numéro de téléphone */}
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <TextField
                    value={numberTel}
                    onChange={(event) => changeNumberTel(event.target.value)}
                    fullWidth
                    type="number"
                    label="Numéro de téléphone"
                    name="number"
                  />
                </Grid>

                {/* Email */}
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <TextField
                    value={email}
                    onChange={(event) => changeEmail(event.target.value)}
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                  />
                </Grid>

                {/* Mot de passe */}
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <TextField
                    value={password}
                    onChange={(event) => changePassword(event.target.value)}
                    fullWidth
                    label="Mot de passe"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    helperText="6 caractères minimum, lettres, chiffres et caractères spéciaux requis."
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword ? 'hide the password' : 'display the password'
                              }
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              onMouseUp={handleMouseUpPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleToogleDialogCreatePartners}>Annuler</Button>
              <Button
                variant="contained"
                onClick={createPartners}
                disabled={isCreating}
                startIcon={isCreating && <AutorenewIcon />}
              >
                {isCreating ? 'Enregistrement' : 'Enregistrer'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            maxWidth="xl"
            fullWidth
            disableEscapeKeyDown
            open={openCreateOrUpdateConfig}
            onClose={handleToogleDialogCreateOrUpdateConfig}
          >
            <DialogTitle>
              {configPartnerairChoice.x_user.trim().length > 2 ? 'Modification' : 'Création'} de la
              configuration
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                Veuillez faire entrer les informations du compte
              </DialogContentText>

              <Grid container spacing={2}>
                {/* Nom complet */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormLabel id="demo-controlled-radio-buttons-group">
                    Est-ce un partenaire E-Payment
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={isMobileMoney}
                    onChange={handleChangeIsMobileMoney}
                  >
                    <FormControlLabel value="oui" control={<Radio />} label="Oui" />
                    <FormControlLabel value="non" control={<Radio />} label="Non" />
                  </RadioGroup>
                </Grid>

                {/* Domaine */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    value={configPartnerairChoice.domaine}
                    onChange={(event) =>
                      changeConfigPartnerairChoice((oldConfig) => ({
                        ...oldConfig,
                        domaine: event.target.value,
                      }))
                    }
                    fullWidth
                    type="text"
                    label="Url authorisé"
                    name="domaine"
                  />
                </Grid>
                {isMobileMoney.trim().toLocaleLowerCase() === 'non' && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      value={configPartnerairChoice.url_generate_otp}
                      onChange={(event) =>
                        changeConfigPartnerairChoice((oldConfig) => ({
                          ...oldConfig,
                          url_generate_otp: event.target.value,
                        }))
                      }
                      fullWidth
                      type="text"
                      label="Url Otp"
                      name="url_generate_otp"
                    />
                  </Grid>
                )}
                {isMobileMoney.trim().toLocaleLowerCase() === 'non' && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      value={configPartnerairChoice.url_billing}
                      onChange={(event) =>
                        changeConfigPartnerairChoice((oldConfig) => ({
                          ...oldConfig,
                          url_billing: event.target.value,
                        }))
                      }
                      fullWidth
                      type="text"
                      label="Url Paiement"
                      name="url_billing"
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleToogleDialogCreateOrUpdateConfig}>Annuler</Button>
              <Button
                variant="contained"
                onClick={createOrUpdateConfigPartners}
                disabled={isUpdatingConfig}
                startIcon={isUpdatingConfig && <AutorenewIcon />}
              >
                {isUpdatingConfig ? 'Enregistrement' : 'Enregistrer'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
}

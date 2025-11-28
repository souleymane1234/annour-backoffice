import { useState, useEffect } from 'react';
import { Menu, Flex, Image, Space, Table, Upload, message, Checkbox, Dropdown } from 'antd';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import { red } from '@mui/material/colors';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import OutlinedInput from '@mui/material/OutlinedInput';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FormHelperText from '@mui/material/FormHelperText';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

import { useRouter } from 'src/routes/hooks';

import {
  useGames,
  useCreateGame,
  useCategoriesGames,
  useCreateCategoryGames,
} from 'src/hooks/use-games';

import { getSrcFromFile, onPreviewCompetitionCover } from 'src/utils/traitement-file';

import { apiUrlAsset } from 'src/constants/apiUrl';

import Iconify from 'src/components/iconify';

import PostCard from '../post-card';
// import PostSort from '../post-sort';
// import PostSearch from '../post-search';
// ----------------------------------------------------------------------

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function GameView() {
  const router = useRouter();
  const theme = useTheme();
  const [messageApi, contextMessageHolder] = message.useMessage();
  const [fileList, setFileList] = useState([]);
  const [fileListProfil, setFileListProfil] = useState([]);
  const [fileListCategory, setFileListCategory] = useState([]);
  const [nameFileCategorieGameUploadBase64, changeNameFileCategorieGameUploadBase64] = useState('');
  const [base64CategorieGame, changeBase64CategorieGame] = useState('');
  const [nameCovers, changeNameCovers] = useState([]);
  const [nameProfil, changeNameProfil] = useState([]);
  const [categorieGameChoice, changeCategorieGameChoice] = useState([]);
  const [base64Files, changeBase64Files] = useState([]);
  const [base64Profil, changeBase64Profil] = useState([]);
  const [openCreateGame, setOpenCreateGame] = useState(false);
  const [isPortraitMode, setIsPortraitMode] = useState(false);
  const [title, changeTitle] = useState('');
  const [nameCategory, changeNameCategory] = useState('');
  const [videoCover, changeVideoCover] = useState('');
  const [urlGame, changeUrlGame] = useState('');
  const [description, changeDescription] = useState('');
  const {
    data: categories,
    isLoading: isLoadingCategory,
    isError: isErrorCategoryGame,
    error: errorCategoryGame,
    refetch: refetchCategoryGame,
  } = useCategoriesGames();
  const {
    data: games,
    isLoading: isLoadingGame,
    isError: isErrorGame,
    error: errorGame,
    refetch: refetchGame,
  } = useGames();

  const { mutate: createGameMutation, isLoading: isCreatingGame } = useCreateGame();
  const { mutate: createCategoryGameMutation, isLoading: isCreatingCategory } =
    useCreateCategoryGames();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router]);

  const handleToogleDialogCreateGames = () => {
    setOpenCreateGame((prev) => !prev);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'urlImage',
      key: 'urlImage',
      width: 110,
      render: (urlImage) => (
        <Image
          style={{ borderRadius: 10 }}
          width={100}
          src={`${apiUrlAsset.categories}/${urlImage}`}
        />
      ),
    },
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Action',
      key: 'id',
      render: (_, { id }) => (
        <Space size="middle">
          <Dropdown overlay={menuItems(id)} trigger={['click']}>
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

  const menuItems = (id) => (
    <Menu>
      <Menu.Item className="hover-danger" key={`removeItem${id}`} onClick={() => console.log(id)}>
        <Flex gap="middle" align="center" justify="space-between">
          Supprimer <DeleteTwoToneIcon sx={{ color: red[500] }} />
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const createGames = async () => {
    const categoriesFilter = categorieGameChoice
      .map((category) => {
        const categoryFound = categories.find((cat) => cat.name === category);
        return categoryFound ? categoryFound.id : null;
      })
      .filter((id) => id !== null);
    const isReady =
      [title.trim(), description.trim()].filter((verification) => verification.length < 3)
        .length === 0;
    if (
      isReady &&
      fileList.length > 0 &&
      fileListProfil.length > 0 &&
      categoriesFilter.length > 0
    ) {
      const covers = nameCovers.map((fileName, index) => ({
        fileName,
        base64: base64Files[index],
      }));
      messageApi.loading('Création en cours');
      createGameMutation(
        {
          nameProfil: nameProfil[0],
          base64Profil: base64Profil[0],
          title,
          description,
          covers,
          isPortrait: isPortraitMode,
          videoCover,
          url: urlGame,
          categories: categoriesFilter,
        },
        {
          onSuccess: async () => {
            handleToogleDialogCreateGames();
            setFileList([]);
            changeBase64Files([]);
            changeNameCovers([]);
            changeDescription('');
            changeTitle('');
            changeVideoCover('');
            await refetch();
            messageApi.destroy();
            messageApi.success('Jeux créé avec succès !');
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
  const createCategoryGames = async () => {
    const isReady =
      [nameCategory.trim()].filter((verification) => verification.length < 3).length === 0;
    if (isReady && fileListCategory.length > 0) {
      messageApi.loading('Création en cours');
      createCategoryGameMutation(
        {
          name: nameCategory.trim(),
          fileName: nameFileCategorieGameUploadBase64,
          base64: base64CategorieGame,
        },
        {
          onSuccess: async () => {
            setFileListCategory([]);
            changeBase64CategorieGame('');
            changeNameFileCategorieGameUploadBase64('');
            changeNameCategory('');
            await refetch();
            messageApi.destroy();
            messageApi.success('Catégorie créé avec succès !');
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

  const onChangePictureCover = async ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const nameFile = newFileList.map((file) => `${file.uid}.${file.type.split('/')[1]}`);
      changeNameCovers(nameFile); // <-- Mise à jour des noms

      const promises = newFileList.map((file) => getSrcFromFile(file));
      const base64Results = await Promise.all(promises);
      changeBase64Files(base64Results); // <-- Mise à jour des fichiers encodés
    }
  };
  const onChangePictureProfil = async ({ fileList: newFileListProfil }) => {
    setFileListProfil(newFileListProfil);
    if (newFileListProfil.length > 0) {
      const nameFile = newFileListProfil.map((file) => `${file.uid}.${file.type.split('/')[1]}`);
      changeNameProfil(nameFile); // <-- Mise à jour des noms

      const promises = newFileListProfil.map((file) => getSrcFromFile(file));
      const base64Results = await Promise.all(promises);
      changeBase64Profil(base64Results); // <-- Mise à jour des fichiers encodés
    }
  };

  const onChangeCategorieGameCover = ({ fileList: newFileList }) => {
    setFileListCategory(newFileList);
    if (newFileList.length > 0) {
      const nameFile = `${newFileList[0].uid}.${newFileList[0].type.split('/')[1]}`;
      changeNameFileCategorieGameUploadBase64(nameFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        changeBase64CategorieGame(base64String);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    }
  };

  const handleChangeCategorieChoice = (event) => {
    const {
      target: { value },
    } = event;
    changeCategorieGameChoice(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const refetch = async () => {
    await refetchCategoryGame();
    await refetchGame();
  };

  if (isErrorGame) {
    console.error('Erreur lors de la récupération des jeux :', errorGame.message);
  }

  if (isErrorCategoryGame) {
    console.error(
      'Erreur lors de la récupération des catégories jeux :',
      errorCategoryGame.message
    );
  }
  return (
    <Container maxWidth="xl">
      {contextMessageHolder}
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4">Gestions Cartegorie Jeux</Typography>
        <Typography variant="subtitle1">Créer une nouvelle cartegorie de jeux</Typography>
        <Grid container spacing={3} sx={{ my: 2 }}>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Upload
              listType="picture"
              accept="image/png, image/jpeg, image/webp"
              fileList={fileListCategory}
              beforeUpload={() => false}
              maxCount={1}
              onChange={onChangeCategorieGameCover}
              onPreview={onPreviewCompetitionCover}
            >
              {fileListCategory.length < 1 && (
                <Box
                  component="div"
                  sx={{
                    width: '100%',
                    border: 'dashed #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    padding: 2,
                    cursor: 'pointer',
                  }}
                >
                  <Iconify icon="openmoji:picture" />
                  <span className="ant-upload-text">Charger la photo de la categorie</span>
                </Box>
              )}
            </Upload>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <TextField
              value={nameCategory}
              onChange={(event) => changeNameCategory(event.target.value)}
              fullWidth
              label="Nom de la categorie du jeu"
              required
              name="nameCategory"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button
              variant="contained"
              disabled={isCreatingCategory}
              color="inherit"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={createCategoryGames}
            >
              Enregistrer cette catégorie
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ my: 2 }}>
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <Table pagination={{ pageSize: 4 }} dataSource={categories} columns={columns} />
          </Grid>
        </Grid>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Gestions Jeux</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleToogleDialogCreateGames}
        >
          Ajouter un jeu
        </Button>
      </Stack>

      {/* <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
        <PostSearch posts={posts} />
        <PostSort
          options={[
            { value: 'latest', label: 'Recent' },
            { value: 'popular', label: 'Populaire' },
            { value: 'oldest', label: 'Ancien' },
          ]}
        />
      </Stack> */}

      <Grid container spacing={3}>
        {isLoadingGame
          ? Array.from(new Array(9)).map((item, index) => (
              <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 4, md: 3 }}>
                <Card sx={{ width: '100%', height: 400, marginBottom: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height="100%" animation="pulse" />
                </Card>
              </Grid>
            ))
          : games.map((game, index) => <PostCard key={game.id} game={game} index={index} />)}
      </Grid>
      <Dialog
        maxWidth="xl"
        fullWidth
        disableEscapeKeyDown
        open={openCreateGame}
        onClose={handleToogleDialogCreateGames}
      >
        <DialogTitle>Nouveau jeu</DialogTitle>

        <DialogContent>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <DialogContentText sx={{ mb: 3 }}>
                Veuillez sélectionner les catégories du jeu
              </DialogContentText>
              <Box component="div" sx={{ width: '80%' }}>
                {!isLoadingCategory && (
                  <FormControl sx={{ m: 1, width: '100%' }}>
                    <InputLabel id="demo-simple-select-helper-label">Catégorie</InputLabel>
                    <Select
                      labelId="demo-multiple-chip-label"
                      id="demo-multiple-chip"
                      multiple
                      placeholder="Action, Aventure, Arcade, etc..."
                      value={categorieGameChoice}
                      onChange={handleChangeCategorieChoice}
                      input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                      renderValue={(categoriesChoice) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {categoriesChoice.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {categories.map((category) => (
                        <MenuItem
                          key={category.id}
                          value={category.name}
                          style={getStyles(category.name, categorieGameChoice, theme)}
                        >
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Vous pouvez en choisir plusieurs</FormHelperText>
                  </FormControl>
                )}
              </Box>
              <DialogContentText sx={{ my: 3 }}>L&apos;icone du jeu</DialogContentText>
              <Box component="div" sx={{ width: '100%' }}>
                <Upload
                  listType="picture-card"
                  accept="image/png, image/jpeg, image/webp"
                  fileList={fileListProfil}
                  beforeUpload={() => false}
                  onChange={onChangePictureProfil}
                  onPreview={onPreviewCompetitionCover}
                >
                  {fileListProfil.length < 1 && (
                    <Box
                      component="div"
                      sx={{
                        width: 200,
                        border: 'dashed #e0e0e0',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        padding: 2,
                        cursor: 'pointer',
                      }}
                    >
                      <Iconify icon="openmoji:picture" />
                      <span className="ant-upload-text">Charger l&apos;icone ici</span>
                    </Box>
                  )}
                </Upload>
              </Box>

              <DialogContentText sx={{ my: 3 }}>Les photos de couvertures</DialogContentText>
              <Box component="div" sx={{ width: '100%' }}>
                <Upload
                  listType="picture"
                  accept="image/png, image/jpeg, image/webp"
                  fileList={fileList}
                  multiple
                  maxCount={6}
                  beforeUpload={() => false}
                  onChange={onChangePictureCover}
                  onPreview={onPreviewCompetitionCover}
                >
                  {fileList.length < 6 && (
                    <Box
                      component="div"
                      sx={{
                        width: 200,
                        border: 'dashed #e0e0e0',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        padding: 2,
                        cursor: 'pointer',
                      }}
                    >
                      <Iconify icon="openmoji:picture" />
                      <span className="ant-upload-text">Charger les images</span>
                    </Box>
                  )}
                </Upload>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 12 }} marginTop={1}>
                  <TextField
                    value={title}
                    onChange={(event) => changeTitle(event.target.value)}
                    fullWidth
                    label="Titre du jeu"
                    required
                    name="title"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12 }} marginTop={1}>
                  <TextField
                    value={videoCover}
                    onChange={(event) => changeVideoCover(event.target.value)}
                    fullWidth
                    placeholder="https://www.youtube.com/watch?v=riCP9x31Kuk"
                    label="URL youtube de la vidéo de couverture"
                    name="videoCover"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12 }} marginTop={1}>
                  <TextField
                    value={urlGame}
                    onChange={(event) => changeUrlGame(event.target.value)}
                    fullWidth
                    placeholder="https://bomber-fish.booz-game.com"
                    label="URL du jeu"
                    required
                    name="urlGame"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12 }} marginTop={1}>
                  <TextField
                    value={description}
                    onChange={(e) => changeDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    required
                  />
                  <Checkbox
                    checked={isPortraitMode}
                    onChange={(e) => setIsPortraitMode(e.target.checked)}
                  >
                    Le jeu est en mode portrait.
                  </Checkbox>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleToogleDialogCreateGames}>Annuler</Button>
          <Button
            variant="contained"
            onClick={createGames}
            disabled={isCreatingGame}
            startIcon={isCreatingGame && <AutorenewIcon />}
          >
            {isCreatingGame ? 'Enregistrement' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

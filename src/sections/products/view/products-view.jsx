/* eslint-disable react/no-danger */
import DOMPurify from 'dompurify';
import { useState, useEffect } from 'react';
import { Image, Table, message } from 'antd';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TimelineDot from '@mui/lab/TimelineDot';
import Container from '@mui/material/Container';
import TimelineItem from '@mui/lab/TimelineItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import FormControlLabel from '@mui/material/FormControlLabel';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { routesName } from 'src/constants/routes';
import { apiUrlAsset } from 'src/constants/apiUrl';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

export default function ProductsView() {
  // const [checked, setOpenFilter] = useState(false);
  const { formationId } = useParams();
  const router = useRouter();
  // const [modalUpdateDauphine, toogleModalUpdateDauphine] = useState(false);

  const [isFetching, setFetch] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [isDisplay, toogleDisplay] = useState(false);
  const [formation, setFormation] = useState({});
  // const [modalAddDauphin, toogleModalAddDauphin] = useState(false);

  // const alert = ({type, content}) => {
  //   messageApi.open({
  //     type,
  //     content,
  //   });
  // };

  const columns = [
    {
      title: 'Nom Complet',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Contact',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
  ];

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    setFetch(true);
    const { success, data } = await ConsumApi.getDetailsFormation({ formationId });

    if (success) {
      setFormation(data);
      toogleDisplay(data.isPublished);
      setFetch(false);
    }
  };

  const deleteFormation = async ({ _id }) => {
    messageApi.loading('Suppression en cours');
    const { success } = await ConsumApi.deleteFormation({ _id });

    if (success) {
      router.replace(routesName.formations);
    }
  };

  const toogleDisplayFormation = async () => {
    toogleDisplay((prev) => !prev);
    // await ConsumApi.toogleEvent({event_id:formationId, display: !isDisplay});
  };

  // const handleToogleUpdateDauphine = () => {
  //   toogleModalUpdateDauphine(!modalUpdateDauphine);
  // };
  // const handleToogleAddDauphine = () => {
  //   toogleModalAddDauphin(!modalAddDauphin);
  // };

  // const setNumberNominate = ({rankingNumber, idCandidate, index}) => {
  //   setNominateId(idCandidate);
  //   setRanking(rankingNumber);
  //   setIndexToEdit(index);
  //   handleToogleUpdateDauphine();
  // };

  return (
    <Container>
      {contextHolder}
      <Stack direction="row" alignItems="center" justifyContent="flex-start" mb={1}>
        <IconButton onClick={() => router.back()}>
          <Iconify icon="typcn:arrow-back-outline" />
        </IconButton>
        <Typography variant="h4">{formation?.title}</Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
        spacing={2}
      >
        <FormControlLabel
          control={<Switch checked={isDisplay} onChange={toogleDisplayFormation} color="warning" />}
          label={isDisplay ? 'Actif' : 'Inactif'}
        />
        {/* <ProductSort />
         */}
        <Button
          variant="contained"
          onClick={async (e) => {
            e.preventDefault();
            await deleteFormation({ _id: formation?._id });
          }}
          color="error"
          startIcon={<Iconify icon="ic:twotone-delete" />}
        >
          Supprimer cette formation
        </Button>
      </Stack>

      <Grid container spacing={1}>
        {isFetching ? (
          Array.from(new Array(7)).map((product, index) => (
            <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rectangular" width="100%" height={300} animation="pulse" />
            </Grid>
          ))
        ) : (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Image src={`${apiUrlAsset.coverFormation}/${formation?.cover}`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 8 }}>
              <Timeline
                sx={{
                  m: 1,
                  p: 0,
                  [`& .${timelineOppositeContentClasses.root}`]: {
                    flex: 0.2,
                    padding: 1,
                  },
                }}
              >
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary">
                    Date de debut
                  </TimelineOppositeContent>
                  <TimelineSeparator color="success">
                    <TimelineDot color="success" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>{fDate(formation?.startDate)}</TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary">
                    Date de fin
                  </TimelineOppositeContent>
                  <TimelineSeparator color="error">
                    <TimelineDot color="error" />
                  </TimelineSeparator>
                  <TimelineContent>{fDate(formation?.endDate)}</TimelineContent>
                </TimelineItem>
              </Timeline>
              <Box component="div" sx={{ pl: 5 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Iconify icon="fluent-emoji:teacher-light" />
                  <Typography variant="subtitle2" color="text.primary">
                    {formation?.instructor}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Iconify icon="duo-icons:location" />
                  <Typography variant="subtitle2" color="text.primary">
                    {formation?.location}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
              <div
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formation?.description) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
              <Typography variant="subtitle1" color="text.primary">
                Liste des participants
              </Typography>
              <Table dataSource={formation?.participants} columns={columns} />
            </Grid>
          </Grid>
        )}
      </Grid>
      {/* <Dialog disableEscapeKeyDown open={modalUpdateDauphine} onClose={handleToogleUpdateDauphine}>
        <DialogTitle>Modification numero de dauphine</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mb: 3}}>
            Veuillez faire entrer le numero de la dauphine
          </DialogContentText>
          <TextField
            value={ranking}
            onChange={(e)=> {
              setRanking(e.target.value);
            }}
            sx={{width: '80%',}} name="numero" label="Numero de dautphine" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToogleUpdateDauphine}>Annuler</Button>
          <Button onClick={createNumeroDauphine}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
      <Modal
      centered
      title="Ajouter des dauphines"
      open={modalAddDauphin}
      onOk={handleToogleAddDauphine}
      onCancel={handleToogleAddDauphine}
      footer={[
        <>
          <Button onClick={handleToogleAddDauphine}>Annuler</Button>
          <Button onClick={addDauphineToEvent}>Enregistrer</Button>
        </>
      ]}
      >
          <Typography variant='h6'>Veuillez selectionner des dauphines pour y ajouter à cet évènement.</Typography>
          <Select
                size='large'
                  mode="multiple"
                  style={{
                    width: '100%',
                    marginTop: 10
                  }}
                  placeholder="Choisir les candidates"
                  // value={allNomine}
                  onChange={choiceCandidate}
                  optionLabelProp="label"
                  options={candidates}
                  optionRender={(option) => (
                    <Space>
                      <span role="img" aria-label={option.data.label}>
                        <Avatar src={`${apiUrlAsset.candidate}/${option.data.img}`} />
                      </span>
                      {option.data.desc} ({option.data.label})
                    </Space>
                  )}
                />
      </Modal> */}
      {/* <ProductCartWidget /> */}
    </Container>
  );
}

import PropTypes from 'prop-types';
import ImgCrop from 'antd-img-crop';
import { useState, useEffect } from 'react';
import { PlusCircleTwoTone, MinusCircleOutlined } from '@ant-design/icons';
import {
  Form,
  Flex,
  Space,
  Switch,
  Upload,
  Button,
  Select,
  Avatar,
  message,
  DatePicker,
  InputNumber,
} from 'antd';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import Filter3Icon from '@mui/icons-material/Filter3';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

import { useRouter } from 'src/routes/hooks';

import { disabledDate } from 'src/utils/format-time';
import { onPreviewCompetitionCover } from 'src/utils/traitement-file';

import { currencies } from 'src/_mock/currencies';
import { apiUrlAsset } from 'src/constants/apiUrl';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

const { RangePicker } = DatePicker;

// ----------------------------------------------------------------------

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <Filter1Icon />,
    2: <Filter2Icon />,
    3: <Filter3Icon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,

  icon: PropTypes.node,
};

const steps = ['Création compétition', 'Création événement de vôte'];

// display image in preview

export default function CreateVotingSystem(props) {
  const { levelActiveStep } = props;
  const [form] = Form.useForm();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const [activeStep, setActiveStep] = useState(levelActiveStep ?? 0);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const [isFinalCompetition, setIsFinalCompetition] = useState(false);
  const [nameCompetition, changeNameCompetition] = useState('');

  const [base64Cover, changeBase64Cover] = useState('');
  const [base64LastMiss, changeBase64Miss] = useState('');
  const [nameFileUploadBase64Cover, changeNameFileUploadBase64Cover] = useState('');
  const [nameFileUploadBase64LastMiss, changeNameFileUploadBase64LastMiss] = useState('');

  const [descriptionCompetition, changeDescriptionCompetition] = useState('');
  const [fileListCover, setFileListCover] = useState([]);
  const [fileListLastMiss, setFileListLastMiss] = useState([]);

  const [admins, setAdmins] = useState([]);
  // const [allNomine, setAllNomine] = useState([]);

  const [rangeDateEvent, setRangeDateEvent] = useState([]);
  // const [candidates, setCandidates] = useState([]);
  // const [candidatesChoice, setCandidatesChoice] = useState([]);
  const [adminChoice, setAdminChoice] = useState('');
  const [titleEvent, changeTitleEvent] = useState('');
  const [devise, changeDevise] = useState('');
  const [priceVote, setPriceVote] = useState('');
  const [location, changeLocation] = useState('');

  const alert = ({ type, content }) => {
    messageApi.open({
      type,
      content,
    });
  };

  useEffect(() => {
    verifyPositionStep();
  }, []);

  const verifyPositionStep = async () => {
    // const allCandidateActivate = await ConsumApi.getAllCandidateActive();
    const allAdmin = await ConsumApi.getAllAdmin(router);
    // const options = allCandidateActivate.data.map((item) => ({
    //     label: item.matricule,
    //     value: `${item.matricule.trim()}_${item.firstName.trim()} ${item.lastName.trim()}`,
    //     img: item.photo,
    //     desc: `${item.firstName} ${item.lastName}`,
    //     id: item.id,
    //   }));
    const optionsAdmin = allAdmin.data.map((admin) => ({
      label: admin.nom_complet,
      value: admin.id,
      img: admin.gravatars,
      desc: admin.nom_departement,
      id: admin.id,
    }));
    // setCandidates(options);
    setAdmins(optionsAdmin);
  };

  const onChangeTypeCompetition = (checked) => {
    setIsFinalCompetition(checked);
  };

  const onChangeCompetitionCover = ({ fileList: newFileList }) => {
    setFileListCover(newFileList);
    if (newFileList.length > 0) {
      const nameFile = `${newFileList[0].uid}.${newFileList[0].type.split('/')[1]}`;
      changeNameFileUploadBase64Cover(nameFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        changeBase64Cover(base64String);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    }
    return false;
  };

  const onChangeCompetitionLastMiss = ({ fileList: newFileList }) => {
    setFileListLastMiss(newFileList);
    if (newFileList.length > 0) {
      const nameFile = `${newFileList[0].uid}.${newFileList[0].type.split('/')[1]}`;
      changeNameFileUploadBase64LastMiss(nameFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        changeBase64Miss(base64String);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    }
    return false;
  };

  const saveItem = async () => {
    if (activeStep === 0) {
      if (nameCompetition.trim().length < 4) {
        alert({ type: 'error', content: 'Veuillez faire entrer un nom valide' });
      } else if (descriptionCompetition.trim().length < 4) {
        alert({ type: 'error', content: 'Veuillez faire entrer une description valide' });
      } else if (fileListCover.length === 0) {
        alert({ type: 'error', content: 'Veuillez charger une image de couverture' });
      } else if (fileListLastMiss.length === 0) {
        alert({ type: 'error', content: 'Veuillez charger une image de la dernière miss' });
      } else {
        setButtonIsLoading(true);
        alert({ type: 'loading', content: 'Enregistrement en cours...' });
        const newCompetion = await ConsumApi.createCompetition(
          {
            base64Cover: base64Cover.trim(),
            name_file_cover: nameFileUploadBase64Cover.trim(),
            base64LastMiss: base64LastMiss.trim(),
            name_file_last_miss: nameFileUploadBase64LastMiss.trim(),
            title: nameCompetition.trim(),
            describe: descriptionCompetition.trim(),
          },
          router
        );
        setButtonIsLoading(false);
        if (newCompetion.success) {
          setFileListCover([]);
          setFileListLastMiss([]);
          changeNameCompetition('');
          changeBase64Cover('');
          changeBase64Miss('');
          changeNameFileUploadBase64Cover('');
          changeDescriptionCompetition('');
          setActiveStep(1);
          alert({ type: 'success', content: 'Compétition crée avec succès' });
        } else {
          alert({
            type: 'error',
            content: 'Un problème a été rencontré veuillez ressayer ultérieurement',
          });
        }
      }
    } else if (activeStep === 1) {
      if (rangeDateEvent.length !== 2) {
        alert({ type: 'error', content: 'Veuillez faire entrer une date de debut et de fin' });
      } else if (devise.trim().length < 2) {
        alert({ type: 'error', content: 'Veuillez faire entrer une devise valide' });
      } else if (fileListCover.length === 0) {
        alert({ type: 'error', content: 'Veuillez charger une image de couverture' });
      } else {
        form.submit();
      }
    } // else if (activeStep === 2) {
    //   if(candidatesChoice.length > 0) {
    //     setButtonIsLoading(true);
    //     const nominate = candidatesChoice.map((item) => {
    //       const matricule = item.split('_')[0];
    //       const {id} = candidates.filter((itemFilter) => itemFilter.label.trim() === matricule.trim())[0];
    //       return id;
    //     });
    //     const {success} = await ConsumApi.setNominate({nominate});
    //     if(success) {
    //       router.reload();
    //     } else {
    //       alert({type: 'error', content: "Un problème rencontré, veuillez réssayer"});
    //     }
    //     setButtonIsLoading(false);
    //   } else {
    //     alert({type: 'error', content: "Veuillez choisir au moins une nominée"});
    //     await verifyPositionStep();
    //   }
    // }
  };

  const onFinish = async (values) => {
    if (values.ticketInfo) {
      setButtonIsLoading(true);
      alert({ type: 'loading', content: 'Enregistrement en cours...' });
      const newEvent = await ConsumApi.createEvent({
        title: titleEvent.trim(),
        level: isFinalCompetition ? 0 : 1,
        admin_id: parseInt(adminChoice, 10),
        base64: base64Cover.trim(),
        name_file: nameFileUploadBase64Cover.trim(),
        beginDate: rangeDateEvent[0].toDate(),
        endDate: rangeDateEvent[1].toDate(),
        price: priceVote.trim().length === 0 ? 0 : parseInt(priceVote.trim(), 10),
        devise,
        location,
        typeTicket: values.ticketInfo,
      });
      setButtonIsLoading(false);
      if (newEvent.success) {
        alert({ type: 'success', content: 'Édition crée avec succès' });
        setRangeDateEvent([]);
        changeDevise('');
        changeTitleEvent('');
        changeLocation('');
        setFileListCover([]);
        changeBase64Cover('');
        setPriceVote('');
        changeDevise('');
        form.resetFields();
        await verifyPositionStep();
      } else {
        alert({
          type: 'error',
          content: 'Un problème a été rencontré veuillez ressayer ultérieurement',
        });
      }
    }
  };

  // const choiceCandidate = (value) => {
  //   setCandidatesChoice(value);
  // }
  const choiceAdmin = (value) => {
    setAdminChoice(value);
  };

  return (
    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
      <Grid container>
        {contextHolder}
        <Stack sx={{ width: '100%' }} spacing={4}>
          <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>

        {activeStep === 0 && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: 1, width: '100%', marginTop: 6 }}
          >
            <Card
              sx={{
                p: 5,
                width: 1,
                maxWidth: 720,
              }}
            >
              <Stack spacing={3} sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      mb={1}
                      sx={{ width: '100%' }}
                    >
                      <ImgCrop showGrid rotationSlider aspectSlider showReset>
                        <Upload
                          listType="picture"
                          accept="image/png, image/jpeg, image/webp"
                          fileList={fileListCover}
                          beforeUpload={(file) => false}
                          onChange={onChangeCompetitionCover}
                          // onPreview={onPreviewCompetitionCover}
                        >
                          {fileListCover.length < 1 && (
                            <Box
                              component="div"
                              sx={{
                                width: 300,
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
                              <span className="ant-upload-text">
                                Charger une photo de couverture
                              </span>
                            </Box>
                          )}
                        </Upload>
                      </ImgCrop>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      mb={1}
                      sx={{ width: '100%' }}
                    >
                      <Upload
                        listType="picture"
                        accept="image/png"
                        fileList={fileListLastMiss}
                        beforeUpload={(file) => false}
                        onChange={onChangeCompetitionLastMiss}
                      >
                        {fileListLastMiss.length < 1 && (
                          <Box
                            component="div"
                            sx={{
                              width: 300,
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
                            <span className="ant-upload-text text-center">
                              Charger la photo de la miss pour édition précédente
                            </span>
                          </Box>
                        )}
                      </Upload>
                    </Stack>
                  </Grid>
                </Grid>
                <TextField
                  value={nameCompetition}
                  onChange={(event) => {
                    changeNameCompetition(event.target.value);
                  }}
                  label="Nom de la compétition"
                />
                <TextField
                  value={descriptionCompetition}
                  onChange={(event) => {
                    changeDescriptionCompetition(event.target.value);
                  }}
                  label="Libélé de la compétition"
                />
                <LoadingButton
                  fullWidth
                  loading={buttonIsLoading}
                  size="large"
                  type="submit"
                  variant="contained"
                  color="inherit"
                  onClick={saveItem}
                >
                  Enregistrer
                </LoadingButton>
              </Stack>
            </Card>
          </Stack>
        )}
        {activeStep === 1 && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: 1, width: '100%', marginTop: 6 }}
          >
            <Card
              sx={{
                p: 5,
                width: 1,
                maxWidth: 720,
              }}
            >
              <Stack spacing={3} sx={{ width: '100%' }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  mb={1}
                  sx={{ width: '100%' }}
                >
                  <ImgCrop showGrid rotationSlider aspectSlider showReset>
                    <Upload
                      listType="picture"
                      accept="image/png, image/jpeg, image/webp"
                      fileList={fileListCover}
                      beforeUpload={(file) => false}
                      onChange={onChangeCompetitionCover}
                      onPreview={onPreviewCompetitionCover}
                    >
                      {fileListCover.length < 1 && (
                        <Box
                          component="div"
                          sx={{
                            width: 300,
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
                          <span className="ant-upload-text">Charger une photo de couverture</span>
                        </Box>
                      )}
                    </Upload>
                  </ImgCrop>
                </Stack>
                <TextField
                  value={titleEvent}
                  onChange={(event) => {
                    changeTitleEvent(event.target.value);
                  }}
                  label="Nom de l'évènement"
                />
                <Grid container spacing={3}>
                  <Grid xs={12} sm={7} md={7}>
                    <Select
                      size="large"
                      style={{
                        width: '100%',
                      }}
                      placeholder="Choisir l'administrateur en charge de cette compétition"
                      // value={allNomine}
                      onChange={choiceAdmin}
                      optionLabelProp="label"
                      options={admins}
                      optionRender={(option) => (
                        <Space>
                          <span role="img" aria-label={option.data.label}>
                            <Avatar src={`${apiUrlAsset.avatars}/${option.data.img}`} />
                          </span>
                          {option.data.label} ({option.data.desc.trim().toLocaleUpperCase()})
                        </Space>
                      )}
                    />
                  </Grid>
                  <Grid xs={12} sm={4} md={4}>
                    <Flex justify="flex-start" align="center">
                      <Switch
                        onChange={onChangeTypeCompetition}
                        checkedChildren={
                          <Iconify icon="solar:cup-star-broken" sx={{ color: '#ffb636' }} />
                        }
                      />
                      <Typography variant="h5" sx={{ marginLeft: 1 }} gutterBottom>
                        {isFinalCompetition ? ' Finale' : 'Préselection'}
                      </Typography>
                    </Flex>
                  </Grid>
                </Grid>
                <RangePicker
                  disabledDate={disabledDate}
                  size="large"
                  format="DD/MM/YYYY"
                  value={rangeDateEvent}
                  onChange={(value, dateString) => {
                    if (value.length > 1) {
                      setRangeDateEvent(value);
                    }
                  }}
                  placeholder={['Date de début', 'Date de fin']}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      value={location}
                      onChange={(event) => {
                        changeLocation(event.target.value);
                      }}
                      label="Lieu de l'évènement"
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      value={priceVote}
                      id="outlined-number"
                      label="Prix du vote"
                      type="number"
                      onChange={(event) => {
                        setPriceVote(event.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      id="outlined-select-currency"
                      select
                      fullWidth
                      value={devise}
                      onChange={(event) => {
                        changeDevise(event.target.value);
                      }}
                      label="Devise"
                      helperText="Choissisez une devise"
                    >
                      {currencies.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Form form={form} name="control-hooks" onFinish={onFinish}>
                      <Form.List name="ticketInfo">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((field) => (
                              <Space key={field.key} align="baseline">
                                <Form.Item
                                  noStyle
                                  shouldUpdate={(prevValues, curValues) =>
                                    prevValues.area !== curValues.area ||
                                    prevValues.ticketInfo !== curValues.ticketInfo
                                  }
                                >
                                  {() => (
                                    <Form.Item
                                      {...field}
                                      label="Nombre de Place"
                                      name={[field.name, 'numberTotalTicket']}
                                      fieldKey={[field.key, 'numberTotalTicket']}
                                      rules={[
                                        {
                                          required: true,
                                          message: 'Le nombre de place est requis',
                                        },
                                      ]}
                                    >
                                      <InputNumber />
                                    </Form.Item>
                                  )}
                                </Form.Item>
                                <Form.Item
                                  {...field}
                                  label="Prix du ticket"
                                  name={[field.name, 'priceTicket']}
                                  fieldKey={[field.key, 'priceTicket']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Le prix est requis',
                                    },
                                  ]}
                                >
                                  <InputNumber />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(field.name)} />
                              </Space>
                            ))}

                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusCircleTwoTone icon="lets-icons:add-duotone" />}
                              >
                                Ajouter un type ticket
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Form>
                  </Grid>
                </Grid>

                <LoadingButton
                  fullWidth
                  loading={buttonIsLoading}
                  size="large"
                  type="submit"
                  variant="contained"
                  color="inherit"
                  onClick={saveItem}
                >
                  Enregistrer
                </LoadingButton>
              </Stack>
            </Card>
          </Stack>
        )}

        {/* {activeStep === 2 && (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 1,  width: '100%', marginTop: 6 }}>
            <Card
              sx={{
                p: 5,
                width: 1,
                maxWidth: 720,
              }}
            >
              <Stack spacing={3} sx={{width: '100%'}}>

              
                <Select
                size='large'
                  mode="multiple"
                  style={{
                    width: '100%',
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
                
                
                <LoadingButton
                  fullWidth
                  loading={buttonIsLoading}
                  size="large"
                  type="submit"
                  variant="contained"
                  color="inherit"
                  onClick={saveItem}
                >
                  Enregistrer
                </LoadingButton>
              </Stack>
            </Card>
          </Stack>
        )} */}
      </Grid>
    </Grid>
  );
}

CreateVotingSystem.propTypes = {
  levelActiveStep: PropTypes.number,
};

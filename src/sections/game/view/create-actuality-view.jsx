import ImgCrop from 'antd-img-crop';
import { Editor } from '@tinymce/tinymce-react';
import { Upload, message, DatePicker } from 'antd';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { onPreviewCompetitionCover } from 'src/utils/traitement-file';

import { apiKeyTinyMce } from 'src/constants/apiKey';
import ConsumApi from 'src/services_workers/consum_api';
import { AdminStorage } from 'src/storages/admins_storage';

import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

const { RangePicker } = DatePicker;

export default function CreateActualityView() {
  const editorRef = useRef(null);
  const router = useRouter();

  const [fileList, setFileList] = useState([]);
  const [dateFormation, setDateFormation] = useState([]);
  const [base64, changeBase64] = useState('');
  const [title, changeTitle] = useState('');
  const [location, changeLocation] = useState('');
  const [author, changeAuthor] = useState('');
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const [nameFileUploadBase64, changeNameFileUploadBase64] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  const alert = ({ type, content }) => {
    messageApi.open({
      type,
      content,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allDepartement = await ConsumApi.getAllDepartement();
    const admin = AdminStorage.getInfoAdmin();
    changeAuthor(admin.nom_complet);
    if (!allDepartement.success) {
      message.error(allDepartement.message);
    }
  };

  const submit = async () => {
    if (editorRef.current) {
      const textEditor = editorRef.current.getContent();
      if (
        title.trim().length > 3 &&
        fileList.length > 0 &&
        textEditor.toString().length > 12 &&
        author.trim().length > 3 &&
        location.trim().length > 3 &&
        dateFormation.length === 2
      ) {
        setButtonIsLoading(true);
        alert({ type: 'loading', content: 'Création en cours...' });
        const [startDate, endDate] = dateFormation;

        const newFormation = await ConsumApi.createFormation({
          cover: base64,
          instructor: author.trim(),
          coverName: nameFileUploadBase64.trim(),
          description: textEditor.trim(),
          location,
          title,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        setButtonIsLoading(false);
        if (newFormation.success) {
          alert({ type: 'success', content: `${title.trim()} a été crée.` });
          setFileList([]);
          setDateFormation([]);
          changeBase64('');
          changeTitle('');
          changeLocation('');
          changeAuthor('');
          editorRef.current.setContent('');
          changeNameFileUploadBase64('');
        } else {
          alert({ type: 'error', content: newFormation.message });
        }
      } else {
        alert({ type: 'error', content: 'Veuillez remplir correctement tous les champs' });
      }
    } else {
      alert({
        type: 'error',
        content: 'Un problème a été rencontré veuillez ressayer ultérieurement',
      });
    }
  };

  const onChangeCompetitionCover = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const nameFile = `${newFileList[0].uid}.${newFileList[0].type.split('/')[1]}`;
      changeNameFileUploadBase64(nameFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        changeBase64(base64String);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    }
  };

  return (
    <Container>
      {contextHolder}
      <Stack direction="row" alignItems="center" justifyContent="center" mb={1}>
        <IconButton onClick={() => router.back()}>
          <Iconify icon="typcn:arrow-back-outline" />
        </IconButton>
        <Typography variant="h4">Création Formation</Typography>
      </Stack>

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 1000,
          }}
        >
          <Stack spacing={3}>
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
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={onChangeCompetitionCover}
                  onPreview={onPreviewCompetitionCover}
                >
                  {fileList.length < 1 && (
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
              name="name"
              label="Titre de la formation"
              value={title}
              onChange={(event) => changeTitle(event.target.value)}
            />
            <TextField
              name="location"
              value={location}
              onChange={(event) => changeLocation(event.target.value)}
              id="outlined-multiline-flexible"
              label="Lieu de la formation"
            />
            <RangePicker
              value={dateFormation}
              onChange={(value, valueString) => {
                setDateFormation(value);
              }}
              size="large"
              placeholder={['Date de début', 'Date de fin']}
            />
            <TextField
              name="authorName"
              label="Nom de l'auteur de la formation"
              value={author}
              onChange={(event) => changeAuthor(event.target.value)}
            />
            <Editor
              apiKey={apiKeyTinyMce}
              onInit={(_evt, editor) => {
                editorRef.current = editor;
              }}
              initialValue="<p>Chargez du contenu.</p>"
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist',
                  'autolink',
                  'lists',
                  'link',
                  'image',
                  'charmap',
                  'preview',
                  'file',
                  'anchor',
                  'searchreplace',
                  'visualblocks',
                  'code',
                  'fullscreen',
                  'insertdatetime',
                  'media',
                  'table',
                  'code',
                  'help',
                  'wordcount',
                ],
                toolbar:
                  'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'file image media preview | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              }}
            />

            <LoadingButton
              loading={buttonIsLoading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="inherit"
              onClick={submit}
            >
              Enregistrer
            </LoadingButton>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

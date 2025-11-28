import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Tag, Image, Table, Typography as Typo } from 'antd';

import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { pink, green } from '@mui/material/colors';
import AssignmentReturnedTwoToneIcon from '@mui/icons-material/AssignmentReturnedTwoTone';
import AssignmentTurnedInTwoToneIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';

import { useRouter } from 'src/routes/hooks';

import { apiUrlAsset } from 'src/constants/apiUrl';
import ConsumApi from 'src/services_workers/consum_api';

// import CVDocument from 'src/components/generator-cv/generator-cv'
import CVDocument from 'src/components/generator-cv/generator-cv-second-model';

// import PostSearch from '../../blog/post-search';
// ----------------------------------------------------------------------
const { Text, Paragraph } = Typo;
export default function VotingView() {
  const [isFetching, setFetch] = useState(true);
  const router = useRouter();
  const [allParticulier, setAllParticulier] = useState([]);
  const [allEntreprise, setAllEntreprise] = useState([]);

  useEffect(() => {
    loadInfo();
    window.scrollTo(0, 0);
  }, []);

  const loadInfo = async () => {
    const { success, data, message } = await ConsumApi.getUsers();
    if (success) {
      setAllEntreprise(data.allEntreprise);
      setAllParticulier(data.allParticulier);
      setFetch(false);
    } else if (message === 'Session Expiré veuillez vous réconnecter') {
      setTimeout(() => {
        router.reload();
      }, 1000);
    }
  };

  const columnsParticulier = [
    {
      title: 'Nom Complet',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (_, { fullName, email, phoneNumber }) => (
        <Typo>
          <Paragraph>
            <Text style={{ textAlign: 'center' }} strong>
              {fullName}
            </Text>
            <br />
            <Text>{email}</Text>
          </Paragraph>
          <Text>{phoneNumber}</Text>
        </Typo>
      ),
    },
    {
      title: 'CV original',
      dataIndex: 'resume',
      key: 'resume',
      render: (_, { resume }) => (
        <Link href={`${apiUrlAsset.cv}/${resume}`} target="_blank" download>
          <AssignmentReturnedTwoToneIcon sx={{ color: pink[500] }} />
        </Link>
      ),
    },
    {
      title: 'CV ICM',
      dataIndex: 'resume',
      key: 'resume',
      render: (_, userData) => (
        <PDFDownloadLink
          document={<CVDocument userData={userData} />}
          fileName={`CV_GENERATE_${userData.fullName}.pdf`}
        >
          <AssignmentTurnedInTwoToneIcon sx={{ color: green[500] }} />
        </PDFDownloadLink>
      ),
    },
    {
      title: 'Domaines',
      dataIndex: 'domainsActivity',
      key: 'domainsActivity',
      render: (_, { domainsActivity }) => (
        <>
          {domainsActivity.map((domains) => (
            <Tag key={`domains-${domains}`} color="cyan">
              {domains.toUpperCase()}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Compétences',
      dataIndex: 'skills',
      key: 'skills',
      render: (_, { skills }) => {
        const maxSkills = 5;
        const displayedSkills = skills.slice(0, maxSkills);
        const remainingSkillsCount = skills.length - maxSkills;

        return (
          <>
            {displayedSkills.map((skill) => (
              <Tag key={`skills-${skill}`}>{skill.toUpperCase()}</Tag>
            ))}
            {remainingSkillsCount > 0 && (
              <Tag color="volcano">
                +{remainingSkillsCount} {remainingSkillsCount > 1 ? 'autres' : 'autre'}
              </Tag>
            )}
          </>
        );
      },
    },
    {
      title: 'Total Candidature',
      dataIndex: 'totalCandidature',
      key: 'totalCandidature',
      sorter: (a, b) => a.totalCandidature - b.totalCandidature,
    },
    {
      title: 'Total Formation',
      dataIndex: 'totalFormation',
      key: 'totalFormation',
      sorter: (a, b) => a.totalFormation - b.totalFormation,
    },
  ];

  const columnsEntreprise = [
    {
      title: 'Compagnie',
      dataIndex: 'logo',
      key: 'logo',
      render: (_, { logo, name }) => (
        <>
          <Image src={`${apiUrlAsset.logo}/${logo}`} width={50} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {name}
          </Typography>
        </>
      ),
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
    {
      title: "Domaine d'activité",
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Total Emploi',
      dataIndex: 'totalJobOffer',
      key: 'totalJobOffer',
      sorter: (a, b) => a.totalJobOffer - b.totalJobOffer,
    },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Liste des postulants
      </Typography>

      {!isFetching && (
        <>
          <Table dataSource={allParticulier} columns={columnsParticulier} />
          <Typography variant="h4" sx={{ my: 2 }}>
            Liste des entreprises
          </Typography>
          <Table dataSource={allEntreprise} columns={columnsEntreprise} />
        </>
      )}

      {isFetching && (
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
    </Container>
  );
}

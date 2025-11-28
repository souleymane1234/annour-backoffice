import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
// import Stack from '@mui/material/Stack';
import { purple } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
// import Avatar from '@mui/material/Avatar';
import { alpha, styled } from '@mui/material/styles';

import { apiUrlAsset } from 'src/constants/apiUrl';

import Iconify from 'src/components/iconify';

// import { fDate } from 'src/utils/format-time';
// import { fShortenNumber } from 'src/utils/format-number';

// import Iconify from 'src/components/iconify';
// import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------
const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  '&:hover': {
    backgroundColor: purple[700],
  },
}));
export default function VotingCompetion({ post, sx, admin }) {
  const { cover, title, describe, imageMiss } = post;

  const renderDescription = (
    <Link
      color="white"
      variant="subtitle2"
      underline="hover"
      onClick={() => {
        // console.log(id);
      }}
      sx={{
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        typography: 'h5',
        marginBottom: 3,
        color: 'common.whitesmoke',
      }}
    >
      {describe}
    </Link>
  );

  const renderMiss = (
    <Box
      sx={{
        width: '50%',
        height: 260,
        borderRadius: 3,
        background: 'linear-gradient(169deg, #13575c, #257377)',
        backgroundImage: `, url("${apiUrlAsset.competitions}/${imageMiss}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        boxShadow:
          'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 3,
          backgroundImage: `url("${apiUrlAsset.competitions}/${imageMiss}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
    </Box>
  );

  // linear-gradient(to left, #bc4e9c, #f80759);
  return (
    <Grid size={{ xs: 12, sm: 12, md: 12 }} sx={sx}>
      <Card
        className="cover-competition"
        sx={{
          width: '100%',
          background: `url(${apiUrlAsset.competitions}/${cover})no-repeat center`,
          backgroundSize: 'cover',
          height: 300,
          boxShadow:
            'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.6),
          }}
        >
          <Grid container spacing={2} padding={2} sx={{ height: '100%' }}>
            <Grid size={{ xs: 6, sm: 6, md: 6 }} sx={{ height: '100%' }}>
              <Stack direction="row" alignItems="center" justifyContent="flex-start" mb={5}>
                <Avatar src={`${apiUrlAsset.avatars}/${admin.gravatars}`} alt={admin.gravatars} />
                <Typography color="white" variant="h4" sx={{ marginLeft: 2 }}>
                  {title.toString().toLocaleUpperCase()}
                </Typography>
              </Stack>
              {renderDescription}
              {admin.role <= 2 && (
                <ColorButton
                  variant="contained"
                  startIcon={<Iconify icon="iconamoon:edit-light" />}
                >
                  Modifier
                </ColorButton>
              )}
            </Grid>
            <Grid
              size={{ xs: 6, sm: 6, md: 6 }}
              sx={{
                justifyContent: 'flex-end',
                alignItems: 'center',
                display: 'flex',
                height: '100%',
              }}
            >
              {renderMiss}
            </Grid>
          </Grid>
        </Box>
        {/* {renderInfo} */}
      </Card>
    </Grid>
  );
}

VotingCompetion.propTypes = {
  post: PropTypes.object.isRequired,
  sx: PropTypes.any,
  admin: PropTypes.object.isRequired,
};

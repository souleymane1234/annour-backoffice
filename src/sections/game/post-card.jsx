import { Badge } from 'antd';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

// import { fDate } from 'src/utils/format-time';
// import { fNumber } from 'src/utils/format-number';

import { routesName } from 'src/constants/routes';
import { apiUrlAsset } from 'src/constants/apiUrl';

import Iconify from 'src/components/iconify';
// import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

export default function PostCard({ game, index }) {
  const { title, ratings, id, isActive, categories, profilPicture } = game;
  const router = useRouter();

  const renderTitle = (
    <Link
      color="inherit"
      variant="subtitle2"
      underline="hover"
      onClick={() => {
        router.push(routesName.setDetailFormation(id));
      }}
      sx={{
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        color: 'common.white',
        typography: 'h5',
        height: 60,
      }}
    >
      {title}
    </Link>
  );

  const renderInfo = (
    <Stack
      direction="row"
      flexWrap="wrap"
      spacing={1.5}
      justifyContent="flex-end"
      sx={{
        mt: 3,
        color: 'text.disabled',
      }}
    >
      {[
        {
          number: ratings.reduce((acc, { rating }) => acc + rating, 0) / ratings.length,
          icon: 'solar:user-broken',
        },
      ].map((info, _index) => (
        <Stack
          key={_index}
          direction="row"
          sx={{
            opacity: 0.48,
            color: 'common.white',
          }}
        >
          <Iconify width={16} icon={info.icon} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{info.number}</Typography>
        </Stack>
      ))}
    </Stack>
  );

  const renderCover = (
    <Box
      component="img"
      alt={title}
      src={`${apiUrlAsset.games}/${profilPicture}`}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 2,
        color: 'white',
        opacity: 0.88,

        // color: 'common.white',
      }}
    >
      {categories.map(({ name }) => name.trim().toLocaleUpperCase()).join(' - ')}
    </Typography>
  );

  return (
    <Grid size={{ xs: 12, sm: 3, md: 2 }}>
      <Badge.Ribbon text={isActive ? 'En ligne' : 'Inactif'} color="purple">
        <Card>
          <Box
            sx={{
              position: 'relative',
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: 0,
                content: "''",
                width: '100%',
                height: '100%',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.grey[800], 0.42),
              },
            }}
          >
            {renderCover}
          </Box>

          <Box
            sx={{
              p: (theme) => theme.spacing(4, 3, 3, 3),
              width: 1,
              bottom: 0,
              position: 'absolute',
            }}
          >
            {renderDate}

            {renderTitle}

            {ratings.length > 0 && renderInfo}
          </Box>
        </Card>
      </Badge.Ribbon>
    </Grid>
  );
}

PostCard.propTypes = {
  game: PropTypes.object.isRequired,
  index: PropTypes.number,
};

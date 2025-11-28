import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

// import { ColorPreview } from 'src/components/color-utils';
import { apiUrlAsset } from 'src/constants/apiUrl';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

export default function ShopProductCard({ candidate, index, onChange }) {
  const renderNumberCandidate = (
    <Label
      variant="filled"
      color="warning"
      onClick={() => {
        onChange({
          rankingNumber: candidate.pivot.ranking ?? '',
          idCandidate: candidate.id,
          index,
        });
      }}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
      }}
    >
      {candidate.pivot.ranking && candidate.pivot.ranking}
      {!candidate.pivot.ranking && <Iconify icon="basil:edit-outline" />}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={candidate.firstName}
      src={`${apiUrlAsset.candidate}/${candidate.photo}`}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderNumberVote = (
    <Box>
      <Typography variant="subtitle1">
        &nbsp;
        {fNumber(candidate.pivot.NumberVotes)}
        <Iconify icon="ic:twotone-how-to-vote" />
      </Typography>
    </Box>
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {renderNumberCandidate}

        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {candidate.firstName} {candidate.lastName}
        </Link>

        <Stack direction="row" alignItems="center">
          {/* <ColorPreview colors={product.colors} /> */}
          <Typography variant="subtitle2">Nombre de vote &nbsp;</Typography>
          {renderNumberVote}
        </Stack>
      </Stack>
    </Card>
  );
}

ShopProductCard.propTypes = {
  candidate: PropTypes.object,
  index: PropTypes.number,
  onChange: PropTypes.any,
};

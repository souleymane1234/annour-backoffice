import PropTypes from 'prop-types';

import {
    Box,
    Dialog,
    Button,
    Typography,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading = false,
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => `rgba(${theme.palette.error.mainChannel} / 0.08)`,
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={24} sx={{ color: 'error.main' }} />
          </Box>
          <Typography variant="h6">{title || 'Confirmer la suppression'}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: itemName ? 0.5 : 0 }}>
          {message || 'Êtes-vous sûr de vouloir supprimer cet élément ?'}
        </Typography>
        {itemName && (
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'grey.100',
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            &quot;{itemName}&quot;
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 2, color: 'error.main', fontWeight: 'fontWeightMedium' }}>
          Cette action est irréversible.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? null : <Iconify icon="solar:trash-bin-trash-bold" />}
        >
          {loading ? 'Suppression...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  itemName: PropTypes.string,
  loading: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};


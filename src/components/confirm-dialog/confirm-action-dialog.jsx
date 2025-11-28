import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer l\'action',
  message = 'Êtes-vous sûr de vouloir effectuer cette action ?',
  itemName,
  loading = false,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmColor = 'primary',
  icon = 'eva:question-mark-circle-fill',
  showReason = false,
  reason = '',
  onReasonChange = () => {},
  reasonLabel = 'Raison (optionnel)',
  reasonPlaceholder = 'Expliquez la raison de cette action...',
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon={icon} sx={{ color: 'warning.main', width: 24, height: 24 }} />
          {title}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: itemName ? 0.5 : 0 }}>
          {message}
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
        {showReason && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'fontWeightMedium' }}>
              {reasonLabel}
            </Typography>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={reasonPlaceholder}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px 12px',
                border: '1px solid #d0d7de',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </Box>
        )}
        <Typography variant="body2" sx={{ mt: 2, color: 'warning.main', fontWeight: 'fontWeightMedium' }}>
          Cette action peut avoir des conséquences importantes.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          startIcon={loading ? null : <Iconify icon="eva:checkmark-circle-2-fill" />}
        >
          {loading ? 'Traitement...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmActionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  itemName: PropTypes.string,
  loading: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColor: PropTypes.string,
  icon: PropTypes.string,
  showReason: PropTypes.bool,
  reason: PropTypes.string,
  onReasonChange: PropTypes.func,
  reasonLabel: PropTypes.string,
  reasonPlaceholder: PropTypes.string,
};

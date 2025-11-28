import PropTypes from 'prop-types';
import { useState, useEffect, forwardRef } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import MuiAlert from '@mui/material/Alert';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const Alert = forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

export default function AnalyticsTasks({ title, subheader, list, ...other }) {
  const [selected, setSelected] = useState(-1);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleClickComplete = (taskId) => {
    setOpen(true);
    setSelected(taskId);
  };

  useEffect(() => {
    const { id } = list.filter((event) => event.isActive)[0];
    setSelected(id);
  }, [list]);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      {list.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          checked={selected === task.id}
          onChange={() => handleClickComplete(task.id)}
        />
      ))}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Changement appliqué
        </Alert>
      </Snackbar>
    </Card>
  );
}

AnalyticsTasks.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function TaskItem({ task, checked, onChange }) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleShare = () => {
    handleCloseMenu();
  };

  const handleEdit = () => {
    handleCloseMenu();
  };

  const handleDelete = () => {
    handleCloseMenu();
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          pl: 2,
          pr: 1,
          py: 1,
          '&:not(:last-of-type)': {
            borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
          },
          ...(!checked && {
            color: 'text.disabled',
            textDecoration: 'line-through',
          }),
        }}
      >
        <FormControlLabel
          control={<Switch checked={checked} onChange={onChange} />}
          label={task.name}
          sx={{ flexGrow: 1, m: 0 }}
        />

        <IconButton color={open ? 'inherit' : 'default'} onClick={handleOpenMenu}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
          Modifier
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <Iconify icon="solar:share-bold" sx={{ mr: 2 }} />
          Partager
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
          Supprimer
        </MenuItem>
      </Popover>
    </>
  );
}

TaskItem.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  task: PropTypes.object,
};

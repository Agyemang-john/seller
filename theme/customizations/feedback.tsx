import { Theme, alpha, Components } from '@mui/material/styles';
import { gray, orange } from '../themePrimitives';

/* eslint-disable import/prefer-default-export */
export const feedbackCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        backgroundColor: orange[100],
        color: (theme.vars || theme).palette.text.primary,
        border: `1px solid ${alpha(orange[300], 0.5)}`,
        '& .MuiAlert-icon': {
          color: orange[500],
        },
        ...theme.applyStyles('dark', {
          backgroundColor: `${alpha(orange[900], 0.5)}`,
          border: `1px solid ${alpha(orange[800], 0.5)}`,
        }),
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
        },
        // Phones: use the screen instead of MUI's 32px gutters, which leave
        // form dialogs cramped and push their buttons below the keyboard.
        [theme.breakpoints.down('sm')]: {
          '& .MuiDialog-paper:not(.MuiDialog-paperFullScreen)': {
            margin: theme.spacing(1.5),
            width: `calc(100% - ${theme.spacing(3)})`,
            maxHeight: `calc(100% - ${theme.spacing(3)})`,
          },
          '& .MuiDialog-paperFullScreen': {
            borderRadius: 0,
            border: 0,
            paddingBottom: 'env(safe-area-inset-bottom)',
          },
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
};

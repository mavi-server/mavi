import { createTheme } from '@mui/material'
export default createTheme({
  typography: {
    fontFamily: [
      'Yanone Kaffeesatz',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'var(--primary)',
          backgroundColor: 'var(--mavi)',
        },
      },
    },
  },
})
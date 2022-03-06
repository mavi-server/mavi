import type { FC } from 'react'
import type { NextPage } from 'next'
import { Box } from '@mui/material'
import styles from './index.module.css'

const AppMain: FC = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }} className={styles.AppMain}>
      {children}
    </Box>
  )
}

export default AppMain

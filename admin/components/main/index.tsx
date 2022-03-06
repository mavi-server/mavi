import type { FC } from 'react'
import type { NextPage } from 'next'
import { Grid } from '@mui/material'
import styles from './index.module.css'

const AppMain: FC = ({ children }) => {
  return (
    <Grid container spacing={2} rowSpacing={2} className={styles.AppMain}>
      {children}
    </Grid>
  )
}

export default AppMain

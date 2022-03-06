import type { NextPage } from 'next'
import { Grid, Button } from '@mui/material'
import styles from './index.module.css'

const Settings: NextPage = () => {
  return (
    <>
      <Grid item md={12}>
        <div>index</div>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained">Button</Button>
      </Grid>
    </>
  )
}

export default Settings

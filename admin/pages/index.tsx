import type { NextPage } from 'next'
import { Grid, Button } from '@mui/material'
import styles from './index.module.css'

const Home: NextPage = () => {
  return (
    <Grid container spacing={2} rowSpacing={2}>
      <Grid item>
        <div>index</div>
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained">Button</Button>
      </Grid>
    </Grid>
  )
}

export default Home

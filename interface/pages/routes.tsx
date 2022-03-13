import type { NextPage } from 'next'
import { Grid, gridClasses } from '@mui/material'
import styles from './index.module.css'

const Routes: NextPage = () => {
  return (
    <Grid>
      <Grid
        container
        className={[styles.HeaderContainer, styles.Dark, styles.MainPad]}
        md={12}
        style={{ borderBottom: 'none' }}
      >
        <Grid className={styles.HeaderTextBox} md={4}>
          <h2>Routes</h2>
          <p>Base API route configurations.</p>
        </Grid>

        <Grid container className={styles.InputContainer}>
          <Grid xs={12} sm={6} xl={3}>
            <h2>API configuration has these inputs:</h2>
            <ul>
              <li>base: string</li>
              <li>routes: object[]</li>
              <li>static: object[]</li>
              <li>define: object{}</li>
              <li>define.models: object[]</li>
              <li>define.populate: object[]</li>
              <li>define.views: object[]</li>
              <li>define.middlewares: object[]</li>
              <li>define.controllers: object[]</li>
              <li>plugins?: object</li>
            </ul>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Routes

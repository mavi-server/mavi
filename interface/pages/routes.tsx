import type { NextPage } from 'next'
import { useState } from 'react'
import { Grid, gridClasses } from '@mui/material'
import styles from './index.module.css'
import initialState from '../states/mavi-config'

const Routes: NextPage = () => {
  const [settings, setSettings] = useState(initialState)
  return (
    <Grid>
      <Grid
        container
        className={`${styles.HeaderContainer} ${styles.Dark} ${styles.MainPad}`}
        md={12}
        style={{ borderBottom: 'none' }}
      >
        <Grid item className={styles.HeaderTextBox} md={4}>
          <h2>Routes</h2>
          <p>Base API route configurations. This page helps you combine all your defined objects in your routes.</p>
        </Grid>

        <Grid container className={styles.InputContainer}>
          <Grid item xs={12} sm={6} xl={3}>
            <h2>This page will touch these `api` options:</h2>
            <ul>
              <li>base: string</li>
              <li>routes: object[]</li>
              <li>static: object[]</li>
              {/* <li>plugins?: object</li> */}
            </ul>
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            Model count: {Object.keys(settings.api.define.models)}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Routes

import type { NextPage } from 'next'
import { useState } from 'react'
import { Grid, TextField, Switch } from '@mui/material'
import MainRoutes from '../components/main/routes/MainRoutes'

import styles from './index.module.css'
import initialState from '../states/mavi-config'

const Routes: NextPage = () => {
  const [settings, setSettings] = useState(initialState)
  const [apiActive, setApiActive] = useState(false)
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
          <Grid xs={12} sm={6} xl={2} className={styles.InputBox}>
            <TextField
              required
              value={settings.api.base}
              disabled={!apiActive}
              size="small"
              variant="standard"
              margin="dense"
              InputProps={{
                endAdornment: (
                  <Switch disabled={false} value={apiActive} size="small" onChange={() => setApiActive(!apiActive)} />
                ),
              }}
              fullWidth
              label="Api base"
              id="input-base"
              helperText="All your routes starts with this path"
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item className={`${styles.HeaderContainer} ${styles.MainPad}`} md={6}>
        <MainRoutes />
      </Grid>
    </Grid>
  )
}

export default Routes

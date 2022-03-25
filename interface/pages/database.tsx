import type { NextPage } from 'next'
import { useState, useReducer } from 'react'
import {
  Grid,
  Button,
  Autocomplete,
  TextField,
  Chip,
  FormHelperText,
  Switch,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import styles from './index.module.css'
import initialState from '../states/mavi-config'

const supportedClients = [
  {
    label: 'PostgreSQL',
    value: 'pg',
  },
  {
    label: 'MySQL',
    value: 'mysql',
    readonly: true,
  },
  {
    label: 'SQLite',
    value: 'sqlite',
    readonly: true,
  },
]

const Database: NextPage = () => {
  const [settings, setSettings] = useState(initialState)
  const [connectionDatabaseActive, setConnectionDatabaseActive] = useState(false)

  return (
    <Grid>
      <Divider></Divider>
      <Grid
        container
        className={`${styles.HeaderContainer} ${styles.Dark} ${styles.MainPad}`}
        md={12}
        style={{ borderBottom: 'none' }}
      >
        <Grid className={styles.HeaderTextBox} md={4}>
          <h2>Database Environment</h2>
          <p>All database configurations will depend on this environment</p>
        </Grid>

        <Grid container className={styles.InputContainer}>
          <Grid xs={12} sm={6} xl={3} className={styles.InputBox}>
            <Autocomplete
              fullWidth
              id="input-database-environment"
              size="medium"
              freeSolo
              options={[...Object.keys(settings.database), 'process.env.NODE_ENV']}
              defaultValue={Object.keys(settings.database)[0]}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  variant="standard"
                  label="Database Environment"
                  placeholder="Environment"
                />
              )}
            />
            <FormHelperText>Selected environment will be configured below</FormHelperText>
          </Grid>
        </Grid>
      </Grid>

      <Grid container className={`${styles.HeaderContainer} ${styles.Dark} ${styles.MainPad}`} md={12}>
        <Grid className={styles.HeaderTextBox} md={4}>
          <h2>Connection</h2>
          <p>These settings are used to connect to the database.</p>
        </Grid>

        <Grid container className={styles.InputContainer}>
          <Grid item xs={12} md={2} sm={6} xl={1.5} className={styles.InputBox}>
            <Autocomplete
              fullWidth
              id="cors-origin"
              size="small"
              options={supportedClients}
              defaultValue={supportedClients.filter(({ value }) => value === 'pg')[0]}
              getOptionLabel={(option) => option.label}
              // getOptionDisabled={(option) => option.readonly}
              renderInput={(params) => (
                <TextField {...params} required variant="standard" label="Client" placeholder="Client" />
              )}
            />
            <FormHelperText>Database management system</FormHelperText>
          </Grid>
          <Grid item xs={12} sm={6} md={4} xl={2} className={styles.InputBox}>
            <TextField
              required
              value={settings.database.development.connection.database}
              size="small"
              variant="standard"
              margin="dense"
              fullWidth
              label="Database name"
              id="input-host"
              helperText="Database name"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} xl={2} className={styles.InputBox}>
            <TextField
              required
              value={settings.database.development.connection.user}
              size="small"
              variant="standard"
              margin="dense"
              fullWidth
              label="Database user"
              id="input-host"
              helperText="Database user"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} xl={2} className={styles.InputBox}>
            <TextField
              required
              value={settings.database.development.connection.password}
              size="small"
              variant="standard"
              margin="dense"
              fullWidth
              label="Database password"
              type="password"
              id="input-host"
              helperText="Database password"
            />
          </Grid>

          <Grid container xl={8.25} justifyContent="flex-end">
            <Button
              sx={{
                backgroundColor: 'var(--mavi)',
                color: 'var(--primary-lighter)',

                '&:hover': {
                  backgroundColor: 'var(--mavi-darker)',
                  color: 'var(--primary-lighter)',
                },
              }}
            >
              Test Connection
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid container>
        {/* pool settings */}
        <Grid item className={`${styles.HeaderContainer} ${styles.MainPad}`} sm={12} md={8} xl={4}>
          <Grid className={styles.HeaderTextBox} md={12}>
            <h2>Pool</h2>
            <p>
              Pooling database resources. See{' '}
              <a target="_blank" href="https://github.com/vincit/tarn.js">
                tarn.js
              </a>
            </p>
          </Grid>

          <Grid container>
            <Grid container xs={12} className={styles.InputContainer} marginTop={2} marginLeft={0}>
              <Grid item xs={12} sm={5} className={styles.InputBox}>
                <TextField
                  required
                  value={settings.database.development.pool.min}
                  size="small"
                  variant="standard"
                  margin="dense"
                  fullWidth
                  type="number"
                  label="Min"
                  id="input-host"
                  helperText="Minimum number of connections in pool"
                />
              </Grid>
              <Grid item xs={12} sm={5} className={styles.InputBox}>
                <TextField
                  required
                  value={settings.database.development.pool.max}
                  size="small"
                  variant="standard"
                  margin="dense"
                  fullWidth
                  type="number"
                  label="Max"
                  id="input-host"
                  helperText="Maximum number of connections in pool"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* other settings */}
        <Grid item className={`${styles.HeaderContainer} ${styles.MainPad}`} sm={12} md={8} xl={4}>
          <Grid item className={styles.HeaderTextBox} md={12}>
            <h2>Other</h2>
            <p>Other settings.</p>
          </Grid>

          <Grid container spacing={2} className={styles.InputContainer} marginTop={2} marginLeft={0}>
            <Grid item className={styles.InputBox}>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox required value={settings.timer} size="small" id="input-timer" />}
                  label="Debug"
                />
                <FormHelperText>Debug sql queries in console</FormHelperText>
              </FormGroup>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Database

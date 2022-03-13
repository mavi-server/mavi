import type { NextPage } from 'next'
import { useState, useReducer } from 'react'
import {
  Grid,
  TextField,
  Checkbox,
  Switch,
  Divider,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete,
} from '@mui/material'
import styles from './index.module.css'

const initialState = {
  host: 'localhost',
  port: 3001,
  poweredBy: 'Mavi',
  timer: true,
  cors: {
    origin: ['*'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token', 'content-type', 'accept'],
  },
  static: {
    base: '/',
    folder: '../public',
    options: {
      dotfiles: 'ignore',
      etag: false,
      extensions: [
        'html',
        'htm',
        'css',
        'js',
        'png',
        'jpg',
        'jpeg',
        'gif',
        'ico',
        'svg',
        'eot',
        'ttf',
        'woff',
        'woff2',
        'otf',
      ],
      maxAge: '1d',
    },
  },
}

const defaultWhitelist = [
  { title: 'http:localhost:3000' },
  { title: 'http:localhost:8080' },
  { title: 'process.env.CLIENT_URL' },
  { title: 'process.env.SERVER_URL' },
  { title: 'https://fonts.googleapis.com' },
]

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'change':
      return {
        ...state,
        [action.name]: action.value,
      }
    case 'toggle':
      return {
        ...state,
        [action.name]: !state[action.name],
      }
    case 'toggle-cors':
      return {
        ...state,
        cors: {
          ...state.cors,
          [action.name]: !state.cors[action.name],
        },
      }
    default:
      return state
  }
}

const Settings: NextPage = () => {
  const [settings, dispatch] = useReducer(reducer, initialState)
  const [hostActive, setHostActive] = useState(false)
  const [portActive, setPortActive] = useState(false)
  const [poweredByActive, setPoweredByActive] = useState(false)

  return (
    <Grid>
      {/* general settings */}
      <Grid container className={[styles.HeaderContainer, styles.Dark, styles.MainPad]} md={12}>
        <Grid className={styles.HeaderTextBox} md={4}>
          <h2>General</h2>
          <p>These settings are used to configure the server.</p>
        </Grid>

        <Grid container className={styles.HeaderInputContainer}>
          <div className={styles.HeaderInputBox}>
            <TextField
              required
              value={settings.host}
              disabled={!hostActive}
              size="small"
              variant="standard"
              margin="dense"
              InputProps={{
                endAdornment: (
                  <Switch
                    disabled={false}
                    value={hostActive}
                    size="small"
                    onChange={() => setHostActive(!hostActive)}
                  />
                ),
              }}
              fullWidth
              label="Host"
              id="input-host"
              helperText="The location of the Node.js thread"
            />
          </div>
          <div className={styles.HeaderInputBox}>
            <TextField
              required
              value={settings.port}
              disabled={!portActive}
              size="small"
              variant="standard"
              margin="dense"
              InputProps={{
                endAdornment: (
                  <Switch
                    disabled={false}
                    value={portActive}
                    size="small"
                    onChange={() => setPortActive(!portActive)}
                  />
                ),
              }}
              fullWidth
              label="Port"
              id="input-port"
              type="number"
              helperText="Be sure that the port is not used by other processes"
            />
          </div>
          <div className={styles.HeaderInputBox}>
            <TextField
              required
              value={settings.poweredBy}
              disabled={!poweredByActive}
              size="small"
              variant="standard"
              margin="dense"
              InputProps={{
                endAdornment: (
                  <Switch
                    disabled={false}
                    value={poweredByActive}
                    size="small"
                    onChange={() => setPoweredByActive(!poweredByActive)}
                  />
                ),
              }}
              fullWidth
              label="Powered By"
              id="input-poweredby"
              type="text"
              helperText="This will be exposed on the response header"
            />
          </div>
        </Grid>
      </Grid>

      <Grid container>
        {/* cors settings */}
        <Grid className={[styles.HeaderContainer, styles.MainPad]} md={6}>
          <Grid className={styles.HeaderTextBox} md={12}>
            <h2>Cors</h2>
            <p>
              Cross-Origin Resource Sharing (CORS) is a mechanism that allows restricted resources to be requested from
              another domain outside the domain from which the resource originated.
            </p>
          </Grid>

          <Grid container>
            <Grid item md={12}>
              <Autocomplete
                fullWidth
                multiple
                id="cors-origin"
                options={defaultWhitelist.map((option) => option.title)}
                defaultValue={[defaultWhitelist[2].title]}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => <Chip variant="standard" label={option} {...getTagProps({ index })} />)
                }
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Origins" required placeholder="Whitelist" />
                )}
              />
              <FormHelperText>Cors Whitelist</FormHelperText>
            </Grid>
          </Grid>
        </Grid>

        {/* other settings */}
        <Grid className={[styles.HeaderContainer, styles.MainPad]} md={6}>
          <Grid className={styles.HeaderTextBox} md={12}>
            <h2>Other</h2>
            <p>These settings are used to configure the server.</p>
          </Grid>

          <Grid container spacing={2}>
            <Grid item>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox required value={settings.timer} size="small" id="input-timer" />}
                  label="Timer"
                />
                <FormHelperText>Print api responses with durations</FormHelperText>
              </FormGroup>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Settings

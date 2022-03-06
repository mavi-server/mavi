import type { NextPage } from 'next'
import { useState } from 'react'
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
  Select,
  FilledInput,
  MenuItem,
  ListItemText,
} from '@mui/material'
import styles from './index.module.css'

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 60 * 4.5,
      width: 250,
      flex: 1,
    },
  },
}

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder',
] as string[]

const Settings: NextPage = () => {
  const [settings, setSettings] = useState({
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
  })
  const [poweredByActive, setPoweredByActive] = useState(false)
  const [personName, setPersonName] = useState([])

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    )
  }
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4} xl={3}>
        Content<br></br>
        Detailed information about the config
      </Grid>
      <Grid item xs={12} sm={6} md={8} xl={6}>
        {/* general settings */}
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              required
              value={settings.host}
              size="small"
              variant="filled"
              margin="dense"
              fullWidth
              label="Host"
              id="input-host"
              helperText="The location of the Node.js thread"
            />
          </Grid>
          <Grid item>
            <TextField
              required
              value={settings.port}
              size="small"
              variant="filled"
              margin="dense"
              fullWidth
              label="Port"
              id="input-port"
              type="number"
              helperText="Be sure that the port is not used by other processes"
            />
          </Grid>
          <Grid item>
            <TextField
              required
              value={settings.poweredBy}
              disabled={!poweredByActive}
              size="small"
              variant="filled"
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
          </Grid>
        </Grid>

        {/* cors settings */}
        <Grid container spacing={2} className={styles.GroupBox}>
          <Grid item>
            <FormControl sx={{ width: 300 }}>
              <InputLabel id="input-cors-origin-label">Origin</InputLabel>
              <Select
                labelId="input-cors-origin-label"
                id="input-cors-origin"
                multiple
                variant="filled"
                value={personName}
                onChange={handleChange}
                input={<FilledInput margin="dense" size="small" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {names.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={personName.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Cors whitelist</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>

        {/* other settings */}
        <Divider variant="middle" textAlign="left" sx={{ margin: 'var(--lg)' }}>
          Other
        </Divider>
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
  )
}

export default Settings

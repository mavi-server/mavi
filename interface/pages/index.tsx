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
import initialState from '../states/mavi-config'

const defaultCorsWhitelist: AutocompleteOption[] = [
  { value: 'http:localhost:3000' },
  { value: 'process.env.CLIENT_URL' },
  { value: 'process.env.SERVER_URL' },
  { value: 'https://fonts.googleapis.com' },
]

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
const httpRequestMethods: AutocompleteOption[] = [
  { value: 'GET' },
  { value: 'HEAD' },
  { value: 'POST' },
  { value: 'PUT' },
  { value: 'DELETE' },
  { value: 'CONNECT' },
  { value: 'OPTIONS' },
  { value: 'TRACE' },
  { value: 'PATCH' },
]
const defaultAllowedHeaders: AutocompleteOption[] = [
  { value: 'x-access-token', readonly: true }, // required for authorization middlewares
  { value: 'x-refresh-token', readonly: true }, // required for authorization middlewares
  { value: 'token', readonly: true }, // required for authorization middlewares. used for cookies
  { value: 'content-type', readonly: true }, // required for some requests
  { value: 'accept', readonly: false }, //
]
type AutocompleteOption = {
  value: string
  readonly?: boolean
}

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
          <h2>Server</h2>
          <p>Base settings for the server.</p>
        </Grid>

        <Grid container className={styles.InputContainer}>
          <Grid xs={12} md={2} sm={4} xl={1} className={styles.InputBox}>
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
          </Grid>
          <Grid xs={12} md={2} sm={4} xl={1} className={styles.InputBox}>
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
          </Grid>
          <Grid xs={12} md={2} sm={4} xl={1} className={styles.InputBox}>
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
          </Grid>
        </Grid>
      </Grid>

      <Grid container>
        {/* cors settings */}
        <Grid className={[styles.HeaderContainer, styles.MainPad]} sm={12} md={8} xl={4}>
          <Grid className={styles.HeaderTextBox} md={12}>
            <h2>Cors</h2>
            <p>
              Cross-Origin Resource Sharing (CORS) is a mechanism that allows restricted resources to be requested from
              another domain outside the domain from which the resource originated.
            </p>
          </Grid>

          <Grid container rowSpacing={5}>
            <Grid item md={12}>
              <Autocomplete
                fullWidth
                multiple
                id="cors-origin"
                options={defaultCorsWhitelist.map((option) => option.value)}
                defaultValue={defaultCorsWhitelist.map((option) => option.value)}
                freeSolo
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} disabled={defaultCorsWhitelist[index].readonly} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Origins" placeholder="Whitelist" />
                )}
              />
              <FormHelperText>Configures the Access-Control-Allow-Origin CORS header</FormHelperText>
            </Grid>
            <Grid item md={12}>
              <Autocomplete
                fullWidth
                multiple
                id="cors-methods"
                options={httpRequestMethods.map((option) => option.value)}
                defaultValue={httpRequestMethods.map((option) => option.value)}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} disabled={httpRequestMethods[index].readonly} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Methods" placeholder="Allowed Methods" />
                )}
              />
              <FormHelperText>Configures the Access-Control-Allow-Methods CORS header</FormHelperText>
            </Grid>
            <Grid item md={12}>
              <Autocomplete
                fullWidth
                multiple
                id="cors-allowed-headers"
                options={defaultAllowedHeaders.filter((option) => !option.readonly).map((option) => option.value)}
                defaultValue={defaultAllowedHeaders.map((option) => option.value)}
                freeSolo
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      disabled={defaultAllowedHeaders[index] && defaultAllowedHeaders[index].readonly}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Allowed Headers" placeholder="Allowed Headers" />
                )}
              />
              <FormHelperText>Configures the Access-Control-Allow-Headers CORS header</FormHelperText>
            </Grid>
            <Grid item md={12}>
              <Autocomplete
                fullWidth
                multiple
                id="cors-expose-headers"
                options={defaultAllowedHeaders.filter((option) => !option.readonly).map((option) => option.value)}
                defaultValue={defaultAllowedHeaders.map((option) => option.value)}
                freeSolo
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      disabled={defaultAllowedHeaders[index] && defaultAllowedHeaders[index].readonly}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Exposed Headers" placeholder="Exposed Headers" />
                )}
              />
              <FormHelperText>Configures the Access-Control-Expose-Headers CORS header</FormHelperText>
            </Grid>
            <Grid container item md={12} className={styles.InputContainer} justifyContent="center">
              <Grid item className={styles.InputBox} md={5}>
                <FormControlLabel
                  control={
                    <Checkbox required value={settings.cors.credentials} size="medium" id="input-cors-credentials" />
                  }
                  label="Credentials"
                />
                <FormHelperText>
                  Configures the Access-Control-Allow-Credentials CORS header. Set to true to pass the header, otherwise
                  it is omitted
                </FormHelperText>
              </Grid>
              <Grid item className={styles.InputBox} md={5}>
                <FormControlLabel
                  control={
                    <Checkbox
                      required
                      value={settings.cors.preflightContinue}
                      size="medium"
                      id="input-cors-credentials"
                    />
                  }
                  label="Preflight Continue"
                />
                <FormHelperText>Pass the CORS preflight response to the next handler</FormHelperText>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* other settings */}
        <Grid item className={[styles.HeaderContainer, styles.MainPad]} sm={12} md={4}>
          <Grid item className={styles.HeaderTextBox} md={12}>
            <h2>Other</h2>
            <p>These settings are used to configure the server.</p>
          </Grid>

          <Grid container spacing={2} className={styles.InputContainer} marginTop={2} marginLeft={0}>
            <Grid item className={styles.InputBox}>
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

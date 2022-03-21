import { Grid, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import Populate from '../../../../../routes/populate'
import Models from '../../../../../models/index'
const utils = ['sanitize', 'detect-language']
const middlewares = ['authorization', 'is-owner', 'interceptor']

type RouteEditProps = {
  prop: string
  route: any
}

const Route = ({ prop, route }: RouteEditProps) => {
  // static view
  // dynamic view
  return (() => {
    switch (prop) {
      case 'path':
        return (
          <TextField fullWidth id="standard-basic" label="Path" size="small" variant="outlined" value={route.path} />
        )
      case 'method':
        return (
          <TextField
            fullWidth
            id="standard-basic"
            label="Method"
            size="small"
            variant="outlined"
            value={route.method}
          />
        )
      case 'controller':
        return (
          <TextField
            fullWidth
            id="standard-basic"
            label="Controller"
            size="small"
            variant="outlined"
            value={route.controller}
          />
        )
      case 'model':
        return (
          <FormControl fullWidth variant="outlined" size="small" style={{ minWidth: 168 }}>
            <InputLabel id="demo-simple-select-label">Model</InputLabel>
            <Select labelId="demo-simple-select-label" id="demo-simple-select" value={route.model} label="Model">
              {Object.keys(Models).map((model) => {
                return <MenuItem value={model}>{model}</MenuItem>
              })}
            </Select>
          </FormControl>
        )
      case 'populate':
        return (
          <Autocomplete
            fullWidth
            multiple
            id="tags-standard"
            options={Object.keys(Populate).map((option) => option)}
            getOptionLabel={(option) => option}
            defaultValue={route.populate}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" size="small" label="Populate" placeholder="Add Populate" />
            )}
          />
        )
      case 'middlewares':
        return (
          <Autocomplete
            fullWidth
            multiple
            id="tags-standard"
            options={middlewares.map((option) => option)}
            getOptionLabel={(option) => option}
            defaultValue={route.middlewares}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" size="small" label="Middlewares" placeholder="Add Middleware" />
            )}
          />
        )
      case 'utils':
        return (
          <Autocomplete
            fullWidth
            multiple
            id="tags-standard"
            options={utils.map((option) => option)}
            getOptionLabel={(option) => option}
            defaultValue={route.utils}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" size="small" label="Utils" placeholder="Add Utility Function" />
            )}
          />
        )
      default:
        return null
    }

    // <Grid item>
    //   <Autocomplete
    //     multiple
    //     id="tags-standard"
    //     options={middlewares.map((option) => option)}
    //     getOptionLabel={(option) => option}
    //     defaultValue={route.exclude}
    //     renderInput={(params) => (
    //       <TextField {...params} variant="outlined" size="small" label="Middlewares" placeholder="Add Middleware" />
    //     )}
    //   />
    // </Grid>
  })()
}

export default Route

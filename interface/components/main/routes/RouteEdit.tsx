import { Grid, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import Populate from '../../../../../routes/populate'
import Models from '../../../../../models/index'
const utils = ['sanitize', 'detect-language']
const middlewares = ['authorization', 'is-owner', 'interceptor']

const Route = ({ route }) => {
  // static view
  // dynamic view
  return (
    <Grid container spacing={2} flexDirection="column">
      <Grid item>
        <TextField id="standard-basic" label="Path" size="small" variant="outlined" value={route.path} />
      </Grid>
      <Grid item>
        <TextField id="standard-basic" label="Method" size="small" variant="outlined" value={route.method} />
      </Grid>
      <Grid item>
        <TextField id="standard-basic" label="Controller" size="small" variant="outlined" value={route.controller} />
      </Grid>
      <Grid item>
        <FormControl variant="outlined" size="small" style={{ minWidth: 168 }}>
          <InputLabel id="demo-simple-select-label">Model</InputLabel>
          <Select labelId="demo-simple-select-label" id="demo-simple-select" value={route.model} label="Model">
            {Object.keys(Models).map((model) => {
              return <MenuItem value={model}>{model}</MenuItem>
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        <Autocomplete
          multiple
          id="tags-standard"
          options={Object.keys(Populate).map((option) => option)}
          getOptionLabel={(option) => option}
          defaultValue={route.populate}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" label="Populate" placeholder="Add Populate" />
          )}
        />
      </Grid>
      <Grid item>
        <Autocomplete
          multiple
          id="tags-standard"
          options={utils.map((option) => option)}
          getOptionLabel={(option) => option}
          defaultValue={route.utils}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" label="Utils" placeholder="Add Utility Function" />
          )}
        />
      </Grid>
      <Grid item>
        <Autocomplete
          multiple
          id="tags-standard"
          options={middlewares.map((option) => option)}
          getOptionLabel={(option) => option}
          defaultValue={route.middlewares}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" label="Middlewares" placeholder="Add Middleware" />
          )}
        />
      </Grid>
      {/* <Grid item>
        <Autocomplete
          multiple
          id="tags-standard"
          options={middlewares.map((option) => option)}
          getOptionLabel={(option) => option}
          defaultValue={route.exclude}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" label="Middlewares" placeholder="Add Middleware" />
          )}
        />
      </Grid> */}
    </Grid>
  )
}

export default Route

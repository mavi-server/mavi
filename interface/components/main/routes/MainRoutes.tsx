import { useState } from 'react'
import {
  Typography,
  Grid,
  Badge,
  Stack,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import PropInput from './PropInput'
import RouteIcon from '@mui/icons-material/AccountTree'

import routes from '../../../../../routes/index'
import type { Route } from '../../../../types'

type Indexes = (number | any)[]

export default function ManageRoutes() {
  const [selectedListItems, setSelectedListItems] = useState([null, null, null, null] as Indexes)

  const handleListItemClick = (index: number, depth: number) => {
    // set index by depth
    const indexes: Indexes = [...selectedListItems]
    indexes.forEach((v, i) => {
      // assign new index
      if (depth === i) indexes[i] = index
      // reset all indexes after this depth
      if (i > depth || (depth === i && indexes[i] === v)) indexes[i] = null
    })
    setSelectedListItems(indexes)
  }

  return (
    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={1}>
      {/* depth 0 */}
      <Grid container xs={2.5} flexDirection="column">
        <Typography variant="h6">Entities</Typography>
        <List component="nav" aria-label="main mailbox folders" sx={{ flex: 1 }}>
          {Object.keys(routes).map((name: any, index) => {
            const depth = 0
            const main: Route[] = routes[name] // entity routes | main routes
            // const staticPathCount = main.filter((route) => route.serve).length || null

            return (
              <ListItemButton
                selected={index === selectedListItems[depth]}
                onClick={() => handleListItemClick(index, depth)}
                key={index}
              >
                <ListItemIcon>
                  <RouteIcon />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItemButton>
            )
          })}
        </List>
      </Grid>

      {/* depth 1 */}
      {selectedListItems[0] != null && (
        <Grid container xs={2.5} flexDirection="column">
          <Typography variant="h6">Routes</Typography>
          <List component="nav" aria-label="main mailbox folders" sx={{ flex: 1 }}>
            {(() => {
              const depth: number = 1
              const key: string = Object.keys(routes)[selectedListItems[0]]
              const main: Route[] = routes[key] // entity routes | main routes

              // if any item selected in previous group
              // render next group
              if (main && main.length) {
                return main.map((route, index) => {
                  return (
                    <ListItemButton
                      selected={index === selectedListItems[depth]}
                      onClick={() => handleListItemClick(index, depth)}
                      key={index}
                    >
                      <ListItemIcon>
                        <RouteIcon />
                      </ListItemIcon>
                      <ListItemText primary={route.path} />
                    </ListItemButton>
                  )
                })
              } else {
                return (
                  <ListItemButton>
                    <ListItemText primary="Nothing to see here" />
                  </ListItemButton>
                )
              }
            })()}
          </List>
        </Grid>
      )}

      {/* depth 2 */}
      {selectedListItems[1] != null && (
        <Grid container xs={2.5} flexDirection="column">
          <Typography variant="h6">Configs</Typography>
          <List component="nav" aria-label="main mailbox folders" sx={{ flex: 1 }}>
            {(() => {
              const depth: number = 2
              const key: string = Object.keys(routes)[selectedListItems[0]]
              const main: Route[] = routes[key] // entity routes | main routes
              const route: Route = main[selectedListItems[depth - 1]]

              // if any item selected in previous group
              // render next group
              if (route) {
                return Object.keys(route).map((propertyName, index) => {
                  return (
                    <ListItemButton
                      selected={index === selectedListItems[depth]}
                      onClick={() => handleListItemClick(index, depth)}
                      key={index}
                    >
                      <ListItemIcon>
                        <RouteIcon />
                      </ListItemIcon>
                      <ListItemText primary={propertyName} />
                    </ListItemButton>
                  )
                })
              } else {
                return (
                  <ListItemButton>
                    <ListItemText primary="Nothing to see here" />
                  </ListItemButton>
                )
              }
            })()}
          </List>
        </Grid>
      )}

      {/* depth 3 */}
      {selectedListItems[2] != null && (
        <Grid container xs={2.5} flexDirection="column">
          <Stack flexDirection="row">
            <RouteIcon />
            {(() => {
              const key: string = Object.keys(routes)[selectedListItems[0]]
              const index: number = selectedListItems[1]
              const route: Route = routes[key][index]
              const prop = Object.keys(route)[selectedListItems[2]]
              return (
                <Typography variant="h6" sx={{ marginLeft: 1 }}>
                  {prop}
                </Typography>
              )
            })()}
          </Stack>

          <List component="nav" aria-label="main mailbox folders" sx={{ flex: 1, padding: 2 }}>
            {(() => {
              const depth: number = 3
              const key: string = Object.keys(routes)[selectedListItems[0]]
              const index: number = selectedListItems[1]
              const route: Route = routes[key][index]
              const prop = Object.keys(route)[selectedListItems[2]]

              // if any item selected in previous group
              // render next group
              if (route[prop]) {
                return <PropInput route={route} prop={prop} />
              } else {
                return (
                  <ListItemButton>
                    <ListItemText primary="Nothing to see here" />
                  </ListItemButton>
                )
              }
            })()}
          </List>
        </Grid>
      )}
    </Stack>
  )
}

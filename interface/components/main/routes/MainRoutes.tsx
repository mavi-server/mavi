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
import ProgressiveList from '../../ProgressiveList'

import routes from '../../../../../routes/index'
import type { Route } from '../../../../types'

const ListItems = [
  {
    title: 'Entities',
    component: ({ handleListItemClick, selectedListItems, setSelectedListItems }: any) =>
      Object.keys(routes).map((name: any, index) => {
        const depth = 0
        // const main: Route[] = routes[name] // entity routes | main routes
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
      }),
  },
  {
    title: 'Routes',
    component: ({ handleListItemClick, selectedListItems, setSelectedListItems }: any) => {
      const depth = 1
      const key: string = Object.keys(routes)[selectedListItems[depth - 1]]
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
    },
  },
  {
    title: 'Configs',
    component: ({ handleListItemClick, selectedListItems, setSelectedListItems }: any) => {
      const depth = 2
      const key: string = Object.keys(routes)[selectedListItems[depth - 2]]
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
    },
  },
  {
    title: 'Props',
    icon: <RouteIcon />,
    component: ({ handleListItemClick, selectedListItems, setSelectedListItems }: any) => {
      const depth = 3
      const key: string = Object.keys(routes)[selectedListItems[depth - 3]]
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
    },
  },
]

export default function ManageRoutes() {
  return <ProgressiveList maxDepth={4} listItems={ListItems} />
}

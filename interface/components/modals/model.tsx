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
import SchemaIcon from '@mui/icons-material/Schema'
import models from '../../../../models/index'
import ProgressiveList from '../ProgressiveList'

const ListItems = [
  {
    title: 'Tables',
    component: ({ handleListItemClick, selectedListItems, setSelectedListItems }: any) =>
      Object.keys(models).map((name: any, index) => {
        const depth = 0
        const main: any = models[name] // entity routes | main routes

        return (
          <ListItemButton
            selected={index === selectedListItems[depth]}
            onClick={() => handleListItemClick(index, depth)}
            key={index}
          >
            <ListItemIcon>
              <SchemaIcon />
            </ListItemIcon>
            <ListItemText primary={name} />
          </ListItemButton>
        )
      }),
  },
  {
    title: 'Columns',
    component: ({ handleListItemClick, selectedListItems, setSelectedListItems }: any) =>
      Object.keys(models).map((name: string, index) => {
        const depth = 1
        const model = models[name] // entity routes | main routes

        // if any item selected in previous group
        // render next group
        if (model) {
          return Object.keys(model).map((column, index) => {
            return (
              <ListItemButton
                selected={index === selectedListItems[depth]}
                onClick={() => handleListItemClick(index, depth)}
                key={index}
              >
                <ListItemText primary={column} />
              </ListItemButton>
            )
          })
        }
      }),
  },
]

export default function Models() {
  return <ProgressiveList maxDepth={4} listItems={ListItems} />
}

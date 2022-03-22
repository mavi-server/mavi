import { useState, useContext } from 'react'
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
import ProgressiveList from '../ProgressiveList'

import { MaviConfigContext } from '../context'
export default function Models() {
  const ctx = useContext(MaviConfigContext)
  const models = ctx.state.api.define.models

  return (
    <ProgressiveList
      ctx={ctx}
      maxDepth={4}
      items={([i, ii, iii, iiii]: any[]) => {
        let list = []
        let modelsKeys: string[] = Object.keys(models)
        //.filter((c) => c != 'hash')
        let selectedModelKey: string
        let columns: any
        let prop: any

        list[0] = {
          name: 'Models',
          header: {
            text: 'Models',
            icon: <SchemaIcon />,
            menu: ['add', 'edit', 'delete'],
          },
          list: modelsKeys.map((modelKey: string) => {
            return {
              text: modelKey,
              icon: <SchemaIcon />,
            }
          }),
        }

        if (i) {
          selectedModelKey = Object.keys(models)[i]
          columns = Object.keys(models[selectedModelKey])
          //.filter((c) => c != 'hash')

          list[1] = {
            name: 'Model',
            header: {
              text: selectedModelKey,
              icon: <SchemaIcon />,
              menu: ['add', 'edit', 'delete'],
            },
            list: columns.map((columnName: string) => {
              return {
                text: columnName,
                icon: <SchemaIcon />,
              }
            }),
          }
        }

        if (ii) {
          prop = Object.keys(models[selectedModelKey][columns[ii]])
          //.filter((c) => c != 'hash')
          list[2] = {
            name: 'Columns',
            header: {
              text: columns[ii],
              icon: <SchemaIcon />,
              menu: ['add', 'edit', 'delete'],
            },
            list: prop.map((prop: string) => {
              return {
                text: prop,
                icon: <SchemaIcon />,
              }
            }),
          }
        }

        // if (iii) {
        //   prop = Object.keys(models[selectedModelKey][columns[ii]]).filter((c) => c != 'hash')
        //   list[2] = {
        //     name: 'Columns',
        //     header: {
        //       text: columns[ii],
        //       icon: <SchemaIcon />,
        //       menu: ['add','edit','delete'],
        //     },
        //     list: prop.map((prop: string) => {
        //       return {
        //         text: prop,
        //         icon: <SchemaIcon />,
        //       }
        //     }),
        //   }
        // }

        return list
      }}
    />
  )
}

import { useContext, useState } from 'react'
import PropInput from './PropInput'
import RouteIcon from '@mui/icons-material/AccountTree'
import FolderIcon from '@mui/icons-material/Folder'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import ProgressiveList from '../../ProgressiveList'

import { MaviConfigContext } from '../../context'
export default function ManageRoutes() {
  const ctx = useContext(MaviConfigContext)
  const routes = ctx.state.api.routes

  return (
    <ProgressiveList
      maxDepth={4}
      ctx={ctx}
      name="routes"
      items={([i, ii, iii, iiii]: any[]) => {
        let list = [],
          path: string,
          route: any,
          prop: any

        list[0] = {
          name: 'Entity',
          header: {
            text: 'Entities',
            icon: <FolderIcon />,
            menu: ['add', 'delete', 'edit'],
          },
          list: Object.keys(routes).map((entityPath: any) => {
            return {
              text: entityPath,
              icon: <FolderIcon />,
            }
          }),
        }

        if (i !== null) {
          path = Object.keys(routes)[i]

          list[1] = {
            name: 'Route',
            header: {
              text: path,
              icon: <RouteIcon />,
              menu: ['add', 'delete', 'edit'],
            },
            list: routes[path].map((route: any) => {
              return {
                text: route.path,
                icon: <RouteIcon />,
              }
            }),
          }
        }
        if (ii !== null) {
          route = routes[path][ii]

          list[2] = {
            name: 'Config',
            header: {
              text: route.path,
              icon: <SettingsIcon />,
              // menu: ['add', 'delete'],
            },
            list: Object.keys(route).map((propertyName: string) => {
              return {
                text: propertyName,
                icon: <SettingsIcon />,
              }
            }),
          }
        }
        if (iii !== null) {
          prop = Object.keys(route)[iii]

          list[3] = {
            name: 'Input',
            header: {
              text: prop,
              icon: <EditIcon />,
            },
            component: <PropInput route={route} prop={prop} />,
          }
        }

        return list
      }}
    />
  )
}

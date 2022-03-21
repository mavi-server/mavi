import { useState } from 'react'
import Box from '@mui/material/Box'
import Backdrop from '@mui/material/Backdrop'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'

import SchemaIcon from '@mui/icons-material/Schema'
import RouteIcon from '@mui/icons-material/AccountTree'
import PuzzleIcon from '@mui/icons-material/Extension'
import LayersIcon from '@mui/icons-material/Layers'
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed'
import PreviewIcon from '@mui/icons-material/Preview'

import ModalContainer from './modals'

const actions = [
  { icon: <SchemaIcon />, name: 'Model' },
  // { icon: <RouteIcon />, name: 'Route' },
  { icon: <PuzzleIcon />, name: 'Populate' },
  { icon: <LayersIcon />, name: 'Controller' },
  { icon: <DynamicFeedIcon />, name: 'Middleware' },
  { icon: <PreviewIcon />, name: 'View' },
]

export default function AddButton() {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null as any)

  return (
    <Box sx={{ height: '100%', position: 'fixed', flexGrow: 1, zIndex: 2 }}>
      <ModalContainer onClose={() => setModal(null)} modal={modal} />

      <SpeedDial
        title="Add"
        ariaLabel="SpeedDial tooltip example"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          '.MuiButtonBase-root': {
            backgroundColor: 'var(--mavi)',
          },
          '.MuiSvgIcon-root *': {
            fill: 'var(--primary)',
          },
          '.MuiSpeedDialAction-staticTooltipLabel': {
            whiteSpace: 'nowrap',
          },
        }}
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => setModal(action)}
          />
        ))}
      </SpeedDial>
    </Box>
  )
}

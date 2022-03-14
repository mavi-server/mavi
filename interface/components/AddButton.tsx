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

const actions = [
  { icon: <SchemaIcon />, name: 'Model' },
  { icon: <RouteIcon />, name: 'Route' },
  { icon: <PuzzleIcon />, name: 'Populate' },
  { icon: <LayersIcon />, name: 'Controller' },
  { icon: <DynamicFeedIcon />, name: 'Middleware' },
  { icon: <PreviewIcon />, name: 'View' },
]

export default function AddButton() {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box sx={{ height: '100%', position: 'fixed', flexGrow: 1, zIndex: 2 }}>
      <Backdrop open={open} />
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
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={handleClose}
          />
        ))}
      </SpeedDial>
    </Box>
  )
}

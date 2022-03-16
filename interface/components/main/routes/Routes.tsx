import * as React from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { Route } from '../../../../types'
import RouteEdit from './RouteEdit'

type RoutesParams = {
  name: string
  routes: Route[]
}

const Routes = ({ routes, name }: RoutesParams) => {
  return routes.map((route, index) => {
    return (
      <Accordion
        key={index}
        disableGutters
        elevation={0}
        sx={{
          border: '1px solid hsla(var(--dark-hsl), 0.1)',
          '&:not(:last-child)': { borderBottom: 0 },
          '&:before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">{(name + route.path).replace(/\/+/g, '/')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RouteEdit route={route} />
        </AccordionDetails>
      </Accordion>
    )
  })
}

export default Routes

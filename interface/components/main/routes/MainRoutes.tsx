import { useState } from 'react'
import { styled } from '@mui/material/styles'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import { Typography, Grid, Badge, Stack, Chip } from '@mui/material'

import Routes from './Routes'

import RoutesIcon from '@mui/icons-material/AccountTree'
import FolderIcon from '@mui/icons-material/Folder'

const Accordion = styled((props) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 'var(--xs)',
  marginBottom: 'var(--xs)',
  '&:before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props) => <MuiAccordionSummary {...props} />)(({ theme }) => ({
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

import routes from '../../../../../routes/index'
import type { Route } from '../../../../types'

export default function CustomizedAccordions() {
  const [expanded, setExpanded] = useState('panel1')

  const handleChange = (panel: any) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <>
      {Object.keys(routes).map((name: any, index) => {
        const main: Route[] = routes[name] // entity routes | main routes
        const staticPathCount = main.filter((route) => route.serve).length || null

        return (
          <Accordion expanded={expanded === name} onChange={handleChange(name)} key={index}>
            <AccordionSummary aria-controls={`${name}-content`} id={`${name}-header`}>
              <Grid container>
                <Grid item>
                  <Badge
                    sx={{ '& .MuiBadge-badge': { backgroundColor: 'var(--mavi)', color: 'var(--primary)' } }}
                    badgeContent={main.length}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    showZero
                  >
                    <RoutesIcon />
                  </Badge>
                </Grid>
                <Grid item flex={1}>
                  <Typography marginLeft={1} marginRight={1}>
                    {name}
                  </Typography>
                </Grid>

                <Grid item>
                  {staticPathCount && (
                    <Chip
                      size="small"
                      icon={<FolderIcon />}
                      label={`${staticPathCount} static path${staticPathCount > 1 ? 's' : ''}`}
                    />
                  )}
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Routes routes={main} name={name} />
            </AccordionDetails>
          </Accordion>
        )
      })}
    </>
  )
}

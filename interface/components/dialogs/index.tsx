import { useContext } from 'react'
import {
  Grid,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type DialogProps = {
  open: boolean
  onClose: () => void
  data: {
    type: SupportedDialogTypes
    params?: any
    title?: string
    description?: string
    icon?: any
  }
}

type SupportedDialogTypes =
  | 'add-route/api.routes'
  | 'edit-route/api.routes'
  | 'delete-route/api.routes'
  | 'add-model/api.routes.define.models'
  | 'edit-model/api.routes.define.models'
  | 'delete-model/api.routes.define.models'

import { MaviConfigContext } from '../context'
export default function CommonActionsDialog({ data, open, onClose }: DialogProps) {
  const { state, actions, dispatch } = useContext(MaviConfigContext)
  const [tn, namespace] = data && data.type ? data.type.split('/') : ''
  const [type, name] = tn ? tn.split('-') : ''

  const handleAction = () => {
    const fn = `${type}${name[0].toUpperCase() + name.slice(1)}` // eg: => addRoute
    if (fn in actions) {
      switch (type) {
        case 'add':
          break
        case 'edit':
          break
        case 'delete':
          break
      }
      // actions[fn](name, data.params)
    } else {
      console.error(`${fn} not implemented`)
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {data &&
        (() => {
          switch (type) {
            case 'delete':
              return (
                <>
                  <DialogTitle id="alert-dialog-title">
                    {data.title || `Are you sure you want to delete this ${name}?`}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      {data.description || 'This selection will be removed from your list.'}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={onClose}>Disagree</Button>
                    <Button onClick={handleAction} autoFocus>
                      Agree
                    </Button>
                  </DialogActions>
                </>
              )
            case 'edit':
              return (
                <>
                  <DialogTitle id="alert-dialog-title">
                    {data.title || `Edit ${name[0].toUpperCase() + name.slice(1)}`}
                  </DialogTitle>
                  <DialogContent>
                    {/* {JSON.stringify(data.params)} */}
                    <Grid item sx={{ paddingTop: 1 }}>
                      <TextField label="Input" variant="outlined" size="small" />
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button sx={{ color: 'var(--dark-lighter)' }} onClick={onClose}>
                      Close
                    </Button>
                    <Button sx={{ color: 'var(--mavi' }} onClick={handleAction} autoFocus>
                      Save
                    </Button>
                  </DialogActions>
                </>
              )
            case 'add':
              const Name = name[0].toUpperCase() + name.slice(1)
              return (
                <>
                  <DialogTitle id="alert-dialog-title">{data.title || `Add ${Name}`}</DialogTitle>
                  <DialogContent>
                    <Grid item sx={{ paddingTop: 1 }}>
                      <TextField label="Input" variant="outlined" size="small" />
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button sx={{ color: 'var(--dark-lighter)' }} onClick={onClose}>
                      Close
                    </Button>
                    <Button sx={{ color: 'var(--mavi' }} onClick={handleAction} autoFocus>
                      New {Name}
                    </Button>
                  </DialogActions>
                </>
              )
            default:
              return <div>Please define dialog type</div>
          }
        })()}
    </Dialog>
  )
}

import React, { useContext, useEffect, useState } from 'react'
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

export type DialogProps = {
  open: boolean
  onClose: () => void
  data: DialogData
}

export type DialogData = {
  type?: SupportedDialogTypes
  params: {
    name: 'routes' | 'models' | 'controllers' | 'views' | 'middlewares'
    selectedListItems?: (number | any)[]
    depth?: number
    inputText?: string
  }
  title?: string
  description?: string
  icon?: any
}
type SupportedDialogTypes = 'add' | 'edit' | 'delete'

import { MaviConfigContext } from '../context'
export function CommonActionsDialog({ data, open, onClose }: DialogProps) {
  const { state, actions, dispatch } = useContext(MaviConfigContext)
  const [input, setInput] = useState('')
  const { name } = data.params
  const { type } = data

  useEffect(() => {
    if (data.params.inputText) {
      setInput(data.params.inputText)
    }
  }, [data.params.inputText])

  const handleInputChange = (e: any) => {
    setInput(e.target.value)
  }
  const handleInputEnter = (e: any) => {
    if (e.key === 'Enter') {
      handleAction()

      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleAction = () => {
    // produce action name
    const fn = `${type}${name[0].toUpperCase() + name.slice(1)}` // eg: => addRoute

    // execute the action
    actions(fn, { input, ...data.params })

    setInput('')

    // close the dialog
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
                    <Grid item sx={{ paddingTop: 1 }}>
                      <TextField
                        autoFocus
                        label="Input"
                        variant="outlined"
                        size="small"
                        value={input}
                        onKeyDown={handleInputEnter}
                        onInput={handleInputChange}
                      />
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
                      <TextField
                        autoFocus
                        label="Input"
                        variant="outlined"
                        size="small"
                        value={input}
                        onKeyDown={handleInputEnter}
                        onInput={handleInputChange}
                      />
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button sx={{ color: 'var(--dark-lighter)' }} onClick={onClose}>
                      Close
                    </Button>
                    <Button disabled={input == ''} sx={{ color: 'var(--mavi' }} onClick={handleAction} autoFocus>
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

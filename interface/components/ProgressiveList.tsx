import { useState } from 'react'
import {
  Typography,
  Grid,
  Badge,
  Button,
  Stack,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import CommonActionsDialog from './dialogs'
import type { ContextType } from '../components/context/index.d'

type Indexes = (number | any)[]
type ListItem = {
  name: string
  header: {
    text: string
    icon?: any
    menu: Array<'add' | 'edit' | 'delete'>
  }
  list?: any
  component?: any
}
type ProgressiveList = (indexes: Indexes) => Array<ListItem>

type ListProps = {
  ctx: ContextType
  maxDepth: number
  items: ProgressiveList
}
export default function ProgressiveList({ ctx, maxDepth, items }: ListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogData, setDialogData] = useState({})
  const [selectedListItems, setSelectedListItems] = useState<Indexes>(Array(maxDepth + 1).fill(null))
  const handleListItemClick = (index: number, depth: number) => {
    // set index by depth
    const indexes: Indexes = [...selectedListItems]
    indexes.forEach((v, i) => {
      // assign new index
      if (depth === i) indexes[i] = index
      // reset all indexes after this depth
      if (i > depth || (depth === i && indexes[i] === v)) indexes[i] = null
    })
    setSelectedListItems(indexes)
  }

  const [open, setOpen] = useState<any>(false)
  const [anchor, setAnchor] = useState<any>(null)
  const handleClick = (e: any, depth: number) => {
    setOpen(depth)
    setAnchor(e.currentTarget)
  }
  const handleClose = () => {
    setOpen(null)
    setAnchor(null)
    setDialogOpen(false)
  }

  const handleListItemDelete = () => {
    setDialogOpen(true)
    setDialogData({
      type: `delete-route/api.routes`,
      params: selectedListItems,
    })
  }
  const handleListItemEdit = () => {
    setDialogOpen(true)
    setDialogData({
      type: `edit-route/api.routes`,
      params: selectedListItems,
    })
  }
  const handleListItemAdd = () => {
    setDialogOpen(true)
    setDialogData({
      type: `add-route/api.routes`,
      params: selectedListItems,
    })
  }

  return (
    <>
      <CommonActionsDialog open={dialogOpen} onClose={handleClose} data={dialogData} />

      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={1}>
        {items(selectedListItems)
          .filter((item, depth) => item !== null)
          .map((item, depth) => {
            return (
              <Grid container xs={2.5} flexDirection="column" key={depth}>
                <Stack flexDirection="row" justifyContent="space-between" alignItems="center" height={34}>
                  {/* set icon component if exists */}
                  {item.header.icon}

                  {/* set header text */}
                  <Typography variant="h6" sx={{ marginLeft: 1 }} flex={1}>
                    {item.header.text}
                  </Typography>

                  {selectedListItems[depth] !== null && (
                    <IconButton
                      onClick={(e) => handleClick(e, depth)}
                      aria-label="more"
                      id={`menu-button-${depth}`}
                      aria-controls={open ? 'long-menu' : undefined}
                      aria-expanded={open ? 'true' : undefined}
                      aria-haspopup="true"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}

                  {/* menu */}
                  {item.header.menu && (
                    <Menu
                      id={`long-menu-${depth}`}
                      MenuListProps={{
                        'aria-labelledby': `menu-button-${depth}`,
                      }}
                      sx={{
                        '& .MuiMenuItem-root': {
                          alignItems: 'center',
                          '& .MuiSvgIcon-root': {
                            fontSize: 18,
                            marginRight: 1.1,
                          },
                        },
                      }}
                      anchorEl={anchor}
                      open={open === depth}
                      onClose={handleClose}
                      PaperProps={{
                        style: {
                          maxHeight: 200,
                          width: 100,
                        },
                      }}
                    >
                      {item.header.menu.includes('delete') && (
                        <MenuItem onClick={() => handleListItemDelete()}>
                          <DeleteIcon />
                          Delete
                        </MenuItem>
                      )}
                      {item.header.menu.includes('edit') && (
                        <>
                          <Divider sx={{ my: 0.5 }} />
                          <MenuItem onClick={() => handleListItemEdit()}>
                            <EditIcon />
                            Edit
                          </MenuItem>
                        </>
                      )}
                    </Menu>
                  )}
                </Stack>

                <List component="nav" aria-label={`main list-depth:${depth}`} sx={{ flex: 1 }}>
                  {/* add items */}
                  {item.header.menu && item.header.menu.includes('add') && (
                    <Button
                      startIcon={<AddIcon />}
                      variant="text"
                      size="small"
                      disableRipple
                      onClick={() => handleListItemAdd()}
                    >
                      Add {item.name || item.header.text}
                    </Button>
                  )}

                  {(() => {
                    if (item.list) {
                      return item.list.map((listItem: any, index: number) => {
                        return (
                          <ListItemButton
                            selected={index === selectedListItems[depth]}
                            onClick={() => handleListItemClick(index, depth)}
                            key={index}
                          >
                            <ListItemIcon>
                              {/* set icon component if exists */}
                              {listItem.icon}
                            </ListItemIcon>

                            {/* set list text */}
                            <ListItemText primary={listItem.text} />
                          </ListItemButton>
                        )
                      })
                    } else if (item.component) {
                      return item.component
                    } else {
                      return (
                        <ListItemButton>
                          <ListItemText primary="Nothing to see here" />
                        </ListItemButton>
                      )
                    }
                  })()}
                </List>
              </Grid>
            )
          })}
      </Stack>
    </>
  )
}

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

type Indexes = (number | any)[]
type ListItem = {
  title: string
  icon: any
  component: (props: any) => any
}

export default function ProgressiveList({ maxDepth, listItems }: { maxDepth: number; listItems: ListItem[] }) {
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

  return (
    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={1}>
      {listItems
        .filter((Item, depth) => depth === 0 || selectedListItems[depth - 1] !== null)
        .map((Item, depth) => {
          return (
            <Grid container xs={2.5} flexDirection="column" key={depth}>
              <Stack flexDirection="row">
                {Item.icon}
                <Typography variant="h6" sx={{ marginLeft: 1 }}>
                  {Item.title}
                </Typography>
              </Stack>

              <List component="nav" aria-label={`main list-depth:${depth}`} sx={{ flex: 1 }}>
                {Item.component({ handleListItemClick, selectedListItems, setSelectedListItems })}
              </List>
            </Grid>
          )
        })}
    </Stack>
  )
}

import { Box, Grid, Stack, Button, Typography, Modal } from '@mui/material'

import Model from './model'
import Controller from './controller'
import View from './view'
import Middleware from './middleware'
import Populate from './populate'

const Modals: any = {
  Model: {
    title: 'Models',
    description: 'Build your database',
    content: <Model />,
  },
  Controller: {
    title: 'Controllers',
    description: 'Customize your API controllers',
    content: <Controller />,
  },
  Middleware: {
    title: 'Middlewares',
    description: 'Extend your API with middlewares',
    content: <Middleware />,
  },
  Populate: {
    title: 'Populates',
    description: 'Build deep SQL queries under the hood',
    content: <Populate />,
  },
  View: {
    title: 'Views',
    description: 'Write your own SQL queries (not actual RDB views)',
    content: <View />,
  },
}
type ButtonAction = {
  icon: any
  name: string
}

const renderModalContent = (modal: ButtonAction) => {
  if (!modal) return null
  else if (modal.name in Modals) {
    return Modals[modal.name].content
  } else {
    console.warn(`Modal '${modal.name}' is not defined!`)
    return (
      <Box>
        <Typography variant="h5">{modal.name}</Typography>
        <Typography variant="body1">{modal.name} is not defined in modals container</Typography>
      </Box>
    )
  }
}

export default function ModalContainer({ modal, onClose }: { modal: ButtonAction; onClose: () => void }) {
  return (
    <Modal
      open={modal != null}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      {modal && (
        <Box sx={styles.boxCentered}>
          <Stack sx={styles.boxHeader}>
            <span>{modal.icon}</span>

            <Stack direction="column" sx={styles.boxHeaderTextGroup}>
              <span>{Modals[modal.name] ? Modals[modal.name].title : modal.name}</span>
              <span>{Modals[modal.name] && Modals[modal.name].description}</span>
            </Stack>
          </Stack>

          {renderModalContent(modal)}
        </Box>
      )}
    </Modal>
  )
}

const styles = {
  boxCentered: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    border: 0,
    boxShadow: 18,
    p: 2,
  },
  boxHeader: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottom: '1px solid #eeeeee',
    paddingBottom: 1,
    marginBottom: 1,
    'span:first-child': {
      marginRight: 1,
      svg: {
        width: 40,
        height: 40,
      },
    },
  },
  boxHeaderTextGroup: {
    'span:first-child': {
      fontSize: 24,
    },
    'span:last-child': {
      fontSize: 18,
      fontWeight: 300,
    },
  },
}

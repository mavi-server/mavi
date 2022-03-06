import { useRouter } from 'next/router'
import { Typography } from '@mui/material'
import styles from './index.module.css'

type HeaderProps = {
  title: string
}

const AppHeader = ({ title }: HeaderProps) => {
  return (
    <div className={styles.AppHeader}>
      <Typography variant="h4">{title}</Typography>
    </div>
  )
}

export default AppHeader

import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Button } from '@mui/material'
import Link from 'next/link'
import styles from './index.module.scss'

import MaviLogo from '../../assets/icons/logo-variant-2.svg'
import SettingsIcon from '../../assets/icons/settings.svg'
import LayersIcon from '../../assets/icons/layers.svg'
import DatabaseIcon from '../../assets/icons/database.svg'

// Mavi version
import $package from '../../../package.json'

const ListItems = [
  {
    title: 'Settings',
    href: '/',
    icon: <SettingsIcon />,
  },
  {
    title: 'Database',
    href: '/database',
    icon: <DatabaseIcon />,
  },
  {
    title: 'Routes',
    href: '/routes',
    icon: <LayersIcon />,
  },
]

type Aside = {
  onNavigationChange: (nav: any) => void
}

const AppAside = ({ onNavigationChange }: Aside) => {
  const { route } = useRouter()

  return (
    <aside className={styles.aside}>
      <div className={styles.head}>
        <MaviLogo />
      </div>

      <ul className={styles.body}>
        {ListItems.map((item) => {
          return (
            <li key={item.title}>
              <Button
                onClick={() => onNavigationChange(item)}
                className={`${styles.MuiButton} ${item.href === route ? styles.active : ''}`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Button>
            </li>
          )
        })}
      </ul>

      <div className={styles.foot}>
        <div className={styles.VersionText}>
          <span style={{ marginRight: 2 }}>Mavi</span>
          <b> v{$package.version}</b>
        </div>
      </div>
    </aside>
  )
}

export default AppAside

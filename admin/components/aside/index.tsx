import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './index.module.scss'
import MaviLogo from '../../public/mavi.svg'

import IconSettings from '../../assets/icons/settings.svg'
import IconLayers from '../../assets/icons/layers.svg'
import IconDatabase from '../../assets/icons/database.svg'

const ListItems = [
  {
    title: 'Settings',
    href: '/',
    icon: <IconSettings />,
  },
  {
    title: 'Database',
    href: '/database',
    icon: <IconDatabase />,
  },
  {
    title: 'Routes',
    href: '/routes',
    icon: <IconLayers />,
  },
]

const Index: NextPage = () => {
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
              <Link href={item.href}>
                <a className={item.href === route ? styles.active : ''}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className={styles.foot}></div>
    </aside>
  )
}

export default Index

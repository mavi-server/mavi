import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ThemeProvider } from '@mui/material'
import Theme from './_app.theme'
import Head from 'next/head'
import AppAside from '../components/aside'
import AppHeader from '../components/header'
import AppMain from '../components/main'
import AddButton from '../components/AddButton'
import { MaviConfigContextProvider } from '../components/context/index'

import '../assets/styles/globals.scss'

function App({ Component, pageProps }: AppProps) {
  const { push } = useRouter()
  const [headerTitle, setHeaderTitle] = useState('Settings')
  const onNavigationChange = (nav: any) => {
    setHeaderTitle(nav.title)
    push(nav.href)
  }

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'ltr')
  }, [])

  return (
    <ThemeProvider theme={Theme}>
      <Head>
        <title>Mavi - Admin</title>
        <meta name="description" content="Mavi configuration panel" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <MaviConfigContextProvider>
        <AppAside onNavigationChange={onNavigationChange} />

        <AppHeader title={headerTitle} />
        <AppMain>
          <Component {...pageProps} />
        </AppMain>

        <AddButton />
      </MaviConfigContextProvider>
    </ThemeProvider>
  )
}

export default App

import type { AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material'
import Theme from './_app.theme'
import Head from 'next/head'
import Aside from '../components/aside'

import '../assets/styles/globals.scss'
import styles from './_app.module.css'

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={Theme}>
      <Head>
        <title>Mavi - Admin</title>
        <meta name="description" content="Mavi configuration panel" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <Aside />

      <main className={styles.MainContainer}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  )
}

export default App

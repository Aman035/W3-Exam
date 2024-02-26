import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Exams from './pages/Exams/Exams'
import EachExam from './pages/EachExam/EachExam'
import CreateExam from './pages/CreateExam/CreateExam'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import NotFound from './pages/NotFound/NotFound'
import { ThemeContext } from './contexts/Theme'
import './styles/App.scss'
import { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'

const { chains, provider } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY! }),
    // publicProvider(), // Don't use public providers, they are not reliable
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'Min W3 Exam',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const App = () => {
  // Detecting the default theme
  const isBrowserDefaulDark = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches

  const getDefaultTheme = (): string => {
    const localStorageTheme = localStorage.getItem('default-theme')
    const browserDefault = isBrowserDefaulDark() ? 'dark' : 'light'
    return localStorageTheme || browserDefault
  }

  const [theme, setTheme] = useState(getDefaultTheme())
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={theme === 'dark' ? darkTheme() : lightTheme()}
          coolMode
        >
          <div className={`theme-${theme}`}>
            <div className="App">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/exams/:examId" element={<EachExam />} />
                <Route path="/create-exam" element={<CreateExam />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </ThemeContext.Provider>
  )
}

export default App

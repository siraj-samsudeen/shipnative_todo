import { SEO } from './components/SEO'
import { WaitlistMode } from './components/WaitlistMode'
import { LaunchMode } from './components/LaunchMode'

function App() {
  const mode = import.meta.env.VITE_MODE || 'waitlist'
  const appName = import.meta.env.VITE_APP_NAME || 'YourApp'
  const appDescription = import.meta.env.VITE_APP_DESCRIPTION || 'Your app description goes here'

  return (
    <>
      <SEO
        title={appName}
        description={appDescription}
        image={import.meta.env.VITE_OG_IMAGE || 'https://yourapp.com/og-image.jpg'}
        url={import.meta.env.VITE_APP_URL || 'https://yourapp.com/'}
      />

      {mode === 'launch' ? <LaunchMode /> : <WaitlistMode />}
    </>
  )
}

export default App


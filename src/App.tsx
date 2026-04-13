import { GlobalStyle } from './styles/globalStyles'
import { Computer } from './components/computer'
import { Monitor } from './components/monitor'
import { FileSystemProvider } from './filesystem/FileSystemContext'

function App() {
  return (
    <FileSystemProvider>
      <GlobalStyle />
      <Computer>
        <Monitor />
      </Computer>
    </FileSystemProvider>
  )
}

export default App

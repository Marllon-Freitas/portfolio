import React, { useState, useCallback } from 'react'
import { useFileSystem } from '../../filesystem/FileSystemContext'
import { FSNode } from '../../utils/types'
import folderIcon from '../../assets/icons/folder.ico'
import TextIcon from '../../assets/icons/notepad-1.png'
import {
  Container,
  Toolbar,
  NavButton,
  AddressBar,
  AddressLabel,
  AddressInput,
  FileGrid,
  FileItem,
  FileIcon,
  FileName,
  StatusBar,
  EmptyMessage
} from './styled'

function getFileIcon(name: string, node: FSNode): string {
  if (node.type === 'dir') return folderIcon
  if (name.endsWith('.txt')) return TextIcon
  return folderIcon
}

function formatPath(path: string): string {
  if (!path.startsWith('C:')) return `C:\\${path}`
  return path
}

function getParentPath(path: string): string {
  const parts = path
    .replace(/\//g, '\\')
    .split('\\')
    .filter((p) => p !== '' && p !== 'C:')
  if (parts.length <= 1) return 'C:\\marllon'
  parts.pop()
  return `C:\\${parts.join('\\')}`
}

function joinPath(base: string, name: string): string {
  return `${base}\\${name}`
}

function countItems(entries: Array<{ name: string; node: FSNode }>): {
  dirs: number
  files: number
} {
  return entries.reduce(
    (acc, { node }) => {
      if (node.type === 'dir') acc.dirs++
      else acc.files++
      return acc
    },
    { dirs: 0, files: 0 }
  )
}

interface FolderWindowProps {
  initialPath: string
  customRenderers?: Record<string, React.ReactNode>
  onOpenFile?: (filePath: string, fileName: string, content: string) => void
}

const FolderWindow: React.FC<FolderWindowProps> = ({
  initialPath,
  customRenderers = {},
  onOpenFile
}) => {
  const fs = useFileSystem()

  const [path, setPath] = useState(formatPath(initialPath))
  const [history, setHistory] = useState<string[]>([formatPath(initialPath)])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [addressInput, setAddressInput] = useState(formatPath(initialPath))

  const navigate = useCallback(
    (newPath: string) => {
      const formatted = formatPath(newPath)
      setPath(formatted)
      setAddressInput(formatted)
      setSelected(null)
      const newHistory = [...history.slice(0, historyIndex + 1), formatted]
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex]
  )

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setPath(history[newIndex])
      setAddressInput(history[newIndex])
      setSelected(null)
    }
  }

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setPath(history[newIndex])
      setAddressInput(history[newIndex])
      setSelected(null)
    }
  }

  const goUp = () => {
    const parent = getParentPath(path)
    if (parent !== path) navigate(parent)
  }

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = formatPath(addressInput)
      const node = fs.getNode(target)
      if (node?.type === 'dir') {
        navigate(target)
      } else {
        setAddressInput(path)
      }
    } else if (e.key === 'Escape') {
      setAddressInput(path)
    }
  }

  const handleItemDoubleClick = (name: string, node: FSNode) => {
    if (node.type === 'dir') {
      navigate(joinPath(path, name))
    } else if (node.type === 'file') {
      onOpenFile?.(joinPath(path, name), name, node.content)
    }
  }

  const entries = fs.listDir(path) ?? []
  const { dirs, files } = countItems(entries)

  const sorted = [...entries].sort((a, b) => {
    if (a.node.type === b.node.type) return a.name.localeCompare(b.name)
    return a.node.type === 'dir' ? -1 : 1
  })

  const customContent = customRenderers[path]

  return (
    <Container>
      <Toolbar>
        <NavButton disabled={historyIndex <= 0} onClick={goBack}>
          ← Back
        </NavButton>
        <NavButton
          disabled={historyIndex >= history.length - 1}
          onClick={goForward}
        >
          Forward →
        </NavButton>
        <NavButton onClick={goUp}>Up ↑</NavButton>
      </Toolbar>

      <AddressBar>
        <AddressLabel>Address:</AddressLabel>
        <AddressInput
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyDown={handleAddressKeyDown}
          onFocus={(e) => e.target.select()}
        />
      </AddressBar>

      {customContent ? (
        customContent
      ) : (
        <FileGrid
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null)
          }}
        >
          {sorted.length === 0 ? (
            <EmptyMessage>This folder is empty.</EmptyMessage>
          ) : (
            sorted.map(({ name, node }) => (
              <FileItem
                key={name}
                selected={selected === name}
                onClick={() => setSelected(name)}
                onDoubleClick={() => handleItemDoubleClick(name, node)}
              >
                <FileIcon src={getFileIcon(name, node)} alt={name} />
                <FileName selected={selected === name}>{name}</FileName>
              </FileItem>
            ))
          )}
        </FileGrid>
      )}

      <StatusBar>
        <span>{entries.length} objects</span>
        <span>
          {dirs} folder{dirs !== 1 ? 's' : ''}, {files} file
          {files !== 1 ? 's' : ''}
        </span>
        {selected && <span>{selected}</span>}
      </StatusBar>
    </Container>
  )
}

export default FolderWindow

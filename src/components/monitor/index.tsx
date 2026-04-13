import React, { useCallback, useRef, useState } from 'react'
import folderIcon from '../../assets/icons/folder.ico'
import cmdIcon from '../../assets/icons/cmd.png'
import TextIcon from '../../assets/icons/notepad-1.png'
import {
  Content,
  MonitorScreen,
  Overlay,
  Scanline,
  SelectionBox
} from './styled'
import DesktopShortcut from '../desktopShortCut'
import GenericWindow from '../desktopWindow'
import Taskbar from '../taskBar'
import { useWallpaper } from '../../hooks/useWallpaper'
import Terminal from '../desktopShortCut/components/terminal'
import Games from '../desktopShortCut/components/games'
import WallpaperOptions from '../desktopShortCut/components/wallpaperOptions'
import FolderWindow from '../folderWindow'
import Notepad, { NotepadHandle } from '../notepad'
import { Shortcut } from '../../utils/types'

interface OpenWindow {
  id: number
  label: string
  content: React.ReactNode
  position: { x: number; y: number }
  icon: string
  notepadRef?: React.RefObject<NotepadHandle | null>
}

let windowIdCounter = 100
const nextWindowId = () => ++windowIdCounter

const INITIAL_SHORTCUTS: Shortcut[] = [
  {
    id: 1,
    position: { x: 20, y: 20 },
    icon: cmdIcon,
    label: 'cmd',
    content: <Terminal />,
    isInFolder: false
  },
  {
    id: 2,
    position: { x: 20, y: 100 },
    icon: folderIcon,
    label: 'marllon',
    path: 'C:\\marllon',
    content: null,
    isInFolder: false
  },
  {
    id: 3,
    position: { x: 20, y: 180 },
    icon: folderIcon,
    label: 'projects',
    path: 'C:\\marllon\\projects',
    content: null,
    isInFolder: false
  },
  {
    id: 4,
    position: { x: 20, y: 260 },
    icon: folderIcon,
    label: 'games',
    path: 'C:\\marllon\\games',
    content: null,
    isInFolder: false
  },
  {
    id: 5,
    position: { x: 20, y: 340 },
    icon: folderIcon,
    label: 'wallpapers',
    path: 'C:\\marllon\\wallpapers',
    content: null,
    isInFolder: false
  }
]

export const Monitor = () => {
  const { wallpapers, currentWallpaper, setWallpaperById } = useWallpaper()
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(INITIAL_SHORTCUTS)
  const [selectedShortcuts, setSelectedShortcuts] = useState<Set<number>>(
    new Set()
  )
  const [selectionBox, setSelectionBox] = useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  const [lastWindowPosition, setLastWindowPosition] = useState({ x: 80, y: 60 })
  const [isSelecting, setIsSelecting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([])
  const [windowOrder, setWindowOrder] = useState<number[]>([])
  const [minimizedWindows, setMinimizedWindows] = useState<Set<number>>(
    new Set()
  )

  const startPos = useRef({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)
  const lastClickTime = useRef<number>(0)
  const initialDragPositions = useRef<Record<number, { x: number; y: number }>>(
    {}
  )

  const closeWindow = useCallback((id: number) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id))
    setWindowOrder((prev) => prev.filter((wid) => wid !== id))
    setMinimizedWindows((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const updateWindowTitle = useCallback((id: number, title: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, label: title } : w))
    )
  }, [])

  const openNotepad = useCallback(
    (filePath: string, fileName: string, content: string) => {
      const id = nextWindowId()
      const notepadRef = React.createRef<NotepadHandle>()

      const newPosition = {
        x: lastWindowPosition.x + 20,
        y: lastWindowPosition.y + 20
      }

      const notepadNode = (
        <Notepad
          ref={notepadRef}
          filePath={filePath}
          fileName={fileName}
          initialContent={content}
          onTitleChange={(title) => updateWindowTitle(id, title)}
          onRequestClose={() => closeWindow(id)}
        />
      )

      const newWindow: OpenWindow = {
        id,
        label: fileName,
        content: notepadNode,
        position: newPosition,
        icon: TextIcon,
        notepadRef
      }

      setOpenWindows((prev) => [...prev, newWindow])
      setWindowOrder((prev) => [...prev, id])
      setLastWindowPosition(newPosition)
    },
    [lastWindowPosition, updateWindowTitle, closeWindow]
  )

  const customRenderers: Record<string, React.ReactNode> = {
    'C:\\marllon\\games': (
      <Games handleDoubleClick={handleShortcutDoubleClick} />
    ),
    'C:\\marllon\\wallpapers': (
      <WallpaperOptions
        wallpapers={wallpapers}
        currentWallpaperId={currentWallpaper.id}
        onSelectWallpaper={setWallpaperById}
      />
    )
  }

  function handleShortcutDoubleClick(shortcut: Shortcut) {
    if (openWindows.some((w) => w.id === shortcut.id)) {
      setWindowOrder((prev) => [
        ...prev.filter((id) => id !== shortcut.id),
        shortcut.id
      ])
      setMinimizedWindows((prev) => {
        const next = new Set(prev)
        next.delete(shortcut.id)
        return next
      })
      return
    }

    const newPosition = {
      x: lastWindowPosition.x + 20,
      y: lastWindowPosition.y + 20
    }

    const content = shortcut.path ? (
      <FolderWindow
        initialPath={shortcut.path}
        customRenderers={customRenderers}
        onOpenFile={openNotepad}
      />
    ) : (
      shortcut.content
    )

    const newWindow: OpenWindow = {
      id: shortcut.id,
      label: shortcut.label,
      content,
      position: newPosition,
      icon: shortcut.icon
    }

    setOpenWindows((prev) => [...prev, newWindow])
    setWindowOrder((prev) => [...prev, shortcut.id])
    setLastWindowPosition(newPosition)
  }

  const isWithinBox = (
    pos: { x: number; y: number },
    box: { left: number; top: number; width: number; height: number }
  ) =>
    pos.x >= box.left &&
    pos.x <= box.left + box.width &&
    pos.y >= box.top &&
    pos.y <= box.top + box.height

  const updateSelectionBox = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting || !contentRef.current || isDragging) return
      const rect = contentRef.current.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const left = Math.min(startPos.current.x, cx)
      const top = Math.min(startPos.current.y, cy)
      const width = Math.abs(cx - startPos.current.x)
      const height = Math.abs(cy - startPos.current.y)
      setSelectionBox({ left, top, width, height })
      const newSelected = new Set<number>()
      shortcuts.forEach((s) => {
        if (isWithinBox(s.position, { left, top, width, height }))
          newSelected.add(s.id)
      })
      setSelectedShortcuts(newSelected)
    },
    [isSelecting, shortcuts, isDragging]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      startPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      setIsSelecting(true)
      setSelectedShortcuts(new Set())
    }
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => updateSelectionBox(e.nativeEvent),
    [updateSelectionBox]
  )

  const handleMouseUp = () => {
    setIsSelecting(false)
    setSelectionBox(null)
    setIsDragging(false)
    initialDragPositions.current = {}
  }

  const handleShortcutClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const now = Date.now()
    if (now - lastClickTime.current < 300) return
    lastClickTime.current = now
    if (!selectedShortcuts.has(id) && !isDragging)
      setSelectedShortcuts(new Set([id]))
  }

  const handleShortcutStartDrag = () => {
    setIsDragging(true)
    initialDragPositions.current = {}
    shortcuts.forEach((s) => {
      initialDragPositions.current[s.id] = { ...s.position }
    })
  }

  const handleShortcutDrag = (
    id: number,
    newPosition: { x: number; y: number }
  ) => {
    const dx = newPosition.x - initialDragPositions.current[id].x
    const dy = newPosition.y - initialDragPositions.current[id].y
    setShortcuts(
      shortcuts.map((s) =>
        selectedShortcuts.has(s.id)
          ? {
              ...s,
              position: {
                x: initialDragPositions.current[s.id].x + dx,
                y: initialDragPositions.current[s.id].y + dy
              }
            }
          : s
      )
    )
  }

  const handleWindowClick = (id: number) => {
    setWindowOrder((prev) => [...prev.filter((wid) => wid !== id), id])
    setMinimizedWindows((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleMinimizeClick = (id: number) => {
    setMinimizedWindows((prev) => new Set(prev).add(id))
  }

  const handleBeforeClose = (window: OpenWindow) => {
    if (window.notepadRef?.current) {
      window.notepadRef.current.requestClose()
    } else {
      closeWindow(window.id)
    }
  }

  return (
    <MonitorScreen>
      <Content
        ref={contentRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ backgroundImage: `url(${currentWallpaper.src})` }}
      >
        {shortcuts.map((shortcut) => (
          <DesktopShortcut
            key={shortcut.id}
            position={shortcut.position}
            icon={shortcut.icon}
            label={shortcut.label}
            selected={selectedShortcuts.has(shortcut.id)}
            onClick={(e) => handleShortcutClick(shortcut.id, e)}
            onStartDrag={handleShortcutStartDrag}
            onDrag={(pos) => handleShortcutDrag(shortcut.id, pos)}
            onDoubleClick={() => handleShortcutDoubleClick(shortcut)}
            isInFolder={shortcut.isInFolder}
          />
        ))}

        {isSelecting && selectionBox && (
          <SelectionBox
            style={{
              left: selectionBox.left,
              top: selectionBox.top,
              width: selectionBox.width,
              height: selectionBox.height
            }}
          />
        )}

        {openWindows.map((window) => (
          <GenericWindow
            key={window.id}
            title={window.label}
            icon={window.icon}
            prevPosition={window.position}
            onClick={() => handleWindowClick(window.id)}
            style={{
              zIndex: windowOrder.indexOf(window.id) + 1,
              display: minimizedWindows.has(window.id) ? 'none' : 'block'
            }}
            onMinimize={() => handleMinimizeClick(window.id)}
            onClose={() => closeWindow(window.id)}
            onBeforeClose={() => handleBeforeClose(window)}
          >
            {window.content}
          </GenericWindow>
        ))}

        <Taskbar
          openWindows={openWindows.map((w) => ({
            id: w.id,
            title: w.label,
            icon: w.icon
          }))}
          onWindowsButtonClick={() => console.log('start clicked')}
          onTaskClick={handleWindowClick}
        />
      </Content>
      <Overlay />
      <Scanline />
    </MonitorScreen>
  )
}

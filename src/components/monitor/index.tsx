import React, { useCallback, useRef, useState } from 'react'
import folderIcon from '../../assets/icons/folder.ico'
import cmdIcon from '../../assets/icons/cmd.png'
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
import WallpaperOptions from '../desktopShortCut/components/wallpaperOptions'
import { useWallpaper } from '../../hooks/useWallpaper'
import Terminal from '../desktopShortCut/components/terminal'
import Games from '../desktopShortCut/components/games'
import { Shortcut } from '../../utils/types'
import WebProjects from '../desktopShortCut/components/webProjectcs'

interface Window {
  id: number
  label: string
  content: React.ReactNode
  position: { x: number; y: number }
  icon: string
}

const SHORTCUTS: Shortcut[] = [
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
    label: 'wallpapers',
    content: null,
    isInFolder: false
  },
  {
    id: 3,
    position: { x: 20, y: 180 },
    icon: folderIcon,
    label: 'games',
    content: null,
    isInFolder: false
  },
  {
    id: 4,
    position: { x: 20, y: 260 },
    icon: folderIcon,
    label: 'web projects',
    content: null,
    isInFolder: false
  }
]

export const Monitor = () => {
  const { wallpapers, currentWallpaper, setWallpaperById } = useWallpaper()
  const [selectedShortcuts, setSelectedShortcuts] = useState<Set<number>>(
    new Set()
  )
  const [selectionBox, setSelectionBox] = useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  const [lastWindowPosition, setLastWindowPosition] = useState({
    x: 100,
    y: 100
  })
  const [isSelecting, setIsSelecting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [openWindows, setOpenWindows] = useState<Window[]>([])
  const [windowOrder, setWindowOrder] = useState<number[]>([])
  const [minimizedWindows, setMinimizedWindows] = useState<Set<number>>(
    new Set()
  )

  const handleDoubleClick = (shortcut: Shortcut) => {
    if (openWindows.some((window) => window.id === shortcut.id)) {
      const newOrder = windowOrder.filter((id) => id !== shortcut.id)
      setWindowOrder([...newOrder, shortcut.id])
      return
    }

    const newPosition = {
      x: lastWindowPosition.x + 20,
      y: lastWindowPosition.y + 20
    }

    const newWindow = {
      id: shortcut.id,
      label: shortcut.label,
      content: shortcut.content,
      position: newPosition,
      icon: shortcut.icon
    }

    setOpenWindows((prevWindows) => {
      if (prevWindows.some((window) => window.id === shortcut.id)) {
        setWindowOrder((prevOrder) => {
          const newOrder = prevOrder.filter((id) => id !== shortcut.id)
          return [...newOrder, shortcut.id]
        })
        return prevWindows
      }
      return [...prevWindows, newWindow]
    })
    setWindowOrder((prevOrder) => [...prevOrder, shortcut.id])
    setLastWindowPosition(newPosition)
  }

  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() =>
    SHORTCUTS.map((shortcut) =>
      shortcut.label === 'wallpapers'
        ? {
            ...shortcut,
            content: (
              <WallpaperOptions
                wallpapers={wallpapers}
                currentWallpaperId={currentWallpaper.id}
                onSelectWallpaper={setWallpaperById}
              />
            )
          }
        : shortcut.label === 'games'
          ? {
              ...shortcut,
              content: <Games handleDoubleClick={handleDoubleClick} />
            }
          : shortcut.label === 'web projects'
            ? {
                ...shortcut,
                content: <WebProjects handleDoubleClick={handleDoubleClick} />
              }
            : shortcut
    )
  )

  const startPos = useRef({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)
  const lastClickTime = useRef<number>(0)
  const initialDragPositions = useRef<Record<number, { x: number; y: number }>>(
    {}
  )

  const handleShortcutClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentTime = new Date().getTime()
    const timeSinceLastClick = currentTime - lastClickTime.current
    lastClickTime.current = currentTime

    if (timeSinceLastClick < 300) return

    if (!selectedShortcuts.has(id) && !isDragging)
      setSelectedShortcuts(new Set([id]))
  }

  const handleShortcutStartDrag = () => {
    setIsDragging(true)
    initialDragPositions.current = {}
    shortcuts.forEach((shortcut) => {
      initialDragPositions.current[shortcut.id] = { ...shortcut.position }
    })
  }

  const handleShortcutDrag = (
    id: number,
    newPosition: { x: number; y: number }
  ) => {
    const deltaX = newPosition.x - initialDragPositions.current[id].x
    const deltaY = newPosition.y - initialDragPositions.current[id].y

    setShortcuts(
      shortcuts.map((shortcut) => {
        if (selectedShortcuts.has(shortcut.id)) {
          return {
            ...shortcut,
            position: {
              x: initialDragPositions.current[shortcut.id].x + deltaX,
              y: initialDragPositions.current[shortcut.id].y + deltaY
            }
          }
        }
        return shortcut
      })
    )
  }

  const updateSelectionBox = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting || !contentRef.current || isDragging) return

      const rect = contentRef.current.getBoundingClientRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top

      const left = Math.min(startPos.current.x, currentX)
      const top = Math.min(startPos.current.y, currentY)
      const width = Math.abs(currentX - startPos.current.x)
      const height = Math.abs(currentY - startPos.current.y)

      setSelectionBox({ left, top, width, height })

      const newSelected = new Set<number>()
      shortcuts.forEach((shortcut) => {
        if (
          isWithinSelectionBox(shortcut.position, { left, top, width, height })
        ) {
          newSelected.add(shortcut.id)
        }
      })
      setSelectedShortcuts(newSelected)
    },
    [isSelecting, shortcuts, isDragging]
  )

  const isWithinSelectionBox = (
    position: { x: number; y: number },
    box: { left: number; top: number; width: number; height: number }
  ) => {
    return (
      position.x >= box.left &&
      position.x <= box.left + box.width &&
      position.y >= box.top &&
      position.y <= box.top + box.height
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      startPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
      setIsSelecting(true)
      setSelectedShortcuts(new Set())
    }
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      updateSelectionBox(e.nativeEvent)
    },
    [updateSelectionBox]
  )

  const handleMouseUp = () => {
    setIsSelecting(false)
    setSelectionBox(null)
    setIsDragging(false)
    initialDragPositions.current = {}
  }

  const handleWindowClick = (id: number) => {
    setWindowOrder((prevOrder) => {
      const newOrder = prevOrder.filter((windowId) => windowId !== id)
      return [...newOrder, id]
    })
    setMinimizedWindows((prevMinimized) => {
      const newMinimized = new Set(prevMinimized)
      newMinimized.delete(id)
      return newMinimized
    })
  }

  const handleMinimizeClick = (id: number) => {
    setMinimizedWindows((prevMinimized) => new Set(prevMinimized).add(id))
  }

  const handleCloseClick = (id: number) => {
    setOpenWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id)
    )
    setWindowOrder((prevOrder) =>
      prevOrder.filter((windowId) => windowId !== id)
    )
    setMinimizedWindows((prevMinimized) => {
      const newMinimized = new Set(prevMinimized)
      newMinimized.delete(id)
      return newMinimized
    })
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
            onStartDrag={() => handleShortcutStartDrag()}
            onDrag={(newPosition) =>
              handleShortcutDrag(shortcut.id, newPosition)
            }
            onDoubleClick={() => handleDoubleClick(shortcut)}
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
            onClose={() => handleCloseClick(window.id)}
          >
            {window.label === 'wallpapers' ? (
              <WallpaperOptions
                wallpapers={wallpapers}
                currentWallpaperId={currentWallpaper.id}
                onSelectWallpaper={setWallpaperById}
              />
            ) : (
              window.content
            )}
          </GenericWindow>
        ))}
        <Taskbar
          openWindows={openWindows.map((window) => ({
            id: window.id,
            title: window.label,
            icon: window.icon
          }))}
          onWindowsButtonClick={() => {
            console.log('clicked')
          }}
          onTaskClick={handleWindowClick}
        />
      </Content>
      <Overlay />
      <Scanline />
    </MonitorScreen>
  )
}

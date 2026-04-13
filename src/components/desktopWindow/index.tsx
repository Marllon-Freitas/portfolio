import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  WindowContainer,
  TitleBar,
  ControlButtons,
  Button,
  ContentArea,
  TitleBarInfo,
  ResizeHandle
} from './styled'
import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../../utils/constants'
import windowCloseIcon from '../../assets/icons/close_window_button.svg'

const MIN_WIDTH = 250
const MIN_HEIGHT = 200

interface GenericWindowProps {
  title: string
  children: React.ReactNode
  icon?: string
  prevPosition?: { x: number; y: number }
  onClick?: () => void
  style?: React.CSSProperties
  onMinimize?: () => void
  onClose?: () => void
  onBeforeClose?: () => void
}

const GenericWindow: React.FC<GenericWindowProps> = ({
  title,
  children,
  icon,
  prevPosition,
  onClick,
  style,
  onMinimize,
  onClose,
  onBeforeClose
}) => {
  const [size, setSize] = useState({ width: 500, height: 380 })
  const [position, setPosition] = useState(prevPosition || { x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ width: 500, height: 380 })
  const prevPos = useRef({ x: 0, y: 0 })
  const prevSize = useRef({ width: 500, height: 380 })

  const handleClose = () => {
    if (onBeforeClose) {
      onBeforeClose()
    } else {
      onClose?.()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMaximized) {
      setIsDragging(true)
      startPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - startPos.current.x,
          y: e.clientY - startPos.current.y
        })
      } else if (isResizing) {
        const newWidth = Math.max(
          MIN_WIDTH,
          startSize.current.width + (e.clientX - startPos.current.x)
        )
        const newHeight = Math.max(
          MIN_HEIGHT,
          startSize.current.height + (e.clientY - startPos.current.y)
        )
        setSize({ width: newWidth, height: newHeight })
      }
    },
    [isDragging, isResizing]
  )

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isMaximized) {
      e.stopPropagation()
      setIsResizing(true)
      startPos.current = { x: e.clientX, y: e.clientY }
      startSize.current = { width: size.width, height: size.height }
    }
  }

  const handleMaximize = () => {
    if (isMaximized) {
      setSize(prevSize.current)
      setPosition(prevPos.current)
    } else {
      prevSize.current = size
      prevPos.current = position
      setSize({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT })
      setPosition({ x: 0, y: 0 })
    }
    setIsMaximized(!isMaximized)
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove])

  return (
    <WindowContainer
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        ...style
      }}
      onMouseDown={onClick}
    >
      <TitleBar onMouseDown={handleMouseDown} onDoubleClick={handleMaximize}>
        <TitleBarInfo>
          {icon && <img src={icon} alt="icon" />}
          <span>{title}</span>
        </TitleBarInfo>
        <ControlButtons>
          <Button onClick={onMinimize}>_</Button>
          <Button onClick={handleMaximize}>{isMaximized ? '🗗' : '🗖'}</Button>
          <Button onClick={handleClose}>
            <img src={windowCloseIcon} alt="Close" />
          </Button>
        </ControlButtons>
      </TitleBar>
      <ContentArea>{children}</ContentArea>
      <ResizeHandle onMouseDown={handleResizeMouseDown} />
    </WindowContainer>
  )
}

export default GenericWindow

import React from 'react'

export interface TerminalColors {
  [key: string]: {
    name: string
    value: string
  }
}

export interface FileSystem {
  [key: string]: {
    type: 'file' | 'directory'
    content?: string
    children?: FileSystem
  }
}

export interface Shortcut {
  id: number
  position: { x: number; y: number }
  icon: string
  label: string
  path?: string
  content: React.ReactNode
  isInFolder: boolean
}

export interface Wallpaper {
  id: string
  src: string
  name: string
  thumbnail?: string
}

export type FSNode =
  | { type: 'file'; content: string; created: number }
  | { type: 'dir'; children: Record<string, FSNode>; created: number }

export type FSAction =
  | { type: 'WRITE_FILE'; path: string; content: string }
  | { type: 'MKDIR'; path: string }
  | { type: 'DELETE'; path: string }
  | { type: 'RENAME'; from: string; to: string }

export interface FileSystemContextValue {
  readFile: (path: string) => string | null
  listDir: (path: string) => Array<{ name: string; node: FSNode }> | null
  writeFile: (path: string, content: string) => void
  mkdir: (path: string) => void
  deleteNode: (path: string) => void
  exists: (path: string) => boolean
  getNode: (path: string) => FSNode | null
}

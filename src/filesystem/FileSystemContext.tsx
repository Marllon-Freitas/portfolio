import React, {
  createContext,
  useContext,
  useReducer,
  useCallback
} from 'react'
import type { FSNode, FSAction, FileSystemContextValue } from '../utils/types'
import { initialTree } from './initialTree'

const FileSystemContext = createContext<FileSystemContextValue | null>(null)

function parsePath(path: string): string[] {
  return path
    .replace(/\//g, '\\')
    .split('\\')
    .filter((p) => p !== '' && p !== 'C:' && p !== '.')
}

function getNode(tree: FSNode, path: string): FSNode | null {
  const parts = parsePath(path)
  let cur: FSNode = tree
  for (const part of parts) {
    if (cur.type !== 'dir' || !cur.children[part]) return null
    cur = cur.children[part]
  }
  return cur
}

function setNode(tree: FSNode, path: string, node: FSNode | null): FSNode {
  const parts = parsePath(path)
  if (parts.length === 0) return node ?? tree

  const [head, ...rest] = parts
  if (tree.type !== 'dir') return tree

  const children = { ...tree.children }

  if (rest.length === 0) {
    if (node === null) {
      delete children[head]
    } else {
      children[head] = node
    }
  } else {
    const child = children[head]
    if (!child || child.type !== 'dir') return tree
    children[head] = setNode(child, rest.join('\\'), node)
  }

  return { ...tree, children }
}

function reducer(state: FSNode, action: FSAction): FSNode {
  switch (action.type) {
    case 'WRITE_FILE':
      return setNode(state, action.path, {
        type: 'file',
        content: action.content,
        created: Date.now()
      })
    case 'MKDIR':
      return setNode(state, action.path, {
        type: 'dir',
        children: {},
        created: Date.now()
      })
    case 'DELETE':
      return setNode(state, action.path, null)
    case 'RENAME': {
      const node = getNode(state, action.from)
      if (!node) return state
      const deleted = setNode(state, action.from, null)
      return setNode(deleted, action.to, node)
    }
    default:
      return state
  }
}

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [tree, dispatch] = useReducer(reducer, initialTree)

  const readFile = useCallback(
    (path: string) => {
      const node = getNode(tree, path)
      return node?.type === 'file' ? node.content : null
    },
    [tree]
  )

  const listDir = useCallback(
    (path: string) => {
      const node =
        path === '' || path === 'C:' || path === 'C:\\'
          ? tree
          : getNode(tree, path)
      if (!node || node.type !== 'dir') return null
      return Object.entries(node.children).map(([name, n]) => ({
        name,
        node: n
      }))
    },
    [tree]
  )

  const writeFile = useCallback(
    (path: string, content: string) =>
      dispatch({ type: 'WRITE_FILE', path, content }),
    []
  )

  const mkdir = useCallback(
    (path: string) => dispatch({ type: 'MKDIR', path }),
    []
  )

  const deleteNode = useCallback(
    (path: string) => dispatch({ type: 'DELETE', path }),
    []
  )

  const exists = useCallback(
    (path: string) => getNode(tree, path) !== null,
    [tree]
  )

  const getNodePublic = useCallback(
    (path: string) => getNode(tree, path),
    [tree]
  )

  return (
    <FileSystemContext.Provider
      value={{
        readFile,
        listDir,
        writeFile,
        mkdir,
        deleteNode,
        exists,
        getNode: getNodePublic
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}

export const useFileSystem = (): FileSystemContextValue => {
  const ctx = useContext(FileSystemContext)
  if (!ctx)
    throw new Error('useFileSystem must be used inside <FileSystemProvider>')
  return ctx
}

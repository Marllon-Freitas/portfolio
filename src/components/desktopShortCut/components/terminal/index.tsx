import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Input,
  InputContainer,
  TerminalContainer,
  TerminalLine
} from './styled'
import {
  AVAILABLE_COMMANDS,
  TERMINAL_COLORS
} from '../../../../utils/constants'
import { useFileSystem } from '../../../../filesystem/FileSystemContext'

function resolvePath(currentPath: string, newPath: string): string {
  if (newPath.startsWith('C:') || newPath.startsWith('c:')) return newPath

  const parts = newPath.replace(/\//g, '\\').split('\\')
  const resolved = currentPath.split('\\')

  for (const part of parts) {
    if (part === '..') {
      resolved.pop()
    } else if (part !== '.') {
      resolved.push(part)
    }
  }

  return resolved.join('\\')
}

const Terminal: React.FC = () => {
  const fs = useFileSystem()

  const [currentPath, setCurrentPath] = useState('C:\\marllon')
  const [inputHistory, setInputHistory] = useState<string[]>([
    'Microsoft(R) Windows 98',
    '(C)Copyright Microsoft Corp 1981-1999.',
    '',
    'Welcome! Type "help" for available commands.'
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [textColor, setTextColor] = useState('white')
  const [backgroundColor, setBackgroundColor] = useState('black')

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [inputHistory])

  const getAutoCompleteOptions = useCallback(
    (input: string): string[] => {
      const options: string[] = []
      const parts = input.trim().split(' ')

      if (parts.length === 1) {
        return AVAILABLE_COMMANDS.filter((cmd) =>
          cmd.startsWith(input.toLowerCase())
        )
      }
      const cmd = parts[0].toLowerCase()
      if (['cd', 'type', 'mkdir', 'del'].includes(cmd)) {
        const partial = parts[1] || ''
        const entries = fs.listDir(currentPath) ?? []
        return entries
          .map((e) => e.name)
          .filter((name) =>
            name.toLowerCase().startsWith(partial.toLowerCase())
          )
      }

      return options
    },
    [currentPath, fs]
  )

  const processCommand = useCallback(
    (command: string): string | null => {
      const trimmed = command.trim()
      if (!trimmed) return null

      setCommandHistory((prev) => [...prev, trimmed])

      const parts = trimmed.split(' ')
      const cmd = parts[0].toLowerCase()
      const args = parts.slice(1)

      switch (cmd) {
        case 'dir': {
          const entries = fs.listDir(currentPath)
          if (!entries) return 'Invalid path.'

          let out = ` Directory of ${currentPath}\n\n`
          if (entries.length === 0) {
            out += '        File Not Found\n'
          } else {
            const dirs = entries.filter((e) => e.node.type === 'dir')
            const files = entries.filter((e) => e.node.type === 'file')

            for (const { name, node } of [...dirs, ...files]) {
              const date = new Date(node.created).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit'
              })
              const isDir = node.type === 'dir'
              const size = isDir
                ? '      <DIR>'
                : `${String(node.content.length).padStart(10)} `
              out += `${date}  ${size}  ${name}\n`
            }

            const fileCount = files.length
            const dirCount = dirs.length
            out += `\n         ${fileCount} File(s)\n         ${dirCount} Dir(s)`
          }
          return out
        }
        case 'cd': {
          if (args.length === 0) return currentPath
          if (args[0] === '/') {
            setCurrentPath('C:\\')
            return null
          }
          const resolved = resolvePath(currentPath, args[0])
          const node = fs.getNode(resolved)
          if (node?.type === 'dir') {
            setCurrentPath(resolved)
            return null
          }
          return 'The system cannot find the path specified.'
        }
        case 'cls':
          setInputHistory([])
          return null
        case 'mkdir':
        case 'md': {
          if (!args[0]) return 'The syntax of the command is incorrect.'
          const newPath = resolvePath(currentPath, args[0])
          if (fs.exists(newPath))
            return 'A subdirectory or file already exists.'
          fs.mkdir(newPath)
          return null
        }
        case 'del':
        case 'rm': {
          if (!args[0]) return 'The syntax of the command is incorrect.'
          const target = resolvePath(currentPath, args[0])
          if (!fs.exists(target)) return 'File Not Found.'
          fs.deleteNode(target)
          return null
        }
        case 'type': {
          if (!args[0]) return 'The syntax of the command is incorrect.'
          const filePath = resolvePath(currentPath, args[0])
          const content = fs.readFile(filePath)
          if (content === null)
            return 'The system cannot find the file specified.'
          return content
        }
        case 'echo': {
          const gtIdx = args.indexOf('>')
          if (gtIdx !== -1) {
            const text = args.slice(0, gtIdx).join(' ')
            const fileName = args[gtIdx + 1]
            if (!fileName) return 'The syntax of the command is incorrect.'
            fs.writeFile(resolvePath(currentPath, fileName), text)
            return null
          }
          return args.join(' ')
        }
        case 'help':
          return `
                Available commands:

                  dir           List directory contents
                  cd [path]     Change directory
                  mkdir [name]  Create directory
                  del [name]    Delete file or folder
                  type [file]   Display file contents
                  echo [text]   Print text (or: echo text > file)
                  cls           Clear screen
                  color [XY]    Change colors (e.g. color 0A)
                  help          Show this message
                  exit          Close terminal

                Tips:
                  Use Tab for autocomplete
                  Use Up/Down arrows for history
                  Use ".." to go up a directory
                  Use Ctrl+L to clear screen`
        case 'color': {
          if (!args[0])
            return `Colors: 0=black 1=blue 2=green 3=aqua 4=red 5=purple
                    6=yellow 7=white 8=gray 9=ltblue A=ltgreen
                    B=ltaqua C=ltred D=ltpurple E=ltyellow

                    Usage: color [background][text]  e.g. color 0A`
          const code = args[0].toUpperCase()
          const bg = code[0] as keyof typeof TERMINAL_COLORS
          const fg = code[1] as keyof typeof TERMINAL_COLORS

          if (
            code.length !== 2 ||
            !TERMINAL_COLORS[bg] ||
            !TERMINAL_COLORS[fg]
          ) {
            return 'Invalid color code. Example: color 0A'
          }
          if (bg === fg) return 'Background and text color cannot be the same.'

          setBackgroundColor(TERMINAL_COLORS[bg].value)
          setTextColor(TERMINAL_COLORS[fg].value)
          return `Colors set: background=${TERMINAL_COLORS[bg].name}, text=${TERMINAL_COLORS[fg].name}`
        }
        case 'exit':
          return 'Type "exit" again or close this window.'
        default:
          return `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`
      }
    },
    [currentPath, fs]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setInputHistory([])
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const options = getAutoCompleteOptions(currentInput)
      if (options.length === 1) {
        const parts = currentInput.split(' ')
        if (parts.length > 1) {
          setCurrentInput(`${parts[0]} ${options[0]}`)
        } else {
          setCurrentInput(options[0])
        }
      } else if (options.length > 1) {
        setInputHistory((prev) => [
          ...prev,
          `${currentPath}> ${currentInput}`,
          options.join('  ')
        ])
      }
      return
    }

    if (e.key === 'Enter') {
      const output = processCommand(currentInput)
      setInputHistory((prev) => [
        ...prev,
        `${currentPath}> ${currentInput}`,
        ...(output !== null ? output.split('\n') : [])
      ])
      setCurrentInput('')
      setHistoryIndex(null)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === null
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== null) {
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        } else {
          setHistoryIndex(null)
          setCurrentInput('')
        }
      }
    }
  }

  return (
    <TerminalContainer
      ref={terminalRef}
      onClick={() => inputRef.current?.focus()}
      style={{ color: textColor, backgroundColor }}
    >
      {inputHistory.map((line, i) => (
        <TerminalLine key={i}>{line || '\u00A0'}</TerminalLine>
      ))}
      <InputContainer>
        <span>{`${currentPath}>`}</span>
        <Input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{ color: textColor, caretColor: textColor }}
        />
      </InputContainer>
    </TerminalContainer>
  )
}

export default Terminal

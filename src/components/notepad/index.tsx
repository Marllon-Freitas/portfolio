import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react'
import { useFileSystem } from '../../filesystem/FileSystemContext'
import {
  Container,
  MenuBar,
  MenuButton,
  DropdownMenu,
  MenuItem,
  MenuDivider,
  ShortcutHint,
  TextArea,
  StatusBar,
  Overlay,
  DialogBox,
  DialogTitle,
  DialogBody,
  DialogIcon,
  DialogText,
  DialogButtons,
  DialogButton
} from './styled'

export interface NotepadHandle {
  requestClose: () => void
}

interface NotepadProps {
  filePath: string
  fileName: string
  initialContent: string
  onTitleChange?: (title: string) => void
  onRequestClose?: () => void
}

const Notepad = forwardRef<NotepadHandle, NotepadProps>(
  (
    { filePath, fileName, initialContent, onTitleChange, onRequestClose },
    ref
  ) => {
    const fs = useFileSystem()

    const [content, setContent] = useState(initialContent)
    const [savedContent, setSavedContent] = useState(initialContent)
    const [wordWrap, setWordWrap] = useState(true)
    const [openMenu, setOpenMenu] = useState<'file' | 'edit' | null>(null)
    const [showDialog, setShowDialog] = useState(false)
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const isDirty = content !== savedContent

    useImperativeHandle(
      ref,
      () => ({
        requestClose: () => {
          if (content !== savedContent) {
            setShowDialog(true)
            setOpenMenu(null)
          } else {
            onRequestClose?.()
          }
        }
      }),
      [content, savedContent, onRequestClose]
    )

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value
      setContent(newContent)

      const newIsDirty = newContent !== savedContent
      onTitleChange?.(newIsDirty ? `${fileName} *` : fileName)
    }

    const save = useCallback(() => {
      fs.writeFile(filePath, content)
      setSavedContent(content)
      onTitleChange?.(fileName)
      setOpenMenu(null)
      textAreaRef.current?.focus()
    }, [fs, filePath, content, fileName, onTitleChange])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        save()
        return
      }
      if (e.key === 'Escape' && openMenu) {
        setOpenMenu(null)
      }
    }

    const updateCursor = () => {
      const el = textAreaRef.current
      if (!el) return
      const before = el.value.substring(0, el.selectionStart)
      const lines = before.split('\n')
      setCursorPos({
        line: lines.length,
        col: lines[lines.length - 1].length + 1
      })
    }

    const handleContainerClick = (e: React.MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-menu]')) {
        setOpenMenu(null)
      }
    }

    const selectAll = () => {
      textAreaRef.current?.select()
      setOpenMenu(null)
    }

    const toggleWordWrap = () => {
      setWordWrap((w) => !w)
      setOpenMenu(null)
    }

    const handleExitClick = () => {
      setOpenMenu(null)
      if (isDirty) {
        setShowDialog(true)
      } else {
        onRequestClose?.()
      }
    }

    const dialogSave = () => {
      save()
      setShowDialog(false)
      onRequestClose?.()
    }

    const dialogDontSave = () => {
      setShowDialog(false)
      onRequestClose?.()
    }

    const dialogCancel = () => {
      setShowDialog(false)
      textAreaRef.current?.focus()
    }

    return (
      <Container onClick={handleContainerClick}>
        <MenuBar>
          <MenuButton
            data-menu
            open={openMenu === 'file'}
            onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
          >
            File
            {openMenu === 'file' && (
              <DropdownMenu>
                <MenuItem onClick={save}>
                  Save <ShortcutHint>Ctrl+S</ShortcutHint>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleExitClick}>Exit</MenuItem>
              </DropdownMenu>
            )}
          </MenuButton>

          <MenuButton
            data-menu
            open={openMenu === 'edit'}
            onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
          >
            Edit
            {openMenu === 'edit' && (
              <DropdownMenu>
                <MenuItem onClick={selectAll}>
                  Select All <ShortcutHint>Ctrl+A</ShortcutHint>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={toggleWordWrap}>
                  {wordWrap ? '✓ ' : '\u00A0\u00A0\u00A0'}Word Wrap
                </MenuItem>
              </DropdownMenu>
            )}
          </MenuButton>
        </MenuBar>

        <TextArea
          ref={textAreaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onClick={updateCursor}
          onKeyUp={updateCursor}
          style={{
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            overflowX: wordWrap ? 'hidden' : 'auto'
          }}
          spellCheck={false}
          autoFocus
        />

        <StatusBar>
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>{isDirty ? 'Modified' : 'Saved'}</span>
        </StatusBar>

        {showDialog && (
          <Overlay onClick={(e) => e.stopPropagation()}>
            <DialogBox>
              <DialogTitle>Notepad</DialogTitle>
              <DialogBody>
                <DialogIcon>?</DialogIcon>
                <DialogText>
                  The text in <strong>{fileName}</strong> has been changed.
                  <br />
                  <br />
                  Do you want to save the changes?
                </DialogText>
              </DialogBody>
              <DialogButtons>
                <DialogButton onClick={dialogSave} autoFocus>
                  Yes
                </DialogButton>
                <DialogButton onClick={dialogDontSave}>No</DialogButton>
                <DialogButton onClick={dialogCancel}>Cancel</DialogButton>
              </DialogButtons>
            </DialogBox>
          </Overlay>
        )}
      </Container>
    )
  }
)

Notepad.displayName = 'Notepad'

export default Notepad

import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--white);
  color: var(--black);
`

export const MenuBar = styled.div`
  display: flex;
  padding: 2px 4px;
  background: var(--gray);
  border-bottom: 1px solid #808080;
  flex-shrink: 0;
  position: relative;
`

export const MenuButton = styled.div<{ open: boolean }>`
  padding: 2px 8px;
  cursor: default;
  font-size: 12px;
  background: ${({ open }) => (open ? 'var(--window-blue)' : 'transparent')};
  color: ${({ open }) => (open ? 'var(--white)' : 'var(--black)')};
  position: relative;
  user-select: none;

  &:hover {
    background: var(--window-blue);
    color: var(--white);
  }
`

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--gray);
  border: 1px solid;
  border-color: var(--white) #808080 #808080 var(--white);
  min-width: 150px;
  z-index: 9999;
  box-shadow: 2px 2px 0 var(--black);
`

export const MenuItem = styled.div<{ disabled?: boolean }>`
  padding: 4px 20px 4px 24px;
  font-size: 12px;
  color: ${({ disabled }) => (disabled ? '#888' : 'var(--black)')};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  white-space: nowrap;

  &:hover {
    background: ${({ disabled }) =>
      disabled ? 'transparent' : 'var(--window-blue)'};
    color: ${({ disabled }) => (disabled ? '#888' : 'var(--white)')};
  }
`

export const MenuDivider = styled.div`
  height: 1px;
  background: #808080;
  margin: 2px 4px;
`

export const ShortcutHint = styled.span`
  float: right;
  margin-left: 24px;
  opacity: 0.7;
`

export const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  padding: 4px 6px;
  font-family: var(--font);
  font-size: 12px;
  line-height: 1.5;
  background: var(--white);
  color: var(--black);
  width: 100%;
  box-sizing: border-box;
`

export const StatusBar = styled.div`
  padding: 2px 8px;
  background: var(--gray);
  border-top: 1px solid #808080;
  font-size: 11px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
`

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`

export const DialogBox = styled.div`
  background: var(--gray);
  border: 2px solid;
  border-color: var(--white) #808080 #808080 var(--white);
  min-width: 300px;
  max-width: 360px;
  box-shadow: 2px 2px 0 var(--black);
`

export const DialogTitle = styled.div`
  background: var(--window-blue);
  color: var(--white);
  padding: 3px 8px;
  font-size: 12px;
  font-weight: bold;
`

export const DialogBody = styled.div`
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`

export const DialogIcon = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid #808080;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
  color: var(--window-blue);
`

export const DialogText = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: var(--black);
`

export const DialogButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 4px 16px 14px;
`

export const DialogButton = styled.button`
  padding: 4px 0;
  width: 80px;
  font-size: 12px;
  font-family: var(--font);
  background: var(--gray);
  border: 1px solid;
  border-color: var(--white) #808080 #808080 var(--white);
  cursor: pointer;
  color: var(--black);

  &:active {
    border-color: #808080 var(--white) var(--white) #808080;
    padding: 5px 0 3px;
  }

  &:focus {
    outline: 1px dotted var(--black);
    outline-offset: -4px;
  }
`

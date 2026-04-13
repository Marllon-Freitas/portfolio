import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--white);
  color: var(--black);
`

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: var(--gray);
  border-bottom: 1px solid #808080;
  flex-shrink: 0;
`

export const NavButton = styled.button<{ disabled?: boolean }>`
  padding: 2px 8px;
  font-size: 11px;
  background: var(--gray);
  border: 1px solid;
  border-color: ${({ disabled }) =>
    disabled
      ? '#aaa #aaa #aaa #aaa'
      : 'var(--white) #808080 #808080 var(--white)'};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:active:not([disabled]) {
    border-color: #808080 var(--white) var(--white) #808080;
  }
`

export const AddressBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  background: var(--gray);
  border-bottom: 1px solid #808080;
  flex-shrink: 0;
`

export const AddressLabel = styled.span`
  font-size: 11px;
  white-space: nowrap;
`

export const AddressInput = styled.input`
  flex: 1;
  font-family: var(--font);
  font-size: 11px;
  padding: 1px 4px;
  border: 1px solid;
  border-color: #808080 var(--white) var(--white) #808080;
  background: var(--white);
  color: var(--black);
  outline: none;
`

export const FileGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  background: var(--white);
`

export const FileItem = styled.div<{ selected: boolean }>`
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px;
  cursor: default;
  border: 1px solid
    ${({ selected }) => (selected ? 'var(--window-blue)' : 'transparent')};
  background: ${({ selected }) =>
    selected ? 'var(--window-blue)' : 'transparent'};
  user-select: none;

  &:hover {
    border-color: ${({ selected }) =>
      selected ? 'var(--window-blue)' : '#aaa'};
  }
`

export const FileIcon = styled.img`
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  pointer-events: none;
`

export const FileName = styled.span<{ selected: boolean }>`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  color: ${({ selected }) => (selected ? 'var(--white)' : 'var(--black)')};
  line-height: 1.2;
  max-width: 68px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

export const StatusBar = styled.div`
  padding: 2px 6px;
  background: var(--gray);
  border-top: 1px solid #808080;
  font-size: 11px;
  flex-shrink: 0;
  display: flex;
  gap: 16px;
  color: var(--black);
`

export const EmptyMessage = styled.span`
  color: #888;
  font-size: 11px;
  padding: 8px;
`

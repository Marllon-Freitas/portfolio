import { FSNode } from '../utils/types'

const now = Date.now()

export const initialTree: FSNode = {
  type: 'dir',
  created: now,
  children: {
    marllon: {
      type: 'dir',
      created: now,
      children: {
        'README.txt': {
          type: 'file',
          created: now,
          content: `Hi. I'm Marllon.
Full-stack developer, based in Brazil.
This machine runs on coffee and curiosity.

Type "dir" in the terminal to look around.
Or just double-click stuff.`
        },
        'contact.txt': {
          type: 'file',
          created: now,
          content: `Email:    marllonfreitas64@gmail.com
GitHub:   github.com/marllon-freitas
LinkedIn: linkedin.com/in/marllon-freitas`
        },
        projects: {
          type: 'dir',
          created: now,
          children: {
            'this-portfolio': {
              type: 'dir',
              created: now,
              children: {
                'README.md': {
                  type: 'file',
                  created: now,
                  content: `# marllon.dev — retro OS portfolio

A personal portfolio built to look and feel
like an old Windows machine.

Stack:    React + TypeScript + styled-components

Source: github.com/marllon-freitas/portfolio`
                },
                'NOTES.txt': {
                  type: 'file',
                  created: now,
                  content: `TODO:
  [x] real filesystem with context
  [x] folder windows that actually navigate`
                }
              }
            }
          }
        },
        games: {
          type: 'dir',
          created: now,
          children: {
            'README.txt': {
              type: 'file',
              created: now,
              content: `Games folder.
Double-click a game to launch it.`
            }
          }
        },
        wallpapers: {
          type: 'dir',
          created: now,
          children: {
            'README.txt': {
              type: 'file',
              created: now,
              content: `Wallpaper picker.
Select a wallpaper to apply it to the desktop.`
            }
          }
        }
      }
    }
  }
}

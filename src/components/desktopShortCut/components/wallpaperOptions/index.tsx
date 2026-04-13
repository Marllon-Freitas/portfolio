import React from 'react'
import {
  WallpaperOptionsContainer,
  WallpaperItem,
  WallpaperImage,
  WallpaperName
} from './styled'
import { Wallpaper } from '../../../../utils/types'

interface WallpaperOptionsProps {
  wallpapers: Wallpaper[]
  currentWallpaperId: string
  onSelectWallpaper: (id: string) => void
}

const WallpaperOptions: React.FC<WallpaperOptionsProps> = ({
  wallpapers,
  currentWallpaperId,
  onSelectWallpaper
}) => {
  return (
    <WallpaperOptionsContainer>
      {wallpapers.map((wallpaper) => (
        <WallpaperItem
          key={wallpaper.id}
          onClick={() => onSelectWallpaper(wallpaper.id)}
          selected={currentWallpaperId === wallpaper.id}
        >
          <WallpaperImage image={wallpaper.src} />
          <WallpaperName>{wallpaper.name}</WallpaperName>
        </WallpaperItem>
      ))}
    </WallpaperOptionsContainer>
  )
}

export default WallpaperOptions

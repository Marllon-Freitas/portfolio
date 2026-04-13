import { useState } from 'react'
import outerWilds02 from '../assets/img/outerWilds02.jpg'
import outerWilds from '../assets/img/outerWilds.jpg'
import { Wallpaper } from '../utils/types'

const WALLPAPER_STORAGE_KEY = '@monitor:wallpaper'

const defaultWallpapers: Wallpaper[] = [
  {
    id: 'outer-wilds-02',
    src: outerWilds02,
    name: 'Outer Wilds 02'
  },
  {
    id: 'outer-wilds',
    src: outerWilds,
    name: 'Outer Wilds'
  }
]

export const useWallpaper = () => {
  const [wallpapers] = useState<Wallpaper[]>(defaultWallpapers)
  const [currentWallpaperId, setCurrentWallpaperId] = useState<string>(() => {
    const savedWallpaperId = localStorage.getItem(WALLPAPER_STORAGE_KEY)

    if (
      savedWallpaperId &&
      defaultWallpapers.some((w) => w.id === savedWallpaperId)
    )
      return savedWallpaperId

    return defaultWallpapers[0].id
  })

  const getCurrentWallpaper = () =>
    wallpapers.find((w) => w.id === currentWallpaperId) || wallpapers[0]

  const setWallpaperById = (id: string) => {
    if (wallpapers.some((w) => w.id === id)) {
      setCurrentWallpaperId(id)
      localStorage.setItem(WALLPAPER_STORAGE_KEY, id)
    }
  }

  return {
    wallpapers,
    currentWallpaper: getCurrentWallpaper(),
    setWallpaperById
  }
}

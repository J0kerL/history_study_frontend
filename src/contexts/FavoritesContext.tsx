import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { getFavoriteCount, hasFavorite as apiHasFavorite } from '../api/user'

/** 收藏状态缓存 key */
function favoriteKey(type: number, refId: number) {
  return `${type}:${refId}`
}

interface FavoritesContextValue {
  /** 收藏总数（用于 Profile 页面展示） */
  count: number | null
  /** 刷新收藏总数 */
  refreshCount: () => Promise<void>
  /** 查询指定资源是否已收藏（带缓存） */
  isFavorited: (type: number, refId: number) => boolean
  /** 更新指定资源的收藏状态（乐观更新 + 刷新计数） */
  updateFavoriteStatus: (type: number, refId: number, favorited: boolean) => void
  /** 从收藏列表中移除一项（用于 Favorites 页面删除后同步） */
  removeFavoriteItem: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState<number | null>(null)
  /** 收藏状态缓存：key = "type:refId", value = boolean */
  const [statusCache, setStatusCache] = useState<Map<string, boolean>>(new Map())

  /** 刷新收藏总数 */
  const refreshCount = useCallback(async () => {
    try {
      const c = await getFavoriteCount()
      setCount(c)
    } catch {
      // 静默失败
    }
  }, [])

  /** 查询是否已收藏（先查缓存，缓存未命中则异步请求） */
  const isFavorited = useCallback(
    (type: number, refId: number) => {
      return statusCache.get(favoriteKey(type, refId)) ?? false
    },
    [statusCache],
  )

  /** 更新收藏状态（乐观更新缓存 + 异步刷新计数） */
  const updateFavoriteStatus = useCallback(
    (type: number, refId: number, favorited: boolean) => {
      setStatusCache((prev) => {
        const next = new Map(prev)
        next.set(favoriteKey(type, refId), favorited)
        return next
      })
      // 异步刷新收藏总数
      refreshCount()
    },
    [refreshCount],
  )

  /** 从收藏列表删除后，计数 -1 */
  const removeFavoriteItem = useCallback(() => {
    setCount((prev) => (prev != null ? Math.max(0, prev - 1) : null))
  }, [])

  // 初始化时刷新计数
  useEffect(() => {
    refreshCount()
  }, [refreshCount])

  return (
    <FavoritesContext.Provider
      value={{
        count,
        refreshCount,
        isFavorited,
        updateFavoriteStatus,
        removeFavoriteItem,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

/**
 * 异步加载收藏状态并更新缓存。
 * 这是一个辅助函数，在组件中配合 useFavorites 使用。
 */
export async function loadFavoriteStatus(
  type: number,
  refId: number,
): Promise<boolean> {
  try {
    return await apiHasFavorite(type, refId)
  } catch {
    return false
  }
}

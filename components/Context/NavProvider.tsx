'use client'
import React, { useEffect, useState } from 'react'
import NextTopLoader from 'nextjs-toploader'
import { useRouter } from 'next/navigation'

const NavProvider: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout
    let minLoadingTime: NodeJS.Timeout

    const handleStart = (): void => {
      setIsLoading(true)
    }

    const handleComplete = (): void => {
      const checkPageLoad = () => {
        if (document.readyState === 'complete') {
          minLoadingTime = setTimeout(() => {
            setIsLoading(false)
          }, 800)
        } else {
          setTimeout(checkPageLoad, 100)
        }
      }
      
      loadingTimeout = setTimeout(() => {
        checkPageLoad()
      }, 300)
    }

    const handlePopState = (): void => {
      handleStart()
      setTimeout(handleComplete, 200)
    }

    const handleBeforeUnload = (): void => {
      handleStart()
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        handleComplete()
      }
    }

    const originalPush = router.push
    const originalReplace = router.replace
    const originalBack = router.back
    const originalForward = router.forward

    router.push = (...args: Parameters<typeof router.push>) => {
      handleStart()
      const result = originalPush.apply(router, args)
      Promise.resolve(result).finally(handleComplete)
      return result
    }

    router.replace = (...args: Parameters<typeof router.replace>) => {
      handleStart()
      const result = originalReplace.apply(router, args)
      Promise.resolve(result).finally(handleComplete)
      return result
    }

    router.back = () => {
      handleStart()
      originalBack.call(router)
      setTimeout(handleComplete, 200)
    }

    router.forward = () => {
      handleStart()
      originalForward.call(router)
      setTimeout(handleComplete, 200)
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(loadingTimeout)
      clearTimeout(minLoadingTime)
      
      router.push = originalPush
      router.replace = originalReplace
      router.back = originalBack
      router.forward = originalForward
      
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[100000000000001]">
        <NextTopLoader color={`var(--chart-2)`} />
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-chart-2 animate-pulse" />
        )}
      </div>
    </>
  )
}

export default NavProvider
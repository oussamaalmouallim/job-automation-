/**
 * cloneme: C-23, A-05 — Barre de progression en haut de l'écran.
 * Portée depuis Lightswind UI v3.2.5 (`npx lightswind add top-loader`, licence MIT) :
 * TypeScript retiré, couleur par défaut = --couleur-accent, roue désactivée par défaut,
 * options inutilisées (parent, template) retirées.
 */
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

const TopLoader = forwardRef(function TopLoader(
  {
    isLoading = false,
    color = 'var(--couleur-accent)',
    height = 3,
    speed = 200,
    showSpinner = false,
    easing = 'ease',
    minimum = 0.08,
    trickle = true,
    trickleRate = 0.02,
    trickleSpeed = 800,
    zIndex = 1031,
    progress,
    className,
    ...props
  },
  ref
) {
  const [mounted, setMounted] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const progressRef = useRef(0)
  const isStartedRef = useRef(false)
  const requestRef = useRef(null)

  const styles = useMemo(() => ({
    container: {
      pointerEvents: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: `${height}px`,
      zIndex,
    },
    bar: {
      position: 'absolute',
      inset: 0,
      background: color,
      boxShadow: `0 0 10px ${color}`,
      transition: `transform ${speed}ms ${easing}`,
      transform: `translate3d(-${100 - currentProgress * 100}%, 0, 0)`,
    },
    spinner: {
      position: 'fixed',
      top: '15px',
      right: '15px',
      width: '18px',
      height: '18px',
      border: 'solid 2px transparent',
      borderTopColor: color,
      borderLeftColor: color,
      borderRadius: '50%',
      animation: 'top-loader-spinner 400ms linear infinite',
      zIndex,
    },
  }), [color, currentProgress, easing, height, speed, zIndex])

  const set = useCallback((n) => {
    const valeur = clamp(n, minimum, 1)
    progressRef.current = valeur
    setCurrentProgress(valeur)
    if (valeur === 1) {
      setTimeout(() => {
        setCurrentProgress(0)
        isStartedRef.current = false
      }, speed)
    } else {
      isStartedRef.current = true
    }
  }, [minimum, speed])

  const inc = useCallback((amount) => {
    let n = progressRef.current
    if (!isStartedRef.current) {
      set(minimum)
      return
    }
    const pas = typeof amount === 'number' ? amount : (1 - n) * clamp(Math.random() * n, 0.1, 0.95)
    n = clamp(n + pas, 0, 0.994)
    set(n)
  }, [minimum, set])

  useEffect(() => {
    if (!mounted) return undefined
    if (progress !== undefined) {
      set(progress)
      return undefined
    }
    if (isLoading && trickle) {
      const tick = () => {
        inc(trickleRate * Math.random())
        requestRef.current = window.setTimeout(tick, trickleSpeed)
      }
      tick()
      return () => {
        window.clearTimeout(requestRef.current)
        requestRef.current = null
      }
    }
    return undefined
  }, [isLoading, mounted, progress, set, trickle, inc, trickleRate, trickleSpeed])

  useEffect(() => {
    setMounted(true)
    const style = document.createElement('style')
    style.textContent = '@keyframes top-loader-spinner { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
      window.clearTimeout(requestRef.current)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (isLoading) {
      if (currentProgress === 0) set(minimum)
    } else if (currentProgress > 0) {
      set(1)
    }
  }, [isLoading, mounted, currentProgress, minimum, set])

  if (!mounted || (!isLoading && currentProgress === 0)) return null

  return (
    <div
      ref={ref}
      className={cn('top-loader', className)}
      style={styles.container}
      role="progressbar"
      aria-busy={isLoading}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(currentProgress * 100)}
      {...props}
    >
      <div style={styles.bar} />
      {showSpinner && <div style={styles.spinner} />}
    </div>
  )
})

export { TopLoader }
export default TopLoader

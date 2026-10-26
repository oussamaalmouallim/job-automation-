/**
 * cloneme: C-22, A-04 — Compteur animé.
 * Porté depuis Lightswind UI v3.2.5 (`npx lightswind add count-up`, licence MIT) :
 * TypeScript retiré, couleurs passées aux tokens, durée par défaut ramenée à 1,2 s.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

const formatValue = (val, precision, sep) =>
  val.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, sep)

const easingFunctions = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
}

const animationStyles = {
  default: { type: 'tween' },
  bounce: { type: 'spring', bounce: 0.25 },
  spring: { type: 'spring', stiffness: 100, damping: 10 },
  gentle: { type: 'spring', stiffness: 60, damping: 15 },
  energetic: { type: 'spring', stiffness: 300, damping: 20 },
}

export function CountUp({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  easing = 'easeOut',
  separator = ' ',
  triggerOnView = true,
  className,
  numberClassName,
  animationStyle = 'default',
  onAnimationComplete,
}) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(reduceMotion ? value : 0)
  const rounded = useTransform(count, (latest) => formatValue(latest, decimals, separator))

  useEffect(() => {
    let controls = null

    // Mode animations réduites : valeur finale tout de suite.
    if (reduceMotion) {
      count.set(value)
      return undefined
    }

    const startAnimation = () => {
      controls = animate(count.get(), value, {
        ...animationStyles[animationStyle],
        ease: easingFunctions[easing],
        duration: animationStyle === 'default' ? duration : undefined,
        onUpdate: (latest) => count.set(latest),
        onComplete: () => {
          setHasAnimated(true)
          onAnimationComplete?.()
        },
      })
    }

    if (!triggerOnView || hasAnimated) {
      startAnimation()
      return () => controls?.stop()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) startAnimation()
      },
      { threshold: 0.1 }
    )
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      controls?.stop()
      observer.disconnect()
    }
  }, [value, duration, easing, animationStyle, triggerOnView, hasAnimated, onAnimationComplete, count, reduceMotion])

  return (
    <div ref={containerRef} className={cn('inline-flex items-center font-bold text-texte', className)}>
      <motion.div className={cn('flex items-center', numberClassName)}>
        {prefix && <span className="mr-1">{prefix}</span>}
        <motion.span>{rounded}</motion.span>
        {suffix && <span className="ml-1">{suffix}</span>}
      </motion.div>
    </div>
  )
}

export default CountUp

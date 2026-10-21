import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactiveTilt?: boolean
  maxTilt?: number
  glare?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      style,
      interactiveTilt = true,
      maxTilt = 7,
      glare = true,
      onMouseMove,
      onMouseLeave,
      onPointerDown,
      onPointerUp,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = React.useRef<HTMLDivElement>(null)
    const cardRef = (forwardedRef || internalRef) as React.RefObject<HTMLDivElement>

    const [tiltStyle, setTiltStyle] = React.useState<React.CSSProperties>({})
    const [glareStyle, setGlareStyle] = React.useState<React.CSSProperties>({ opacity: 0 })
    const [isPressed, setIsPressed] = React.useState(false)
    const rafRef = React.useRef<number | null>(null)

    const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactiveTilt || !cardRef.current) return

      const card = cardRef.current
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const xPct = (x / rect.width - 0.5) * 2 // -1 to 1
        const yPct = (y / rect.height - 0.5) * 2 // -1 to 1

        const rotateX = -yPct * maxTilt
        const rotateY = xPct * maxTilt
        const scale = isPressed ? 0.985 : 1.015

        setTiltStyle({
          transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
          transition: 'transform 0.08s ease-out',
        })

        if (glare) {
          const glareX = ((x / rect.width) * 100).toFixed(1)
          const glareY = ((y / rect.height) * 100).toFixed(1)
          setGlareStyle({
            opacity: isPressed ? 0.35 : 0.22,
            background: `radial-gradient(circle 220px at ${glareX}% ${glareY}%, rgba(255, 175, 75, 0.32), rgba(255, 255, 255, 0.08) 35%, transparent 70%)`,
            transition: 'opacity 0.15s ease',
          })
        }
      })

      if (onMouseMove) {
        onMouseMove(e)
      }
    }

    const handlePointerLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      setIsPressed(false)

      if (interactiveTilt) {
        setTiltStyle({
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        })
        setGlareStyle({
          opacity: 0,
          transition: 'opacity 0.4s ease-out',
        })
      }

      if (onMouseLeave) {
        onMouseLeave(e)
      }
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      setIsPressed(true)
      if (interactiveTilt && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const xPct = (x / rect.width - 0.5) * 2
        const yPct = (y / rect.height - 0.5) * 2

        const rotateX = -yPct * (maxTilt * 1.1)
        const rotateY = xPct * (maxTilt * 1.1)

        setTiltStyle({
          transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(0.98, 0.98, 0.98)`,
          transition: 'transform 0.12s ease-out',
        })
      }

      if (onPointerDown) {
        onPointerDown(e)
      }
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      setIsPressed(false)
      if (onPointerUp) {
        onPointerUp(e)
      }
    }

    return (
      <div
        ref={cardRef}
        onMouseMove={interactiveTilt ? handlePointerMove : onMouseMove}
        onMouseLeave={interactiveTilt ? handlePointerLeave : onMouseLeave}
        onPointerDown={interactiveTilt ? handlePointerDown : onPointerDown}
        onPointerUp={interactiveTilt ? handlePointerUp : onPointerUp}
        style={{
          ...style,
          ...tiltStyle,
          willChange: interactiveTilt ? 'transform' : undefined,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          "relative rounded-2xl border bg-card text-card-foreground shadow-sm transition-shadow duration-300 card-ambient-glow select-none",
          className
        )}
        {...props}
      >
        {/* Dynamic Specular Glare Reflection Layer */}
        {interactiveTilt && glare && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl overflow-hidden"
          >
            <div
              className="absolute inset-0 transition-opacity"
              style={glareStyle}
            />
          </div>
        )}

        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Check, CircleCheck } from "lucide-react"

interface ChecklistButtonProps {
  label?: string
  doneLabel?: string
  onDone?: () => void
  resettable?: boolean
  icon?: React.ReactNode
  doneIcon?: React.ReactNode
  className?: string
  // 新增：受控/非受控支持
  defaultDone?: boolean
  done?: boolean
  onDoneChange?: (done: boolean) => void
}

export default function ChecklistButton({
  label = "Mark as Done",
  doneLabel = "Done",
  onDone,
  resettable = false,
  icon = <CircleCheck className="w-4 h-4 text-sky-600" />,
  doneIcon = <Check className="w-4 h-4 text-green-600" />,
  className,
  defaultDone,
  done: doneProp,
  onDoneChange,
}: ChecklistButtonProps) {
  const isControlled = doneProp !== undefined
  const [internalDone, setInternalDone] = React.useState(!!defaultDone)
  const done = isControlled ? !!doneProp : internalDone
  const FLIP_DURATION = 0.5
  const STROKE_DURATION = 1.0
  
  // 用于测量文字宽度以自适应划线
  const textRef = React.useRef<HTMLSpanElement>(null)
  const [textWidth, setTextWidth] = React.useState(0)
  
  // 测量文字宽度并更新 SVG viewBox
  React.useEffect(() => {
    const measureWidth = () => {
      if (textRef.current) {
        const width = textRef.current.offsetWidth
        if (width > 0) {
          setTextWidth(width)
        }
      }
    }
    
    // 立即测量
    measureWidth()
    
    // 延迟测量以确保翻转动画后能获取正确的宽度
    const timer = setTimeout(measureWidth, 100)
    
    return () => clearTimeout(timer)
  }, [doneLabel, done])

  const handleClick = () => {
    if (done && resettable) {
      if (!isControlled) setInternalDone(false)
      onDoneChange?.(false)
      return
    }
    if (!done) {
      if (!isControlled) setInternalDone(true)
      onDoneChange?.(true)
      onDone?.()
    }
  }

  return (
    <Button
      variant={done ? "secondary" : "default"}
      className={`relative w-48 flex bg-white text-black dark:bg-black dark:text-white border hover:bg-white justify-center items-center overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ perspective: 800 }}
    >
      {/* 3D Flip container */}
      <motion.div
        initial={false}
        animate={{ rotateY: done ? 180 : 0 }}
        transition={{ duration: FLIP_DURATION, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full flex justify-center items-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face - default state */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" as React.CSSProperties["backfaceVisibility"] }}
        >
          <motion.span
            key="front"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            {icon}
            {label}
          </motion.span>
        </div>

        {/* Back face - done state */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden" as React.CSSProperties["backfaceVisibility"],
            transform: "rotateY(180deg)",
          }}
        >
          <motion.span
            key="back"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            {/* Done icon pop a bit for extra delight */}
            <motion.span
              initial={false}
              animate={{ scale: done ? 1.05 : 1, rotate: done ? 360 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.6 }}
              className="inline-flex"
            >
              {doneIcon}
            </motion.span>

            {/* Strike-through animated SVG path (scribble) */}
            <span className="relative inline-block">
              <span className="relative z-10" ref={textRef}>{doneLabel}</span>
              {textWidth > 0 && (
                <motion.svg
                  width={textWidth}
                  height="20"
                  viewBox={`0 0 ${textWidth} 20`}
                  className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20"
                  style={{ width: textWidth, height: 20 }}
                >
                  <motion.path
                    d={`M 2 10 Q ${textWidth * 0.25} 6, ${textWidth * 0.35} 10 T ${textWidth * 0.65} 10 Q ${textWidth * 0.85} 8, ${textWidth - 2} 10`}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={false}
                    animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
                    transition={{
                      pathLength: { duration: STROKE_DURATION, ease: "easeInOut", delay: done ? Math.max(0, FLIP_DURATION - 0.05) : 0 },
                      opacity: { duration: 0.01, delay: done ? Math.max(0, FLIP_DURATION - 0.05) : STROKE_DURATION },
                    }}
                    className="stroke-green-600 dark:stroke-green-400"
                  />
                </motion.svg>
              )}
            </span>
          </motion.span>
        </div>
      </motion.div>
    </Button>
  )
}

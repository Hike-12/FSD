import React, { createContext, useContext, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useMeasure from "react-use-measure"

// Utility function for class names (you might want to replace with your own implementation)
const cn = (...classes) => classes.filter(Boolean).join(' ')

const springConfig = { stiffness: 200, damping: 20, bounce: 0.2 }

// Context
const ExpandableContext = createContext({
  isExpanded: false,
  toggleExpand: () => {},
  expandDirection: "vertical",
  expandBehavior: "replace",
  transitionDuration: 0.3,
  easeType: "easeInOut",
  initialDelay: 0,
})

// Custom hook
const useExpandable = () => useContext(ExpandableContext)

// Animation Presets
const ANIMATION_PRESETS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  // ... (other presets remain the same as in the original code)
}

// Utility function for getting animation props
const getAnimationProps = (preset, animateIn, animateOut) => {
  const defaultAnimation = {
    initial: {},
    animate: {},
    exit: {},
  }

  const presetAnimation = preset ? ANIMATION_PRESETS[preset] : defaultAnimation

  return {
    initial: presetAnimation.initial,
    animate: presetAnimation.animate,
    exit: animateOut?.exit || presetAnimation.exit,
  }
}

// Expandable Root Component
const Expandable = ({
  children,
  expanded,
  onToggle,
  transitionDuration = 0.3,
  easeType = "easeInOut",
  expandDirection = "vertical",
  expandBehavior = "replace",
  initialDelay = 0,
  onExpandStart,
  onExpandEnd,
  onCollapseStart,
  onCollapseEnd,
  ...props
}) => {
  const [isExpandedInternal, setIsExpandedInternal] = useState(false)

  const isExpanded = expanded !== undefined ? expanded : isExpandedInternal
  const toggleExpand = onToggle || (() => setIsExpandedInternal(prev => !prev))

  useEffect(() => {
    if (isExpanded) {
      onExpandStart?.()
    } else {
      onCollapseStart?.()
    }
  }, [isExpanded, onExpandStart, onCollapseStart])

  const contextValue = {
    isExpanded,
    toggleExpand,
    expandDirection,
    expandBehavior,
    transitionDuration,
    easeType,
    initialDelay,
    onExpandEnd,
    onCollapseEnd,
  }

  return (
    <ExpandableContext.Provider value={contextValue}>
      <motion.div
        initial={false}
        animate={{
          transition: {
            duration: transitionDuration,
            ease: easeType,
            delay: initialDelay,
          },
        }}
        {...props}
      >
        {typeof children === "function" ? children({ isExpanded }) : children}
      </motion.div>
    </ExpandableContext.Provider>
  )
}

// ExpandableContent Component
const ExpandableContent = ({
  children,
  preset,
  animateIn,
  animateOut,
  stagger = false,
  staggerChildren = 0.1,
  keepMounted = false,
  ...props
}) => {
  const { isExpanded, transitionDuration, easeType } = useExpandable()
  const [measureRef, { height: measuredHeight }] = useMeasure()
  const [animatedHeight, setAnimatedHeight] = useState(0)

  useEffect(() => {
    setAnimatedHeight(isExpanded ? measuredHeight : 0)
  }, [isExpanded, measuredHeight])

  const animationProps = getAnimationProps(preset, animateIn, animateOut)

  return (
    <motion.div
      style={{
        height: animatedHeight,
        overflow: "hidden",
      }}
      transition={{ duration: transitionDuration, ease: easeType }}
      {...props}
    >
      <AnimatePresence initial={false}>
        {(isExpanded || keepMounted) && (
          <motion.div
            ref={measureRef}
            initial={animationProps.initial}
            animate={animationProps.animate}
            exit={animationProps.exit}
            transition={{ duration: transitionDuration, ease: easeType }}
          >
            {stagger ? (
              <motion.div
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: staggerChildren,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {React.Children.map(children, (child, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    {child}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              children
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ExpandableCard Component
const ExpandableCard = ({
  children,
  className = "",
  collapsedSize = { width: 320, height: 211 },
  expandedSize = { width: 480, height: undefined },
  hoverToExpand = false,
  expandDelay = 0,
  collapseDelay = 0,
  ...props
}) => {
  const { isExpanded, toggleExpand, expandDirection } = useExpandable()
  const [measureRef, { width, height }] = useMeasure()
  const [animatedWidth, setAnimatedWidth] = useState(collapsedSize.width || 0)
  const [animatedHeight, setAnimatedHeight] = useState(collapsedSize.height || 0)

  useEffect(() => {
    if (isExpanded) {
      setAnimatedWidth(expandedSize.width || width)
      setAnimatedHeight(expandedSize.height || height)
    } else {
      setAnimatedWidth(collapsedSize.width || width)
      setAnimatedHeight(collapsedSize.height || height)
    }
  }, [
    isExpanded,
    collapsedSize,
    expandedSize,
    width,
    height,
  ])

  const handleHover = () => {
    if (hoverToExpand && !isExpanded) {
      setTimeout(toggleExpand, expandDelay)
    }
  }

  const handleHoverEnd = () => {
    if (hoverToExpand && isExpanded) {
      setTimeout(toggleExpand, collapseDelay)
    }
  }

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      style={{
        width:
          expandDirection === "vertical" ? collapsedSize.width : animatedWidth,
        height:
          expandDirection === "horizontal"
            ? collapsedSize.height
            : animatedHeight,
      }}
      transition={springConfig}
      onHoverStart={handleHover}
      onHoverEnd={handleHoverEnd}
      {...props}
    >
      <div className={cn(
        "grid grid-cols-1 rounded-lg sm:rounded-xl md:rounded-[2rem]",
        "shadow-[inset_0_0_1px_1px_#ffffff4d] sm:shadow-[inset_0_0_2px_1px_#ffffff4d]",
        "ring-1 ring-black/5",
        "max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] md:max-w-[calc(100%-4rem)]",
        "mx-auto w-full",
        "transition-all duration-300 ease-in-out"
      )}>
        <div className="grid grid-cols-1 rounded-lg sm:rounded-xl md:rounded-[2rem] p-1 sm:p-1.5 md:p-2 shadow-md shadow-black/5">
          <div className="rounded-md sm:rounded-lg md:rounded-3xl bg-white p-2 sm:p-3 md:p-4 shadow-xl ring-1 ring-black/5">
            <div className="w-full h-full overflow-hidden">
              <div ref={measureRef} className="flex flex-col h-full">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ExpandableTrigger Component
const ExpandableTrigger = ({ children, ...props }) => {
  const { toggleExpand } = useExpandable()
  return (
    <div onClick={toggleExpand} className="cursor-pointer" {...props}>
      {children}
    </div>
  )
}

// ExpandableCardHeader Component
const ExpandableCardHeader = ({ className, children, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    <motion.div layout className="flex justify-between items-start">
      {children}
    </motion.div>
  </div>
)

// ExpandableCardContent Component
const ExpandableCardContent = ({ className, children, ...props }) => (
  <div
    className={cn("p-6 pt-0 px-4 overflow-hidden flex-grow", className)}
    {...props}
  >
    <motion.div layout>{children}</motion.div>
  </div>
)

// ExpandableCardFooter Component
const ExpandableCardFooter = ({ className, ...props }) => (
  <div
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
)

export {
  Expandable,
  useExpandable,
  ExpandableCard,
  ExpandableContent,
  ExpandableContext,
  ExpandableTrigger,
  ExpandableCardHeader,
  ExpandableCardContent,
  ExpandableCardFooter,
}
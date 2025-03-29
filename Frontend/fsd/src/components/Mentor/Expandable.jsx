import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    forwardRef 
  } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import useMeasure from 'react-use-measure';
  
  // Create a context to share expansion state and methods
  const ExpandableContext = createContext({
    isExpanded: false,
    toggleExpand: () => {}
  });
  
  // Custom hook to use the Expandable context
  const useExpandable = () => useContext(ExpandableContext);
  
  // Main Expandable wrapper component
  const Expandable = ({ 
    children, 
    onExpand, 
    onCollapse,
    initialExpanded = false 
  }) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
    const toggleExpand = () => {
      setIsExpanded(prev => {
        if (!prev && onExpand) onExpand();
        if (prev && onCollapse) onCollapse();
        return !prev;
      });
    };
  
    return (
      <ExpandableContext.Provider value={{ isExpanded, toggleExpand }}>
        {children}
      </ExpandableContext.Provider>
    );
  };
  
  // Expandable Card component
  const ExpandableCard = ({ children, className = '' }) => {
    const [ref, { height }] = useMeasure();
  
    return (
      <motion.div 
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        initial={false}
        animate={{ 
          height: height || 'auto' 
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30 
        }}
      >
        {children}
      </motion.div>
    );
  };
  
  // Expandable Trigger component
  const ExpandableTrigger = forwardRef(({ children, className = '' }, ref) => {
    const { toggleExpand } = useExpandable();
  
    return (
      <div 
        ref={ref}
        onClick={toggleExpand} 
        className={`cursor-pointer ${className}`}
      >
        {children}
      </div>
    );
  });
  
  // Expandable Content component
  const ExpandableContent = ({ 
    children, 
    preset = 'default', 
    className = '' 
  }) => {
    const { isExpanded } = useExpandable();
  
    const presets = {
      default: {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto' },
        exit: { opacity: 0, height: 0 }
      },
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      'slide-down': {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      }
    };
  
    const animation = presets[preset] || presets.default;
  
    return (
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            className={`w-full ${className}`}
            transition={{ 
              type: 'tween',
              duration: 0.3
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  // Card Header component
  const ExpandableCardHeader = ({ children, className = '' }) => (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
  
  // Card Content component
  const ExpandableCardContent = ({ children, className = '' }) => (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
  
  // Card Footer component
  const ExpandableCardFooter = ({ children, className = '' }) => (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
  
  export {
    Expandable,
    ExpandableCard,
    ExpandableTrigger,
    ExpandableContent,
    ExpandableCardHeader,
    ExpandableCardContent,
    ExpandableCardFooter,
    useExpandable
  };
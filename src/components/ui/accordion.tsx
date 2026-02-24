import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
  singleExpand?: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

interface AccordionProps {
  children: React.ReactNode;
  defaultExpanded?: string[];
  singleExpand?: boolean;
  className?: string;
  onExpandedChange?: (expanded: string[]) => void;
}

export function Accordion({
  children,
  defaultExpanded = [],
  singleExpand = true,
  className,
  onExpandedChange,
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = React.useCallback(
    (id: string) => {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (singleExpand) {
            next.clear();
          }
          next.add(id);
        }
        onExpandedChange?.(Array.from(next));
        return next;
      });
    },
    [singleExpand, onExpandedChange]
  );

  const expandItem = React.useCallback(
    (id: string) => {
      setExpandedItems((prev) => {
        const next = new Set(singleExpand ? [] : prev);
        next.add(id);
        onExpandedChange?.(Array.from(next));
        return next;
      });
    },
    [singleExpand, onExpandedChange]
  );

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, singleExpand }}>
      <div className={cn("space-y-3", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ id, children, className }: AccordionItemProps) {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.has(id);

  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl bg-card border border-border overflow-hidden transition-shadow duration-200",
        isExpanded ? "shadow-lg" : "shadow-sm",
        className
      )}
      data-state={isExpanded ? "open" : "closed"}
    >
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function AccordionTrigger({
  id,
  children,
  className,
  disabled = false,
}: AccordionTriggerProps) {
  const { expandedItems, toggleItem } = useAccordionContext();
  const isExpanded = expandedItems.has(id);

  return (
    <button
      type="button"
      onClick={() => !disabled && toggleItem(id)}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between p-4 text-left transition-colors",
        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      aria-expanded={isExpanded}
      aria-controls={`${id}-content`}
    >
      {children}
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    </button>
  );
}

interface AccordionContentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ id, children, className }: AccordionContentProps) {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.has(id);

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          id={`${id}-content`}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2, delay: 0.1 }
            }
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.15 }
            }
          }}
          className="overflow-hidden"
          role="region"
          aria-labelledby={id}
        >
          <div className={cn("p-4 pt-0", className)}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para controle externo do accordion
export function useAccordionControl() {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const expand = React.useCallback((id: string) => {
    setExpandedItems([id]);
  }, []);

  const collapse = React.useCallback((id: string) => {
    setExpandedItems((prev) => prev.filter((item) => item !== id));
  }, []);

  const toggle = React.useCallback((id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [id]
    );
  }, []);

  return {
    expandedItems,
    expand,
    collapse,
    toggle,
    setExpandedItems,
  };
}

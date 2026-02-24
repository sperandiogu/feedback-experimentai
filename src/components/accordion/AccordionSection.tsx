import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionStatus } from '@/hooks/useAccordionFeedback';

interface AccordionSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  status: SectionStatus;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export function AccordionSection({
  id,
  title,
  subtitle,
  icon,
  status,
  isExpanded,
  onToggle,
  children,
  className,
  badge,
}: AccordionSectionProps) {
  const getStatusIcon = () => {
    if (status === 'completed') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      );
    }
    if (status === 'in_progress') {
      return (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Circle className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full" />
    );
  };

  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl bg-card border overflow-hidden transition-all duration-300",
        isExpanded ? "shadow-lg border-primary/30" : "shadow-sm border-border",
        status === 'completed' && !isExpanded && "border-green-500/30 bg-green-50/30",
        className
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 p-4 text-left transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        )}
        aria-expanded={isExpanded}
        aria-controls={`${id}-content`}
      >
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusIcon()}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

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
            <div className="px-4 pb-4 pt-2 border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

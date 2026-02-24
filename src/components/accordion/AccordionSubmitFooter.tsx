import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { SectionInfo } from '@/hooks/useAccordionFeedback';

interface AccordionSubmitFooterProps {
  canSubmit: boolean;
  isSubmitting: boolean;
  incompleteSections: SectionInfo[];
  onSubmit: () => void;
  className?: string;
}

export function AccordionSubmitFooter({
  canSubmit,
  isSubmitting,
  incompleteSections,
  onSubmit,
  className,
}: AccordionSubmitFooterProps) {
  const incompleteCount = incompleteSections.length;

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className={cn(
        "sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t safe-area-inset-bottom",
        className
      )}
    >
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Incomplete sections indicator */}
        {!canSubmit && incompleteCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-3 text-sm text-muted-foreground"
          >
            <AlertCircle className="w-4 h-4" />
            <span>
              {incompleteCount === 1
                ? `Complete ${incompleteCount} seção restante`
                : `Complete ${incompleteCount} seções restantes`}
            </span>
          </motion.div>
        )}

        {/* Submit button */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className={cn(
            "w-full py-6 rounded-full text-lg font-semibold transition-all",
            canSubmit
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isSubmitting ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enviando...</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Finalizar Feedback</span>
            </motion.div>
          )}
        </Button>

        {/* Success hint when ready */}
        {canSubmit && !isSubmitting && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-green-600 mt-2"
          >
            Tudo pronto! Clique para enviar seu feedback.
          </motion.p>
        )}
      </div>
    </motion.footer>
  );
}

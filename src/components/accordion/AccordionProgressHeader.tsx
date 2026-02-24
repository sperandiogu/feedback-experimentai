import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SectionInfo } from '@/hooks/useAccordionFeedback';

interface AccordionProgressHeaderProps {
  sections: SectionInfo[];
  currentSectionId: string | null;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  onSectionClick: (sectionId: string) => void;
  onExit: () => void;
  className?: string;
}

const getMotivationalMessage = (percentage: number): { emoji: string; message: string } => {
  if (percentage === 0) return { emoji: '👋', message: 'Vamos começar!' };
  if (percentage < 25) return { emoji: '🚀', message: 'Ótimo começo!' };
  if (percentage < 50) return { emoji: '💪', message: 'Mandando bem!' };
  if (percentage < 75) return { emoji: '🔥', message: 'Está voando!' };
  if (percentage < 100) return { emoji: '⭐', message: 'Quase lá!' };
  return { emoji: '🎉', message: 'Completo!' };
};

export function AccordionProgressHeader({
  sections,
  currentSectionId,
  progress,
  onSectionClick,
  onExit,
  className,
}: AccordionProgressHeaderProps) {
  const motivation = getMotivationalMessage(progress.percentage);

  return (
    <header className={cn("sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b", className)}>
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Top row: Logo + Progress + Exit */}
        <div className="flex items-center justify-between mb-3">
          <img
            src="https://app.experimentai.com.br/LogoTipo.png"
            alt="ExperimentAI"
            className="h-8"
          />

          <div className="flex items-center gap-3">
            <motion.div
              key={motivation.message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-lg">{motivation.emoji}</span>
              <span className="text-sm font-medium text-foreground/80 hidden sm:inline">
                {motivation.message}
              </span>
              <Badge
                variant="secondary"
                className="bg-primary/20 text-secondary text-sm font-semibold border-none"
              >
                {Math.round(progress.percentage)}%
              </Badge>
            </motion.div>

            <button
              onClick={onExit}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Sair do feedback"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <Progress
          value={progress.percentage}
          className="h-2 bg-gray-200 [&>div]:bg-primary mb-3"
        />

        {/* Step indicators - horizontal scroll on mobile */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {sections.map((section, index) => {
            const isActive = section.id === currentSectionId;
            const isCompleted = section.status === 'completed';
            const isPending = section.status === 'pending';

            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && !isActive && "bg-green-100 text-green-700",
                  isPending && !isActive && "bg-muted text-muted-foreground",
                  "hover:opacity-80"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline max-w-[80px] truncate">
                  {section.type === 'product'
                    ? section.productName
                    : section.type === 'experimentai'
                    ? 'Experimentaí'
                    : 'Entrega'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

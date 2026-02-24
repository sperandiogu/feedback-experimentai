import React from 'react';
import { motion } from 'framer-motion';
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/entities/Questions';

interface DynamicQuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  editionName?: string;
  showValidation?: boolean;
  error?: string;
  touched?: boolean;
  onBlur?: () => void;
}

export default function DynamicQuestionRenderer({
  question,
  value,
  onChange,
  editionName,
  showValidation = false,
  error,
  touched = false,
  onBlur
}: DynamicQuestionRendererProps) {
  function hasValue(val: any): boolean {
    if (val === undefined || val === null) return false;
    if (typeof val === 'string') return val.trim() !== '';
    if (Array.isArray(val)) return val.length > 0;
    return true;
  }

  const showError = (touched && error) || (showValidation && question.is_required && !hasValue(value));

  const renderEmojiRating = () => {
    const emojis = question.config.emojis || [];

    return (
      <div className="flex justify-start gap-2">
        {emojis.map((item: any) => (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full transition-all",
              value === item.value
                ? "ring-2 ring-primary/50 bg-primary/5"
                : "hover:bg-muted/50"
            )}
          >
            <span className="text-xl">{item.emoji}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderRating = () => {
    const min = question.config.min || 1;
    const max = question.config.max || 5;
    const icon = question.config.icon || 'star';
    const IconComponent = icon === 'heart' ? Heart : Star;

    return (
      <div className="flex justify-start gap-0.5">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className="p-0.5 transition-colors"
          >
            <IconComponent
              className={cn(
                "w-6 h-6 transition-colors",
                rating <= value
                  ? "fill-accent text-accent"
                  : "fill-transparent text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderMultipleChoice = () => {
    const options = question.options || [];
    const isMultiSelect = question.config.multiSelect === true;

    const handleClick = (optionValue: string) => {
      if (isMultiSelect) {
        const currentValues = Array.isArray(value) ? value : [];
        if (currentValues.includes(optionValue)) {
          onChange(currentValues.filter((v: string) => v !== optionValue));
        } else {
          onChange([...currentValues, optionValue]);
        }
      } else {
        onChange(optionValue);
      }
    };

    const isSelected = (optionValue: string) => {
      if (isMultiSelect) {
        return Array.isArray(value) && value.includes(optionValue);
      }
      return value === optionValue;
    };

    return (
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option.option_value}
            onClick={() => handleClick(option.option_value)}
            className={cn(
              "w-full text-left py-2 px-3 text-sm rounded-lg border transition-colors",
              isSelected(option.option_value)
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border hover:border-muted-foreground/50"
            )}
          >
            {option.option_icon && (
              <span className="mr-2">{option.option_icon}</span>
            )}
            {option.option_label}
          </button>
        ))}
      </div>
    );
  };

  const renderBoolean = () => {
    const trueLabel = question.config.true_label || 'Sim';
    const falseLabel = question.config.false_label || 'Não';

    return (
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 py-2 text-sm rounded-lg border transition-colors",
            value === true
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-muted-foreground/50"
          )}
        >
          {trueLabel}
        </button>
        <button
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 py-2 text-sm rounded-lg border transition-colors",
            value === false
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-muted-foreground/50"
          )}
        >
          {falseLabel}
        </button>
      </div>
    );
  };

  const renderText = () => {
    const placeholder = question.config.placeholder || 'Digite sua resposta...';
    const rows = question.config.rows || 2;
    const isEmpty = !value || value.trim() === '';
    const localShowError = (touched && error) || (showValidation && question.is_required && isEmpty);

    return (
      <div>
        <Textarea
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "text-sm rounded-lg border-border",
            localShowError && "border-destructive/50"
          )}
          rows={rows}
        />
        {localShowError && (
          <p className="text-xs text-destructive/80 mt-1">
            {error || 'Este campo é obrigatório'}
          </p>
        )}
      </div>
    );
  };

  const getQuestionText = () => {
    if (question.question_text.includes('Curadoria do tema') && editionName) {
      return question.question_text.replace('Curadoria do tema', `Curadoria do tema "${editionName}"`);
    }
    return question.question_text;
  };

  return (
    <div className="space-y-2">
      <p className={cn(
        "text-sm font-medium text-left text-foreground/80",
        showError && "text-destructive/80"
      )}>
        {getQuestionText()}
        {question.is_required && (
          <span className="text-destructive/70 ml-0.5">*</span>
        )}
      </p>

      {question.question_type === 'emoji_rating' && renderEmojiRating()}
      {question.question_type === 'rating' && renderRating()}
      {question.question_type === 'multiple_choice' && renderMultipleChoice()}
      {question.question_type === 'boolean' && renderBoolean()}
      {question.question_type === 'text' && renderText()}

      {showError && question.question_type !== 'text' && (
        <p className="text-xs text-destructive/80 mt-1">
          {error || 'Selecione uma opção'}
        </p>
      )}
    </div>
  );
}

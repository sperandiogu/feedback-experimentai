import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart } from 'lucide-react';
import type { Question } from '@/entities/Questions';

interface DynamicQuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  editionName?: string;
}

export default function DynamicQuestionRenderer({ 
  question, 
  value, 
  onChange, 
  editionName 
}: DynamicQuestionRendererProps) {
  const renderEmojiRating = () => {
    const emojis = question.config.emojis || [];
    
    return (
      <div className="flex justify-center gap-3">
        {emojis.map((item: any) => (
          <motion.button
            key={item.value}
            onClick={() => onChange(item.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 ${
              value === item.value
                ? 'bg-primary text-primary-foreground transform scale-110 shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl">{item.emoji}</span>
          </motion.button>
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
      <div className="flex justify-center gap-1">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((rating) => (
          <motion.button 
            key={rating} 
            onClick={() => onChange(rating)} 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1"
          >
            <IconComponent 
              className={`w-8 h-8 transition-colors ${
                rating <= value 
                  ? 'fill-accent text-accent' 
                  : 'text-gray-300'
              }`} 
            />
          </motion.button>
        ))}
      </div>
    );
  };

  const renderMultipleChoice = () => {
    const options = question.options || [];
    const isGrid = options.length > 4;
    
    return (
      <div className={isGrid ? "grid grid-cols-2 gap-3" : "flex flex-col sm:flex-row gap-2"}>
        {options.map((option) => (
          <motion.button
            key={option.option_value}
            onClick={() => onChange(option.option_value)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`${
              isGrid 
                ? `p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${
                    value === option.option_value
                      ? 'bg-primary text-primary-foreground transform scale-105 shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`
                : `flex-1 text-base py-3 sm:py-2 rounded-full ${
                    value === option.option_value
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`
            }`}
          >
            {option.option_icon && isGrid && (
              <span className="text-xl">{option.option_icon}</span>
            )}
            <span className={isGrid ? "text-sm font-medium" : ""}>
              {option.option_label}
            </span>
          </motion.button>
        ))}
      </div>
    );
  };

  const renderBoolean = () => {
    const trueLabel = question.config.true_label || 'Sim';
    const falseLabel = question.config.false_label || 'Não';
    
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          asChild
          onClick={() => onChange(true)}
          variant={value === true ? "default" : "outline"}
          className={`flex-1 text-base py-3 rounded-full ${
            value === true
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <motion.div whileTap={{ scale: 0.95 }}>{trueLabel}</motion.div>
        </Button>
        <Button
          asChild
          onClick={() => onChange(false)}
          variant={value === false ? "default" : "outline"}
          className={`flex-1 text-base py-3 rounded-full ${
            value === false
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <motion.div whileTap={{ scale: 0.95 }}>{falseLabel}</motion.div>
        </Button>
      </div>
    );
  };

  const renderText = () => {
    const placeholder = question.config.placeholder || 'Digite sua resposta...';
    const rows = question.config.rows || 2;
    
    return (
      <Textarea
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded-xl border-gray-200"
        rows={rows}
      />
    );
  };

  const getQuestionText = () => {
    if (question.question_text.includes('Curadoria do tema') && editionName) {
      return question.question_text.replace('Curadoria do tema', `Curadoria do tema "${editionName}"`);
    }
    return question.question_text;
  };

  return (
    <div>
      <p className="font-semibold mb-3 text-center text-base">
        {getQuestionText()}
      </p>
      
      {question.question_type === 'emoji_rating' && renderEmojiRating()}
      {question.question_type === 'rating' && renderRating()}
      {question.question_type === 'multiple_choice' && renderMultipleChoice()}
      {question.question_type === 'boolean' && renderBoolean()}
      {question.question_type === 'text' && renderText()}
    </div>
  );
}
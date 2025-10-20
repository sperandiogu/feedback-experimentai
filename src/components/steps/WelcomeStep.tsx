import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gift } from 'lucide-react';

interface WelcomeStepProps {
  editionName: string;
  productCount: number;
  onStart: () => void;
}

export default function WelcomeStep({ editionName, productCount, onStart }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-background border-none shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Gift className="w-12 h-12 text-secondary" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Sua opinião vale ouro!</h1>
          <p className="text-foreground/80 mb-6">
            Vamos avaliar a edição <span className="font-semibold text-secondary">"{editionName}"</span>.
            Sua experiência nos ajuda a criar boxes cada vez melhores.
          </p>

          <div className="bg-gray-50/50 border border-border/50 rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-secondary text-secondary-foreground flex items-center justify-center rounded-full flex-shrink-0 mt-1">1</div>
              <p className="text-sm text-foreground/90">Avalie os <span className="font-bold">{productCount} produtos</span> da sua box.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-secondary text-secondary-foreground flex items-center justify-center rounded-full flex-shrink-0 mt-1">2</div>
              <p className="text-sm text-foreground/90">Conte-nos sobre sua experiência geral com a Experimentaí.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-secondary text-secondary-foreground flex items-center justify-center rounded-full flex-shrink-0 mt-1">3</div>
              <p className="text-sm text-foreground/90">Por fim, dê seu feedback sobre a entrega.</p>
            </div>
          </div>

          <Button 
            onClick={onStart}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Começar a Avaliação
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
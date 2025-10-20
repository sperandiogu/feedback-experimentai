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
      <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center"
          >
            <Gift className="w-12 h-12 text-purple-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sua opinião vale ouro!</h1>
          <p className="text-gray-600 mb-6">
            Vamos avaliar a edição <span className="font-semibold text-purple-600">"{editionName}"</span>.
            Sua experiência nos ajuda a criar boxes cada vez melhores.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-purple-500 text-white flex items-center justify-center rounded-full flex-shrink-0 mt-1">1</div>
              <p className="text-sm text-gray-700">Avalie os <span className="font-bold">{productCount} produtos</span> da sua box.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-purple-500 text-white flex items-center justify-center rounded-full flex-shrink-0 mt-1">2</div>
              <p className="text-sm text-gray-700">Conte-nos sobre sua experiência geral com a Experimentaí.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-purple-500 text-white flex items-center justify-center rounded-full flex-shrink-0 mt-1">3</div>
              <p className="text-sm text-gray-700">Por fim, dê seu feedback sobre a entrega.</p>
            </div>
          </div>

          <Button 
            onClick={onStart}
            className="w-full bg-purple-600 hover:bg-purple-700 text-base py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Começar a Avaliação
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
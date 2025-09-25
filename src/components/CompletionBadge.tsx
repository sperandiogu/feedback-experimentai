import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from 'lucide-react';

export default function CompletionBadge({ badge, onClose }: any) {
  const confettiElements = Array.from({ length: 30 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 1, y: 0, x: Math.random() * 400 - 200, rotate: Math.random() * 360 }}
      animate={{ opacity: 0, y: 500, rotate: Math.random() * 720 + 360 }}
      transition={{ duration: 4, delay: Math.random() * 0.8, ease: "linear", repeat: Infinity, repeatType: "loop" }}
      className="absolute text-2xl pointer-events-none"
      style={{ left: '50%', top: -50 }}
    >
      {['🎉', '✨', '🌟', '💖', '🚀'][Math.floor(Math.random() * 5)]}
    </motion.div>
  ));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.5, y: 100, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative w-full max-w-sm"
      >
        <div className="absolute inset-0 overflow-hidden">{confettiElements}</div>
        
        <Card className="bg-white border-none shadow-2xl rounded-3xl w-full">
          <CardContent className="p-8 text-center relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ delay: 0.3, type: "tween", duration: 0.6 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-600 flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-gray-800 mb-2"
            >
              Feedback Enviado!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-gray-600 mb-6"
            >
              Obrigado! Sua opinião é super importante para nós e para as marcas.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-8"
            >
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-base font-semibold inline-block">
                {badge}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
            >
              <Button 
                onClick={onClose}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Voltar ao site
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
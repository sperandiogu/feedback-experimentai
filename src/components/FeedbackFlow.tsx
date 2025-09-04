import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Star, Heart, Sparkles, Package, Truck } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
};

const ProductCard = ({ product, onFeedback, currentIndex, totalProducts }: any) => {
  const [feedback, setFeedback] = useState({
    experience_rating: 0,
    would_buy: null,
    main_attraction: null,
    what_caught_attention: ''
  });

  const experienceEmojis = [
    { value: 1, emoji: '😖', label: 'Não curti' },
    { value: 2, emoji: '😐', label: 'Ok' },
    { value: 3, emoji: '🙂', label: 'Gostei' },
    { value: 4, emoji: '😍', label: 'Amei' }
  ];

  const attractionOptions = [
    { value: 'sabor', label: 'Sabor', icon: '👅' },
    { value: 'textura', label: 'Textura', icon: '✋' },
    { value: 'aroma', label: 'Cheiro', icon: '👃' },
    { value: 'embalagem', label: 'Embalagem', icon: '📦' },
    { value: 'preco', label: 'Preço', icon: '💰' },
    { value: 'marca', label: 'Marca', icon: '🏷️' },
    { value: 'inovacao', label: 'Inovação', icon: '🚀' },
    { value: 'qualidade', label: 'Qualidade', icon: '⭐' }
  ];

  const handleNext = () => {
    onFeedback(product.name, {
      ...feedback,
      product_vibe: feedback.main_attraction
    });
  };

  const isComplete = feedback.experience_rating && feedback.would_buy && feedback.main_attraction;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center text-3xl text-purple-600">
              📦
            </div>
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.brand}</p>
            <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 border-none">{product.category}</Badge>
          </div>

          <div className="space-y-8">
            <div>
              <p className="font-semibold mb-3 text-center text-base">Como foi testar esse produto?</p>
              <div className="flex justify-center gap-3">
                {experienceEmojis.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFeedback({...feedback, experience_rating: item.value})}
                    className={`p-3 w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 ${
                      feedback.experience_rating === item.value
                        ? 'bg-purple-600 text-white transform scale-110 shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3 text-center text-base">Você compraria?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {[
                  { value: 'sim', label: 'Sim!' },
                  { value: 'talvez', label: 'Talvez' },
                  { value: 'nao', label: 'Não' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => setFeedback({...feedback, would_buy: option.value})}
                    variant={feedback.would_buy === option.value ? "default" : "outline"}
                    className={`flex-1 text-base py-3 sm:py-2 rounded-full ${
                      feedback.would_buy === option.value
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3 text-center text-base">O que mais chamou sua atenção?</p>
              <div className="grid grid-cols-2 gap-3">
                {attractionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFeedback({...feedback, main_attraction: option.value})}
                    className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${
                      feedback.main_attraction === option.value
                        ? 'bg-purple-600 text-white transform scale-105 shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2 text-center text-base">Quer comentar algo específico?</p>
              <Textarea
                placeholder="Ex: textura cremosa, cheiro incrível... (opcional)"
                value={feedback.what_caught_attention}
                onChange={(e) => setFeedback({...feedback, what_caught_attention: e.target.value})}
                className="text-sm rounded-xl border-gray-200"
                rows={2}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Produto {currentIndex + 1} de {totalProducts}
            </span>
            <Button
              onClick={handleNext}
              disabled={!isComplete}
              className="bg-purple-600 hover:bg-purple-700 text-base py-3 px-6 rounded-full shadow-md hover:shadow-lg disabled:shadow-none disabled:bg-gray-300"
            >
              Próximo <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ExperimentaiFeedback = ({ onComplete, box }: any) => {
  const [feedback, setFeedback] = useState({
    box_variety_rating: 0,
    favorite_product: '',
    overall_satisfaction: 0,
    would_recommend: null,
    box_theme_rating: 0
  });

  const handleSubmit = () => {
    onComplete(feedback);
  };

  const isComplete = feedback.box_variety_rating && feedback.overall_satisfaction &&
                    feedback.would_recommend !== null && feedback.box_theme_rating;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Sobre a Experimentaí</h2>
            <p className="text-sm text-gray-500">Sua experiência com a nossa box!</p>
          </div>

          <div className="space-y-8">
            <div>
              <p className="font-semibold mb-3 text-center text-base">Variedade de produtos na box</p>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setFeedback({...feedback, box_variety_rating: star})} className="p-1">
                    <Star className={`w-8 h-8 transition-colors ${ star <= feedback.box_variety_rating ? 'fill-purple-500 text-purple-500' : 'text-gray-300' }`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3 text-center text-base">Curadoria do tema "{box.theme}"</p>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setFeedback({...feedback, box_theme_rating: star})} className="p-1">
                    <Star className={`w-8 h-8 transition-colors ${ star <= feedback.box_theme_rating ? 'fill-purple-500 text-purple-500' : 'text-gray-300' }`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3 text-center text-base">Satisfação geral com a Experimentaí</p>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setFeedback({...feedback, overall_satisfaction: star})} className="p-1">
                    <Heart className={`w-8 h-8 transition-colors ${ star <= feedback.overall_satisfaction ? 'fill-purple-500 text-purple-500' : 'text-gray-300' }`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3 text-center text-base">Indicaria para um amigo?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {[
                  { value: true, label: 'Com certeza! 🙌' },
                  { value: false, label: 'Não indicaria 🤷‍♀️' }
                ].map((option) => (
                  <Button
                    key={option.value.toString()}
                    onClick={() => setFeedback({...feedback, would_recommend: option.value})}
                    variant={feedback.would_recommend === option.value ? "default" : "outline"}
                    className={`flex-1 text-base py-3 rounded-full ${ feedback.would_recommend === option.value ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!isComplete} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-base py-3 rounded-full shadow-md hover:shadow-lg disabled:shadow-none disabled:bg-gray-300">
            Continuar <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DeliveryFeedback = ({ onComplete }: any) => {
  const [feedback, setFeedback] = useState({
    delivery_time_rating: 0,
    packaging_condition: 0,
    delivery_experience: ''
  });
  const [finalMessage, setFinalMessage] = useState('');

  const handleSubmit = () => {
    onComplete({ ...feedback, final_message: finalMessage });
  };

  const isComplete = feedback.delivery_time_rating && feedback.packaging_condition && feedback.delivery_experience;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <Truck className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Sobre a entrega</h2>
            <p className="text-sm text-gray-500">Quase lá! Como foi receber sua box?</p>
          </div>

          <div className="space-y-8">
            <div>
              <p className="font-semibold mb-3 text-center text-base">Prazo de entrega</p>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setFeedback({...feedback, delivery_time_rating: star})} className="p-1">
                    <Star className={`w-8 h-8 transition-colors ${ star <= feedback.delivery_time_rating ? 'fill-purple-500 text-purple-500' : 'text-gray-300' }`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3 text-center text-base">Estado da embalagem</p>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setFeedback({...feedback, packaging_condition: star})} className="p-1">
                    <Star className={`w-8 h-8 transition-colors ${ star <= feedback.packaging_condition ? 'fill-purple-500 text-purple-500' : 'text-gray-300' }`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3 text-center text-base">Experiência geral de entrega</p>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'excelente', label: 'Excelente! 🌟' },
                  { value: 'boa', label: 'Boa 👍' },
                  { value: 'ok', label: 'Ok 😐' },
                  { value: 'ruim', label: 'Ruim 😕' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => setFeedback({...feedback, delivery_experience: option.value})}
                    variant={feedback.delivery_experience === option.value ? "default" : "outline"}
                    className={`w-full text-base py-3 rounded-full ${ feedback.delivery_experience === option.value ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2 text-center text-base">Quer deixar um recado para as marcas?</p>
              <Textarea
                placeholder="Seu feedback é muito valioso... (opcional)"
                value={finalMessage}
                onChange={(e) => setFinalMessage(e.target.value)}
                className="text-sm rounded-xl border-gray-200"
                rows={3}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!isComplete} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-base py-3 rounded-full shadow-md hover:shadow-lg disabled:shadow-none disabled:bg-gray-300">
            Finalizar Feedback <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function FeedbackFlow({ edition, onComplete }: any) {
  const [currentStep, setCurrentStep] = useState('products');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [productFeedbacks, setProductFeedbacks] = useState([]);
  const [experimentaiFeedback, setExperimentaiFeedback] = useState({});

  const totalSteps = edition.products.length + 2;
  const currentProgressIndex = currentStep === 'products'
    ? currentProductIndex
    : currentStep === 'experimentai'
    ? edition.products.length
    : edition.products.length + 1;
  const progress = ((currentProgressIndex + 1) / totalSteps) * 100;

  const handleProductFeedback = (productName: string, feedback: any) => {
    const newFeedback = [...productFeedbacks, { product_name: productName, ...feedback }];
    setProductFeedbacks(newFeedback);

    if (currentProductIndex + 1 < edition.products.length) {
      setCurrentProductIndex(currentProductIndex + 1);
    } else {
      setCurrentStep('experimentai');
    }
  };

  const handleExperimentaiFeedback = (feedback: any) => {
    setExperimentaiFeedback(feedback);
    setCurrentStep('delivery');
  };

  const handleDeliveryFeedback = (feedback: any) => {
    const completeFeedback = {
      edition_id: edition.edition_id,
      product_feedbacks: productFeedbacks,
      experimentai_feedback: experimentaiFeedback,
      delivery_feedback: feedback,
      final_message: feedback.final_message || '',
      completion_badge: "🎉 Testador Expert da Experimentaí"
    };

    onComplete(completeFeedback);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-md mx-auto pt-4 sm:pt-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <span className="font-bold text-purple-600">Experimentaí</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-sm font-semibold border-none">
              {Math.round(progress)}%
            </Badge>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200 [&>div]:bg-purple-600" />
        </header>

        <main>
          <AnimatePresence mode="wait">
            {currentStep === 'products' && (
              <ProductCard
                key={currentProductIndex}
                product={edition.products[currentProductIndex]}
                onFeedback={handleProductFeedback}
                currentIndex={currentProductIndex}
                totalProducts={edition.products.length}
              />
            )}

            {currentStep === 'experimentai' && (
              <ExperimentaiFeedback
                onComplete={handleExperimentaiFeedback}
                edition={edition}
              />
            )}

            {currentStep === 'delivery' && (
              <DeliveryFeedback
                onComplete={handleDeliveryFeedback}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
                <p className="text-gray-600">
                  Faça login para avaliar produtos e compartilhar sua experiência
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">Erro no login</p>
                    <p className="text-red-600">{error}</p>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-4 text-base font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Entrar com Google
                  </>
                )}
              </Button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Ao fazer login, você concorda com nossos termos de uso
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Section */}
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 grid grid-cols-1 gap-4"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Avalie Produtos</h3>
                  <p className="text-xs text-gray-600">Compartilhe sua experiência com novos produtos</p>
                </div>
              </div>
          transition={{ duration: 0.6 }}

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Acesso Seguro</h3>
                  <p className="text-xs text-gray-600">Login protegido apenas para usuários autorizados</p>
                </div>
              </div>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
          </motion.div>
        )}
      </div>
        >
   const handleGoogleSignIn = async () => {
          <Card className="bg-white/80 backdrop-blur-sm border-none shadow-xl rounded-3xl">
     setIsLoading(true);
            <CardContent className="p-8">
     try {
              <div className="text-center mb-8">
import React, { useState, useEffect } from 'react';
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo!</h2>
     }
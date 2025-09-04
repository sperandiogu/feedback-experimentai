import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginPage from './LoginPage';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAuthorized, loading, error, signInWithGoogle, signOut } = useAuth();

  console.log('AuthWrapper state:', { user: !!user, isAuthorized, loading, error });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} error={error} />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assinatura Inativa</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Sua assinatura está inativa. Entre em contato conosco para reativar seu acesso.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Email: {user.email}
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-700">
              💬 <strong>Precisa de ajuda?</strong><br/>
              Entre em contato conosco para reativar sua assinatura e continuar avaliando produtos incríveis!
            </p>
          </div>
          <button
            onClick={signOut}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Fazer logout
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
import React from 'react';
import AuthWrapper from './components/AuthWrapper';
import FeedbackPage from './components/FeedbackPage';

function App() {
  return (
    <AuthWrapper>
      <FeedbackPage />
    </AuthWrapper>
  );
}

export default App;
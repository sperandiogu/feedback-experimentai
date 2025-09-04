export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('No Firebase user found');
          setUser(null);
          setIsAuthorized(false);
          setError('');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Erro ao verificar autenticação');
    });
  }, []);
};
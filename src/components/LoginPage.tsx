@@ .. @@
 export default function LoginPage({ onSignIn, error }: LoginPageProps) {
   const [isLoading, setIsLoading] = useState(false);

  console.log('LoginPage rendered with error:', error);
+  console.log('LoginPage rendered with error:', error);
+
   const handleGoogleSignIn = async () => {
     setIsLoading(true);
     try {
     }
   }
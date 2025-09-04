@@ .. @@
 export default function AuthWrapper({ children }: { children: React.ReactNode }) {
   const { user, isAuthorized, loading, error, signInWithGoogle, signOut } = useAuth();

  console.log('AuthWrapper state:', { user: !!user, isAuthorized, loading, error });
 }
+  console.log('AuthWrapper state:', { user: !!user, isAuthorized, loading, error });
+
   if (loading) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
     )
   }
     )
   }
     )
   }
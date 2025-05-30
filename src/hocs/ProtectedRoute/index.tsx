import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

function ProtectedRoute(Component: any, redirectTo = '/login') {
  function AuthWrapper(props: any) {
    const router = useRouter();
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const validateToken = async () => {
        try {
          const idToken = Cookies.get('idToken');
          if (!idToken) {
            router.push(redirectTo);
            return;
          }

          const decodedToken = jwt.decode(idToken) as Record<string, any>;
          if (decodedToken) {
            setUserData({
              email: decodedToken.email,
              name: decodedToken.name,
              idcliente: decodedToken["custom:idcliente"],
              idsubcli: decodedToken["custom:idsubcli"],
              tcvUserId: decodedToken["custom:tcv_user_id"],
            });
          } else {
            router.push(redirectTo);
          }
        } catch (error) {
          console.error('Error al verificar el token:', error);
          router.push(redirectTo);
        } finally {
          setLoading(false);
        }
      };

      validateToken();
    }, [router]);

    if (loading) return <div>Loading...</div>; // Puedes agregar un componente de carga aquí

    if (!userData) return <div>No autorizado</div>;
    // Pasa userData como prop al componente protegido
    return <Component {...props} user={userData} />;
  }

  return AuthWrapper;
}

export default ProtectedRoute;

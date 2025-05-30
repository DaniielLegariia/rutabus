import { useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';

import LogRocket from 'logrocket';

function Default() {
  const router = useRouter();
  useEffect(() => {
    /**
     * Paths dinamicos a tomar en cuenta, esto pasa cuando dentro de cierta dirección
     * tenemos archivos [id] ya que estos id's son dinamicos.
     */
    const dynamicPaths: string | string[] = ['user', 'mapper', 'provider', 'admin']; // /admin/role/edit/3564

    // Inicializamos LogRocket
    if (typeof window !== 'undefined') {
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || '');
    }
    /* const dynamicPaths2: object = {
      "admin": [
        "role",
        "user"
      ],

      else if (dynamicPaths2[pathNameArray[1]].indexOf(pathNameArray[2]) >= 0)

    } */

    const pathNameArray = window.location.pathname.split('/'); // /admin/role/edit/3564
    // pathNameArray = ["", "admin", "role", "edit", "3564"]

    if (pathNameArray[1] === '') { // Verifica entrada a la raiz
      router.replace('/login');
      // verificamos que se encuentre en nuestro array de dynamicPaths
    } else if (dynamicPaths.indexOf(pathNameArray[1]) >= 0) {
      router.replace(window.location.pathname); // Hacemos replace del pathname
    } else {
      router.replace('/404');
    }
  }, []);
  return <> </>;
}
export default Default;

import { Layout as AntLayout, Menu, Avatar, Dropdown } from 'antd';
import { useRouter } from 'next/dist/client/router';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import useLoading from '@/providers/LoadingProvider';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import styles from './Layout.module.scss';
import menu, { userMenu } from './menu';

interface IOptMenu {
  keyPath: string[]
}

React.useLayoutEffect = React.useEffect;
const { Header } = AntLayout;
const LayoutContext = createContext({} as any);

/**
 * Vista layout que sirve de base para algunas vistas de la aplicación.
 *
 * @view
 *
 * @property {Component} children - Componente el cual esta envuelto de diferentes componentes UI
 * para formar el layout base.
 */
function Layout({ children, user }: any) {
  const router = useRouter(); // Hook de Next.js
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected([router.pathname.split('/')[1]]);
  }, [router]);

  // Función para navegar hacia atrás
  const back = (path?: string) => {
    if (path) {
      router.push(path); // Navega a una ruta específica
    } else {
      router.back(); // Navega a la página anterior
    }
  };

  // Función para navegar hacia adelante (puedes personalizarla si es necesario)
  const forward = (path: string) => {
    router.push(path); // Navega a la ruta especificada
  };

  async function logOut() {
    localStorage.clear();
    await router.push('/login');
  }

  const onMenuSelect = ({ keyPath }: IOptMenu) => {
    const route = keyPath.reverse().join('/');
    router.push(`/${route}`);
  };

  return (
    <LayoutContext.Provider value={{ forward, back }}>
      <AntLayout style={{ height: '100vh' }}>
        <Header className={`header ${styles.header}`} style={{ zIndex: 2, paddingLeft: 10 }}>
          <div className={styles.logo}>
            <img src="/images/svg/newLogo.png" height={55} width={100} alt="logo" />
          </div>
          <Menu
            mode="horizontal"
            style={{ paddingLeft: 30 }}
            selectedKeys={selected}
            items={menu}
            onClick={onMenuSelect}
          />
          <Dropdown
            menu={{
              className: styles.logout_menu,
              onClick: () => logOut(),
              items: userMenu,
            }}
            placement="bottomRight"
            className={styles.user_info}
          >
            <div className={styles.user_info}>
              <Avatar className={styles.avatar} size="default">
                {user?.name?.charAt(0)}
                {user?.name?.split(' ')[1]?.charAt(0)}
              </Avatar>
              <div>
                <span>{user?.name}</span>
                <span>{user?.email}</span>
              </div>
            </div>
          </Dropdown>
        </Header>
        <AntLayout>
          <AntLayout className={styles.layout_container}>
            <motion.div
              initial="pageIn"
              animate="pageFinal"
              transition={{ ease: 'easeInOut', duration: 0.3 }}
              key={router.route}
              variants={{
                pageIn: { opacity: 0.2, x: 100 },
                pageOut: { opacity: 0.2, x: -100 },
                pageFinal: { opacity: 1, x: 0 },
              }}
            >
              {children}
            </motion.div>
          </AntLayout>
        </AntLayout>
      </AntLayout>
    </LayoutContext.Provider>
  );
}

export default ProtectedRoute(Layout);
/**
 * Custom hook para el uso de nuestro LayoutContext.
 *
 * @returns {Object} - Regresa un objeto con las propiedades "forward" y "back", las cuales
 * son funciones para desplazarse o navegar en la app.
 */
export const useNavigation = () => useContext(LayoutContext);

import { Typography } from 'antd';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import styles from './Loading.module.scss';

/**
 * Vista que despliega una animación de el logo junto
 * un mensaje de "Cargando...", en lo que carga la aplicación.
 * Si se hace refresh, se vuelve a mostrar el loading.
 *
 * @view
 */
function Loading() {
  const { loaded } = useAuth();
  return !loaded ? (
    <div className={styles.loadingBackground}>
      <div className={styles.loadingContainer}>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{
            ease: 'easeInOut',
            repeatDelay: 1,
            stiffness: 260,
            repeat: Infinity,
          }}
        >
          <img src="/images/svg/newLogo.png" alt="logo" width={300} height={100} />
        </motion.div>

        <Typography.Title level={5} style={{ color: '#7e7e7e', fontWeight: 400 }}>
          Cargando...
        </Typography.Title>
      </div>
    </div>
  ) : null;
}

export default Loading;

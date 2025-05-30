import '../src/styles/globals.scss'; // Tus estilos globales personalizados
import { LoadingProvider } from '@/providers/LoadingProvider';
import Amplify from 'aws-amplify';
import { AuthProvider } from '@/providers/AuthProvider';
import Layout from '@/views/layout/Layout';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES'; // Cambia la importación para Ant Design 5
import '@/utils/yupConfig';
import theme from '@/styles/theme'; // Tu tema personalizado (si lo tienes)

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_oYRR6lRjG',
    userPoolWebClientId: '1jue84fm6h82gp1s14h790lrvr',
    authenticationFlowType: 'ADMIN_NO_SRP_AUTH',
  },
});

function MyApp({ Component, pageProps }: any) {
  const queryClient = new QueryClient();

  return (
    <ConfigProvider locale={esES} theme={theme}>
      <QueryClientProvider client={queryClient} contextSharing>
        <Head>
          <title>Rutabus</title>
          <link rel="icon" href="/images/svg/newLogo.png" />
        </Head>
        <AuthProvider props={pageProps}>
          <LoadingProvider>
            {Component.Layout ? (
              <Layout full={Component.Fullscreen} {...pageProps}>
                <Component {...pageProps} />
              </Layout>
            ) : (
              <Component {...pageProps} />
            )}
          </LoadingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default MyApp;
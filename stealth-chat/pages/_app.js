import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Favicon to match Flipkart */}
        <link rel="icon" href="/favicon.ico" />
        <title>Stealth Chat - Your Secure Shopping Experience</title>
        <meta name="description" content="Secure chat with Flipkart-like interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Component {...pageProps} />
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
    </>
  );
}

export default MyApp;

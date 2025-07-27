import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Import Google Font in Document for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        
        {/* Script to prevent FOUC and ghost text issues */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Mark HTML as loaded once DOM is ready to prevent ghost text
              document.addEventListener('DOMContentLoaded', function() {
                document.documentElement.classList.add('loaded');
              });
              
              // Fallback in case DOMContentLoaded already fired
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                  document.documentElement.classList.add('loaded');
                });
              } else {
                document.documentElement.classList.add('loaded');
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}

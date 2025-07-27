/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'flipkart-blue': '#2874f0',
        'flipkart-yellow': '#ffc200',
        'flipkart-grey': '#f1f2f6',
        'flipkart-green': '#388e3c',
        // WhatsApp-like colors for chat
        'whatsapp-green': '#25D366',
        'whatsapp-green-dark': '#128C7E',
        'whatsapp-teal': '#075E54',
        'whatsapp-light': '#DCF8C6',
        'whatsapp-grey': '#F7F7F7',
        'whatsapp-dark': '#2A2F32',
        'chat-sent': '#DCF8C6',
        'chat-received': '#FFFFFF',
        'chat-bg': '#E5DDD5',
      },
      animation: {
        'bounce-dots': 'bounce 1.4s ease-in-out infinite both',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'bounce-dots': {
          '0%, 80%, 100%': {
            transform: 'scale(0)',
          },
          '40%': {
            transform: 'scale(1)',
          },
        }
      },
      backgroundImage: {
        'chat-pattern': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"...'"
      }
    },
  },
};

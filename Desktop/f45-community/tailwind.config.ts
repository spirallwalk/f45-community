import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        f45: {
          blue: '#003DA5',
          'blue-dark': '#002880',
          'blue-light': '#1A52B8',
          red: '#E8002D',
          'red-dark': '#C0001F',
          'red-light': '#FF1A3E',
          dark: '#0A0A0A',
          gray: '#1C1C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'f45-gradient': 'linear-gradient(135deg, #003DA5 0%, #E8002D 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #1C1C1C 100%)',
      },
    },
  },
  plugins: [],
}

export default config

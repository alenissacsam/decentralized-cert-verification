/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Indian Tricolor Theme
        saffron: '#FF9933',
        saffronDark: '#E67300',
        white: '#FFFFFF',
        green: '#138808',
        greenDark: '#0D5C06',
        navy: '#000080',
        ashoka: '#1C4587',
        // Supporting colors
        primary: '#FF9933',
        secondary: '#138808',
        accent: '#000080',
        danger: '#ea4335',
        dark: '#1f2937',
        light: '#f9fafb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'tricolor-gradient': 'linear-gradient(to bottom, #FF9933 0%, #FFFFFF 33%, #FFFFFF 66%, #138808 100%)',
        'saffron-gradient': 'linear-gradient(135deg, #FF9933 0%, #E67300 100%)',
        'green-gradient': 'linear-gradient(135deg, #138808 0%, #0D5C06 100%)',
      },
    },
  },
  plugins: [],
}

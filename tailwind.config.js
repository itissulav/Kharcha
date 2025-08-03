/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core theme roles
        primary: '#030014', // background primary
        secondary: '#00001C ', // background surface
        accent: '#AB8BFF', // accent purple

        // Text
        light: {
          100: '#FFFFFF', // pure white
          200: '#F3F3F3', // soft white
          300: '#D1D1D1', // muted light
        },
        dark: {
          100: '#221f3d',
          200: '#0f0d23',
        },

        // Status colors
        error: '#ca3232',    // red
        success: '#00bfa5',  // teal green
        warning: '#f5a623',  // optional: amber

        // Grays for borders or subtle elements
        muted: {
          100: '#3a3a3a',
          200: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
  presets: [require('nativewind/preset')],
};

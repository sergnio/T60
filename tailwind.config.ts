// tailwind.config.js
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        // Fluid text sizes using vmin (smallest viewport dimension)
        // Scales proportionally on any screen
        'fluid-xs': 'clamp(0.75rem, 1.5vmin, 3rem)',
        'fluid-sm': 'clamp(0.875rem, 1.75vmin, 3.5rem)',
        'fluid-base': 'clamp(1rem, 2vmin, 4rem)',
        'fluid-lg': 'clamp(1.125rem, 2.25vmin, 4.5rem)',
        'fluid-xl': 'clamp(1.25rem, 2.5vmin, 5rem)',
        'fluid-2xl': 'clamp(1.5rem, 3vmin, 6rem)',
        'fluid-3xl': 'clamp(1.875rem, 3.75vmin, 7.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 4.5vmin, 9rem)',
        'fluid-5xl': 'clamp(3rem, 6vmin, 12rem)',
      },
      spacing: {
        // Fluid spacing using vmin
        'fluid-1': 'clamp(0.25rem, 0.5vmin, 1rem)',
        'fluid-2': 'clamp(0.5rem, 1vmin, 2rem)',
        'fluid-3': 'clamp(0.75rem, 1.5vmin, 3rem)',
        'fluid-4': 'clamp(1rem, 2vmin, 4rem)',
        'fluid-6': 'clamp(1.5rem, 3vmin, 6rem)',
        'fluid-8': 'clamp(2rem, 4vmin, 8rem)',
      },
      borderRadius: {
        'fluid-lg': 'clamp(0.5rem, 1vmin, 2rem)',
        'fluid-xl': 'clamp(0.75rem, 1.5vmin, 3rem)',
        'fluid-2xl': 'clamp(1rem, 2vmin, 4rem)',
      },
      gap: {
        'fluid-1': 'clamp(0.25rem, 0.5vmin, 1rem)',
        'fluid-2': 'clamp(0.5rem, 1vmin, 2rem)',
        'fluid-4': 'clamp(1rem, 2vmin, 4rem)',
      },
    },
  },
  plugins: [],
};

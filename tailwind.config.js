export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          container: 'hsl(var(--primary-container))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          container: 'hsl(var(--secondary-container))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          low: 'hsl(var(--surface-container-low))',
          lowest: 'hsl(var(--surface-container-lowest))',
          high: 'hsl(var(--surface-container-high))',
          bright: 'hsl(var(--surface-bright))',
          variant: 'hsl(var(--surface-variant))',
        },
        outline: {
          DEFAULT: 'hsl(var(--outline))',
          variant: 'hsl(var(--outline-variant))',
        },
      },
      borderRadius: {
        lg: '2rem',
        md: '1.25rem',
        sm: '0.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0 12px 32px hsla(var(--foreground), 0.04)',
      },
      backdropBlur: {
        citrus: '24px',
      },
    },
  },
  plugins: [],
};

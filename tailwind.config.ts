import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "xs": "480px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1600px",
      },
    },
    screens: {
      "xs": "480px",
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1600px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom Gonstead colors
        gonstead: {
          50: "#f8f5f0",
          100: "#f0e6d2",
          200: "#e1cda5",
          300: "#d2b478",
          400: "#c39b4b",
          500: "rgb(66,139,124)",
          600: "#3e8570",
          700: "#357164",
          800: "#2d5f55",
          900: "#254d46",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#0d5c75",
          600: "#0a4a5c",
          700: "#083d4a",
          800: "#063038",
          900: "#042326",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "system-ui", "sans-serif"],
        "open-sans": ["var(--font-open-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-open-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spine-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 20px rgba(227, 252, 236, 0.3)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 40px rgba(227, 252, 236, 0.6)",
          },
        },
        "vertebra-reveal": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px) rotateX(-90deg)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) rotateX(0deg)",
          },
        },
        "spine-wave": {
          "0%, 100%": { transform: "translateY(0px)" },
          "25%": { transform: "translateY(-2px)" },
          "50%": { transform: "translateY(-4px)" },
          "75%": { transform: "translateY(-2px)" },
        },
        "pulse-wave": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "grid-line": {
          "0%": { opacity: "0", transform: "scaleX(0)" },
          "100%": { opacity: "0.3", transform: "scaleX(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spine-pulse": "spine-pulse 2s ease-in-out infinite",
        "vertebra-reveal": "vertebra-reveal 0.8s ease-out forwards",
        "spine-wave": "spine-wave 2s ease-in-out infinite",
        "pulse-wave": "pulse-wave 1.5s ease-in-out infinite",
        "grid-line": "grid-line 2s ease-out infinite",
        float: "float 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "spine-gradient": "linear-gradient(45deg, #0d5c75, rgb(227,252,236))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== PRIMARY (Cyan — used for links, accents, secondary actions) =====
        primary: {
          DEFAULT: "#00A8CC",
          dark: "#0090B0",
          light: "#E0F7FC",
        },

        // ===== BRAND =====
        brand: {
          // Navy scale — THE primary brand color used across the app
          navy: {
            DEFAULT: "#001F54",    // Primary navy (buttons, sidebar, headings)
            dark: "#000546",       // Darker navy (auth buttons, alt dark)
            darker: "#0A0A32",     // Darkest navy (gradients)
            light: "#0D3B7A",      // Lighter navy (hover states)
            50: "#EBF0F7",         // Navy tint for backgrounds
            100: "#D1DDEF",
            200: "#A3BBE0",
            300: "#7599D0",
            400: "#4777C1",
            500: "#001F54",        // Same as DEFAULT
            600: "#001A47",
            700: "#00153A",
            800: "#000F2D",
            900: "#000A20",
          },
          // Accent
          accent: "#FF3B30",
          "accent-light": "#FFF0EF",
          // Utility
          light: "#FCFDFF",
          muted: "#ECECF1",
        },

        // ===== BACKGROUND =====
        background: {
          DEFAULT: "#F5F7FA",
          subtle: "#F9FAFB",
          muted: "#F3F4F6",
        },
        card: "#FFFFFF",

        // ===== TEXT =====
        text: {
          primary: "#1F2937",
          secondary: "#4B5563",
          muted: "#6B7280",
          light: "#9CA3AF",
          link: "#00A8CC",
        },

        // ===== BORDER =====
        border: {
          DEFAULT: "#E5E7EB",
          medium: "#D1D5DB",
          focus: "#001F54",
        },

        // ===== STATUS =====
        status: {
          success: "#10B981",
          "success-light": "#D1FAE5",
          "success-bg": "#ECFDF5",
          warning: "#F59E0B",
          "warning-light": "#FEF3C7",
          "warning-bg": "#FFFBEB",
          error: "#EF4444",
          "error-light": "#FEE2E2",
          "error-bg": "#FEF2F2",
          info: "#3B82F6",
          "info-light": "#DBEAFE",
          "info-bg": "#EFF6FF",
        },

        // ===== PLATFORM =====
        platform: {
          instagram: "#E4405F",
          tiktok: "#000000",
          youtube: "#FF0000",
          twitter: "#1DA1F2",
          facebook: "#1877F2",
          linkedin: "#0A66C2",
        },
      },

      // ===== BORDER RADIUS =====
      borderRadius: {
        "4xl": "2rem",
      },

      // ===== BOX SHADOW =====
      boxShadow: {
        "brand-sm": "0 1px 2px 0 rgba(0, 31, 84, 0.05)",
        "brand-md": "0 4px 6px -1px rgba(0, 31, 84, 0.1), 0 2px 4px -2px rgba(0, 31, 84, 0.1)",
        "brand-lg": "0 10px 15px -3px rgba(0, 31, 84, 0.1), 0 4px 6px -4px rgba(0, 31, 84, 0.1)",
      },

      // ===== ANIMATION =====
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;

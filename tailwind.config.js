/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0b55cf",
          container: "#3870ea",
          fixed: "#dae2ff",
          "fixed-dim": "#b2c5ff",
        },
        surface: {
          DEFAULT: "#f8f9fa",
          dim: "#d9dadb",
          bright: "#f8f9fa",
          container: "#edeeef",
          "container-low": "#f3f4f5",
          "container-lowest": "#ffffff",
          "container-high": "#e7e8e9",
          "container-highest": "#e1e3e4",
          variant: "#e1e3e4",
        },
        "on-surface": {
          DEFAULT: "#191c1d",
          variant: "#414754",
        },
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",
        "inverse-primary": "#b2c5ff",
        "on-primary": {
          DEFAULT: "#ffffff",
          fixed: "#001848",
          "fixed-variant": "#0040a2",
        },
        "on-primary-container": "#ffffff",
        "primary-fixed": "#dae2ff",
        "primary-fixed-dim": "#b2c5ff",
        outline: {
          DEFAULT: "#727785",
          variant: "#c1c6d6",
        },
        secondary: {
          DEFAULT: "#525f73",
          container: "#d6e3fb",
          fixed: "#d6e3fb",
          "fixed-dim": "#bac7de",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          fixed: "#0f1c2d",
          "fixed-variant": "#3b485a",
        },
        "on-secondary-container": "#586579",
        tertiary: {
          DEFAULT: "#1a6c23",
          container: "#37863a",
          fixed: "#a3f69c",
          "fixed-dim": "#88d982",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          fixed: "#002204",
          "fixed-variant": "#005312",
        },
        "on-tertiary-container": "#ffffff",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": {
          DEFAULT: "#ffffff",
          container: "#93000a",
        },
        background: "#f8f9fa",
        "on-background": "#191c1d",
      },
      fontFamily: {
        display: ["Manrope_800ExtraBold"],
        headline: ["Manrope_700Bold"],
        "headline-semibold": ["Manrope_600SemiBold"],
        "headline-medium": ["Manrope_500Medium"],
        "headline-regular": ["Manrope_400Regular"],
        title: ["Inter_600SemiBold"],
        "title-medium": ["Inter_500Medium"],
        body: ["Inter_400Regular"],
        "body-medium": ["Inter_500Medium"],
        "body-bold": ["Inter_700Bold"],
        label: ["Inter_500Medium"],
      },
      borderRadius: {
        md: "12px",
        lg: "16px",
      },
      spacing: {
        2: "0.5rem",
        4: "1rem",
        8: "2rem",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          green:   "#04342C",
          amber:   "#412402",
          purple:  "#26215C",
          black:   "#0A0A0A",
          gold:    "#BA7517",
          teal:    "#1D9E75",
          "teal-dim": "#0F6E56",
          "teal-text": "#9FE1CB",
          "amber-acc": "#EF9F27",
          "amber-text": "#FAC775",
          "amber-dim": "#633806",
          "purple-acc": "#7F77DD",
          "purple-text": "#AFA9EC",
          "purple-dim": "#3C3489",
          red: "#E24B4A",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
      },
      animation: {
        blink: "blink 1s step-end infinite",
        glitch: "glitch 0.2s ease-in-out",
        flicker: "flicker 0.1s ease-in-out",
        "type-in": "typeIn 0.05s steps(1) forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 1px)", color: "#E24B4A" },
          "40%": { transform: "translate(2px, -1px)", color: "#BA7517" },
          "60%": { transform: "translate(-1px, 2px)" },
          "80%": { transform: "translate(1px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        typeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

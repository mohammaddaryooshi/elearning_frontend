import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssRtl from "tailwindcss-rtl";
import tailwindcssTypography from "@tailwindcss/typography";

const config: Config = {
    darkMode: ["class"],
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        container: {
            center: true,
            padding: "1rem",
            screens: {
                "2xl": "1280px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-iran-sans)", "Tahoma", "Arial", "sans-serif"],
                iranSans: ["var(--font-iran-sans)", "Tahoma", "Arial", "sans-serif"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                surface: {
                    DEFAULT: "hsl(var(--surface))",
                    elevated: "hsl(var(--surface-elevated))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    hover: "hsl(var(--primary-hover))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [tailwindcssAnimate, tailwindcssRtl, tailwindcssTypography],
};

export default config;

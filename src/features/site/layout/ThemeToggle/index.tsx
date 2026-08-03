"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-9 w-9 p-0"
                aria-label="تغییر تم"
                disabled
            >
                <Moon className="h-4 w-4" />
            </Button>
        );
    }

    const isDark = theme === "dark";

    return (
        <Button
            variant="outline"
            size="sm"
            type="button"
            className="h-9 w-9 rounded-full border-border/80 bg-card/70 p-0 hover:bg-accent"
            aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تیره"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}

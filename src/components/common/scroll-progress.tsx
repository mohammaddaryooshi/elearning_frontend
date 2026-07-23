"use client";

import { useEffect, useState } from "react";

function getScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) {
        return 0;
    }

    return Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
}

export function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frameId = 0;

        const updateProgress = () => {
            setProgress(getScrollProgress());
            frameId = 0;
        };

        const onScrollOrResize = () => {
            if (frameId) {
                return;
            }

            frameId = window.requestAnimationFrame(updateProgress);
        };

        updateProgress();

        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);

        return () => {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }
            window.removeEventListener("scroll", onScrollOrResize);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, []);

    return (
        <div className="h-1 w-full bg-border/70" aria-hidden="true">
            <div
                className="h-full bg-primary transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

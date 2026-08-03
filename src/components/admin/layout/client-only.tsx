"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
    return () => { };
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,   // client snapshot
        () => false,  // server snapshot
    );

    if (!mounted) return null;
    return <>{children}</>;
}

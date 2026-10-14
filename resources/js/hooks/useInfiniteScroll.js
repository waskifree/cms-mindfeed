import { useEffect, useRef, useCallback } from "react";
import { router } from "@inertiajs/react";

export default function useInfiniteScroll({
    nextPageUrl,
    only = ["contents"],
    enabled = true,
}) {
    const loaderRef = useRef(null);
    const loadingRef = useRef(false);

    const loadMore = useCallback(() => {
        if (!nextPageUrl || loadingRef.current || !enabled) return;

        loadingRef.current = true;

        router.get(
            nextPageUrl,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only,
                onFinish: () => {
                    loadingRef.current = false;
                },
            },
        );
    }, [nextPageUrl, only, enabled]);

    useEffect(() => {
        const el = loaderRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: "200px" }, // mulai load sedikit sebelum mentok
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    return { loaderRef };
}

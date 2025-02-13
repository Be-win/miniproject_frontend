// @ts-ignore
import type React from "react"
import { useEffect, useRef, useCallback } from "react"

type InfiniteScrollProps = {
    loadMore: () => void
    hasMore: boolean
    children: React.ReactNode
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({ loadMore, hasMore, children }) => {
    const observerTarget = useRef<HTMLDivElement>(null)

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries
            if (target.isIntersecting && hasMore) {
                loadMore()
            }
        },
        [loadMore, hasMore],
    )

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "20px",
            threshold: 1.0,
        })

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [handleObserver])

    return (
        <>
            {children}
            <div ref={observerTarget} className="infinite-scroll-loader" />
        </>
    )
}

export default InfiniteScroll

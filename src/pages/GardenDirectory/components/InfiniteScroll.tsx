"use client"

import { useEffect, useRef } from "react"
// @ts-ignore
import type React from "react" // Added import for React

type InfiniteScrollProps = {
    loadMore: () => void
    hasMore: boolean
    children: React.ReactNode
}

export default function InfiniteScroll({ loadMore, hasMore, children }: InfiniteScrollProps) {
    const observerTarget = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore()
                }
            },
            { threshold: 1.0 },
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [loadMore, hasMore])

    return (
        <>
            {children}
            <div ref={observerTarget} style={{ height: "10px" }} />
        </>
    )
}


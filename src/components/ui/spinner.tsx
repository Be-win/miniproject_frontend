// @ts-ignore
import type React from "react"
import { cn } from "../../lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-spin rounded-full border-4 border-t-4 border-gray-200", className)}
            style={{ borderTopColor: "currentColor" }}
            {...props}
        />
    )
}


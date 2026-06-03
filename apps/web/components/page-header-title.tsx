"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

const routeTitles: Record<string, string> = {
    "/": "Home",
    "/dashboard": "Dashboard",
    "/courses": "Courses",
    "/community": "Community",
    "/quizzes": "Quizzes",
    "/settings": "Settings",
    "/new-case": "New Case",
    "/workflows": "Workflows",
}

export function PageHeaderTitle() {
    const pathname = usePathname()

    // Function to get title from pathname
    const getTitle = (path: string) => {
        // Direct match
        if (routeTitles[path]) {
            return routeTitles[path]
        }

        // Handle dynamic routes like /courses/[id]
        if (path.startsWith("/courses/")) {
            return "Course Details"
        }

        // Handle nesting or other dynamic patterns
        const segments = path.split("/").filter(Boolean)
        const lastSegment = segments[segments.length - 1]
        if (lastSegment) {
            // Capitalize last segment as fallback
            return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ")
        }

        return "Otto"
    }

    const title = getTitle(pathname)

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
                {title}
            </span>
        </div>
    )
}

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// We need to define the props manually if types aren't inferred perfectly
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
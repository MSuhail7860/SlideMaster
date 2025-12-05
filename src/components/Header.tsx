"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export function Header() {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    // Initialize theme from system or local storage
    useEffect(() => {
        const isDark =
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            setTheme("dark");
            document.documentElement.classList.add('dark');
        } else {
            setTheme("light");
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
            document.documentElement.classList.add("dark");
            localStorage.theme = "dark";
        } else {
            setTheme("light");
            document.documentElement.classList.remove("dark");
            localStorage.theme = "light";
        }
    };

    return (
        <header className="flex justify-between items-center w-full max-w-md mx-auto py-6 px-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">SlidePuzzle</h1>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
        </header>
    );
}

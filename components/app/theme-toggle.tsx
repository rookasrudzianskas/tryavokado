"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* CSS-driven swap avoids a hydration flash and setState-in-effect. */}
      <Sun className="hidden size-[1.15rem] dark:block" />
      <Moon className="size-[1.15rem] dark:hidden" />
    </Button>
  );
}

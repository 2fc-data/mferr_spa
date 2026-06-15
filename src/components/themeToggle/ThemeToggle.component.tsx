/**
 * @copyright 2025 Marcell Ferreira - Advocacia
 * @license Apache-2.0
 */

/**
 * Components
 */

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/**
 * Hooks
 */
import { useTheme } from "@/components/themeProvider";

/**
 * Assets
 */
import { MoonIcon, SunIcon, MonitorIcon, CheckIcon } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Toggle theme" variant="ghost" size="icon" className="rounded-full">
          <MonitorIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon className="scale-100 rotate-0 transition-all dark:scale-100 dark:-rotate-90" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon className="scale-100 rotate-0 transition-all dark:scale-100 dark:-rotate-90" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <MonitorIcon />
          <span>Sistema</span>
          {theme === "system" && <CheckIcon className="ms-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>

    </DropdownMenu>
  );
};

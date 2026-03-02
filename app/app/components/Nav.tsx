import React from "react";
import {
  Link,
  NavLink,
  useFetcher,
  useNavigate,
  useRouteLoaderData,
} from "react-router";
import type { SearchResult } from "../lib/database/queries";
import {
  EllipsisVertical,
  Github,
  Monitor,
  Moon,
  SearchIcon,
  Settings,
  Sun,
  XIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "./ui/sheet";
import { THEME_MODES, THEME_MODE_LABELS } from "../lib/theme/constants";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Experience", to: "/experience" },
  { label: "Stack", to: "/stack" },
  { label: "Gallery", to: "/gallery" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Settings", to: "/settings" },
];

const primaryNavItems = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const modLabel = isMac ? "⌘" : "Ctrl";

const Nav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [githubStars, setGithubStars] = React.useState<number | null>(null);
  const navigate = useNavigate();
  const searchFetcher = useFetcher<SearchResult[]>();
  const rootData = useRouteLoaderData("root") as
    | { theme: string; style: string }
    | undefined;
  const theme = rootData?.theme ?? "system";

  const handleThemeChange = async (mode: string) => {
    try {
      await fetch("/set-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({ theme: mode }).toString(),
      });
      window.location.reload();
    } catch {
      // noop
    }
  };

  const closeOverlays = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleNavigate = (to: string) => {
    navigate(to);
    closeOverlays();
  };

  // Ctrl/Clg + K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((s) => !s);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Fetch GitHub stars for the portfolio repo
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/Shaku-Med/pfolio",
        );
        if (!res.ok) return;
        const data = (await res.json()) as { stargazers_count?: number };
        if (!cancelled && typeof data.stargazers_count === "number") {
          setGithubStars(data.stargazers_count);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q.length <= 2) return;

    const id = window.setTimeout(() => {
      searchFetcher.load(`/api/data/search?q=${encodeURIComponent(q)}`);
    }, 300);

    return () => window.clearTimeout(id);
  }, [searchQuery]);

  const searchResults = searchFetcher.data ?? [];
  const hasQuery = searchQuery.trim().length > 2;

  return (
    <>
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        {/* ── Header bar ── */}
        <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background backdrop-blur-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-5 lg:px-6">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-3">
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted lg:hidden"
                  aria-label="Open menu"
                >
                  <span className="relative inline-flex h-3 w-4 flex-col justify-between">
                    <span className="block h-0.5 w-full rounded-full bg-foreground" />
                    <span className="block h-0.5 w-full rounded-full bg-foreground" />
                  </span>
                </button>
              </SheetTrigger>

              <NavLink to="/" className="flex items-center gap-2.5">
                <img
                  src="/web/icon-192.png"
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-lg object-contain"
                />
                <span className="hidden text-[0.938rem] font-semibold tracking-tight text-foreground sm:inline">
                  Mohamed Amara
                </span>
              </NavLink>
            </div>

            {/* Right: nav + search + actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              <nav className="hidden items-center gap-5 lg:flex">
                {primaryNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `text-sm transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted lg:inline-flex"
              >
                <SearchIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Search</span>
                <kbd className="rounded border border-border/70 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground/70">
                  {modLabel} K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted lg:hidden"
                aria-label="Search"
              >
                <SearchIcon className="h-4 w-4" />
              </button>

              <Link
                to="/contact"
                className="hidden items-center rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 lg:inline-flex"
              >
                Hire me
              </Link>

              <a
                href="https://github.com/Shaku-Med/pfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm transition hover:bg-muted lg:inline-flex"
                aria-label="View and star this project on GitHub"
              >
                <Github className="h-3 w-3" />
                <span className="tabular-nums">
                  {githubStars !== null ? githubStars : "—"}
                </span>
              </a>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted"
                    aria-label="Settings"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Theme
                  </DropdownMenuLabel>
                  {THEME_MODES.map((mode) => {
                    const Icon =
                      mode === "light"
                        ? Sun
                        : mode === "dark"
                          ? Moon
                          : Monitor;
                    const active = theme === mode;
                    return (
                      <DropdownMenuItem
                        key={mode}
                        onSelect={(e) => {
                          e.preventDefault();
                          void handleThemeChange(mode);
                        }}
                        className={active ? "text-primary" : ""}
                      >
                        <Icon className="mr-2 h-4 w-4 shrink-0" />
                        {THEME_MODE_LABELS[mode]}
                        {active && (
                          <span className="ml-auto text-xs text-primary">
                            ✓
                          </span>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* ── Mobile sheet ── */}
        <SheetContent
          side="left"
          className="flex w-full max-w-80 flex-col border-r border-border/60 p-0 lg:hidden"
          showCloseButton={false}
        >
          {/* Sheet header */}
          <SheetHeader className="shrink-0 border-b border-border/60 px-5 pb-4 pt-0">
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <img
                  src="/web/icon-192.png"
                  alt=""
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <div>
                  <SheetTitle className="text-lg line-clamp-1 font-semibold tracking-tight">
                    Mohamed Amara
                  </SheetTitle>
                </div>
              </div>
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* Sheet nav */}
          <nav className="flex-1 overflow-y-auto py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeOverlays}
                className={({ isActive }) =>
                  `flex items-center px-5 py-2.5 text-sm transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Sheet footer */}
          <SheetFooter className="shrink-0 border-t border-border/60 px-5 py-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted"
            >
              <SearchIcon className="h-4 w-4" />
              Search
              <kbd className="ml-auto rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground/60">
                {modLabel} K
              </kbd>
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Link
                to="/contact"
                onClick={closeOverlays}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Hire me
              </Link>
              <a
                href="https://github.com/Shaku-Med/provit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm transition hover:bg-muted"
                aria-label="View and star this project on GitHub"
              >
                <Github className="h-3 w-3" />
                <span className="tabular-nums">
                  {githubStars !== null ? githubStars : "—"}
                </span>
              </a>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Search dialog ── */}
      <CommandDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        title="Search"
        description="Search across projects, blog, experience, and more"
      >
        <CommandInput
          autoFocus
          placeholder="Search..."
          onValueChange={setSearchQuery}
        />
        <CommandList className="max-h-[min(24rem,60vh)]">
          <CommandEmpty>
            {hasQuery ? "No results found." : "Start typing to search."}
          </CommandEmpty>

          {/* Quick nav — only show when no search query */}
          {!hasQuery && (
            <CommandGroup heading="Pages">
              {navItems.map((item) => (
                <CommandItem
                  key={item.to}
                  value={item.label}
                  onSelect={() => handleNavigate(item.to)}
                  className="py-2.5"
                >
                  <span className="text-sm">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Search results */}
          {hasQuery && searchResults.length > 0 && (
            <CommandGroup heading="Results">
              {searchResults.map((item) => (
                <CommandItem
                  key={`${item.kind}-${item.id}`}
                  value={`${item.kind} ${item.title} ${searchQuery}`}
                  onSelect={() => handleNavigate(item.href)}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {item.kind}
                    </span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  {item.summary && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {item.summary}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default Nav;
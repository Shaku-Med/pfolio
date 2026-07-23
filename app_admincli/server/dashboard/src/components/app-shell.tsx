"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  Images,
  Layers,
  LogOut,
  Monitor,
  Moon,
  Newspaper,
  Star,
  Sun,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { request } from "@/lib/client-api";
import { siteAssetUrl } from "@/lib/files";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/selected", label: "Selected", Icon: Star },
  { href: "/projects", label: "Projects", Icon: Briefcase },
  { href: "/experience", label: "Experience", Icon: Layers },
  { href: "/stack", label: "Stack", Icon: Wrench },
  { href: "/gallery", label: "Gallery", Icon: Images },
  { href: "/blog", label: "Blog", Icon: Newspaper },
  { href: "/resume", label: "Resume", Icon: FileText },
];

const LOGO_SRC = siteAssetUrl("web/icon-192.png");

const THEME_OPTIONS = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const current = theme ?? "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8" aria-label="Theme" />
        }
      >
        <Sun className="size-4 dark:hidden" />
        <Moon className="hidden size-4 dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(value) => {
            if (value === "system" || value === "light" || value === "dark") {
              setTheme(value);
            }
          }}
        >
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const signOut = async () => {
    setConfirmSignOut(false);
    try {
      await request("POST", "/api/auth/logout");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
    }
  };

  const current = NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-12 border-b border-sidebar-border p-0">
          <div className="flex h-12 items-center gap-2.5 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_SRC}
              alt="Pfolio"
              className="size-7 shrink-0 rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.src = "/web/icon-192.png";
              }}
            />
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">Pfolio</span>
              <span className="truncate text-xs text-muted-foreground">Admin</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-1 py-2">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {NAV.map(({ href, label, Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={label}
                        render={<Link href={href} />}
                        className={cn("h-9", active && "font-medium")}
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-1 p-2">
          <SidebarSeparator className="mx-0 mb-1" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                className="h-9"
                onClick={() => setConfirmSignOut(true)}
              >
                <LogOut className="size-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3 sm:px-4">
          <SidebarTrigger className="-ml-1 size-8" />
          <span className="min-w-0 truncate text-sm font-medium">
            {current?.label ?? "Dashboard"}
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-7 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
          {children}
        </div>
      </SidebarInset>

      <AlertDialog open={confirmSignOut} onOpenChange={setConfirmSignOut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to manage content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay signed in</AlertDialogCancel>
            <AlertDialogAction onClick={() => void signOut()}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

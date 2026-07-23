import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/session";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isSignedIn())) redirect("/login");
  return <AppShell>{children}</AppShell>;
}

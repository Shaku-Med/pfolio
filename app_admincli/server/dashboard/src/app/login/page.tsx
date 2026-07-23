import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/session";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/projects");
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}

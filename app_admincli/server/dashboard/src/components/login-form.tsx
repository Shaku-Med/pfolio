"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { request } from "@/lib/client-api";
import { siteAssetUrl } from "@/lib/files";

export function LoginForm() {
  const router = useRouter();
  const [wrapper, setWrapper] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await request("POST", "/api/auth/login", { wrapper, password });
      router.replace("/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
      setBusy(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteAssetUrl("web/icon-192.png")}
          alt="Pfolio"
          className="mb-2 size-9 rounded-md object-cover"
          onError={(e) => {
            e.currentTarget.src = "/web/icon-192.png";
          }}
        />
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use the wrapper key and password you set up with the CLI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wrapper">Wrapper key</Label>
            <Input
              id="wrapper"
              type="password"
              autoComplete="off"
              value={wrapper}
              onChange={(e) => setWrapper(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured. Copy .env.example to .env.local, add your keys, and restart the dev server.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured. Copy .env.example to .env.local, add your keys, and restart the dev server.");
      return;
    }
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-violet-50 px-4 dark:from-teal-950/30 dark:via-gray-900 dark:to-violet-950/30">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
            {APP_NAME}
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to continue your recovery journey</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>
          <div className="mt-4 space-y-2 text-center text-sm">
            <Link href="/reset-password" className="text-teal-600 hover:underline">Forgot password?</Link>
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-teal-600 hover:underline">Sign up</Link>
            </p>
          </div>
        </Card>
        <div className="mt-6"><Disclaimer compact /></div>
      </div>
    </div>
  );
}

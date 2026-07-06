"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { APP_NAME } from "@/lib/constants";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      router.push("/onboarding");
    } catch {
      setError("Could not create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/onboarding");
    } catch {
      setError("Google sign-up failed. Please try again.");
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
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Take the first step on your recovery journey</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
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
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:underline">Sign in</Link>
          </p>
        </Card>
        <div className="mt-6"><Disclaimer compact /></div>
      </div>
    </div>
  );
}

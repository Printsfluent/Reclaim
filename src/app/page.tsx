import Link from "next/link";
import { Heart, Shield, Users, TrendingUp, MessageCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { APP_NAME } from "@/lib/constants";

const features = [
  { icon: TrendingUp, title: "Track Your Progress", desc: "Monitor streaks, moods, and cravings with daily check-ins." },
  { icon: BookOpen, title: "Private Journal", desc: "Reflect on your journey in a secure, personal space." },
  { icon: MessageCircle, title: "AI Recovery Coach", desc: "Get supportive guidance with motivational interviewing." },
  { icon: Users, title: "Anonymous Community", desc: "Share victories and find support from others on the same path." },
  { icon: Shield, title: "Emergency Support", desc: "Access breathing exercises and grounding tools when cravings hit." },
  { icon: Heart, title: "Motivation Center", desc: "Daily quotes, tips, and reminders to keep you going." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg dark:border-gray-700/60 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-violet-50 dark:from-teal-950/30 dark:via-gray-900 dark:to-violet-950/30" />
          <div className="relative mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
              Your Journey to{" "}
              <span className="bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
                Recovery
              </span>{" "}
              Starts Here
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              A calm, supportive platform to help you overcome addiction. Track progress, build healthier habits, and connect with a caring community.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup"><Button size="lg">Start Your Recovery</Button></Link>
              <Link href="/login"><Button variant="outline" size="lg">I Have an Account</Button></Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">Everything You Need</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700/60 dark:bg-gray-900">
                <div className="mb-4 inline-flex rounded-xl bg-teal-100 p-3 dark:bg-teal-900/50">
                  <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12">
          <Disclaimer />
        </section>
      </main>

      <footer className="border-t border-gray-200/60 py-8 text-center text-sm text-gray-500 dark:border-gray-700/60 dark:text-gray-400">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}

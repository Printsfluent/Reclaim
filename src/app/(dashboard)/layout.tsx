import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DashboardNav />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

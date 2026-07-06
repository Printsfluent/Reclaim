"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/ProtectedRoute";
import { getAllUsers, getReports, getCommunityPosts, deleteCommunityPost } from "@/lib/supabase/database";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { UserProfile, CommunityPost } from "@/lib/types";
import { formatDate } from "@/lib/utils/dates";
import { Trash2, Users, Flag } from "lucide-react";

function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Array<{ id: string; postId: string; reason: string; createdAt: string }>>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [tab, setTab] = useState<"users" | "reports" | "posts">("users");

  const load = () => {
    getAllUsers().then(setUsers);
    getReports().then(setReports);
    getCommunityPosts(100).then(setPosts);
  };

  useEffect(() => { load(); }, []);

  const handleDeletePost = async (postId: string) => {
    await deleteCommunityPost(postId);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-500">Manage users, reports, and content</p>
      </div>

      <div className="flex gap-2">
        {(["users", "reports", "posts"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "primary" : "ghost"} size="sm" onClick={() => setTab(t)} className="capitalize">
            {t}
          </Button>
        ))}
      </div>

      {tab === "users" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Users ({users.length})</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">Joined</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2 capitalize">{u.role}</td>
                    <td className="py-2">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "reports" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Flag className="h-5 w-5" /> Reports ({reports.length})</CardTitle></CardHeader>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-lg border p-3 text-sm dark:border-gray-700">
                <p><strong>Post:</strong> {r.postId}</p>
                <p><strong>Reason:</strong> {r.reason}</p>
                <p className="text-gray-500">{formatDate(r.createdAt)}</p>
                <Button size="sm" variant="danger" className="mt-2" onClick={() => handleDeletePost(r.postId)}>
                  <Trash2 className="h-3 w-3" /> Remove Post
                </Button>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-500">No reports.</p>}
          </div>
        </Card>
      )}

      {tab === "posts" && (
        <Card>
          <CardHeader><CardTitle>Community Posts ({posts.length})</CardTitle></CardHeader>
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="rounded-lg border p-3 text-sm dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">{p.anonymousName}</span>
                  <span className="text-gray-400">{formatDate(p.createdAt)}</span>
                </div>
                <p className="mt-1">{p.content}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Reports: {p.reportCount}</span>
                  <Button size="sm" variant="danger" onClick={() => handleDeletePost(p.id)}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  );
}

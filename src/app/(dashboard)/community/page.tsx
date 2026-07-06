"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommunityPosts, createCommunityPost, reportPost,
} from "@/lib/firebase/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { generateAnonymousName, filterProfanity } from "@/lib/utils/sanitize";
import { formatDate } from "@/lib/utils/dates";
import type { CommunityPost } from "@/lib/types";
import { Flag, Send } from "lucide-react";

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [content, setContent] = useState("");
  const [type, setType] = useState<CommunityPost["type"]>("update");
  const [loading, setLoading] = useState(false);

  const load = () => getCommunityPosts().then(setPosts);
  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!user || !content.trim()) return;
    setLoading(true);
    await createCommunityPost(user.uid, generateAnonymousName(), content, type);
    setContent("");
    setLoading(false);
    load();
  };

  const handleReport = async (postId: string) => {
    if (!user) return;
    await reportPost(postId, user.uid, "Inappropriate content");
    load();
  };

  const typeColors = {
    update: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    victory: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    question: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-gray-500">Anonymous support from others on the same path</p>
      </div>

      <Card>
        <div className="mb-3 flex gap-2">
          {(["update", "victory", "question"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1 text-xs font-medium capitalize ${type === t ? typeColors[t] : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <Textarea placeholder="Share with the community..." rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
        <Button className="mt-3" onClick={handlePost} disabled={loading || !content.trim()}>
          <Send className="h-4 w-4" /> {loading ? "Posting..." : "Post Anonymously"}
        </Button>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{post.anonymousName}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${typeColors[post.type]}`}>{post.type}</span>
              </div>
              <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{filterProfanity(post.content)}</p>
            <button
              onClick={() => handleReport(post.id)}
              className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
            >
              <Flag className="h-3 w-3" /> Report
            </button>
          </Card>
        ))}
        {posts.length === 0 && <Card><p className="text-center text-gray-500">No posts yet. Be the first to share!</p></Card>}
      </div>
    </div>
  );
}

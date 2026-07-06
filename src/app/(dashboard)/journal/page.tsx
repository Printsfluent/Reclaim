"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry,
} from "@/lib/firebase/firestore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils/dates";
import type { JournalEntry } from "@/lib/types";
import { Plus, Search, Trash2, Edit2, X } from "lucide-react";

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (user) getJournalEntries(user.uid).then(setEntries);
  };

  useEffect(load, [user]);

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setLoading(true);
    if (editing) {
      await updateJournalEntry(editing.id, title, content);
    } else {
      await createJournalEntry(user.uid, title, content);
    }
    setTitle("");
    setContent("");
    setShowForm(false);
    setEditing(null);
    setLoading(false);
    load();
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditing(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-gray-500">Your private space for reflection</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setTitle(""); setContent(""); }}>
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input className="pl-10" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{editing ? "Edit Entry" : "New Entry"}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Write your thoughts..." rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Entry"}</Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card><p className="text-center text-gray-500">No journal entries yet. Start writing!</p></Card>
        ) : (
          filtered.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{entry.title}</h3>
                  <p className="text-xs text-gray-500">{formatDate(entry.updatedAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(entry)} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(entry.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{entry.content}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

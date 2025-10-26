"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { ScrollArea } from "./ui/scroll-area"
import { BookOpen, Loader2, Plus } from "lucide-react"
import { api } from "../lib/api"
import { supabase } from "../lib/supabase"

type ConversationMeta = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

type Props = {
  onOpenConversation: (conversationId: string) => Promise<void> | void
  onNewConversation?: (conversationId: string) => void
  currentConversationId?: string | null
}

export default function ConversationsSheet({
  onOpenConversation,
  onNewConversation,
  currentConversationId,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [convos, setConvos] = useState<ConversationMeta[]>([])

  async function loadConversations() {
    setLoading(true)
    try {
      const res = await api.listConversations()
      setConvos(res.conversations ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function createNewConversation() {
    const firstTitle = "New conversation"
    const res = await api.createConversation(firstTitle)
    const cid = res.conversation.id as string
    setConvos((prev) => [{ ...res.conversation }, ...prev])
    onNewConversation?.(cid)
    setOpen(false)
  }

  // whenever the sheet opens, refresh
  useEffect(() => {
    if (open) loadConversations()
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Past conversations"
          className="hover:bg-primary/10 transition-all hover:scale-110"
        >
          <BookOpen className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Past conversations</SheetTitle>
        </SheetHeader>

        <div className="p-3 border-b">
          <Button className="w-full gap-2" onClick={createNewConversation}>
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : convos.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No conversations yet.</div>
          ) : (
            <ul className="p-2 space-y-1">
              {convos.map((c) => (
                <li key={c.id}>
                  <button
                    className={`w-full text-left rounded-md px-3 py-2 hover:bg-muted ${
                      currentConversationId === c.id ? "bg-muted" : ""
                    }`}
                    onClick={async () => {
                      await onOpenConversation(c.id)
                      setOpen(false)
                    }}
                  >
                    <div className="text-sm font-medium line-clamp-1">{c.title || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.updated_at).toLocaleString()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

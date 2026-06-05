"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/firebase/auth-provider";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import {
  ensureSupportConversation,
  getConversation,
  listMessages,
  markSpecialistPaid,
  requestSpecialist,
  sendMessage,
} from "@/lib/firebase/conversations";
import { listAudit } from "@/lib/firebase/data";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HUMAN_HELP } from "@/lib/constants";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { MessageDoc } from "@/lib/firebase/types";

export default function HelpPage() {
  const { user } = useAuth();
  const { active } = useWorkspace();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [sending, startSend] = useTransition();
  const [requesting, setRequesting] = useState(false);
  const paidHandled = useRef(false);
  const wsId = active?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["support", wsId],
    enabled: !!wsId && !!user,
    queryFn: async () => {
      await ensureSupportConversation(wsId!, user!.uid);
      const [convo, messages, audit] = await Promise.all([
        getConversation(wsId!),
        listMessages(wsId!),
        listAudit(wsId!, 6),
      ]);
      return { convo, messages, audit };
    },
  });

  // Confirm payment on return from Stripe Checkout (?paid=1).
  useEffect(() => {
    if (paidHandled.current || !wsId || !user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      paidHandled.current = true;
      markSpecialistPaid(wsId, user.uid)
        .then(() => queryClient.invalidateQueries({ queryKey: ["support", wsId] }))
        .catch(() => undefined)
        .finally(() => {
          window.history.replaceState({}, "", "/help");
          toast.success("Specialist assigned to your workspace.");
        });
    } else if (params.get("canceled") === "1") {
      window.history.replaceState({}, "", "/help");
    }
  }, [wsId, user, queryClient]);

  async function handleRequest() {
    if (!wsId || !user) return;
    setRequesting(true);
    try {
      await requestSpecialist(wsId, user.uid);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: wsId, uid: user.uid }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
      } else {
        toast.error(json.error ?? "Could not start checkout.");
        setRequesting(false);
      }
    } catch {
      toast.error("Could not start checkout.");
      setRequesting(false);
    }
  }

  function handleSend() {
    const body = input.trim();
    if (!body || !wsId || !user) return;
    setInput("");
    startSend(async () => {
      await sendMessage(wsId, {
        role: "user",
        authorName: user.displayName ?? "You",
        body,
      });
      await queryClient.invalidateQueries({ queryKey: ["support", wsId] });
    });
  }

  const convo = data?.convo;
  const paid = convo?.paid ?? false;

  return (
    <>
      <PageHeader
        title="Human support"
        description="Chat with us, see what the AI has done, and bring in a senior specialist when you want a human."
      >
        {paid ? (
          <Badge variant="success" className="gap-1">
            <UserRound className="size-3" /> Specialist assigned
          </Badge>
        ) : (
          <Badge variant="muted">Self-serve</Badge>
        )}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Chat */}
        <Card className="flex h-[32rem] flex-col">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Support thread</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 overflow-y-auto py-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-2/3" />
                ))}
              </div>
            ) : (
              data?.messages.map((m) => <ChatBubble key={m.id} message={m} />)
            )}
          </CardContent>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message…"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {/* Specialist offer */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-primary" />
                {HUMAN_HELP.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold text-foreground">
                  {formatCurrency(HUMAN_HELP.priceEur)}
                </span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {HUMAN_HELP.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              {paid ? (
                <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                  A specialist is reviewing your workspace and will reply in the
                  thread.
                </p>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleRequest}
                  disabled={requesting}
                >
                  {requesting && <Loader2 className="size-4 animate-spin" />}
                  Connect a specialist
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Secure checkout via Stripe. Test mode.
              </p>
            </CardContent>
          </Card>

          {/* What the AI has done */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" /> What the AI has done
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : data && data.audit.length > 0 ? (
                data.audit.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    <p className="text-foreground">
                      {entry.summary ?? entry.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(entry.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No activity yet. Connect a store to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ChatBubble({ message }: { message: MessageDoc }) {
  if (message.role === "system") {
    return (
      <p className="mx-auto max-w-md text-center text-xs text-muted-foreground">
        {message.body}
      </p>
    );
  }
  const isUser = message.role === "user";
  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <span className="px-1 text-[11px] font-medium text-muted-foreground">
        {message.authorName}
      </span>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {message.body}
      </div>
    </div>
  );
}

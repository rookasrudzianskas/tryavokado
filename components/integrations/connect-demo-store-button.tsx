"use client";
import { useTransition } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/firebase/auth-provider";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import { connectDemoStore } from "@/lib/firebase/stores";
import { roleAtLeast } from "@/lib/constants";
import type { EcommercePlatform } from "@/lib/constants";

export function ConnectDemoStoreButton({
  platform,
  connected,
}: {
  platform: EcommercePlatform;
  connected?: boolean;
}) {
  const { user } = useAuth();
  const { active, role } = useWorkspace();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={connected ? "outline" : "default"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (!user || !active) return;
          if (!role || !roleAtLeast(role, "admin")) {
            toast.error("You need the Admin role to connect a store.");
            return;
          }
          try {
            const res = await connectDemoStore({
              workspaceId: active.id,
              platform,
              uid: user.uid,
              actorName: user.displayName ?? user.email ?? "Owner",
            });
            await queryClient.invalidateQueries({ queryKey: ["stores", active.id] });
            await queryClient.invalidateQueries({ queryKey: ["products", active.id] });
            await queryClient.invalidateQueries({
              queryKey: ["overview-progress", active.id],
            });
            toast.success(`Imported ${res.productCount} demo products.`, {
              description:
                "Demo data — clearly labelled and never mixed with real data.",
            });
          } catch {
            toast.error("Could not connect the demo store. Please try again.");
          }
        })
      }
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : connected ? (
        <Check className="size-4" />
      ) : (
        <Plus className="size-4" />
      )}
      {connected ? "Reimport demo data" : "Connect demo store"}
    </Button>
  );
}

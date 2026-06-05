"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { connectDemoStoreAction } from "@/lib/stores/actions";
import type { EcommercePlatform } from "@/lib/constants";

export function ConnectDemoStoreButton({
  platform,
  connected,
}: {
  platform: EcommercePlatform;
  connected?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant={connected ? "outline" : "default"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await connectDemoStoreAction(platform);
          if (res.ok) {
            toast.success(`Imported ${res.productCount} demo products.`, {
              description: "Demo data — clearly labelled and never mixed with real data.",
            });
            router.refresh();
          } else {
            toast.error(res.error);
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

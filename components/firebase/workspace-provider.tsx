"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth-provider";
import {
  getActiveWorkspaceId,
  listMyWorkspaces,
  setActiveWorkspace as persistActiveWorkspace,
} from "@/lib/firebase/data";
import type { WorkspaceDoc } from "@/lib/firebase/types";
import type { WorkspaceRole } from "@/lib/constants";

interface WorkspaceContextValue {
  workspaces: WorkspaceDoc[];
  active: WorkspaceDoc | null;
  role: WorkspaceRole | null;
  loading: boolean;
  switchWorkspace: (id: string) => Promise<void>;
  refresh: () => Promise<unknown>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/** Loads the signed-in user's workspaces from Firestore and gates the app. */
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [overrideActiveId, setOverrideActiveId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-workspaces", user?.uid ?? "anon"],
    enabled: !authLoading && !!user,
    queryFn: async () => {
      const list = await listMyWorkspaces(user!.uid);
      const storedActive = await getActiveWorkspaceId(user!.uid);
      return { list, storedActive };
    },
  });

  const workspaces = data?.list ?? [];
  const loading = authLoading || (!!user && isLoading);
  const activeId = overrideActiveId ?? data?.storedActive ?? null;
  const active =
    workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;
  const role: WorkspaceRole | null =
    active && user ? (active.roles[user.uid] ?? null) : null;

  // Redirects are side effects to external navigation, not React state.
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!loading && user && workspaces.length === 0) {
      router.replace("/onboarding");
    }
  }, [loading, user, workspaces.length, router]);

  async function switchWorkspace(id: string) {
    if (!user) return;
    await persistActiveWorkspace(user.uid, id);
    setOverrideActiveId(id);
    await refetch();
    router.refresh();
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        active,
        role,
        loading,
        switchWorkspace,
        refresh: refetch,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}

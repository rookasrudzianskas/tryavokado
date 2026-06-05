import { requireWorkspaceContext } from "@/lib/auth/session";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, workspace, workspaces } = await requireWorkspaceContext();

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          workspaces={workspaces.map((w) => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            role: w.role,
          }))}
          activeSlug={workspace.slug}
          user={{
            name: user.name,
            email: user.email,
            image: user.image ?? null,
          }}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

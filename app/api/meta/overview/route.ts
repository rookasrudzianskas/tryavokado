import { NextResponse } from "next/server";
import { getMetaAdapter } from "@/lib/integrations/registry";
import { toErrorResponse } from "@/lib/errors";

/**
 * Returns a full Meta account overview through the active typed adapter
 * (Mock / Marketing API / MCP — selected by `getMetaAdapter`). In demo mode this
 * is the labelled MockMetaAdapter. The app never depends on a concrete impl.
 */
export async function GET() {
  const adapter = getMetaAdapter();
  try {
    const [businesses, adAccounts, pages, instagram, permissions, catalogs] =
      await Promise.all([
        adapter.listBusinesses(),
        adapter.listAdAccounts(),
        adapter.listPages(),
        adapter.listInstagramAccounts(),
        adapter.checkPermissions(),
        adapter.listCatalogs(),
      ]);

    const primaryAccount = adAccounts[0]?.externalId;
    const [pixels, readiness] = primaryAccount
      ? await Promise.all([
          adapter.listPixels(primaryAccount),
          adapter.getAdAccountReadiness(primaryAccount),
        ])
      : [[], null];

    return NextResponse.json({
      adapter: adapter.mode,
      businesses,
      adAccounts,
      pages,
      instagram,
      permissions,
      catalogs,
      pixels,
      readiness,
    });
  } catch (err) {
    const e = toErrorResponse(err);
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.httpStatus });
  }
}

import { IntegrationSetupError } from "@/lib/errors";
import { env } from "@/lib/env";
import type {
  MetaAdapter,
  MetaAdAccount,
  MetaBusiness,
  MetaCampaignData,
  MetaCatalog,
  MetaCreateResult,
  MetaInsightRow,
  MetaInstagramAccount,
  MetaPage,
  MetaPermission,
  MetaPixel,
  MetaReadiness,
  MetaUploadResult,
} from "../types";

const MARKETING_API_SETUP = [
  "Create a Meta app and complete business verification.",
  "Grant ads_management, ads_read, business_management, and page/instagram scopes.",
  "Set META_APP_ID and META_APP_SECRET, then connect via OAuth.",
  "Submit for App Review for production access to advertising data.",
];

const MCP_SETUP = [
  "Run or host a Meta Ads MCP server and set META_MCP_URL.",
  "Set META_MCP_ENABLED=true to route the Meta adapter through MCP.",
  "Authenticate the MCP server with a Meta token that has ads_management.",
  "Mutations still pass through Avokado's policy engine + audit log, not raw model output.",
];

/**
 * Official Meta Marketing API adapter (production target). The OAuth connection,
 * encrypted token storage, and readiness checks are wired elsewhere; the
 * Graph API request layer is implemented incrementally. Until a method is wired
 * it throws a typed IntegrationSetupError describing exactly what is required —
 * it never silently falls back or fabricates a successful response.
 */
export class MetaMarketingApiAdapter implements MetaAdapter {
  readonly mode = "live" as const;
  protected adapterLabel = "Meta Marketing API";
  protected setupSteps = MARKETING_API_SETUP;

  constructor(
    protected readonly ctx: {
      accessToken: string;
      apiVersion?: string;
    },
  ) {}

  protected get version() {
    return this.ctx.apiVersion ?? env.META_GRAPH_API_VERSION;
  }

  protected todo(operation: string): never {
    throw new IntegrationSetupError(
      `The live ${this.adapterLabel} call "${operation}" requires completed setup. ` +
        "Until then the app uses the labelled mock Meta adapter.",
      this.setupSteps,
    );
  }

  listBusinesses(): Promise<MetaBusiness[]> {
    return this.todo("listBusinesses");
  }
  listAdAccounts(): Promise<MetaAdAccount[]> {
    return this.todo("listAdAccounts");
  }
  listPages(): Promise<MetaPage[]> {
    return this.todo("listPages");
  }
  listInstagramAccounts(): Promise<MetaInstagramAccount[]> {
    return this.todo("listInstagramAccounts");
  }
  listPixels(): Promise<MetaPixel[]> {
    return this.todo("listPixels");
  }
  listCatalogs(): Promise<MetaCatalog[]> {
    return this.todo("listCatalogs");
  }
  checkPermissions(): Promise<MetaPermission[]> {
    return this.todo("checkPermissions");
  }
  getAdAccountReadiness(): Promise<MetaReadiness> {
    return this.todo("getAdAccountReadiness");
  }
  fetchCampaigns(): Promise<MetaCampaignData[]> {
    return this.todo("fetchCampaigns");
  }
  fetchInsights(): Promise<MetaInsightRow[]> {
    return this.todo("fetchInsights");
  }
  uploadImage(): Promise<MetaUploadResult> {
    return this.todo("uploadImage");
  }
  uploadVideo(): Promise<MetaUploadResult> {
    return this.todo("uploadVideo");
  }
  createCampaign(): Promise<MetaCreateResult> {
    return this.todo("createCampaign");
  }
  createAdSet(): Promise<MetaCreateResult> {
    return this.todo("createAdSet");
  }
  createAd(): Promise<MetaCreateResult> {
    return this.todo("createAd");
  }
  updateStatus(): Promise<MetaCreateResult> {
    return this.todo("updateStatus");
  }
  pauseEntity(): Promise<MetaCreateResult> {
    return this.todo("pauseEntity");
  }
}

/**
 * Optional Meta Ads MCP adapter — an agent-facing convenience that speaks to a
 * Meta Ads MCP server (set via META_MCP_URL, enabled with META_MCP_ENABLED=true).
 * It implements the SAME typed `MetaAdapter` contract, so the rest of the app is
 * unaware of which backend is active. Each method maps 1:1 to an MCP tool call —
 * e.g. listAdAccounts → `meta.list_ad_accounts`, createCampaign →
 * `meta.create_campaign` (paused), fetchInsights → `meta.get_insights`.
 *
 * Production mutations still flow through Avokado's deterministic policy engine
 * and audit log — never raw model output. Until an MCP server is configured the
 * methods throw a typed, MCP-specific IntegrationSetupError (no fabrication).
 */
export class MetaMcpAdapter extends MetaMarketingApiAdapter {
  protected override adapterLabel = "Meta Ads MCP";
  protected override setupSteps = MCP_SETUP;
}

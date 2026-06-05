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

/**
 * Official Meta Marketing API adapter (production target). The OAuth connection,
 * encrypted token storage, and readiness checks are wired elsewhere; the
 * Graph API request layer is implemented incrementally. Until a method is wired
 * it throws a typed IntegrationSetupError describing exactly what is required —
 * it never silently falls back or fabricates a successful response.
 */
export class MetaMarketingApiAdapter implements MetaAdapter {
  readonly mode = "live" as const;

  constructor(
    private readonly ctx: {
      accessToken: string;
      apiVersion?: string;
    },
  ) {}

  private get version() {
    return this.ctx.apiVersion ?? env.META_GRAPH_API_VERSION;
  }

  private todo(operation: string): never {
    throw new IntegrationSetupError(
      `The live Meta Marketing API call "${operation}" requires completed app setup and review.`,
      MARKETING_API_SETUP,
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
 * Meta Ads MCP server. Disabled unless META_MCP_ENABLED=true. Production mutations
 * still flow through the policy engine and audit log, not free-form model output.
 */
export class MetaMcpAdapter extends MetaMarketingApiAdapter {
  // Inherits the typed contract; the MCP transport is wired when META_MCP_ENABLED.
  // Methods throw the same typed setup error until the MCP server is configured.
}

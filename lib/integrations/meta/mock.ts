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
import {
  DEMO_META_AD_ACCOUNTS,
  DEMO_META_BUSINESSES,
  DEMO_META_CATALOGS,
  DEMO_META_INSTAGRAM,
  DEMO_META_PAGES,
  DEMO_META_PERMISSIONS,
  DEMO_META_PIXELS,
  DEMO_META_READINESS,
  buildDemoInsights,
} from "@/lib/mock/data";

let counter = 1000;
function mockId(prefix: string) {
  counter += 1;
  return `mock_${prefix}_${counter}`;
}

/** Labelled mock Meta adapter — never contacts Meta; entities are always PAUSED. */
export class MockMetaAdapter implements MetaAdapter {
  readonly mode = "mock" as const;

  async listBusinesses(): Promise<MetaBusiness[]> {
    return DEMO_META_BUSINESSES;
  }
  async listAdAccounts(): Promise<MetaAdAccount[]> {
    return DEMO_META_AD_ACCOUNTS;
  }
  async listPages(): Promise<MetaPage[]> {
    return DEMO_META_PAGES;
  }
  async listInstagramAccounts(): Promise<MetaInstagramAccount[]> {
    return DEMO_META_INSTAGRAM;
  }
  async listPixels(): Promise<MetaPixel[]> {
    return DEMO_META_PIXELS;
  }
  async listCatalogs(): Promise<MetaCatalog[]> {
    return DEMO_META_CATALOGS;
  }
  async checkPermissions(): Promise<MetaPermission[]> {
    return DEMO_META_PERMISSIONS;
  }
  async getAdAccountReadiness(): Promise<MetaReadiness> {
    return DEMO_META_READINESS;
  }
  async fetchCampaigns(): Promise<MetaCampaignData[]> {
    return [
      { externalId: "mock_camp_1", name: "Prospecting — Dark Roast", objective: "sales", status: "PAUSED", dailyBudget: 60 },
      { externalId: "mock_camp_2", name: "Retargeting — Site visitors", objective: "sales", status: "PAUSED", dailyBudget: 30 },
    ];
  }
  async fetchInsights(params: {
    since: string;
    until: string;
  }): Promise<MetaInsightRow[]> {
    const start = new Date(params.since);
    const end = new Date(params.until);
    const days =
      Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1,
      ) || 30;
    return buildDemoInsights(days, params.until);
  }

  async uploadImage(): Promise<MetaUploadResult> {
    return { mediaId: mockId("img"), mediaHash: mockId("hash") };
  }
  async uploadVideo(): Promise<MetaUploadResult> {
    return { mediaId: mockId("vid") };
  }
  async createCampaign(): Promise<MetaCreateResult> {
    return { externalId: mockId("camp"), status: "PAUSED" };
  }
  async createAdSet(): Promise<MetaCreateResult> {
    return { externalId: mockId("adset"), status: "PAUSED" };
  }
  async createAd(): Promise<MetaCreateResult> {
    return { externalId: mockId("ad"), status: "PAUSED" };
  }
  async updateStatus(input: {
    entityId: string;
    status: "PAUSED" | "ACTIVE";
  }): Promise<MetaCreateResult> {
    return { externalId: input.entityId, status: input.status };
  }
  async pauseEntity(entityId: string): Promise<MetaCreateResult> {
    return { externalId: entityId, status: "PAUSED" };
  }
}

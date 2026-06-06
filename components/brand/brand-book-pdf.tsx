import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { AdPlan } from "@/lib/brand/types";

/*
  A detailed, print-ready PDF brand book. Flat and monochrome (black on white,
  hairline rules) with the brand's own palette as the only color — no gradients.
  Loaded only on demand (dynamic import) so the renderer stays out of the main
  bundle.
*/

const C = {
  ink: "#0a0a0a",
  body: "#2b2b2b",
  sub: "#6b6b6b",
  faint: "#9a9a9a",
  line: "#e6e6e6",
  panel: "#f7f7f7",
};

const s = StyleSheet.create({
  page: {
    paddingVertical: 56,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    color: C.ink,
    fontSize: 10,
    lineHeight: 1.5,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  topMeta: { fontSize: 8, letterSpacing: 1.6, color: C.sub, textTransform: "uppercase" },
  ruleInk: { height: 1.4, backgroundColor: C.ink, marginTop: 10 },

  coverCenter: { marginTop: 190 },
  company: {
    fontFamily: "Helvetica-Bold",
    fontSize: 40,
    lineHeight: 1.1,
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  tagline: { fontSize: 14, color: C.sub, maxWidth: 420, lineHeight: 1.5 },

  coverFooter: { position: "absolute", bottom: 56, left: 56, right: 56 },
  swatchRow: { flexDirection: "row" },
  swatchCell: { marginRight: 10 },
  swatch: { width: 58, height: 58, borderRadius: 5, borderWidth: 1, borderColor: C.line },
  swatchName: { marginTop: 6, fontSize: 7, color: C.sub, textTransform: "uppercase", letterSpacing: 0.6 },
  swatchHex: { fontSize: 7, color: C.faint, marginTop: 1 },
  coverByline: { marginTop: 22, fontSize: 8, color: C.faint, letterSpacing: 0.5 },

  kicker: { fontSize: 8, letterSpacing: 1.6, color: C.sub, textTransform: "uppercase" },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 23, marginTop: 7, letterSpacing: -0.4 },
  sectionRule: { height: 1, backgroundColor: C.line, marginTop: 16, marginBottom: 24 },

  block: { marginBottom: 24 },
  label: { fontSize: 8, letterSpacing: 1.1, color: C.faint, textTransform: "uppercase", marginBottom: 7 },
  body: { fontSize: 10.5, color: C.body, lineHeight: 1.6, maxWidth: 460 },

  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 11,
    fontSize: 9,
    color: "#333",
    marginRight: 6,
    marginBottom: 6,
  },

  listItem: { flexDirection: "row", marginBottom: 6, maxWidth: 460 },
  bullet: { width: 12, fontSize: 10, color: C.faint },
  listText: { flex: 1, fontSize: 10.5, color: C.body },

  twoCol: { flexDirection: "row" },
  col: { flex: 1, marginRight: 22 },

  card: { borderWidth: 1, borderColor: C.line, borderRadius: 9, padding: 16, marginBottom: 10 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontFamily: "Helvetica-Bold", fontSize: 12.5 },
  cardTag: { fontSize: 8, color: C.sub, textTransform: "uppercase", letterSpacing: 0.6 },
  fieldLabel: { fontSize: 7.5, letterSpacing: 0.8, color: C.faint, textTransform: "uppercase", marginTop: 8, marginBottom: 2 },
  fieldValue: { fontSize: 10, color: C.body, lineHeight: 1.5 },

  metricRow: { flexDirection: "row", marginBottom: 18 },
  metric: { flex: 1, marginRight: 18 },
  metricLabel: { fontSize: 7.5, letterSpacing: 0.8, color: C.faint, textTransform: "uppercase" },
  metricValue: { fontFamily: "Helvetica-Bold", fontSize: 13, marginTop: 4 },

  adSetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingVertical: 10,
  },

  pageNum: { position: "absolute", bottom: 30, right: 56, fontSize: 8, color: C.faint },
  footNote: { position: "absolute", bottom: 30, left: 56, fontSize: 8, color: C.faint, maxWidth: 380 },
});

function Header({ kicker, title }: { kicker: string; title: string }) {
  return (
    <View>
      <Text style={s.kicker}>{kicker}</Text>
      <Text style={s.h2}>{title}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <View style={s.listItem} key={i}>
          <Text style={s.bullet}>—</Text>
          <Text style={s.listText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export function BrandBookDocument({ plan, date }: { plan: AdPlan; date: string }) {
  const { brand, strategy, creatives, campaign } = plan;

  return (
    <Document
      title={`${brand.companyName} — Brand Book`}
      author="Avokado"
      subject="AI-generated brand book"
    >
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.topRow}>
          <Text style={s.topMeta}>Brand Book</Text>
          <Text style={s.topMeta}>{brand.domain}</Text>
        </View>
        <View style={s.ruleInk} />

        <View style={s.coverCenter}>
          <Text style={s.company}>{brand.companyName}</Text>
          <Text style={s.tagline}>{brand.tagline}</Text>
        </View>

        <View style={s.coverFooter}>
          <View style={s.swatchRow}>
            {brand.palette.map((c) => (
              <View style={s.swatchCell} key={c.name}>
                <View style={[s.swatch, { backgroundColor: c.hex }]} />
                <Text style={s.swatchName}>{c.name}</Text>
                <Text style={s.swatchHex}>{c.hex.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <Text style={s.coverByline}>Generated by Avokado · {date}</Text>
        </View>
      </Page>

      {/* Identity */}
      <Page size="A4" style={s.page}>
        <Header kicker="01 — Visual identity" title="The brand, distilled" />
        <View style={s.block}>
          <Text style={s.label}>Summary</Text>
          <Text style={s.body}>{brand.summary}</Text>
        </View>

        <View style={s.block}>
          <Text style={s.label}>Color palette</Text>
          <View style={s.swatchRow}>
            {brand.palette.map((c) => (
              <View style={s.swatchCell} key={c.name}>
                <View style={[s.swatch, { width: 76, height: 76, backgroundColor: c.hex }]} />
                <Text style={s.swatchName}>{c.name}</Text>
                <Text style={s.swatchHex}>{c.hex.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.label}>Voice &amp; tone</Text>
            <View style={s.chipRow}>
              {brand.voice.map((v) => (
                <Text style={s.chip} key={v}>
                  {v}
                </Text>
              ))}
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.label}>Value props</Text>
            <Bullets items={brand.valueProps} />
          </View>
        </View>

        <Text style={s.pageNum}>02</Text>
      </Page>

      {/* Audience */}
      <Page size="A4" style={s.page}>
        <Header kicker="02 — Positioning" title="Who we reach, and what we say" />
        <View style={s.block}>
          <Text style={s.label}>Primary audiences</Text>
          <Bullets items={brand.audience} />
        </View>
        {brand.keywords.length > 0 && (
          <View style={s.block}>
            <Text style={s.label}>Themes &amp; keywords</Text>
            <View style={s.chipRow}>
              {brand.keywords.map((k) => (
                <Text style={s.chip} key={k}>
                  {k}
                </Text>
              ))}
            </View>
          </View>
        )}
        <Text style={s.pageNum}>03</Text>
      </Page>

      {/* Strategy */}
      <Page size="A4" style={s.page}>
        <Header kicker="03 — Ad strategy" title="How we'll win attention" />
        <View style={s.metricRow}>
          <View style={s.metric}>
            <Text style={s.metricLabel}>Objective</Text>
            <Text style={s.metricValue}>{strategy.objective}</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricLabel}>Daily budget</Text>
            <Text style={s.metricValue}>
              €{strategy.dailyBudget} / day
            </Text>
          </View>
        </View>
        <View style={s.block}>
          <Text style={s.label}>Testing plan</Text>
          <Text style={s.body}>{strategy.testingPlan}</Text>
        </View>
        {strategy.angles.map((a, i) => (
          <View style={s.card} key={a.title}>
            <View style={s.cardHead}>
              <Text style={s.cardTitle}>{a.title}</Text>
              <Text style={s.cardTag}>Angle {i + 1}</Text>
            </View>
            <Text style={s.fieldValue}>“{a.hook}”</Text>
            <Text style={s.fieldLabel}>Audience</Text>
            <Text style={s.fieldValue}>{a.audience}</Text>
          </View>
        ))}
        <Text style={s.pageNum}>04</Text>
      </Page>

      {/* Creative */}
      <Page size="A4" style={s.page}>
        <Header kicker="04 — Ad creative" title="Concepts, ready for review" />
        {creatives.map((c) => (
          <View style={s.card} key={c.name}>
            <View style={s.cardHead}>
              <Text style={s.cardTitle}>{c.name}</Text>
              <Text style={s.cardTag}>{c.format}</Text>
            </View>
            <Text style={s.fieldLabel}>Primary text</Text>
            <Text style={s.fieldValue}>{c.primaryText}</Text>
            <Text style={s.fieldLabel}>Headline</Text>
            <Text style={s.fieldValue}>{c.headline}</Text>
            <Text style={s.fieldLabel}>Call to action</Text>
            <Text style={s.fieldValue}>{c.cta}</Text>
          </View>
        ))}
        <Text style={s.pageNum}>05</Text>
      </Page>

      {/* Campaign */}
      <Page size="A4" style={s.page}>
        <Header kicker="05 — Campaign" title="Ready to launch, as a draft" />
        <View style={s.metricRow}>
          <View style={s.metric}>
            <Text style={s.metricLabel}>Campaign</Text>
            <Text style={s.metricValue}>{campaign.name}</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricLabel}>Daily budget</Text>
            <Text style={s.metricValue}>€{campaign.dailyBudget} / day</Text>
          </View>
        </View>
        <Text style={s.label}>Ad sets</Text>
        <View>
          {campaign.adSets.map((set) => (
            <View style={s.adSetRow} key={set.name}>
              <View>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>{set.name}</Text>
                <Text style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{set.audience}</Text>
              </View>
              <Text style={{ fontSize: 9, color: C.sub }}>
                {set.optimization} · {set.ads} ads
              </Text>
            </View>
          ))}
        </View>
        <Text style={s.footNote}>
          Status: {campaign.status}. Nothing is launched. Campaigns are created
          paused in Meta and never go live without explicit approval.
        </Text>
        <Text style={s.pageNum}>06</Text>
      </Page>
    </Document>
  );
}

/** Render the brand book to a PDF Blob (client-side, on demand). */
export async function renderBrandBookBlob(plan: AdPlan, date: string): Promise<Blob> {
  return pdf(<BrandBookDocument plan={plan} date={date} />).toBlob();
}

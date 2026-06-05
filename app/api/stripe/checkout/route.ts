import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { HUMAN_HELP, HUMAN_HELP_PRICE_EUR } from "@/lib/constants";

/**
 * Creates a Stripe Checkout Session for the one-time €500 specialist handoff.
 * Real Stripe (test mode) using STRIPE_SECRET_KEY. The session is `payment`
 * mode in EUR. Marking the conversation paid happens on the success return
 * (and should be confirmed by a webhook in production — STRIPE_WEBHOOK_SECRET).
 */
export async function POST(request: Request) {
  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
      { status: 400 },
    );
  }

  let body: { workspaceId?: string; uid?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.workspaceId || !body.uid) {
    return NextResponse.json(
      { error: "Missing workspace context." },
      { status: 400 },
    );
  }

  const origin =
    request.headers.get("origin") ?? env.NEXT_PUBLIC_APP_URL;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: HUMAN_HELP_PRICE_EUR * 100,
            product_data: {
              name: HUMAN_HELP.name,
              description:
                "One-time senior specialist review and launch help for your Avokado workspace.",
            },
          },
        },
      ],
      success_url: `${origin}/help?paid=1`,
      cancel_url: `${origin}/help?canceled=1`,
      metadata: { workspaceId: body.workspaceId, uid: body.uid, kind: "human_help" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

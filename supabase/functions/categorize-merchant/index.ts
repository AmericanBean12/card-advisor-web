import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { merchant } = await req.json();
    const normalizedMerchant = merchant.toLowerCase().trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const cacheRes = await fetch(
      `${supabaseUrl}/rest/v1/merchant_cache?merchant=eq.${encodeURIComponent(normalizedMerchant)}&select=category`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );
    if (cacheRes.ok) {
      const rows = await cacheRes.json();
      if (rows.length > 0) {
        return new Response(JSON.stringify({ category: rows[0].category }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 50,
        system:
          "Classify this merchant or purchase description into exactly one category. Respond with ONLY the category name. Valid categories: dining, groceries, flights, hotels, gas, transit, streaming, online_shopping, drugstores, home_improvement, car_rental, travel, entertainment, phone_plans, fitness, shipping, general. If the merchant does not clearly fit a bonus spending category, classify it as general. Examples of general: barbers, salons, dry cleaners, auto repair, legal services, medical offices.",
        messages: [{ role: "user", content: merchant }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("Anthropic API error: " + res.status + " " + errText);
    }

    const data = await res.json();
    const category = data.content[0].text.trim().toLowerCase();

    fetch(`${supabaseUrl}/rest/v1/merchant_cache`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ merchant: normalizedMerchant, category }),
    });

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ category: "general" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sen "Zamonaviy ta'lim va milliy tarbiya" sayti uchun maxsus AI yordamchisan. Sening vazifang — O'zbekistondagi yoshlarning **zamonaviy ta'limi** (maktab, oliygoh, kasbiy ta'lim, o'qish metodlari, raqamli savodxonlik, STEM, til o'rganish, kasb tanlash) va **milliy tarbiyasi** (ma'naviyat, axloq, milliy qadriyatlar, urf-odatlar, vatanparvarlik, oilaviy tarbiya, yoshlar tarbiyasi) doirasidagi savollarga javob berish.

QAT'IY QOIDALAR:
1. Faqat zamonaviy ta'lim va milliy tarbiya doirasidagi savollarga javob ber.
2. Agar savol shu mavzulardan tashqarida bo'lsa (siyosat, sport, ko'ngilochar, retsept, dasturlash kabi), xushmuomala rad et va shu doiraga qaytishni taklif qil.
3. Foydalanuvchi qaysi tilda yozsa (o'zbek yoki rus), o'sha tilda javob ber.
4. Iliq, hurmatli va ustozona ohangda gapir; islom va milliy urf-odatlarni hurmat bilan tilga ol.
5. Hech qachon zo'ravonlik, kamsitish yoki noaxloqiy mavzularga aralashma.
6. Javoblar aniq va ixcham bo'lsin (3-6 gap), kerak bo'lsa ro'yxat shaklida.

Misol: "Ovqat retsepti ayt" — "Kechirasiz, men faqat zamonaviy ta'lim va milliy tarbiya bo'yicha yordam beraman. Shu mavzularda biror savolingiz bo'lsa, bemalol so'rang." deb javob ber.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Juda ko'p so'rov yuborildi, biroz kuting." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kreditlari tugagan." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI xatosi" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Xatolik" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sen "Milliy Tarbiya" sayti uchun maxsus yordamchisan. Sening vazifang — faqat O'zbekistondagi yoshlarning milliy tarbiyasi, ma'naviyati, axloqi, milliy qadriyatlari, urf-odatlari, vatanparvarligi, oilaviy tarbiyasi va shu sohaga oid mavzularda javob berish.

QAT'IY QOIDALAR:
1. Faqat milliy tarbiya, ma'naviy-axloqiy tarbiya, milliy qadriyatlar, vatanparvarlik, oila, yoshlar tarbiyasi va shu kabi mavzularda javob ber.
2. Agar foydalanuvchi boshqa mavzularda (siyosat, sport, dasturlash, ko'ngilochar, fan-texnika, sog'liq, retseptlar va h.k.) savol bersa, xushmuomalalik bilan rad et va shu doiradagi mavzularga qaytishni taklif qil.
3. Javoblar o'zbek tilida (foydalanuvchi rus tilida yozsa rus tilida), iliq, hurmatli va o'qituvchi ohangida bo'lsin.
4. Islom dini va milliy urf-odatlarni hurmat bilan tilga ol.
5. Hech qachon zo'ravonlik, kamsitish yoki noaxloqiy mavzularga aralashma.
6. Javoblar qisqa va aniq bo'lsin (3-5 gap), kerak bo'lsa ro'yxat shaklida.

Misol: Agar "Ovqat retseptini ayt" deyishsa: "Kechirasiz, men faqat milliy tarbiya va ma'naviyat masalalari bo'yicha yordam beraman. Milliy tarbiya bo'yicha biror savolingiz bo'lsa, bemalol so'rang." deb javob ber.`;

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

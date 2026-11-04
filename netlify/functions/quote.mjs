export default async (request) => {
  const key = Netlify.env.get("TWELVE_DATA_API_KEY");
  if (!key) return new Response(JSON.stringify({error:"لم يتم إعداد مفتاح Twelve Data في إعدادات الخادم."}), {
    status:503, headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}
  });
  const url = new URL(request.url);
  const symbol = (url.searchParams.get("symbol") || "").trim().toUpperCase();
  if (!/^[A-Z0-9.:-]{1,20}$/.test(symbol)) return new Response(JSON.stringify({error:"رمز السهم غير صالح."}), {
    status:400, headers:{"content-type":"application/json; charset=utf-8"}
  });
  const upstream = new URL("https://api.twelvedata.com/quote");
  upstream.searchParams.set("symbol", symbol);
  upstream.searchParams.set("apikey", key);
  try {
    const res = await fetch(upstream, {headers:{"accept":"application/json"}});
    const raw = await res.json();
    if (!res.ok || raw.status === "error" || raw.code) return new Response(JSON.stringify({
      error:raw.message || "لم تتوفر بيانات لهذا الرمز ضمن خطتك."
    }), {status:502, headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
    return new Response(JSON.stringify({
      symbol:raw.symbol || symbol, name:raw.name || raw.symbol || symbol,
      exchange:raw.exchange || "", currency:raw.currency || "",
      datetime:raw.datetime || "", close:raw.close || ""
    }), {status:200, headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=60"}});
  } catch {
    return new Response(JSON.stringify({error:"تعذر الاتصال بمزود البيانات. حاول لاحقاً."}), {
      status:502, headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}
    });
  }
};

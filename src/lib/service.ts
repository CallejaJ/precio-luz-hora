export interface PriceInfo {
  date: string;
  hour: string;
  is_cheap: boolean;
  is_under_avg: boolean;
  market: string;
  price: number;
  units: string;
}

/**
 * Fetches today's hourly PVPC electricity prices from the official REE (Red Eléctrica de España) API.
 * Docs: https://www.ree.es/es/datos/apidatos
 * Returns null if the API is unreachable.
 */
export async function getPrices(): Promise<PriceInfo[] | null> {
  // Use Spain timezone (Europe/Madrid = CET UTC+1 / CEST UTC+2) to get the correct date
  const todayInSpain = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Madrid",
  }); // "YYYY-MM-DD"
  const startDate = `${todayInSpain}T00:00`;
  const endDate = `${todayInSpain}T23:59`;

  try {
    // API oficial de Red Eléctrica de España (REE / Redeia)
    const url = `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=${startDate}&end_date=${endDate}&time_trunc=hour&geo_trunc=electric_system&geo_limit=peninsular&geo_ids=8741`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Host: "apidatos.ree.es",
      },
    });

    if (!response.ok) throw new Error(`REE API error: ${response.status}`);

    const json = await response.json();
    // El primer indicador (PVPC spot) está en included[0].attributes.values
    const pvpcIndicator = json?.included?.[0];
    if (!pvpcIndicator) throw new Error("No data in REE API response");

    const values: { value: number; datetime: string }[] =
      pvpcIndicator.attributes.values;
    const prices = values.map((v) => {
      const dt = new Date(v.datetime);
      const h = dt.getHours();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const priceKwh = v.value / 1000; // REE devuelve €/MWh => convertir a €/kWh
      return {
        date: new Date().toLocaleDateString("es-ES", {
          timeZone: "Europe/Madrid",
        }),
        hour: `${pad(h)}-${pad(h + 1)}`,
        is_cheap: false,
        is_under_avg: false,
        market: "PVPC",
        price: priceKwh,
        units: "€/kWh",
      };
    });

    // Calculamos umbrales para is_cheap / is_under_avg
    const avg = prices.reduce((s, p) => s + p.price, 0) / prices.length;
    const sorted = [...prices].map((p) => p.price).sort((a, b) => a - b);
    const lowThreshold = sorted[Math.floor(sorted.length * 0.33)];
    return prices.map((p) => ({
      ...p,
      is_cheap: p.price <= lowThreshold,
      is_under_avg: p.price < avg,
    }));
  } catch (error) {
    console.warn("⚠️ API de REE no disponible.", error);
    return null;
  }
}

/**
 * Returns historical monthly average prices.
 * In a full implementation, this would also call the REE API with time_trunc=month.
 */
export async function getMonthlyPrices(): Promise<
  { month: string; price: number }[]
> {
  return [
    { month: "Feb 25", price: 0.1757 },
    { month: "Mar 25", price: 0.1231 },
    { month: "Abr 25", price: 0.1085 },
    { month: "May 25", price: 0.1132 },
    { month: "Jun 25", price: 0.1341 },
    { month: "Jul 25", price: 0.1372 },
    { month: "Ago 25", price: 0.1334 },
    { month: "Sep 25", price: 0.1381 },
    { month: "Oct 25", price: 0.1465 },
    { month: "Nov 25", price: 0.1356 },
    { month: "Dic 25", price: 0.1478 },
    { month: "Ene 26", price: 0.1392 },
    { month: "Feb 26", price: 0.1184 },
  ];
}

export function getCurrentPrice(prices: PriceInfo[]) {
  // Use Spain timezone to get the correct current hour
  const currentHour = parseInt(
    new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      hour12: false,
    }),
    10,
  );
  const pad = (n: number) => n.toString().padStart(2, "0");
  const hourString = `${pad(currentHour)}-${pad(currentHour + 1)}`;
  return prices.find((p) => p.hour === hourString) || prices[0];
}

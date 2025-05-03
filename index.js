import fetch from 'node-fetch';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const stazioni = [
  { stationId: "ICOSEN11", lat: 38.905, lon: 16.587, apiKey: "03d402e1e8844ac49402e1e8844ac419" },
  { stationId: "IAMANT6", lat: 39.143, lon: 16.062, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICELIC1", lat: 38.873, lon: 16.683, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICOSEN20", lat: 38.898, lon: 16.556, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "IMENDI13", lat: 38.85, lon: 16.464, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICASAL40", lat: 38.993, lon: 16.62, apiKey: "b368cd08174d424fa8cd08174d424f20" },
  { stationId: "CATCENTRO", lat: 38.91, lon: 16.59 },
  { stationId: "REGCENTRO", lat: 38.11, lon: 15.65 },
  { stationId: "ROSSCENTRO", lat: 39.58, lon: 16.63 },
  { stationId: "VIBOPORO", lat: 38.63, lon: 16.05 },
  { stationId: "LOCRIMARINA", lat: 38.25, lon: 16.26 },
  { stationId: "SGFIORE", lat: 39.26, lon: 16.68 },
  { stationId: "CROPOR", lat: 39.08, lon: 17.12 },
  { stationId: "LAMSANTEUF", lat: 38.91, lon: 16.24 },
  { stationId: "SCALEACENTRO", lat: 39.81, lon: 15.79 },
  { stationId: "TAVSILAPIC", lat: 39.02, lon: 16.68 },
  { stationId: "ISOCAPORIZ", lat: 38.96, lon: 17.09 },
  { stationId: "CIROMARINA", lat: 39.37, lon: 17.12 },
  { stationId: "CARIATI", lat: 39.5, lon: 16.96 },
  { stationId: "PETILIA", lat: 39.13, lon: 16.77 },
  { stationId: "TROPEA", lat: 38.68, lon: 15.9 },
  { stationId: "GERACE", lat: 38.27, lon: 16.23 },
  { stationId: "SPEZSILA", lat: 39.33, lon: 16.38 },
  { stationId: "PAOLA", lat: 39.37, lon: 16.03 },
  { stationId: "BELVEDERE", lat: 39.61, lon: 15.86 },
  { stationId: "MORMANNO", lat: 39.92, lon: 15.97 },
  { stationId: "SOVERATO", lat: 38.68, lon: 16.54 },
  { stationId: "PALMI", lat: 38.36, lon: 15.85 },
  { stationId: "SERRASTRETTA", lat: 39.01, lon: 16.4 },
  { stationId: "SSSEVERINA", lat: 39.21, lon: 16.97 },
  { stationId: "BADO_MARINA", lat: 38.6, lon: 16.55 },
  { stationId: "DELIANUOVA", lat: 38.2, lon: 15.88 }
];

async function salvaOsservazione(stationId, latitudine, longitudine, temperatura, umidita, pioggia, raffica) {
  try {
    const dati = {
      stationId,
      latitudine,
      longitudine,
      temperatura,
      umidita,
      pioggia,
      raffica,
      timestamp: Timestamp.now()
    };
    Object.keys(dati).forEach(k => dati[k] === undefined && delete dati[k]);
    await db.collection("osservazioni").add(dati);
    console.log(`Salvato per ${stationId}`);
  } catch (e) {
    console.error(`Errore salvataggio ${stationId}:`, e.message);
  }
}

async function fetchEInserisci() {
  for (const s of stazioni) {
    try {
      const om = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`);
      if (!om.ok) throw new Error("Fetch Open-Meteo fallita");
      const omData = await om.json();
      const o = omData.current;
      if (o?.temperature_2m != null) {
        await salvaOsservazione(s.stationId, s.lat, s.lon, o.temperature_2m, o.relative_humidity_2m, o.precipitation, o.wind_speed_10m);
      }

      if (s.apiKey) {
        const wc = await fetch(`https://api.weather.com/v2/pws/observations/current?stationId=${s.stationId}&format=json&units=m&apiKey=${s.apiKey}`);
        const raw = await wc.text();
        if (!raw.startsWith("{")) return;
        const wcData = JSON.parse(raw);
        const d = wcData.observations?.[0];
        if (d?.metric?.temp != null) {
          await salvaOsservazione(s.stationId, s.lat, s.lon, d.metric.temp, d.humidity, d.metric.precipTotal, d.windGust);
        }
      }
    } catch (err) {
      console.error("Errore per", s.stationId, ":", err.message);
    }
  }
}

console.log("Script meteo attivo:", new Date().toISOString());
fetchEInserisci();

setInterval(() => {
  console.log("Aggiornamento ogni 10 minuti:", new Date().toISOString());
  fetchEInserisci();
}, 10 * 60 * 1000);

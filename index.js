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
  { stationId: "CATCENTRO", lat: 38.91, lon: 16.59, openMeteo: true },
  { stationId: "REGCENTRO", lat: 38.11, lon: 15.65, openMeteo: true },
  { stationId: "ROSSCENTRO", lat: 39.58, lon: 16.63, openMeteo: true },
  { stationId: "VIBOPORO", lat: 38.63, lon: 16.05, openMeteo: true },
  { stationId: "LOCRIMARINA", lat: 38.25, lon: 16.26, openMeteo: true },
  { stationId: "SGFIORE", lat: 39.26, lon: 16.68, openMeteo: true },
  { stationId: "CROPOR", lat: 39.08, lon: 17.12, openMeteo: true },
  { stationId: "LAMSANTEUF", lat: 38.91, lon: 16.24, openMeteo: true },
  { stationId: "SCALEACENTRO", lat: 39.81, lon: 15.79, openMeteo: true },
  { stationId: "TAVSILAPIC", lat: 39.02, lon: 16.68, openMeteo: true },
  { stationId: "ISOCAPORIZ", lat: 38.96, lon: 17.09, openMeteo: true },
  { stationId: "CIROMARINA", lat: 39.37, lon: 17.12, openMeteo: true },
  { stationId: "CARIATI", lat: 39.5, lon: 16.96, openMeteo: true },
  { stationId: "PETILIA", lat: 39.13, lon: 16.77, openMeteo: true },
  { stationId: "TROPEA", lat: 38.68, lon: 15.9, openMeteo: true },
  { stationId: "GERACE", lat: 38.27, lon: 16.23, openMeteo: true },
  { stationId: "SPEZSILA", lat: 39.33, lon: 16.38, openMeteo: true },
  { stationId: "PAOLA", lat: 39.37, lon: 16.03, openMeteo: true },
  { stationId: "BELVEDERE", lat: 39.61, lon: 15.86, openMeteo: true },
  { stationId: "MORMANNO", lat: 39.92, lon: 15.97, openMeteo: true },
  { stationId: "SOVERATO", lat: 38.68, lon: 16.54, openMeteo: true },
  { stationId: "PALMI", lat: 38.36, lon: 15.85, openMeteo: true },
  { stationId: "SERRASTRETTA", lat: 39.01, lon: 16.4, openMeteo: true },
  { stationId: "SSSEVERINA", lat: 39.21, lon: 16.97, openMeteo: true },
  { stationId: "BADO_MARINA", lat: 38.6, lon: 16.55, openMeteo: true },
  { stationId: "DELIANUOVA", lat: 38.2, lon: 15.88, openMeteo: true },
  { stationId: "MONGIANA", lat: 38.505, lon: 16.317, openMeteo: true },
  { stationId: "FABRIZIA", lat: 38.46, lon: 16.35, openMeteo: true },
  { stationId: "NARDODIPACE", lat: 38.468, lon: 16.319, openMeteo: true },
  { stationId: "POLISTENA", lat: 38.417, lon: 16.083, openMeteo: true },
  { stationId: "NATOLI_NUOVO", lat: 38.548, lon: 15.94, openMeteo: true },
  { stationId: "CITTANOVA", lat: 38.361, lon: 16.081, openMeteo: true },
  { stationId: "ZUNGRI", lat: 38.634, lon: 15.969, openMeteo: true },
  { stationId: "SPILINGA", lat: 38.621, lon: 15.943, openMeteo: true },
  { stationId: "PIZZO", lat: 38.738, lon: 16.166, openMeteo: true },
  { stationId: "MONTEROSSO", lat: 38.649, lon: 16.195, openMeteo: true },
  { stationId: "REGCENTRO", lat: 38.114, lon: 15.651, openMeteo: true },
  { stationId: "ROSSCENTRO", lat: 39.582, lon: 16.636, openMeteo: true },
  { stationId: "VIBOPORO", lat: 38.622, lon: 16.005, openMeteo: true },
  { stationId: "LOCRIMARINA", lat: 38.239, lon: 16.258, openMeteo: true },
  { stationId: "SANGIOVANNI", lat: 39.261, lon: 16.694, openMeteo: true }
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
    if (s.apiKey) {
      try {
        console.log(`Weather.com â ${s.stationId}`);
        const wc = await fetch(`https://api.weather.com/v2/pws/observations/current?stationId=${s.stationId}&format=json&units=m&apiKey=${s.apiKey}`);
        const raw = await wc.text();
        if (!raw.startsWith("{")) throw new Error("Risposta non valida da Weather.com");
        const wcData = JSON.parse(raw);
        const d = wcData.observations?.[0];
        if (d?.metric?.temp != null) {
          await salvaOsservazione(s.stationId, s.lat, s.lon, d.metric.temp, d.humidity, d.metric.precipTotal, d.windGust);
        }
      } catch (err) {
        console.error(`Errore Weather.com ${s.stationId}:`, err.message);
      }
    } else {
      try {
        console.log(`OpenMeteo â ${s.stationId}`);
        const om = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`);
        const omData = await om.json();
        const o = omData.current;
        if (o?.temperature_2m != null) {
          await salvaOsservazione(s.stationId, s.lat, s.lon, o.temperature_2m, o.relative_humidity_2m, o.precipitation, o.wind_speed_10m);
        }
      } catch (err) {
        console.error(`Errore OpenMeteo ${s.stationId}:`, err.message);
      }
    }
  }
}

console.log("Script meteo attivo:", new Date().toISOString());
fetchEInserisci();

setInterval(() => {
  console.log("Aggiornamento ogni 10 minuti:", new Date().toISOString());
  fetchEInserisci();
}, 10 * 60 * 1000);

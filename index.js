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
  { stationId: "CARIATI", lat: 39.5, lon: 16.96 },
  { stationId: "PAOLA", lat: 39.37, lon: 16.03 }
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
    // --- OpenMeteo ---
    try {
      console.log(`Contatto OpenMeteo per ${s.stationId}...`);
      const om = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`);
      const omData = await om.json();
      const o = omData.current;
      if (o?.temperature_2m != null) {
        await salvaOsservazione(s.stationId, s.lat, s.lon, o.temperature_2m, o.relative_humidity_2m, o.precipitation, o.wind_speed_10m);
        console.log(`Salvato per ${s.stationId} (OpenMeteo)`);
      } else {
        console.warn(`Dati mancanti da OpenMeteo per ${s.stationId}`);
      }
    } catch (err) {
      console.error(`Errore OpenMeteo per ${s.stationId}: ${err.message}`);
    }

    // --- Weather Underground ---
    if (s.apiKey) {
      try {
        console.log(`Contatto Weather.com per ${s.stationId}...`);
        const wc = await fetch(`https://api.weather.com/v2/pws/observations/current?stationId=${s.stationId}&format=json&units=m&apiKey=${s.apiKey}`);
        const raw = await wc.text();
        if (!raw.startsWith("{")) throw new Error("Risposta non valida da Weather.com");
        const wcData = JSON.parse(raw);
        const d = wcData.observations?.[0];
        if (d?.metric?.temp != null) {
          await salvaOsservazione(s.stationId, s.lat, s.lon, d.metric.temp, d.humidity, d.metric.precipTotal, d.windGust);
          console.log(`Salvato per ${s.stationId} (Weather.com)`);
        } else {
          console.warn(`Dati incompleti da Weather.com per ${s.stationId}`);
        }
      } catch (err) {
        console.error(`Errore Weather.com per ${s.stationId}: ${err.message}`);
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

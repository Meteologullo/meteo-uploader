import fetch from 'node-fetch';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Inizializza Firebase
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const stazioni = [
  { stationId: "ICOSEN11", lat: 38.905, lon: 16.587, apiKey: "03d402e1e8844ac49402e1e8844ac419" },
  { stationId: "IAMANT6", lat: 39.143, lon: 16.062, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICELIC1", lat: 38.873, lon: 16.683, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICOSEN20", lat: 38.898, lon: 16.556, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "IMENDI13", lat: 38.850, lon: 16.464, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICASAL40", lat: 38.993, lon: 16.620, apiKey: "b368cd08174d424fa8cd08174d424f20" }
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
    console.log(`Salvato per ${stationId}: ${temperatura}Â°C`);
  } catch (e) {
    console.error("Errore salvataggio:", e);
  }
}

async function fetchEInserisci() {
  for (const s of stazioni) {
    try {
      // Open-Meteo
      const om = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`);
      const omData = await om.json();
      const omObs = omData.current;
      if (omObs) {
        await salvaOsservazione(s.stationId, s.lat, s.lon, omObs.temperature_2m, omObs.relative_humidity_2m, omObs.precipitation, omObs.wind_speed_10m);
      }

      // Weather.com
      if (s.apiKey) {
        const wc = await fetch(`https://api.weather.com/v2/pws/observations/current?stationId=${s.stationId}&format=json&units=m&apiKey=${s.apiKey}`);
        const wcData = await wc.json();
        const wcObs = wcData.observations?.[0];
        if (wcObs) {
          await salvaOsservazione(s.stationId, s.lat, s.lon, wcObs.metric.temp, wcObs.humidity, wcObs.metric.precipTotal, wcObs.windGust);
        }
      }
    } catch (err) {
      console.error("Errore per", s.stationId, err);
    }
  }
}

// Avvia subito all'avvio
console.log("Script meteo avviato:", new Date().toISOString());
fetchEInserisci();

// Esegui ogni 10 minuti
setInterval(() => {
  console.log("Esecuzione ogni 10 minuti:", new Date().toISOString());
  fetchEInserisci();
}, 10 * 60 * 1000);

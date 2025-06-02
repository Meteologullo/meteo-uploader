import fetch from 'node-fetch';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const stazioni = [
  { stationId: "ICOSEN11", lat: 38.905, lon: 16.587, apiKey: "03d402e1e8844ac49402e1e8844ac419" },
  { stationId: "IAMANT7", lat: 39.143, lon: 16.062, apiKey: "a3f4ae4f9b6d46a4b4ae4f9b6d06a494" },
  { stationId: "ICELIC3", lat: 38.873, lon: 16.683, apiKey: "2d12def7f4894eca92def7f4892eca99" },
  { stationId: "ICOSEN20", lat: 38.898, lon: 16.556, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "IMENDI13", lat: 38.85, lon: 16.464, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICASAL40", lat: 38.993, lon: 16.62, apiKey: "b368cd08174d424fa8cd08174d424f20" },
  { stationId: "IBIANC4", lat: 39.11, lon: 16., apiKey: "2ccb91c2398a4f778b91c2398a4f772f" }
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
  {"stationId": "AFRICO_NUOVO", "lat": 38.0167, "lon": 16.1333, "openMeteo": true},
  {"stationId": "BRANCALEONE", "lat": 37.95, "lon": 16.0833, "openMeteo": true},
  {"stationId": "PELLARO", "lat": 38.01, "lon": 15.633, "openMeteo": true},
  {"stationId": "SIBARI", "lat": 39.6833, "lon": 16.5333, "openMeteo": true},
  {"stationId": "VILLAPIANA", "lat": 39.8167, "lon": 16.5167, "openMeteo": true},
  {"stationId": "MELITO_DI_PORTO_SALVO", "lat": 37.9167, "lon": 15.7333, "openMeteo": true},
  {"stationId": "SANTA_CATERINA_DELLO_IONIO", "lat": 38.55, "lon": 16.5667, "openMeteo": true},
  {"stationId": "VILLA_SAN_GIOVANNI", "lat": 38.2131, "lon": 15.6414, "openMeteo": true},
  {"stationId": "CAPO_VATICANO", "lat": 38.6278, "lon": 15.8415, "openMeteo": true},
  {"stationId": "TARSIA", "lat": 39.58, "lon": 16.3167, "openMeteo": true},
  {"stationId": "BOVALINO", "lat": 38.15, "lon": 16.2, "openMeteo": true},
  {"stationId": "CAPOCOLONNA", "lat": 39.0167, "lon": 17.1333, "openMeteo": true},
  {"stationId": "MONASTERACE_MARINA", "lat": 38.4333, "lon": 16.5333, "openMeteo": true},
  {"stationId": "SAN_LUCA", "lat": 38.1333, "lon": 16.0833, "openMeteo": true},
  {"stationId": "TREBISACCE", "lat": 39.85, "lon": 16.5333, "openMeteo": true},
  {"stationId": "SANSOSTI", "lat": 39.6167, "lon": 16.05, "openMeteo": true},
  {"stationId": "MONGRASSANO_SCALO", "lat": 39.538, "lon": 16.264, "openMeteo": true},
  {"stationId": "MARINA_DI_STRONGOLI", "lat": 39.3, "lon": 17.1167, "openMeteo": true},
  {"stationId": "CUTRO", "lat": 39.0167, "lon": 17.0833, "openMeteo": true},
  {"stationId": "TORRETTA_DI_CRUCOLI", "lat": 39.4167, "lon": 17.0333, "openMeteo": true},
  {"stationId": "ACERENTHIA_CAMIGLIANO", "lat": 39.2667, "lon": 17.0, "openMeteo": true},
  {"stationId": "CASTROVILLARI", "lat": 39.8167, "lon": 16.2, "openMeteo": true},
  {"stationId": "ACRI", "lat": 39.5, "lon": 16.3833, "openMeteo": true},
  {"stationId": "ROCCAFORTE_DEL_GRECO", "lat": 38.0167, "lon": 15.85, "openMeteo": true},
  {"stationId": "MONTALTO_UFFUGO", "lat": 39.4165, "lon": 16.1985, "openMeteo": true},
  {"stationId": "ROSETO_CAPO_SPULICO", "lat": 39.9667, "lon": 16.5833, "openMeteo": true},
  {"stationId": "VIBO_VALENTIA", "lat": 38.6749, "lon": 16.1027, "openMeteo": true},
  {"stationId": "TORANO_SCALO", "lat": 39.516, "lon": 16.255, "openMeteo": true},
  {"stationId": "ALTOMONTE", "lat": 39.7, "lon": 16.1333, "openMeteo": true},
  {"stationId": "DALTOLIA", "lat": 39.033, "lon": 16.388, "openMeteo": true},
  {"stationId": "MONTEROSSO_CALABRO", "lat": 38.6333, "lon": 16.2667, "openMeteo": true},
  {"stationId": "ROGLIANO", "lat": 39.1581, "lon": 16.3723, "openMeteo": true},
  {"stationId": "GIOIA_TAURO", "lat": 38.4236, "lon": 15.8996, "openMeteo": true},
  {"stationId": "ROSARNO", "lat": 38.4886, "lon": 15.9738, "openMeteo": true},
  {"stationId": "CAMILGIATELLO_SILANO", "lat": 39.3306, "lon": 16.4492, "openMeteo": true},
  {"stationId": "MONTE_CURCIO", "lat": 39.317, "lon": 16.4689, "openMeteo": true},
  {"stationId": "BOTTE_DONATO", "lat": 39.2833, "lon": 16.5667, "openMeteo": true},
  {"stationId": "RENDE", "lat": 39.3306, "lon": 16.2078, "openMeteo": true},
  {"stationId": "GIRIFALCO", "lat": 38.8, "lon": 16.4167, "openMeteo": true},
  { stationId: "SANGIOVANNI", lat: 39.261, lon: 16.694, openMeteo: true },
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
        console.log(`Weather.com ÃÂ¢ÃÂÃÂ ${s.stationId}`);
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
        console.log(`OpenMeteo ÃÂ¢ÃÂÃÂ ${s.stationId}`);
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

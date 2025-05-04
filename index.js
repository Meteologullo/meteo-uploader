import fetch from 'node-fetch';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const stazioni = [
  {"ID_stazione": "ICOSEN11", "lat": 38.905, "lone": 16.587, "chiave_API": "03d402e1e8844ac49402e1e8844ac419"},
  {"ID_stazione": "IAMANT6", "lat": 39.143, "lone": 16.062, "chiave_API": "844d02e7e12049ef8d02e7e120b9ef68"},
  {"ID_stazione": "ICELIC1", "lat": 38.873, "lone": 16.683, "chiave_API": "844d02e7e12049ef8d02e7e120b9ef68"},
  {"ID_stazione": "ICOSEN20", "lat": 38.898, "lone": 16.556, "chiave_API": "844d02e7e12049ef8d02e7e120b9ef68"},
  {"ID_stazione": "IMENDI13", "lat": 38.85, "lone": 16.464, "chiave_API": "844d02e7e12049ef8d02e7e120b9ef68"},
  {"ID_stazione": "ICASAL40", "lat": 38.993, "lone": 16.62, "chiave_API": "b368cd08174d424fa8cd08174d424f20"},
  {"ID_stazione": "CATCENTRO", "lat": 38.91, "lone": 16.59, "openMeteo": true},
  {"ID_stazione": "REGCENTRO", "lat": 38.11, "lone": 15.65, "openMeteo": true},
  {"ID_stazione": "ROSSCENTRO", "lat": 39.58, "lone": 16.63, "openMeteo": true},
  {"ID_stazione": "VIBOPORO", "lat": 38.63, "lone": 16.05, "openMeteo": true},
  {"ID_stazione": "LOCRIMARINA", "lat": 38.25, "lone": 16.26, "openMeteo": true},
  {"ID_stazione": "SGFIORE", "lat": 39.26, "lone": 16.68, "openMeteo": true},
  {"ID_stazione": "CROPOR", "lat": 39.08, "lone": 17.12, "openMeteo": true},
  {"ID_stazione": "LAMSANTEUF", "lat": 38.91, "lone": 16.24, "openMeteo": true},
  {"ID_stazione": "SCALEACENTRO", "lat": 39.81, "lone": 15.79, "openMeteo": true},
  {"ID_stazione": "TAVSILAPIC", "lat": 39.02, "lone": 16.68, "openMeteo": true},
  {"ID_stazione": "ISOCAPORIZ", "lat": 38.96, "lone": 17.09, "openMeteo": true},
  {"ID_stazione": "CIROMARINA", "lat": 39.37, "lone": 17.12, "openMeteo": true},
  {"ID_stazione": "CARIATI", "lat": 39.5, "lone": 16.96, "openMeteo": true},
  {"ID_stazione": "PETILIA", "lat": 39.13, "lone": 16.77, "openMeteo": true},
  {"ID_stazione": "AFRICO_NUOVO", "lat": 38.0167, "lone": 16.1333, "openMeteo": true},
  {"ID_stazione": "BRANCALEONE", "lat": 37.95, "lone": 16.0833, "openMeteo": true},
  {"ID_stazione": "PELLARO", "lat": 38.01, "lone": 15.633, "openMeteo": true},
  {"ID_stazione": "SIBARI", "lat": 39.6833, "lone": 16.5333, "openMeteo": true},
  {"ID_stazione": "VILLAPIANA", "lat": 39.8167, "lone": 16.5167, "openMeteo": true},
  {"ID_stazione": "MELITO_DI_PORTO_SALVO", "lat": 37.9167, "lone": 15.7333, "openMeteo": true},
  {"ID_stazione": "SANTA_CATERINA_DELLO_IONIO", "lat": 38.55, "lone": 16.5667, "openMeteo": true},
  {"ID_stazione": "VILLA_SAN_GIOVANNI", "lat": 38.2131, "lone": 15.6414, "openMeteo": true},
  {"ID_stazione": "CAPO_VATICANO", "lat": 38.6278, "lone": 15.8415, "openMeteo": true},
  {"ID_stazione": "TARSIA", "lat": 39.58, "lone": 16.3167, "openMeteo": true},
  {"ID_stazione": "BOVALINO", "lat": 38.15, "lone": 16.2, "openMeteo": true},
  {"ID_stazione": "CAPOCOLONNA", "lat": 39.0167, "lone": 17.1333, "openMeteo": true},
  {"ID_stazione": "MONASTERACE_MARINA", "lat": 38.4333, "lone": 16.5333, "openMeteo": true},
  {"ID_stazione": "SAN_LUCA", "lat": 38.1333, "lone": 16.0833, "openMeteo": true},
  {"ID_stazione": "TREBISACCE", "lat": 39.85, "lone": 16.5333, "openMeteo": true},
  {"ID_stazione": "SANSOSTI", "lat": 39.6167, "lone": 16.05, "openMeteo": true},
  {"ID_stazione": "MONGRASSANO_SCALO", "lat": 39.538, "lone": 16.264, "openMeteo": true},
  {"ID_stazione": "MARINA_DI_STRONGOLI", "lat": 39.3, "lone": 17.1167, "openMeteo": true},
  {"ID_stazione": "CUTRO", "lat": 39.0167, "lone": 17.0833, "openMeteo": true},
  {"ID_stazione": "TORRETTA_DI_CRUCOLI", "lat": 39.4167, "lone": 17.0333, "openMeteo": true},
  {"ID_stazione": "ACERENTHIA_-_CAMIGLIANO", "lat": 39.2667, "lone": 17.0, "openMeteo": true},
  {"ID_stazione": "CASTROVILLARI", "lat": 39.8167, "lone": 16.2, "openMeteo": true},
  {"ID_stazione": "ACRI", "lat": 39.5, "lone": 16.3833, "openMeteo": true},
  {"ID_stazione": "ROCCAFORTE_DEL_GRECO", "lat": 38.0167, "lone": 15.85, "openMeteo": true},
  {"ID_stazione": "MONTALTO_UFFUGO", "lat": 39.4165, "lone": 16.1985, "openMeteo": true},
  {"ID_stazione": "ROSETO_CAPO_SPULICO", "lat": 39.9667, "lone": 16.5833, "openMeteo": true},
  {"ID_stazione": "VIBO_VALENTIA", "lat": 38.6749, "lone": 16.1027, "openMeteo": true},
  {"ID_stazione": "TORANO_SCALO", "lat": 39.516, "lone": 16.255, "openMeteo": true},
  {"ID_stazione": "ALTOMONTE", "lat": 39.7, "lone": 16.1333, "openMeteo": true},
  {"ID_stazione": "DALTOLIA", "lat": 39.033, "lone": 16.388, "openMeteo": true},
  {"ID_stazione": "MONTEROSSO_CALABRO", "lat": 38.6333, "lone": 16.2667, "openMeteo": true},
  {"ID_stazione": "ROGLIANO", "lat": 39.1581, "lone": 16.3723, "openMeteo": true},
  {"ID_stazione": "GIOIA_TAURO", "lat": 38.4236, "lone": 15.8996, "openMeteo": true},
  {"ID_stazione": "ROSARNO", "lat": 38.4886, "lone": 15.9738, "openMeteo": true},
  {"ID_stazione": "CAMILGIATELLO_SILANO", "lat": 39.3306, "lone": 16.4492, "openMeteo": true},
  {"ID_stazione": "MONTE_CURCIO", "lat": 39.317, "lone": 16.4689, "openMeteo": true},
  {"ID_stazione": "BOTTE_DONATO", "lat": 39.2833, "lone": 16.5667, "openMeteo": true},
  {"ID_stazione": "RENDE", "lat": 39.3306, "lone": 16.2078, "openMeteo": true},
  {"ID_stazione": "GIRIFALCO", "lat": 38.8, "lone": 16.4167, "openMeteo": true}
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

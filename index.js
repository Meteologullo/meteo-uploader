// index.js – rotazione gruppi, SOLO temperatura (1 variabile)
// Weather.com ogni 10' (solo temperatura); Open‑Meteo un gruppo da 100 ogni 30‑40'

import fetch from 'node-fetch';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ---------- CONFIG ----------
const WEATHERCOM_INTERVAL_MIN = 10;
const OPENMETEO_INTERVAL_MIN_MIN = 30;
const OPENMETEO_INTERVAL_MIN_MAX = 40;
const BATCH_SIZE = 100;
const OPENMETEO_PARAMS = 'temperature_2m'; // <-- solo temperatura

// ---------- STAZIONI ----------
const stazioni = [
  { nome: "Bianchi - Palinudo Staglio", mlg: true, lat: 39.11, lon: 16.42, quota: "830 m", provincia: "CS", regione: "Calabria", area: "Valle del Corace", stationId: "IBIANC4", apiKey: "2ccb91c2398a4f778b91c2398a4f772f", webcam: "", linkStazione: "https://esempio.it/stazioni/nuova-stazione-1" },
  { nome: "Cosenza - Vaglio Lise", mlg: true, lat: 39.32, lon: 16.26, quota: "208 m", provincia: "CS", regione: "Calabria", area: "Valle del Crati", stationId: "ICOSEN11", apiKey: "03d402e1e8844ac49402e1e8844ac419", webcam: "", linkStazione: "https://www.meteologullo.com/stazione-cosenza-vaglio-lise" },
  { nome: "Amantea Spiaggia", mlg: true, lat: 39.13, lon: 16.07, quota: "0 m", provincia: "CS", regione: "Calabria", area: "Costa Tirrenica Cosentina", stationId: "IAMANT7", apiKey: "a3f4ae4f9b6d46a4b4ae4f9b6d06a494", webcam: "", linkStazione: "https://www.meteologullo.com/stazione-amantea-spiaggia" },
  { nome: "Monte Scuro - Celico", mlg: true, lat: 39.33, lon: 16.4, quota: "1643 m", provincia: "CS", regione: "Calabria", area: "Vetta della Sila Grande", stationId: "ICELIC3", apiKey: "2d12def7f4894eca92def7f4892eca99", webcam: "", linkStazione: "https://www.meteologullo.com/stazione-meteo-di-monte-scuro-celico" },
  { nome: "Cosenza - Campagnano", mlg: true, lat: 39.31, lon: 16.23, quota: "234 m", provincia: "CS", regione: "Calabria", area: "Valle del Crati", stationId: "ICOSEN20", apiKey: "844d02e7e12049ef8d02e7e120b9ef68", webcam: "", linkStazione: "https://www.meteologullo.com/stazione-cosenza-campagnano" },
  { nome: "Mendicino - Tivolille Pasquali", mlg: true, lat: 39.28, lon: 16.2, quota: "431 m", provincia: "CS", regione: "Calabria", area: "Pre-Catena Costiera Interna", stationId: "IMENDI13", apiKey: "844d02e7e12049ef8d02e7e120b9ef68", webcam: "", linkStazione: "https://www.meteologullo.com/stazione-mendicino-tivolille" },
  { nome: "Casali del Manco - Morelli Soprana", mlg: true, lat: 39.28, lon: 16.29, quota: "389 m", provincia: "CS", regione: "Calabria", area: "collina Valle del Crati", stationId: "ICASAL40", apiKey: "b368cd08174d424fa8cd08174d424f20", webcam: "", linkStazione: "https://www.meteologullo.com/stazione-casali-del-manco-morelli-soprana" },
  { nome: "Nuova Stazione 1", mlg: true, lat: 39.40, lon: 16.50, quota: "100 m", provincia: "CS", regione: "Calabria", area: "Nuova Area", stationId: "INUST1", apiKey: "123456789", webcam: "", linkStazione: "https://esempio.it/stazioni/nuova-stazione-1" },
  { nome: "Catanzaro Centro", lat: 38.82, lon: 16.43, quota: "320 m", provincia: "CZ", regione: "Calabria", area: "Centro città", openMeteo: true, stationId: "CATCENTRO", webcam: "", linkStazione: "#" }
,
  { nome: "Reggio Calabria - Centro", lat: 38.11, lon: 15.65, quota: "31 m", provincia: "RC", regione: "Calabria", area: "Area dello Stretto", openMeteo: true, stationId: "REGCENTRO", webcam: "", linkStazione: "#" },
  { nome: "Rossano - Centro Storico", lat: 39.58, lon: 16.63, quota: "270 m", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "ROSSCENTRO", webcam: "", linkStazione: "#" },
  { nome: "Vibo Valentia - Monte Poro", lat: 38.63, lon: 16.05, quota: "710 m", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "VIBOPORO", webcam: "", linkStazione: "#" },
  { nome: "Locri Marina", lat: 38.25, lon: 16.26, quota: "12 m", provincia: "RC", regione: "Calabria", area: "Costa Ionica Reggina", openMeteo: true, stationId: "LOCRIMARINA", webcam: "", linkStazione: "#" },
  { nome: "San Giovanni in Fiore", lat: 39.26, lon: 16.68, quota: "1049 m", provincia: "CS", regione: "Calabria", area: "Altopiano Silano", openMeteo: true, stationId: "SGFIORE", webcam: "", linkStazione: "#" },
  { nome: "Crotone Porto", lat: 39.08, lon: 17.12, quota: "8 m", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "CROPOR", webcam: "", linkStazione: "#" },
  { nome: "Lamezia Terme - Sant'Eufemia", lat: 38.91, lon: 16.24, quota: "15 m", provincia: "CZ", regione: "Calabria", area: "Piana di Lamezia", openMeteo: true, stationId: "LAMSANTEUF", webcam: "", linkStazione: "#" },
  { nome: "Scalea - Centro", lat: 39.81, lon: 15.79, quota: "25 m", provincia: "CS", regione: "Calabria", area: "Alto Tirreno Cosentino", openMeteo: true, stationId: "SCALEACENTRO", webcam: "", linkStazione: "#" },
  { nome: "Taverna - Parco Nazionale Sila Piccola", lat: 39.02, lon: 16.68, quota: "880 m", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "TAVSILAPIC", webcam: "", linkStazione: "#" },
  { nome: "Isola di Capo Rizzuto", lat: 38.96, lon: 17.09, quota: "75 m", provincia: "KR", regione: "Calabria", area: "Capo Rizzuto", openMeteo: true, stationId: "ISOCAPORIZ", webcam: "", linkStazione: "#" },
,
  { nome: "Cirò Marina", lat: 39.37, lon: 17.12, quota: "25 m", provincia: "KR", regione: "Calabria", area: "Alto Ionio Crotonese", openMeteo: true, stationId: "CIROMARINA", webcam: "", linkStazione: "#" },
  { nome: "Cariati", lat: 39.5, lon: 16.96, quota: "30 m", provincia: "CS", regione: "Calabria", area: "Basso Ionio cosentino", openMeteo: true, stationId: "CARIATI", webcam: "", linkStazione: "#" },
  { nome: "Petilia Policastro", lat: 39.13, lon: 16.77, quota: "436 m", provincia: "KR", regione: "Calabria", area: "Marchesato Crotonese", openMeteo: true, stationId: "PETILIA", webcam: "", linkStazione: "#" },
  { nome: "Tropea", lat: 38.68, lon: 15.9, quota: "61 m", provincia: "VV", regione: "Calabria", area: "Costa degli Dei", openMeteo: true, stationId: "TROPEA", webcam: "", linkStazione: "#" },
  { nome: "Gerace", lat: 38.27, lon: 16.23, quota: "500 m", provincia: "RC", regione: "Calabria", area: "Collina Ionica alto Reggino", openMeteo: true, stationId: "GERACE", webcam: "", linkStazione: "#" },
  { nome: "Spezzano della Sila", lat: 39.30, lon: 16.33, quota: "800 m", provincia: "CS", regione: "Calabria", area: "Pre-Sila Grande cosentina", openMeteo: true, stationId: "SPEZSILA", webcam: "", linkStazione: "#" },
  { nome: "Paola", lat: 39.37, lon: 16.03, quota: "154 m", provincia: "CS", regione: "Calabria", area: "Tirreno Cosentino", openMeteo: true, stationId: "PAOLA", webcam: "", linkStazione: "#" },
  { nome: "Belvedere Marittimo", lat: 39.61, lon: 15.86, quota: "150 m", provincia: "CS", regione: "Calabria", area: "Alto Tirreno Cosentino", openMeteo: true, stationId: "BELVEDERE", webcam: "", linkStazione: "#" },
  { nome: "Mormanno", lat: 39.88, lon: 15.98, quota: "850 m", provincia: "CS", regione: "Calabria", area: "Pollino", openMeteo: true, stationId: "MORMANNO", webcam: "", linkStazione: "#" },
  { nome: "Soverato", lat: 38.68, lon: 16.54, quota: "20 m", provincia: "CZ", regione: "Calabria", area: "Costa Ionica basso Catanzarese", openMeteo: true, stationId: "SOVERATO", webcam: "", linkStazione: "#" },
  { nome: "Palmi", lat: 38.36, lon: 15.85, quota: "228 m", provincia: "RC", regione: "Calabria", area: "Costa Viola", openMeteo: true, stationId: "PALMI", webcam: "", linkStazione: "#" },
  { nome: "Serrastretta", lat: 39.01, lon: 16.4, quota: "820 m", provincia: "CZ", regione: "Calabria", area: "Istmo di Catanzaro", openMeteo: true, stationId: "SERRASTRETTA", webcam: "", linkStazione: "#" },
  { nome: "Santa Severina", lat: 39.21, lon: 16.97, quota: "326 m", provincia: "KR", regione: "Calabria", area: "Marchesato crotonese", openMeteo: true, stationId: "SSSEVERINA", webcam: "", linkStazione: "#" },
  { nome: "Badolato Marina", lat: 38.6, lon: 16.55, quota: "10 m", provincia: "CZ", regione: "Calabria", area: "Costa Ionica basso Catanzarese", openMeteo: true, stationId: "BADO_MARINA", webcam: "", linkStazione: "#" },
  { nome: "Delianuova", lat: 38.2, lon: 15.88, quota: "600 m", provincia: "RC", regione: "Calabria", area: "Pre-Aspromonte Occidentale", openMeteo: true, stationId: "DELIANUOVA", webcam: "", linkStazione: "#" },
  {"nome": "Rende", "lat": 39.3306, "lon": 16.2078, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Valle del Crati", "openMeteo": true, "stationId": "RENDE", "webcam": "", "linkStazione": "#"},
  {"nome": "Montalto Uffugo", "lat": 39.4165, "lon": 16.1985, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Valle del Crati", "openMeteo": true, "stationId": "MONTALTO_UFFUGO", "webcam": "", "linkStazione": "#"},
  {"nome": "Torano Castello - Sartano", "lat": 39.49, "lon": 16.20, "quota": "90", "provincia": "CS", "regione": "Calabria", "area": "Collina alta Valle del Crati", "openMeteo": true, "stationId": "TORANO_SCALO", "webcam": "", "linkStazione": "#"},
  {"nome": "Bisignano", "lat": 39.50, "lon": 16.27, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Collina alta Valle del Crati", "openMeteo": true, "stationId": "MONGRASSANO_SCALO", "webcam": "", "linkStazione": "#"},
  {"nome": "Tarsia", "lat": 39.58, "lon": 16.3167, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Valle del Crati", "openMeteo": true, "stationId": "TARSIA", "webcam": "", "linkStazione": "#"},
  {"nome": "Castrovillari", "lat": 39.8167, "lon": 16.2, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Pollino", "openMeteo": true, "stationId": "CASTROVILLARI", "webcam": "", "linkStazione": "#"},
  {"nome": "Sibari", "lat": 39.6833, "lon": 16.5333, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Sibaritide", "openMeteo": true, "stationId": "SIBARI", "webcam": "", "linkStazione": "#"},
  {"nome": "Villapiana", "lat": 39.84, "lon": 16.45, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Sibaritide", "openMeteo": true, "stationId": "VILLAPIANA", "webcam": "", "linkStazione": "#"},
  {"nome": "Camigliatello Silano", "lat": 39.3306, "lon": 16.4492, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Sila Grande", "openMeteo": true, "stationId": "CAMIGLIATELLO_SILANO", "webcam": "", "linkStazione": "#"},
  {"nome": "Monte Curcio", "lat": 39.317, "lon": 16.42, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Sila Grande", "openMeteo": true, "stationId": "MONTE_CURCIO", "webcam": "", "linkStazione": "#"},
  {"nome": "Botte Donato", "lat": 39.2833, "lon": 16.45, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Sila Grande", "openMeteo": true, "stationId": "BOTTE_DONATO", "webcam": "", "linkStazione": "#"},
  {"nome": "Daltolia", "lat": 39.033, "lon": 16.388, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Valle del Savuto", "openMeteo": true, "stationId": "DALTOLIA", "webcam": "", "linkStazione": "#"},
  {"nome": "Rogliano", "lat": 39.1581, "lon": 16.3723, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Valle del Savuto", "openMeteo": true, "stationId": "ROGLIANO", "webcam": "", "linkStazione": "#"},
  {"nome": "Girifalco", "lat": 38.8, "lon": 16.4167, "quota": "ND", "provincia": "CZ", "regione": "Calabria", "area": "Pre-Serre", "openMeteo": true, "stationId": "GIRIFALCO", "webcam": "", "linkStazione": "#"},
  {"nome": "Vibo Valentia", "lat": 38.6749, "lon": 16.1027, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Entroterra Vibonese", "openMeteo": true, "stationId": "VIBO_VALENTIA", "webcam": "", "linkStazione": "#"},
  {"nome": "Capo Vaticano", "lat": 38.6278, "lon": 15.8415, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Costa degli Dei", "openMeteo": true, "stationId": "CAPO_VATICANO", "webcam": "", "linkStazione": "#"},
  {"nome": "Rosarno", "lat": 38.4886, "lon": 15.9738, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Piana di Gioia Tauro", "openMeteo": true, "stationId": "ROSARNO", "webcam": "", "linkStazione": "#"},
  {"nome": "Gioia Tauro", "lat": 38.4236, "lon": 15.8996, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Piana di Gioia Tauro", "openMeteo": true, "stationId": "GIOIA_TAURO", "webcam": "", "linkStazione": "#"},
  {"nome": "Pellaro", "lat": 38.01, "lon": 15.633, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Area dello Stretto", "openMeteo": true, "stationId": "PELLARO", "webcam": "", "linkStazione": "#"},
  {"nome": "Villa San Giovanni", "lat": 38.2131, "lon": 15.6414, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Area dello Stretto", "openMeteo": true, "stationId": "VILLA_SAN_GIOVANNI", "webcam": "", "linkStazione": "#"},
  {"nome": "Melito di Porto Salvo", "lat": 37.9167, "lon": 15.7333, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Costa Ionica Reggina", "openMeteo": true, "stationId": "MELITO_DI_PORTO_SALVO", "webcam": "", "linkStazione": "#"},
  {"nome": "Brancaleone", "lat": 37.95, "lon": 16.0833, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Costa Ionica Reggina", "openMeteo": true, "stationId": "BRANCALEONE", "webcam": "", "linkStazione": "#"},
  {"nome": "Africo Nuovo", "lat": 38.0167, "lon": 16.1333, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Costa Ionica Reggina", "openMeteo": true, "stationId": "AFRICO_NUOVO", "webcam": "", "linkStazione": "#"},
  {"nome": "Bovalino", "lat": 38.15, "lon": 16.2, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Costa Ionica Reggina", "openMeteo": true, "stationId": "BOVALINO", "webcam": "", "linkStazione": "#"},
  {"nome": "Monasterace Marina", "lat": 38.4333, "lon": 16.5333, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Costa Ionica Meridionale", "openMeteo": true, "stationId": "MONASTERACE_MARINA", "webcam": "", "linkStazione": "#"},
  {"nome": "Mongiana", "lat": 38.5167, "lon": 16.3, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Serre Vibonesi", "openMeteo": true, "stationId": "MONGIANA", "webcam": "", "linkStazione": "#"},
  {"nome": "Fabrizia", "lat": 38.5, "lon": 16.3667, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Serre Vibonesi", "openMeteo": true, "stationId": "FABRIZIA", "webcam": "", "linkStazione": "#"},
  {"nome": "Nardodipace", "lat": 38.4833, "lon": 16.4, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Serre Vibonesi", "openMeteo": true, "stationId": "NARDODIPACE", "webcam": "", "linkStazione": "#"},
  {"nome": "Polistena", "lat": 38.4167, "lon": 16.0833, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Piana di Gioia Tauro", "openMeteo": true, "stationId": "POLISTENA", "webcam": "", "linkStazione": "#"},
  {"nome": "Natoli Nuovo", "lat": 38.5167, "lon": 16.0833, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Entroterra Vibonese", "openMeteo": true, "stationId": "NATOLI_NUOVO", "webcam": "", "linkStazione": "#"},
  {"nome": "Cittanova", "lat": 38.3167, "lon": 16.0833, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Piana di Gioia Tauro", "openMeteo": true, "stationId": "CITTANOVA", "webcam": "", "linkStazione": "#"},
  {"nome": "Zungri", "lat": 38.6167, "lon": 15.9333, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Entroterra Vibonese", "openMeteo": true, "stationId": "ZUNGRI", "webcam": "", "linkStazione": "#"},
  {"nome": "Spilinga", "lat": 38.6, "lon": 15.8833, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Entroterra Vibonese", "openMeteo": true, "stationId": "SPILINGA", "webcam": "", "linkStazione": "#"},
  {"nome": "Pizzo", "lat": 38.7333, "lon": 16.1667, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Costa Tirrenica Vibonese", "openMeteo": true, "stationId": "PIZZO", "webcam": "", "linkStazione": "#"},
  {"nome": "Monterosso Calabro", "lat": 38.6333, "lon": 16.2667, "quota": "ND", "provincia": "VV", "regione": "Calabria", "area": "Entroterra Vibonese", "openMeteo": true, "stationId": "MONTEROSSO_CALABRO", "webcam": "", "linkStazione": "#"},
  {"nome": "Cutro", "lat": 39.0167, "lon": 17.0833, "quota": "ND", "provincia": "KR", "regione": "Calabria", "area": "Collina Crotonese", "openMeteo": true, "stationId": "CUTRO", "webcam": "", "linkStazione": "#"},
  {"nome": "Capocolonna", "lat": 39.0167, "lon": 17.1333, "quota": "ND", "provincia": "KR", "regione": "Calabria", "area": "Costa Ionica Crotonese", "openMeteo": true, "stationId": "CAPOCOLONNA", "webcam": "", "linkStazione": "#"},
  {"nome": "Marina di Strongoli", "lat": 39.3, "lon": 17.1167, "quota": "ND", "provincia": "KR", "regione": "Calabria", "area": "Costa Ionica Crotonese", "openMeteo": true, "stationId": "MARINA_DI_STRONGOLI", "webcam": "", "linkStazione": "#"},
  {"nome": "Acerenthia - Camigliano", "lat": 39.2667, "lon": 17.0, "quota": "ND", "provincia": "KR", "regione": "Calabria", "area": "Collina Crotonese", "openMeteo": true, "stationId": "ACERENTHIA_-_CAMIGLIANO", "webcam": "", "linkStazione": "#"},
  {"nome": "Torretta di Crucoli", "lat": 39.4167, "lon": 17.0333, "quota": "ND", "provincia": "KR", "regione": "Calabria", "area": "Costa Ionica Crotonese", "openMeteo": true, "stationId": "TORRETTA_DI_CRUCOLI", "webcam": "", "linkStazione": "#"},
  {"nome": "Longobucco", "lat": 39.45, "lon": 16.65, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Sila Greca", "openMeteo": true, "stationId": "LONGOBUCCO", "webcam": "", "linkStazione": "#"},
  {"nome": "Acri", "lat": 39.5, "lon": 16.3833, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Sila Greca", "openMeteo": true, "stationId": "ACRI", "webcam": "", "linkStazione": "#"},
  {"nome": "Roccaforte del Greco", "lat": 38.0167, "lon": 15.85, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Aspromonte", "openMeteo": true, "stationId": "ROCCAFORTE_DEL_GRECO", "webcam": "", "linkStazione": "#"},
  {"nome": "San Luca", "lat": 38.1333, "lon": 16.0833, "quota": "ND", "provincia": "RC", "regione": "Calabria", "area": "Aspromonte", "openMeteo": true, "stationId": "SAN_LUCA", "webcam": "", "linkStazione": "#"},
  {"nome": "Santa Caterina dello Ionio", "lat": 38.55, "lon": 16.5667, "quota": "ND", "provincia": "CZ", "regione": "Calabria", "area": "Costa Ionica Meridionale", "openMeteo": true, "stationId": "SANTA_CATERINA_DELLO_IONIO", "webcam": "", "linkStazione": "#"},
  {"nome": "San Sosti", "lat": 39.66, "lon": 16.02, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Valle dell'Esaro", "openMeteo": true, "stationId": "SANSOSTI", "webcam": "", "linkStazione": "#"},
  {"nome": "Altomonte", "lat": 39.7, "lon": 16.1333, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Valle dell'Esaro", "openMeteo": true, "stationId": "ALTOMONTE", "webcam": "", "linkStazione": "#"},
  {"nome": "Roseto Capo Spulico", "lat": 39.9667, "lon": 16.5833, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Alto Ionio Cosentino", "openMeteo": true, "stationId": "ROSETO_CAPO_SPULICO", "webcam": "", "linkStazione": "#"},
  {"nome": "Trebisacce", "lat": 39.87, "lon": 16.53, "quota": "ND", "provincia": "CS", "regione": "Calabria", "area": "Alto Ionio Cosentino", "openMeteo": true, "stationId": "TREBISACCE", "webcam": "", "linkStazione": "#"}
,
  { nome: "Rende - Quattromiglia", lat: 39.353702, lon: 16.242313, quota: "ND", provincia: "CS", regione: "Calabria", area: "Fondovalle del Crati sud", openMeteo: true, stationId: "RENDE_QUATTR", webcam: "", linkStazione: "#" },
  { nome: "Torano Castello - Scalo", lat: 39.46, lon: 16.24, quota: "90", provincia: "CS", regione: "Calabria", area: "Fondovalle del Crati", openMeteo: true, stationId: "LUZZI_PETRINI", webcam: "", linkStazione: "#" },
  { nome: "Luzzi - Petrini", lat: 39.446816, lon: 16.28, quota: "ND", provincia: "CS", regione: "Calabria", area: "Media Valle del Crati", openMeteo: true, stationId: "LUZZI_CENTRO", webcam: "", linkStazione: "#" },
  { nome: "Lattarico", lat: 39.464303, lon: 16.138027, quota: "ND", provincia: "CS", regione: "Calabria", area: "Pre-Catena costiera interna nord", openMeteo: true, stationId: "LATTARICO", webcam: "", linkStazione: "#" },
  { nome: "Rota Greca", lat: 39.467, lon: 16.117, quota: "ND", provincia: "CS", regione: "Calabria", area: "Pre-Catena costiera interna nord", openMeteo: true, stationId: "ROTA_GRECA", webcam: "", linkStazione: "#" },
  { nome: "Lattarico - Piretto", lat: 39.467, lon: 16.133, quota: "ND", provincia: "CS", regione: "Calabria", area: "Pre-Catena Costiera interna nord", openMeteo: true, stationId: "LATTARICO_PIRETTO", webcam: "", linkStazione: "#" },
  { nome: "Cassano all'Ionio", lat: 39.783, lon: 16.317, quota: "ND", provincia: "CS", regione: "Calabria", area: "Piana di Sibari centrale", openMeteo: true, stationId: "CASSANO_IONIO", webcam: "", linkStazione: "#" },
  { nome: "Sibari", lat: 39.74, lon: 16.45, quota: "ND", provincia: "CS", regione: "Calabria", area: "Piana di Sibari orientale", openMeteo: true, stationId: "SIBARI", webcam: "", linkStazione: "#" },
  { nome: "Terranova da Sibari", lat: 39.6575, lon: 16.3398, quota: "ND", provincia: "CS", regione: "Calabria", area: "Collina Piana di Sibari sud", openMeteo: true, stationId: "TERRANOVA_SIBARI", webcam: "", linkStazione: "#" },
  { nome: "Tarsia", lat: 39.62311, lon: 16.27337, quota: "ND", provincia: "CS", regione: "Calabria", area: "Collina Valle del Crati nord", openMeteo: true, stationId: "TARSIA", webcam: "", linkStazione: "#" },
  { nome: "Roggiano Gravina", lat: 39.61786, lon: 16.16173, quota: "ND", provincia: "CS", regione: "Calabria", area: "Collina Valle dell'Esaro", openMeteo: true, stationId: "ROGGIANO", webcam: "", linkStazione: "#" },
  { nome: "San Pietro in Guarano", lat: 39.333, lon: 16.317, quota: "ND", provincia: "CS", regione: "Calabria", area: "Pre-Sila cosentina", openMeteo: true, stationId: "SANPIETRO_GUARANO", webcam: "", linkStazione: "#" },
  { nome: "Marano Marchesato", lat: 39.316974, lon: 16.174788, quota: "ND", provincia: "CS", regione: "Calabria", area: "Pre-Catena costiera interna sud", openMeteo: true, stationId: "MARANO_MARCH", webcam: "", linkStazione: "#" },
  { nome: "Carolei", lat: 39.25, lon: 16.217, quota: "ND", provincia: "CS", regione: "Calabria", area: "Serre cosentine", openMeteo: true, stationId: "CAROLEI", webcam: "", linkStazione: "#" },
  { nome: "Dipignano", lat: 39.237886, lon: 16.25324, quota: "ND", provincia: "CS", regione: "Calabria", area: "Serre cosentine", openMeteo: true, stationId: "DIPIGNANO", webcam: "", linkStazione: "#" },
  { nome: "Mangone", lat: 39.205635, lon: 16.332584, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Savuto", openMeteo: true, stationId: "MANGONE", webcam: "", linkStazione: "#" },
  { nome: "Altilia", lat: 39.1286, lon: 16.2532, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Savuto", openMeteo: true, stationId: "ALTILIA", webcam: "", linkStazione: "#" },
  { nome: "Aiello Calabro", lat: 39.117215, lon: 16.166775, quota: "ND", provincia: "CS", regione: "Calabria", area: "Collina basso tirreno cosentino", openMeteo: true, stationId: "AIELLO_CALABRO", webcam: "", linkStazione: "#" },
  { nome: "Lamezia Terme", lat: 38.966667, lon: 16.299999, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Piana di Lamezia", openMeteo: true, stationId: "LAMEZIA_TERME", webcam: "", linkStazione: "#" },
  { nome: "Falerna", lat: 39.003346, lon: 16.172041, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Costa tirrenica catanzarese", openMeteo: true, stationId: "FALERNA", webcam: "", linkStazione: "#" },
  { nome: "San Lucido", lat: 39.309956, lon: 16.051827, quota: "ND", provincia: "CS", regione: "Calabria", area: "Costa tirrenica cosentina", openMeteo: true, stationId: "SAN_LUCIDO", webcam: "", linkStazione: "#" },
  { nome: "Guardia Piemontese", lat: 39.467, lon: 16.0, quota: "ND", provincia: "CS", regione: "Calabria", area: "Costa alto tirreno cosentino", openMeteo: true, stationId: "GUARDIA_PIEM", webcam: "", linkStazione: "#" },
  { nome: "Vena di Maida", lat: 38.888685, lon: 16.407462, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Istmo di Catanzaro", openMeteo: true, stationId: "VENA_DI_MAIDA", webcam: "", linkStazione: "#" },
  { nome: "Settingiano", lat: 38.910024, lon: 16.514955, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Istmo di Catanzaro", openMeteo: true, stationId: "SETTINGIANO", webcam: "", linkStazione: "#" },
  { nome: "Caraffa di Catanzaro", lat: 38.88194, lon: 16.4875, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Istmo di Catanzaro", openMeteo: true, stationId: "CARAFFA", webcam: "", linkStazione: "#" },
  { nome: "Catanzaro Lido", lat: 38.8303, lon: 16.6278, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Costa Ionica Catanzarese", openMeteo: true, stationId: "CATANZARO_LIDO", webcam: "", linkStazione: "#" },
  { nome: "Simeri Mare", lat: 38.865607, lon: 16.697665, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Costa Ionica Catanzarese", openMeteo: true, stationId: "SIMERI_MARE", webcam: "", linkStazione: "#" },
  { nome: "Sorbo San Basile", lat: 39.01889, lon: 16.56944, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Pre-Sila catanzarese", openMeteo: true, stationId: "SORBO_BASILE", webcam: "", linkStazione: "#" },
  { nome: "Steccato di Cutro", lat: 38.938014, lon: 16.916678, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa del basso ionio crotonese", openMeteo: true, stationId: "STECCATO_CUTRO", webcam: "", linkStazione: "#" },
  { nome: "Cropani", lat: 38.967, lon: 16.783, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Costa ionica alto catanzarese", openMeteo: true, stationId: "CROPANI", webcam: "", linkStazione: "#" },
  { nome: "Botricello Superiore", lat: 38.93199, lon: 16.85831, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Collina alto ionio catanzarese", openMeteo: true, stationId: "BOTRICELLO", webcam: "", linkStazione: "#" },
  { nome: "Acconia", lat: 38.83585, lon: 16.2653, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Piana di Lamezia", openMeteo: true, stationId: "ACCONIA", webcam: "", linkStazione: "#" },
  { nome: "Curinga", lat: 38.8281, lon: 16.31344, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Valle dell'Amato", openMeteo: true, stationId: "CURINGA", webcam: "", linkStazione: "#" },
  { nome: "Maida", lat: 38.8588, lon: 16.3628, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Istmo di Catanzaro", openMeteo: true, stationId: "MAIDA", webcam: "", linkStazione: "#" },
  { nome: "Francavilla Angitola", lat: 38.783, lon: 16.267, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "FRANCAVILLA_ANGITOLA", webcam: "", linkStazione: "#" },
  { nome: "San Pietro Lametino", lat: 38.869082, lon: 16.277958, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Collina della Piana di Lamezia", openMeteo: true, stationId: "SANPIETRO_LAM", webcam: "", linkStazione: "#" },
  { nome: "Squillace", lat: 38.780585, lon: 16.513228, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Costa ionica del basso catanzarese", openMeteo: true, stationId: "SQUILLACE", webcam: "", linkStazione: "#" },
  { nome: "Montepaone Lido", lat: 38.728733, lon: 16.541554, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Costa ionica del basso catanzarese", openMeteo: true, stationId: "MONTEPAONE_LIDO", webcam: "", linkStazione: "#" },
  { nome: "San Vito sullo Ionio", lat: 38.710368, lon: 16.409777, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Entroterra del basso ionio catanzarese", openMeteo: true, stationId: "SANVITO_IONIO", webcam: "", linkStazione: "#" },
  { nome: "Monterosso Calabro", lat: 38.71792, lon: 16.291973, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "MONTEROSSO_CALABRO", webcam: "", linkStazione: "#" },
  { nome: "Chiaravalle Centrale", lat: 38.680996, lon: 16.411957, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Entroterra del basso ionio catanzarese", openMeteo: true, stationId: "CHIARAVALLE_C", webcam: "", linkStazione: "#" },
  { nome: "Verbicaro", lat: 39.756, lon: 15.916, quota: "ND", provincia: "CS", regione: "Calabria", area: "Pre-Catena Costiera marittima nord", openMeteo: true, stationId: "VERBICARO", webcam: "", linkStazione: "#" },
  { nome: "Orsomarso", lat: 39.799, lon: 15.908, quota: "ND", provincia: "CS", regione: "Calabria", area: "Catena Costiera marittima nord", openMeteo: true, stationId: "ORSOMARSO", webcam: "", linkStazione: "#" },
  { nome: "Cirella", lat: 39.703, lon: 15.823, quota: "ND", provincia: "CS", regione: "Calabria", area: "Alto Tirreno cosentino", openMeteo: true, stationId: "CIRELLA", webcam: "", linkStazione: "#" },
  { nome: "Praia a Mare", lat: 39.909, lon: 15.778, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "PRAIA_A_MARE", webcam: "", linkStazione: "#" },
  { nome: "Laino Borgo", lat: 39.95, lon: 15.97, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Mercure", openMeteo: true, stationId: "LAINO_BORGO", webcam: "", linkStazione: "#" },
  { nome: "Papasidero", lat: 39.87, lon: 15.90, quota: "ND", provincia: "CS", regione: "Calabria", area: "Borgo dell'alto tirreno", openMeteo: true, stationId: "PAPASIDERO", webcam: "", linkStazione: "#" },
  { nome: "Acquaformosa", lat: 39.736, lon: 16.078, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "ACQUAFORMOSA", webcam: "", linkStazione: "#" },
  { nome: "Saracena", lat: 39.849, lon: 16.11, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "SARACENA", webcam: "", linkStazione: "#" },
  { nome: "Cerchiara di Calabria", lat: 39.883, lon: 16.4, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "CERCHIARA_DI_CALABRIA", webcam: "", linkStazione: "#" },
  { nome: "San Lorenzo Bellizzi", lat: 39.88, lon: 16.33, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "SAN_LORENZO_BELLIZZI", webcam: "", linkStazione: "#" },
  { nome: "Plataci", lat: 39.90, lon: 16.43, quota: "ND", provincia: "CS", regione: "Calabria", area: "Parco Nazionale del Pollino", openMeteo: true, stationId: "PLATACI", webcam: "", linkStazione: "#" },
  { nome: "Albidona", lat: 39.937, lon: 16.525, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "ALBIDONA", webcam: "", linkStazione: "#" },
  { nome: "Alessandria del Carretto", lat: 39.984, lon: 16.338, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "ALESSANDRIA_DEL_CARRETTO", webcam: "", linkStazione: "#" },
  { nome: "Terranova di Pollino", lat: 40.032, lon: 16.23, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "TERRANOVA_DI_POLLINO", webcam: "", linkStazione: "#" },
  { nome: "Castroregio", lat: 39.987, lon: 16.51, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CASTROREGIO", webcam: "", linkStazione: "#" },
  { nome: "Oriolo", lat: 40.05, lon: 16.434, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "ORIOLO", webcam: "", linkStazione: "#" },
  { nome: "Montegiordano", lat: 40.04, lon: 16.53, quota: "ND", provincia: "CS", regione: "Calabria", area: "Alto ionio cosentino", openMeteo: true, stationId: "MONTEGIORDANO", webcam: "", linkStazione: "#" },
  { nome: "Nocara", lat: 40.09, lon: 16.48, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "NOCARA", webcam: "", linkStazione: "#" },
  { nome: "Rocca Imperiale", lat: 40.10, lon: 16.58, quota: "ND", provincia: "CS", regione: "Calabria", area: "Alto ionio cosentino", openMeteo: true, stationId: "ROCCA_IMPERIALE", webcam: "", linkStazione: "#" },
  { nome: "Apollinara", lat: 39.70, lon: 16.41, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "APOLLINARA", webcam: "", linkStazione: "#" },
  { nome: "Cantinella", lat: 39.66, lon: 16.44, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CANTINELLA", webcam: "", linkStazione: "#" },
  { nome: "Corigliano Scalo", lat: 39.618, lon: 16.509, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CORIGLIANO_SCALO", webcam: "", linkStazione: "#" },
  { nome: "San Giorgio Albanese", lat: 39.58, lon: 16.45, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "SAN_GIORGIO_ALBANESE", webcam: "", linkStazione: "#" },
  { nome: "San Demetrio Corone", lat: 39.562, lon: 16.51, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "SAN_DEMETRIO_CORONE", webcam: "", linkStazione: "#" },
  { nome: "Cozzo Carbonaro", lat: 39.46, lon: 16.20, quota: "ND", provincia: "CS", regione: "Calabria", area: "Alta Valle del Crati", openMeteo: true, stationId: "COZZO_CARBONARO", webcam: "", linkStazione: "#" },
  { nome: "Taverna di Montalto Uffugo", lat: 39.415, lon: 16.246, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "TAVERNA_DI_MONTALTO_UFFUGO", webcam: "", linkStazione: "#" },
  { nome: "Rose", lat: 39.394, lon: 16.232, quota: "ND", provincia: "CS", regione: "Calabria", area: "Collina della media Valle del Crati", openMeteo: true, stationId: "ROSE", webcam: "", linkStazione: "#" },
  { nome: "San Vincenzo la Costa", lat: 39.374, lon: 16.162, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "SAN_VINCENZO_LA_COSTA", webcam: "", linkStazione: "#" },
  { nome: "Lago", lat: 39.198, lon: 16.128, quota: "ND", provincia: "CS", regione: "Calabria", area: "Colline della Pre-Catena Costiera marittima sud", openMeteo: true, stationId: "LAGO", webcam: "", linkStazione: "#" },
  { nome: "Potame", lat: 39.188, lon: 16.199, quota: "ND", provincia: "CS", regione: "Calabria", area: "Serre Cosentine", openMeteo: true, stationId: "POTAME", webcam: "", linkStazione: "#" },
  { nome: "San Mango d'Aquino", lat: 39.027, lon: 16.217, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Collina della Valle del Savuto", openMeteo: true, stationId: "SAN_MANGO_DAQUINO", webcam: "", linkStazione: "#" },
  { nome: "Panetti", lat: 39.01, lon: 16.30, quota: "ND", provincia: "CS", regione: "Calabria", area: "Collina del Monte Reventino", openMeteo: true, stationId: "PANETTI", webcam: "", linkStazione: "#" },
  { nome: "Cicala", lat: 39.02, lon: 16.416, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Pre-Sila catanzarese", openMeteo: true, stationId: "CICALA", webcam: "", linkStazione: "#" },
  { nome: "Panettieri", lat: 39.079, lon: 16.423, quota: "ND", provincia: "CS", regione: "Calabria", area: "Monte Reventino", openMeteo: true, stationId: "PANETTIERI", webcam: "", linkStazione: "#" },
  { nome: "Sellia", lat: 38.832, lon: 16.517, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Collina dell'alto ionio catanzarese", openMeteo: true, stationId: "SELLIA", webcam: "", linkStazione: "#" },
  { nome: "Pianopoli", lat: 38.957, lon: 16.319, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Istmo di Marcellinara", openMeteo: true, stationId: "PIANOPOLI", webcam: "", linkStazione: "#" },
  { nome: "Gizzeria", lat: 38.937, lon: 16.148, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Alto tirreno catanzarese", openMeteo: true, stationId: "GIZZERIA", webcam: "", linkStazione: "#" },
  { nome: "Soveria Simeri", lat: 38.97, lon: 16.659, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Collina dell'alto ionio catanzarese", openMeteo: true, stationId: "SOVERIA_SIMERI", webcam: "", linkStazione: "#" },
  { nome: "Mesoraca", lat: 39.096, lon: 16.789, quota: "ND", provincia: "KR", regione: "Calabria", area: "Pre-Sila catanzarese", openMeteo: true, stationId: "MESORACA", webcam: "", linkStazione: "#" },
  { nome: "San Mauro Marchesato", lat: 39.126, lon: 16.859, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "SAN_MAURO_MARCHESATO", webcam: "", linkStazione: "#" },
  { nome: "Marcedusa", lat: 39.024, lon: 16.858, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "MARCEDUSA", webcam: "", linkStazione: "#" },
  { nome: "Papanice", lat: 39.118, lon: 16.981, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "PAPANICE", webcam: "", linkStazione: "#" },
  { nome: "Capo Colonna", lat: 39.016, lon: 17.135, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "CAPO_COLONNA", webcam: "", linkStazione: "#" },
  { nome: "Le Cannella", lat: 38.946, lon: 17.074, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "LE_CANNELLA", webcam: "", linkStazione: "#" },
  { nome: "Le Castella", lat: 38.906, lon: 17.01, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "LE_CASTELLA", webcam: "", linkStazione: "#" },
  { nome: "San Floro", lat: 38.899, lon: 16.486, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "SAN_FLORO", webcam: "", linkStazione: "#" },
  { nome: "Borgia", lat: 38.882, lon: 16.507, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "BORGIA", webcam: "", linkStazione: "#" },
  { nome: "Vallefiorita", lat: 38.778, lon: 16.49, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "VALLEFIORITA", webcam: "", linkStazione: "#" },
  { nome: "Palermiti", lat: 38.71, lon: 16.422, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "PALERMITI", webcam: "", linkStazione: "#" },
  { nome: "Petrizzi", lat: 38.637, lon: 16.474, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "PETRIZZI", webcam: "", linkStazione: "#" },
  { nome: "San Sostene", lat: 38.65, lon: 16.487, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "SAN_SOSTENE", webcam: "", linkStazione: "#" },
  { nome: "Brognaturo", lat: 38.575, lon: 16.373, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "BROGNATURO", webcam: "", linkStazione: "#" },
  { nome: "Badolato", lat: 38.578, lon: 16.556, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "BADOLATO", webcam: "", linkStazione: "#" },
  { nome: "Serra San Bruno", lat: 38.583, lon: 16.316, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "SERRA_SAN_BRUNO", webcam: "", linkStazione: "#" },
  { nome: "Arena", lat: 38.576, lon: 16.157, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "ARENA", webcam: "", linkStazione: "#" },
  { nome: "Monsoreto", lat: 38.521, lon: 16.163, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "MONSORETO", webcam: "", linkStazione: "#" },
  { nome: "Paravati", lat: 38.6, lon: 16.084, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "PARAVATI", webcam: "", linkStazione: "#" },
  { nome: "Mileto", lat: 38.606, lon: 16.067, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "MILETO", webcam: "", linkStazione: "#" },
  { nome: "Briatico", lat: 38.72, lon: 15.949, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "BRIATICO", webcam: "", linkStazione: "#" },
  { nome: "Zambrone", lat: 38.695, lon: 15.959, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "ZAMBRONE", webcam: "", linkStazione: "#" },
  { nome: "Caria", lat: 38.638, lon: 15.958, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "CARIA", webcam: "", linkStazione: "#" },
  { nome: "Maierato", lat: 38.697, lon: 16.111, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "MAIERATO", webcam: "", linkStazione: "#" },
  { nome: "Vibo Marina", lat: 38.721, lon: 16.127, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "VIBO_MARINA", webcam: "", linkStazione: "#" },
  { nome: "Nicotera", lat: 38.533, lon: 15.933, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "NICOTERA", webcam: "", linkStazione: "#" },
  { nome: "San Calogero", lat: 38.53, lon: 16.033, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "SAN_CALOGERO", webcam: "", linkStazione: "#" },
  { nome: "San Ferdinando", lat: 38.483, lon: 15.899, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SAN_FERDINANDO", webcam: "", linkStazione: "#" },
  { nome: "Taurianova", lat: 38.354, lon: 16.03, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "TAURIANOVA", webcam: "", linkStazione: "#" },
  { nome: "Oppido Mamertina", lat: 38.351, lon: 15.986, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "OPPIDO_MAMERTINA", webcam: "", linkStazione: "#" },
  { nome: "Siderno", lat: 38.27, lon: 16.294, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SIDERNO", webcam: "", linkStazione: "#" },
  { nome: "Marina di Gioiosa Ionica", lat: 38.3, lon: 16.318, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MARINA_DI_GIOIOSA_IONICA", webcam: "", linkStazione: "#" },
  { nome: "Roccella Ionica", lat: 38.327, lon: 16.398, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "ROCCELLA_IONICA", webcam: "", linkStazione: "#" },
  { nome: "Marina di Caulonia", lat: 38.389, lon: 16.463, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MARINA_DI_CAULONIA", webcam: "", linkStazione: "#" },
  { nome: "Riace Marina", lat: 38.483, lon: 16.566, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "RIACE_MARINA", webcam: "", linkStazione: "#" },
  { nome: "Villaggio Trepitò", lat: 38.386, lon: 16.453, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "VILLAGGIO_TREPITÒ", webcam: "", linkStazione: "#" },
  { nome: "Santa Cristina d'Aspromonte", lat: 38.275, lon: 15.954, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SANTA_CRISTINA_DASPROMONTE", webcam: "", linkStazione: "#" },
  { nome: "Antonimina", lat: 38.195, lon: 16.097, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "ANTONIMINA", webcam: "", linkStazione: "#" },
  { nome: "Ardore", lat: 38.23, lon: 16.171, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "ARDORE", webcam: "", linkStazione: "#" },
  { nome: "Molochio", lat: 38.28, lon: 16.01, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MOLOCHIO", webcam: "", linkStazione: "#" },
  { nome: "Bagnara Calabra", lat: 38.272, lon: 15.799, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "BAGNARA_CALABRA", webcam: "", linkStazione: "#" },
  { nome: "Gallico Marina", lat: 38.17, lon: 15.65, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "GALLICO_MARINA", webcam: "", linkStazione: "#" },
  { nome: "San Gregorio", lat: 38.048, lon: 15.682, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SAN_GREGORIO", webcam: "", linkStazione: "#" },
  { nome: "Cardeto", lat: 38.045, lon: 15.745, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "CARDETO", webcam: "", linkStazione: "#" },
  { nome: "Amendolea", lat: 38.025, lon: 15.887, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "AMENDOLEA", webcam: "", linkStazione: "#" },
  { nome: "Bianco", lat: 38.082, lon: 16.142, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "BIANCO", webcam: "", linkStazione: "#" },
  { nome: "Montebello Ionico", lat: 37.986, lon: 15.759, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MONTEBELLO_IONICO", webcam: "", linkStazione: "#" },
  { nome: "Motta San Giovanni", lat: 38.013, lon: 15.706, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MOTTA_SAN_GIOVANNI", webcam: "", linkStazione: "#" },
  { nome: "Bova Marina", lat: 37.933, lon: 15.918, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "BOVA_MARINA", webcam: "", linkStazione: "#" },
  { nome: "Palizzi Marina", lat: 37.919, lon: 15.973, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "PALIZZI_MARINA", webcam: "", linkStazione: "#" },
  { nome: "Sant'Alessio in Aspromonte", lat: 38.148, lon: 15.709, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SANTALESSIO_IN_ASPROMONTE", webcam: "", linkStazione: "#" },
  { nome: "Santo Stefano in Aspromonte", lat: 38.155, lon: 15.799, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SANTO_STEFANO_IN_ASPROMONTE", webcam: "", linkStazione: "#" },
  { nome: "Gambarie", lat: 38.154, lon: 15.877, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "GAMBARIE", webcam: "", linkStazione: "#" },
  { nome: "Sambatello", lat: 38.179, lon: 15.69, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SAMBATELLO", webcam: "", linkStazione: "#" },
  { nome: "Trunca", lat: 38.155, lon: 15.642, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "TRUNCA", webcam: "", linkStazione: "#" },
  { nome: "Palizzi", lat: 37.939, lon: 15.991, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "PALIZZI", webcam: "", linkStazione: "#" },
  { nome: "Pietrapennata", lat: 38.187, lon: 15.956, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "PIETRAPENNATA", webcam: "", linkStazione: "#" },
  { nome: "Motticella", lat: 38.064, lon: 16.137, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MOTTICELLA", webcam: "", linkStazione: "#" },
  { nome: "Sant'Agata del Bianco", lat: 38.092, lon: 16.176, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SANTAGATA_DEL_BIANCO", webcam: "", linkStazione: "#" },
  { nome: "Locri", lat: 38.243, lon: 16.258, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "LOCRI", webcam: "", linkStazione: "#" },
  { nome: "Marina di Sant'Ilario dello Ionio", lat: 38.174, lon: 16.239, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MARINA_DI_SANTILARIO_DELLO_IONIO", webcam: "", linkStazione: "#" },
  { nome: "Benestare", lat: 38.207, lon: 16.148, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "BENESTARE", webcam: "", linkStazione: "#" },
  { nome: "Platì", lat: 38.19, lon: 16.094, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "PLATÌ", webcam: "", linkStazione: "#" },
  { nome: "Sant'Eufemia d'Aspromonte", lat: 38.287, lon: 15.887, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SANTEUFEMIA_DASPROMONTE", webcam: "", linkStazione: "#" },
  { nome: "Melicuccà", lat: 38.35, lon: 15.942, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MELICUCCÀ", webcam: "", linkStazione: "#" },
  { nome: "Monasterace", lat: 38.474, lon: 16.58, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "MONASTERACE", webcam: "", linkStazione: "#" },
  { nome: "Torre di Ruggiero", lat: 38.648, lon: 16.353, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "TORRE_DI_RUGGIERO", webcam: "", linkStazione: "#" },
  { nome: "Sant'Angelo di Gerocarne", lat: 38.639, lon: 16.123, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "SANTANGELO_DI_GEROCARNE", webcam: "", linkStazione: "#" },
  { nome: "San Nicola da Crissa", lat: 38.635, lon: 16.205, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "SAN_NICOLA_DA_CRISSA", webcam: "", linkStazione: "#" },
  { nome: "Montepaone", lat: 38.697, lon: 16.529, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "MONTEPAONE", webcam: "", linkStazione: "#" },
  { nome: "Roccelletta", lat: 38.781, lon: 16.519, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "ROCCELLETTA", webcam: "", linkStazione: "#" },
  { nome: "San Giovanni di Gerace", lat: 38.286, lon: 16.226, quota: "ND", provincia: "RC", regione: "Calabria", area: "Aspromonte", openMeteo: true, stationId: "SAN_GIOVANNI_DI_GERACE", webcam: "", linkStazione: "#" },
  { nome: "Ciricilla", lat: 39.012, lon: 16.365, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "CIRICILLA", webcam: "", linkStazione: "#" },
  { nome: "Villaggio Palumbo", lat: 39.215, lon: 16.762, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "VILLAGGIO_PALUMBO", webcam: "", linkStazione: "#" },
  { nome: "Villaggio Mancuso", lat: 39.022, lon: 16.608, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "VILLAGGIO_MANCUSO", webcam: "", linkStazione: "#" },
  { nome: "Cotronei", lat: 39.16, lon: 16.773, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "COTRONEI", webcam: "", linkStazione: "#" },
  { nome: "Caccuri", lat: 39.164, lon: 16.786, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "CACCURI", webcam: "", linkStazione: "#" },
  { nome: "Cerenzia", lat: 39.246, lon: 16.812, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "CERENZIA", webcam: "", linkStazione: "#" },
  { nome: "Castelsilano", lat: 39.238, lon: 16.844, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "CASTELSILANO", webcam: "", linkStazione: "#" },
  { nome: "Vigne", lat: 39.357, lon: 16.869, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "VIGNE", webcam: "", linkStazione: "#" },
  { nome: "Verzino", lat: 39.326, lon: 16.911, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "VERZINO", webcam: "", linkStazione: "#" },
  { nome: "Savelli", lat: 39.3, lon: 16.762, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "SAVELLI", webcam: "", linkStazione: "#" },
  { nome: "Belvedere di Spinello", lat: 39.236, lon: 16.925, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "BELVEDERE_DI_SPINELLO", webcam: "", linkStazione: "#" },
  { nome: "Casabona", lat: 39.2, lon: 16.991, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "CASABONA", webcam: "", linkStazione: "#" },
  { nome: "San Nicola dell'Alto", lat: 39.221, lon: 17.071, quota: "ND", provincia: "KR", regione: "Calabria", area: "Costa Ionica Crotonese", openMeteo: true, stationId: "SAN_NICOLA_DELLALTO", webcam: "", linkStazione: "#" },
  { nome: "Pino Grande", lat: 39.32, lon: 16.75, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "PINO_GRANDE", webcam: "", linkStazione: "#" },
  { nome: "Lorica", lat: 39.24, lon: 16.51, quota: "ND", provincia: "CS", regione: "Calabria", area: "Altipiano silano", openMeteo: true, stationId: "LORICA", webcam: "", linkStazione: "#" },
  { nome: "Bocchigliero", lat: 39.429, lon: 16.797, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "BOCCHIGLIERO", webcam: "", linkStazione: "#" },
  { nome: "Campana", lat: 39.496, lon: 16.742, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CAMPANA", webcam: "", linkStazione: "#" },
  { nome: "Campo San Lorenzo", lat: 39.36, lon: 16.49, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "CAMPO_SAN_LORENZO", webcam: "", linkStazione: "#" },
  { nome: "Corigliano Calabro", lat: 39.593, lon: 16.519, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CORIGLIANO_CALABRO", webcam: "", linkStazione: "#" },
  { nome: "San Giacomo d'Acri", lat: 39.485, lon: 16.357, quota: "ND", provincia: "CS", regione: "Calabria", area: "Valle del Crati", openMeteo: true, stationId: "SAN_GIACOMO_DACRI", webcam: "", linkStazione: "#" },
  { nome: "Pietrapaola", lat: 39.486, lon: 16.893, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "PIETRAPAOLA", webcam: "", linkStazione: "#" },
  { nome: "Mandatoriccio", lat: 39.508, lon: 16.87, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "MANDATORICCIO", webcam: "", linkStazione: "#" },
  { nome: "Cropalati", lat: 39.466, lon: 16.585, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CROPALATI", webcam: "", linkStazione: "#" },
  { nome: "Paludi", lat: 39.496, lon: 16.671, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "PALUDI", webcam: "", linkStazione: "#" },
  { nome: "Mirto", lat: 39.502, lon: 16.768, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "MIRTO", webcam: "", linkStazione: "#" },
  { nome: "Crosia", lat: 39.517, lon: 16.903, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CROSIA", webcam: "", linkStazione: "#" },
  { nome: "Calopezzati", lat: 39.516, lon: 16.869, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "CALOPEZZATI", webcam: "", linkStazione: "#" },
  { nome: "Camigliano", lat: 38.983, lon: 16.233, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "CAMIGLIANO", webcam: "", linkStazione: "#" },
  { nome: "Fabrizio", lat: 39.635, lon: 16.575, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "FABRIZIO", webcam: "", linkStazione: "#" },
  { nome: "Schiavonea", lat: 39.663, lon: 16.523, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "SCHIAVONEA", webcam: "", linkStazione: "#" },
  { nome: "Laghi di Sibari", lat: 39.72, lon: 16.50, quota: "ND", provincia: "CS", regione: "Calabria", area: "Alto ionio cosentino", openMeteo: true, stationId: "LAGHI_DI_SIBARI", webcam: "", linkStazione: "#" },
  { nome: "Doria", lat: 39.73, lon: 16.35, quota: "ND", provincia: "CS", regione: "Calabria", area: "Sibaritide", openMeteo: true, stationId: "DORIA", webcam: "", linkStazione: "#" },
  { nome: "Firmo", lat: 39.72, lon: 16.17, quota: "ND", provincia: "CS", regione: "Calabria", area: "Collina sibaritide", openMeteo: true, stationId: "FIRMO", webcam: "", linkStazione: "#" },
  { nome: "Miglierina", lat: 39.001, lon: 16.444, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "MIGLIERINA", webcam: "", linkStazione: "#" },
  { nome: "Tiriolo", lat: 38.962, lon: 16.512, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "TIRIOLO", webcam: "", linkStazione: "#" },
  { nome: "San Pietro Apostolo", lat: 39.007, lon: 16.47, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "SAN_PIETRO_APOSTOLO", webcam: "", linkStazione: "#" },
  { nome: "Cerva", lat: 39.029, lon: 16.572, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "CERVA", webcam: "", linkStazione: "#" },
  { nome: "Petronà", lat: 39.118, lon: 16.632, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "PETRONÀ", webcam: "", linkStazione: "#" },
  { nome: "Belcastro", lat: 39.027, lon: 16.687, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "BELCASTRO", webcam: "", linkStazione: "#" },
  { nome: "Simeri", lat: 38.971, lon: 16.677, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "SIMERI", webcam: "", linkStazione: "#" },
  { nome: "Dulcino", lat: 39.039, lon: 16.434, quota: "ND", provincia: "CZ", regione: "Calabria", area: "Presila Catanzarese", openMeteo: true, stationId: "DULCINO", webcam: "", linkStazione: "#" },
  { nome: "Filadelfia", lat: 38.818, lon: 16.247, quota: "ND", provincia: "VV", regione: "Calabria", area: "Entroterra Vibonese", openMeteo: true, stationId: "FILADELFIA", webcam: "", linkStazione: "#" },
  { nome: "Olivara", lat: 38.77, lon: 16.21, quota: "ND", provincia: "VV", regione: "Calabria", area: "Costa vibonese", openMeteo: true, stationId: "OLIVARA", webcam: "", linkStazione: "#" }
];

// ---------- UTILITY ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function salvaOsservazione(stationId, lat, lon, temp) {
  try {
    await db.collection('osservazioni').add({
      stationId,
      latitudine: lat,
      longitudine: lon,
      temperatura: temp,
      timestamp: Timestamp.now()
    });
    console.log('Salvato per', stationId);
  } catch (e) {
    console.error('Errore salvataggio', stationId, e.message);
  }
}

// ---------- WEATHER.COM ----------
async function fetchWeatherCom(st) {
  if (!st.apiKey) return;
  try {
    const url = `https://api.weather.com/v2/pws/observations/current?stationId=\${st.stationId}&format=json&units=m&apiKey=\${st.apiKey}`;
    const resp = await fetch(url);
    const raw = await resp.text();
    if (!raw.startsWith('{')) throw new Error('Risposta non valida');
    const d = JSON.parse(raw).observations?.[0];
    if (!d) return;
    await salvaOsservazione(st.stationId, st.lat, st.lon, d.metric?.temp);
  } catch (err) {
    console.error('Weather.com', st.stationId, err.message);
  }
}

async function fetchWeatherComAll() {
  for (const st of stazioni.filter(s => s.apiKey)) {
    await fetchWeatherCom(st);
  }
}

// ---------- OPEN‑METEO ----------
function chunk(arr, size) { const out=[]; for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out;}
const omGroups = chunk(stazioni.filter(s => s.openMeteo), BATCH_SIZE);
let groupIdx = 0;

async function fetchOpenMeteoGroup() {
  if (omGroups.length === 0) return;
  const batch = omGroups[groupIdx];
  groupIdx = (groupIdx + 1) % omGroups.length;

  const lats = batch.map(s=>s.lat).join(',');
  const lons = batch.map(s=>s.lon).join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=\${lats}&longitude=\${lons}&current=\${OPENMETEO_PARAMS}&timezone=auto`;

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP \${r.status}`);
    const data = await r.json();
    const recs = Array.isArray(data) ? data : [data];
    for (let i=0;i<recs.length;i++) {
      const cur = recs[i]?.current;
      if (!cur) continue;
      const st = batch[i];
      await salvaOsservazione(st.stationId, st.lat, st.lon, cur.temperature_2m);
    }
  } catch (err) {
    console.error('Open‑Meteo batch', err.message);
  }
}

// ---------- SCHEDULER ----------
let nextOM = 0;
async function ciclo() {
  console.log('--- ciclo', new Date().toISOString());
  await fetchWeatherComAll();

  if (Date.now() >= nextOM) {
    await fetchOpenMeteoGroup();
    const jitter = OPENMETEO_INTERVAL_MIN_MIN + Math.floor(Math.random()*(OPENMETEO_INTERVAL_MIN_MAX-OPENMETEO_INTERVAL_MIN_MIN+1));
    nextOM = Date.now() + jitter*60_000;
    console.log('Open‑Meteo: prossimo gruppo fra', jitter, 'minuti');
  }
}

await ciclo();
setInterval(ciclo, WEATHERCOM_INTERVAL_MIN*60_000);

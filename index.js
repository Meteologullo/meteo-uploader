// index_snellente.js – versione ottimizzata (15 giu 2025)
// • Weather.com / PWS → ogni 10 min
// • Open‑Meteo (solo temperatura) → un gruppo ≤100 stazioni ogni 30‑40 min
//   → ~4 100 “unit” al giorno, molto sotto il limite 10k.

import fetch from 'node-fetch';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ---------- CONFIG ----------
const WEATHERCOM_INTERVAL_MIN = 10;
const OPENMETEO_MIN = 30;   // intervallo minimo (min)
const OPENMETEO_MAX = 40;   // intervallo massimo (min)
const BATCH_SIZE = 100;     // max coordinate per request
const OPENMETEO_PARAMS = 'temperature_2m';

// ---------- STAZIONI ----------
const stazioni = [
  { stationId: "ICOSEN11", lat: 38.905, lon: 16.587, apiKey: "03d402e1e8844ac49402e1e8844ac419" },
  { stationId: "IAMANT7", lat: 39.143, lon: 16.062, apiKey: "a3f4ae4f9b6d46a4b4ae4f9b6d06a494" },
  { stationId: "ICELIC3", lat: 38.873, lon: 16.683, apiKey: "2d12def7f4894eca92def7f4892eca99" },
  { stationId: "ICOSEN20", lat: 38.898, lon: 16.556, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "IMENDI13", lat: 38.85, lon: 16.464, apiKey: "844d02e7e12049ef8d02e7e120b9ef68" },
  { stationId: "ICASAL40", lat: 38.993, lon: 16.62, apiKey: "b368cd08174d424fa8cd08174d424f20" },
  { stationId: "IBIANC4", lat: 39.11, lon: 16.42, apiKey: "2ccb91c2398a4f778b91c2398a4f772f" },
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

  { stationId: "ACCONIA", lat: 38.836, lon: 16.265, openMeteo: true },
  { stationId: "ACQUAFORMOSA", lat: 39.736, lon: 16.078, openMeteo: true },
  { stationId: "AIELLO_CALABRO", lat: 39.117, lon: 16.167, openMeteo: true },
  { stationId: "ALBIDONA", lat: 39.937, lon: 16.525, openMeteo: true },
  { stationId: "ALESSANDRIA_DEL_CARRETTO", lat: 39.984, lon: 16.338, openMeteo: true },
  { stationId: "ALTILIA", lat: 39.129, lon: 16.253, openMeteo: true },
  { stationId: "AMENDOLEA", lat: 38.025, lon: 15.887, openMeteo: true },
  { stationId: "ANTONIMINA", lat: 38.195, lon: 16.097, openMeteo: true },
  { stationId: "APOLLINARA", lat: 39.7, lon: 16.41, openMeteo: true },
  { stationId: "ARDORE", lat: 38.23, lon: 16.171, openMeteo: true },
  { stationId: "ARENA", lat: 38.576, lon: 16.157, openMeteo: true },
  { stationId: "BADOLATO", lat: 38.578, lon: 16.556, openMeteo: true },
  { stationId: "BAGNARA_CALABRA", lat: 38.272, lon: 15.799, openMeteo: true },
  { stationId: "BELCASTRO", lat: 39.027, lon: 16.687, openMeteo: true },
  { stationId: "BELVEDERE_DI_SPINELLO", lat: 39.236, lon: 16.925, openMeteo: true },
  { stationId: "BENESTARE", lat: 38.207, lon: 16.148, openMeteo: true },
  { stationId: "BIANCO", lat: 38.082, lon: 16.142, openMeteo: true },
  { stationId: "BOCCHIGLIERO", lat: 39.429, lon: 16.797, openMeteo: true },
  { stationId: "BORGIA", lat: 38.882, lon: 16.507, openMeteo: true },
  { stationId: "BOTRICELLO", lat: 38.932, lon: 16.858, openMeteo: true },
  { stationId: "BOVA_MARINA", lat: 37.933, lon: 15.918, openMeteo: true },
  { stationId: "BRIATICO", lat: 38.72, lon: 15.949, openMeteo: true },
  { stationId: "BROGNATURO", lat: 38.575, lon: 16.373, openMeteo: true },
  { stationId: "CACCURI", lat: 39.164, lon: 16.786, openMeteo: true },
  { stationId: "CALOPEZZATI", lat: 39.516, lon: 16.869, openMeteo: true },
  { stationId: "CAMIGLIANO", lat: 38.983, lon: 16.233, openMeteo: true },
  { stationId: "CAMPANA", lat: 39.496, lon: 16.742, openMeteo: true },
  { stationId: "CAMPO_SAN_LORENZO", lat: 39.36, lon: 16.49, openMeteo: true },
  { stationId: "CANTINELLA", lat: 39.66, lon: 16.44, openMeteo: true },
  { stationId: "CAPO_COLONNA", lat: 39.016, lon: 17.135, openMeteo: true },
  { stationId: "CARAFFA", lat: 38.882, lon: 16.488, openMeteo: true },
  { stationId: "CARDETO", lat: 38.045, lon: 15.745, openMeteo: true },
  { stationId: "CARIA", lat: 38.638, lon: 15.958, openMeteo: true },
  { stationId: "CAROLEI", lat: 39.25, lon: 16.217, openMeteo: true },
  { stationId: "CASABONA", lat: 39.2, lon: 16.991, openMeteo: true },
  { stationId: "CASSANO_IONIO", lat: 39.783, lon: 16.317, openMeteo: true },
  { stationId: "CASTELSILANO", lat: 39.238, lon: 16.844, openMeteo: true },
  { stationId: "CASTROREGIO", lat: 39.987, lon: 16.51, openMeteo: true },
  { stationId: "CATANZARO_LIDO", lat: 38.83, lon: 16.628, openMeteo: true },
  { stationId: "CERCHIARA_DI_CALABRIA", lat: 39.883, lon: 16.4, openMeteo: true },
  { stationId: "CERENZIA", lat: 39.246, lon: 16.812, openMeteo: true },
  { stationId: "CERVA", lat: 39.029, lon: 16.572, openMeteo: true },
  { stationId: "CHIARAVALLE_C", lat: 38.681, lon: 16.412, openMeteo: true },
  { stationId: "CICALA", lat: 39.02, lon: 16.416, openMeteo: true },
  { stationId: "CIRELLA", lat: 39.703, lon: 15.823, openMeteo: true },
  { stationId: "CIRICILLA", lat: 39.012, lon: 16.365, openMeteo: true },
  { stationId: "CORIGLIANO_CALABRO", lat: 39.593, lon: 16.519, openMeteo: true },
  { stationId: "CORIGLIANO_SCALO", lat: 39.618, lon: 16.509, openMeteo: true },
  { stationId: "COTRONEI", lat: 39.16, lon: 16.773, openMeteo: true },
  { stationId: "COZZO_CARBONARO", lat: 39.46, lon: 16.2, openMeteo: true },
  { stationId: "CROPALATI", lat: 39.466, lon: 16.585, openMeteo: true },
  { stationId: "CROPANI", lat: 38.967, lon: 16.783, openMeteo: true },
  { stationId: "CROSIA", lat: 39.517, lon: 16.903, openMeteo: true },
  { stationId: "CURINGA", lat: 38.828, lon: 16.313, openMeteo: true },
  { stationId: "DIPIGNANO", lat: 39.238, lon: 16.253, openMeteo: true },
  { stationId: "DORIA", lat: 39.73, lon: 16.35, openMeteo: true },
  { stationId: "DULCINO", lat: 39.039, lon: 16.434, openMeteo: true },
  { stationId: "FABRIZIO", lat: 39.635, lon: 16.575, openMeteo: true },
  { stationId: "FALERNA", lat: 39.003, lon: 16.172, openMeteo: true },
  { stationId: "FILADELFIA", lat: 38.818, lon: 16.247, openMeteo: true },
  { stationId: "FIRMO", lat: 39.72, lon: 16.17, openMeteo: true },
  { stationId: "FRANCAVILLA_ANGITOLA", lat: 38.783, lon: 16.267, openMeteo: true },
  { stationId: "GALLICO_MARINA", lat: 38.17, lon: 15.65, openMeteo: true },
  { stationId: "GAMBARIE", lat: 38.154, lon: 15.877, openMeteo: true },
  { stationId: "GIZZERIA", lat: 38.937, lon: 16.148, openMeteo: true },
  { stationId: "GUARDIA_PIEM", lat: 39.467, lon: 16, openMeteo: true },
  { stationId: "INUST1", lat: 39.4, lon: 16.5, openMeteo: true },
  { stationId: "LAGHI_DI_SIBARI", lat: 39.72, lon: 16.5, openMeteo: true },
  { stationId: "LAGO", lat: 39.198, lon: 16.128, openMeteo: true },
  { stationId: "LAINO_BORGO", lat: 39.95, lon: 15.97, openMeteo: true },
  { stationId: "LAMEZIA_TERME", lat: 38.967, lon: 16.3, openMeteo: true },
  { stationId: "LATTARICO", lat: 39.464, lon: 16.138, openMeteo: true },
  { stationId: "LATTARICO_PIRETTO", lat: 39.467, lon: 16.133, openMeteo: true },
  { stationId: "LE_CANNELLA", lat: 38.946, lon: 17.074, openMeteo: true },
  { stationId: "LE_CASTELLA", lat: 38.906, lon: 17.01, openMeteo: true },
  { stationId: "LOCRI", lat: 38.243, lon: 16.258, openMeteo: true },
  { stationId: "LORICA", lat: 39.24, lon: 16.51, openMeteo: true },
  { stationId: "LUZZI_CENTRO", lat: 39.447, lon: 16.28, openMeteo: true },
  { stationId: "LUZZI_PETRINI", lat: 39.46, lon: 16.24, openMeteo: true },
  { stationId: "MAIDA", lat: 38.859, lon: 16.363, openMeteo: true },
  { stationId: "MAIERATO", lat: 38.697, lon: 16.111, openMeteo: true },
  { stationId: "MANDATORICCIO", lat: 39.508, lon: 16.87, openMeteo: true },
  { stationId: "MANGONE", lat: 39.206, lon: 16.333, openMeteo: true },
  { stationId: "MARANO_MARCH", lat: 39.317, lon: 16.175, openMeteo: true },
  { stationId: "MARCEDUSA", lat: 39.024, lon: 16.858, openMeteo: true },
  { stationId: "MARINA_DI_CAULONIA", lat: 38.389, lon: 16.463, openMeteo: true },
  { stationId: "MARINA_DI_GIOIOSA_IONICA", lat: 38.3, lon: 16.318, openMeteo: true },
  { stationId: "MARINA_DI_SANTILARIO_DELLO_IONIO", lat: 38.174, lon: 16.239, openMeteo: true },
  { stationId: "MELICUCCÀ", lat: 38.35, lon: 15.942, openMeteo: true },
  { stationId: "MESORACA", lat: 39.096, lon: 16.789, openMeteo: true },
  { stationId: "MIGLIERINA", lat: 39.001, lon: 16.444, openMeteo: true },
  { stationId: "MILETO", lat: 38.606, lon: 16.067, openMeteo: true },
  { stationId: "MIRTO", lat: 39.502, lon: 16.768, openMeteo: true },
  { stationId: "MOLOCHIO", lat: 38.28, lon: 16.01, openMeteo: true },
  { stationId: "MONASTERACE", lat: 38.474, lon: 16.58, openMeteo: true },
  { stationId: "MONSORETO", lat: 38.521, lon: 16.163, openMeteo: true },
  { stationId: "MONTEBELLO_IONICO", lat: 37.986, lon: 15.759, openMeteo: true },
  { stationId: "MONTEGIORDANO", lat: 40.04, lon: 16.53, openMeteo: true },
  { stationId: "MONTEPAONE", lat: 38.697, lon: 16.529, openMeteo: true },
  { stationId: "MONTEPAONE_LIDO", lat: 38.729, lon: 16.542, openMeteo: true },
  { stationId: "MONTEROSSO_CALABRO", lat: 38.718, lon: 16.292, openMeteo: true },
  { stationId: "MOTTA_SAN_GIOVANNI", lat: 38.013, lon: 15.706, openMeteo: true },
  { stationId: "MOTTICELLA", lat: 38.064, lon: 16.137, openMeteo: true },
  { stationId: "NICOTERA", lat: 38.533, lon: 15.933, openMeteo: true },
  { stationId: "NOCARA", lat: 40.09, lon: 16.48, openMeteo: true },
  { stationId: "OLIVARA", lat: 38.77, lon: 16.21, openMeteo: true },
  { stationId: "OPPIDO_MAMERTINA", lat: 38.351, lon: 15.986, openMeteo: true },
  { stationId: "ORIOLO", lat: 40.05, lon: 16.434, openMeteo: true },
  { stationId: "ORSOMARSO", lat: 39.799, lon: 15.908, openMeteo: true },
  { stationId: "PALERMITI", lat: 38.71, lon: 16.422, openMeteo: true },
  { stationId: "PALIZZI", lat: 37.939, lon: 15.991, openMeteo: true },
  { stationId: "PALIZZI_MARINA", lat: 37.919, lon: 15.973, openMeteo: true },
  { stationId: "PALUDI", lat: 39.496, lon: 16.671, openMeteo: true },
  { stationId: "PANETTI", lat: 39.01, lon: 16.3, openMeteo: true },
  { stationId: "PANETTIERI", lat: 39.079, lon: 16.423, openMeteo: true },
  { stationId: "PAPANICE", lat: 39.118, lon: 16.981, openMeteo: true },
  { stationId: "PAPASIDERO", lat: 39.87, lon: 15.9, openMeteo: true },
  { stationId: "PARAVATI", lat: 38.6, lon: 16.084, openMeteo: true },
  { stationId: "PETRIZZI", lat: 38.637, lon: 16.474, openMeteo: true },
  { stationId: "PETRONÀ", lat: 39.118, lon: 16.632, openMeteo: true },
  { stationId: "PIANOPOLI", lat: 38.957, lon: 16.319, openMeteo: true },
  { stationId: "PIETRAPAOLA", lat: 39.486, lon: 16.893, openMeteo: true },
  { stationId: "PIETRAPENNATA", lat: 38.187, lon: 15.956, openMeteo: true },
  { stationId: "PINO_GRANDE", lat: 39.32, lon: 16.75, openMeteo: true },
  { stationId: "PLATACI", lat: 39.9, lon: 16.43, openMeteo: true },
  { stationId: "PLATÌ", lat: 38.19, lon: 16.094, openMeteo: true },
  { stationId: "POTAME", lat: 39.188, lon: 16.199, openMeteo: true },
  { stationId: "PRAIA_A_MARE", lat: 39.909, lon: 15.778, openMeteo: true },
  { stationId: "RENDE_QUATTR", lat: 39.354, lon: 16.242, openMeteo: true },
  { stationId: "RIACE_MARINA", lat: 38.483, lon: 16.566, openMeteo: true },
  { stationId: "ROCCA_IMPERIALE", lat: 40.1, lon: 16.58, openMeteo: true },
  { stationId: "ROCCELLA_IONICA", lat: 38.327, lon: 16.398, openMeteo: true },
  { stationId: "ROCCELLETTA", lat: 38.781, lon: 16.519, openMeteo: true },
  { stationId: "ROGGIANO", lat: 39.618, lon: 16.162, openMeteo: true },
  { stationId: "ROSE", lat: 39.394, lon: 16.232, openMeteo: true },
  { stationId: "ROTA_GRECA", lat: 39.467, lon: 16.117, openMeteo: true },
  { stationId: "SAMBATELLO", lat: 38.179, lon: 15.69, openMeteo: true },
  { stationId: "SANPIETRO_GUARANO", lat: 39.333, lon: 16.317, openMeteo: true },
  { stationId: "SANPIETRO_LAM", lat: 38.869, lon: 16.278, openMeteo: true },
  { stationId: "SANTAGATA_DEL_BIANCO", lat: 38.092, lon: 16.176, openMeteo: true },
  { stationId: "SANTALESSIO_IN_ASPROMONTE", lat: 38.148, lon: 15.709, openMeteo: true },
  { stationId: "SANTANGELO_DI_GEROCARNE", lat: 38.639, lon: 16.123, openMeteo: true },
  { stationId: "SANTA_CRISTINA_DASPROMONTE", lat: 38.275, lon: 15.954, openMeteo: true },
  { stationId: "SANTEUFEMIA_DASPROMONTE", lat: 38.287, lon: 15.887, openMeteo: true },
  { stationId: "SANTO_STEFANO_IN_ASPROMONTE", lat: 38.155, lon: 15.799, openMeteo: true },
  { stationId: "SANVITO_IONIO", lat: 38.71, lon: 16.41, openMeteo: true },
  { stationId: "SAN_CALOGERO", lat: 38.53, lon: 16.033, openMeteo: true },
  { stationId: "SAN_DEMETRIO_CORONE", lat: 39.562, lon: 16.51, openMeteo: true },
  { stationId: "SAN_FERDINANDO", lat: 38.483, lon: 15.899, openMeteo: true },
  { stationId: "SAN_FLORO", lat: 38.899, lon: 16.486, openMeteo: true },
  { stationId: "SAN_GIACOMO_DACRI", lat: 39.485, lon: 16.357, openMeteo: true },
  { stationId: "SAN_GIORGIO_ALBANESE", lat: 39.58, lon: 16.45, openMeteo: true },
  { stationId: "SAN_GIOVANNI_DI_GERACE", lat: 38.286, lon: 16.226, openMeteo: true },
  { stationId: "SAN_GREGORIO", lat: 38.048, lon: 15.682, openMeteo: true },
  { stationId: "SAN_LORENZO_BELLIZZI", lat: 39.88, lon: 16.33, openMeteo: true },
  { stationId: "SAN_LUCIDO", lat: 39.31, lon: 16.052, openMeteo: true },
  { stationId: "SAN_MANGO_DAQUINO", lat: 39.027, lon: 16.217, openMeteo: true },
  { stationId: "SAN_MAURO_MARCHESATO", lat: 39.126, lon: 16.859, openMeteo: true },
  { stationId: "SAN_NICOLA_DA_CRISSA", lat: 38.635, lon: 16.205, openMeteo: true },
  { stationId: "SAN_NICOLA_DELLALTO", lat: 39.221, lon: 17.071, openMeteo: true },
  { stationId: "SAN_PIETRO_APOSTOLO", lat: 39.007, lon: 16.47, openMeteo: true },
  { stationId: "SAN_SOSTENE", lat: 38.65, lon: 16.487, openMeteo: true },
  { stationId: "SAN_VINCENZO_LA_COSTA", lat: 39.374, lon: 16.162, openMeteo: true },
  { stationId: "SARACENA", lat: 39.849, lon: 16.11, openMeteo: true },
  { stationId: "SAVELLI", lat: 39.3, lon: 16.762, openMeteo: true },
  { stationId: "SCHIAVONEA", lat: 39.663, lon: 16.523, openMeteo: true },
  { stationId: "SELLIA", lat: 38.832, lon: 16.517, openMeteo: true },
  { stationId: "SERRA_SAN_BRUNO", lat: 38.583, lon: 16.316, openMeteo: true },
  { stationId: "SETTINGIANO", lat: 38.91, lon: 16.515, openMeteo: true },
  { stationId: "SIBARI", lat: 39.74, lon: 16.45, openMeteo: true },
  { stationId: "SIDERNO", lat: 38.27, lon: 16.294, openMeteo: true },
  { stationId: "SIMERI", lat: 38.971, lon: 16.677, openMeteo: true },
  { stationId: "SIMERI_MARE", lat: 38.866, lon: 16.698, openMeteo: true },
  { stationId: "SORBO_BASILE", lat: 39.019, lon: 16.569, openMeteo: true },
  { stationId: "SOVERIA_SIMERI", lat: 38.97, lon: 16.659, openMeteo: true },
  { stationId: "SQUILLACE", lat: 38.781, lon: 16.513, openMeteo: true },
  { stationId: "STECCATO_CUTRO", lat: 38.938, lon: 16.917, openMeteo: true },
  { stationId: "TARSIA", lat: 39.623, lon: 16.273, openMeteo: true },
  { stationId: "TAURIANOVA", lat: 38.354, lon: 16.03, openMeteo: true },
  { stationId: "TAVERNA_DI_MONTALTO_UFFUGO", lat: 39.415, lon: 16.246, openMeteo: true },
  { stationId: "TERRANOVA_DI_POLLINO", lat: 40.032, lon: 16.23, openMeteo: true },
  { stationId: "TERRANOVA_SIBARI", lat: 39.657, lon: 16.34, openMeteo: true },
  { stationId: "TIRIOLO", lat: 38.962, lon: 16.512, openMeteo: true },
  { stationId: "TORRE_DI_RUGGIERO", lat: 38.648, lon: 16.353, openMeteo: true },
  { stationId: "TRUNCA", lat: 38.155, lon: 15.642, openMeteo: true },
  { stationId: "VALLEFIORITA", lat: 38.778, lon: 16.49, openMeteo: true },
  { stationId: "VENA_DI_MAIDA", lat: 38.889, lon: 16.407, openMeteo: true },
  { stationId: "VERBICARO", lat: 39.756, lon: 15.916, openMeteo: true },
  { stationId: "VERZINO", lat: 39.326, lon: 16.911, openMeteo: true },
  { stationId: "VIBO_MARINA", lat: 38.721, lon: 16.127, openMeteo: true },
  { stationId: "VIGNE", lat: 39.357, lon: 16.869, openMeteo: true },
  { stationId: "VILLAGGIO_MANCUSO", lat: 39.022, lon: 16.608, openMeteo: true },
  { stationId: "VILLAGGIO_PALUMBO", lat: 39.215, lon: 16.762, openMeteo: true },
  { stationId: "VILLAGGIO_TREPITÒ", lat: 38.386, lon: 16.453, openMeteo: true },
  { stationId: "ZAMBRONE", lat: 38.695, lon: 15.959, openMeteo: true },
];

// ---------- UTIL ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function salvaOsservazione(id, lat, lon, temp) {
  try {
    await db.collection('osservazioni').add({
      stationId: id,
      latitudine: lat,
      longitudine: lon,
      temperatura: temp,
      timestamp: Timestamp.now()
    });
    console.log('Salvato per', id);
  } catch (e) {
    console.error('Errore salvataggio', id, e.message);
  }
}

// ---------- WEATHER.COM ----------
async function fetchWeatherCom(st) {
  try {
    const url = `https://api.weather.com/v2/pws/observations/current?stationId=${st.stationId}&format=json&units=m&apiKey=${st.apiKey}`;
    const r = await fetch(url);
    const raw = await r.text();
    if (!raw.startsWith('{')) throw new Error('Risposta non valida');
    const d = JSON.parse(raw).observations?.[0];
    if (!d?.metric?.temp) return;
    await salvaOsservazione(st.stationId, st.lat, st.lon, d.metric.temp);
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
function chunk(arr, size) { const out=[]; for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }
const omGroups = chunk(stazioni.filter(s => s.openMeteo), BATCH_SIZE);
let groupIdx = 0;

async function fetchOpenMeteoGroup() {
  if (omGroups.length === 0) return;
  const batch = omGroups[groupIdx];
  groupIdx = (groupIdx + 1) % omGroups.length;

  const lats = batch.map(s=>s.lat).join(',');
  const lons = batch.map(s=>s.lon).join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=${OPENMETEO_PARAMS}&timezone=auto`;

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
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
    const jitter = OPENMETEO_MIN + Math.floor(Math.random()*(OPENMETEO_MAX-OPENMETEO_MIN+1));
    nextOM = Date.now() + jitter*60_000;
    console.log('Open‑Meteo: prossimo gruppo fra', jitter, 'minuti');
  }
}

await ciclo();
setInterval(ciclo, WEATHERCOM_INTERVAL_MIN*60_000);

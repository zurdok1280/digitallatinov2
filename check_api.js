const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function check() {
  try {
    const r = await fetch('https://backend.digital-latino.com/api/report/getTopArtist/0/1/0');
    const d = await r.json();
    const a = Array.isArray(d) ? d[0] : (d.data ? d.data[0] : d);
    console.log(JSON.stringify(a, null, 2));
  } catch (e) {
    console.error(e);
  }
}
check();

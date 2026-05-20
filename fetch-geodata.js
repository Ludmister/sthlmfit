#!/usr/bin/env node
// Run once: node fetch-geodata.js
// Fetches real Stockholm district boundaries from Nominatim (OpenStreetMap)
// and writes neighbourhoods.geojson

const fs = require('fs');

const DISTRICTS = [
  { id: 1,  name: 'Södermalm',        query: 'Södermalm, Stockholm, Sweden' },
  { id: 2,  name: 'Vasastan',          query: 'Vasastaden, Stockholm, Sweden' },
  { id: 3,  name: 'Östermalm',         query: 'Östermalm, Stockholm, Sweden' },
  { id: 4,  name: 'Kungsholmen',       query: 'Kungsholmen, Stockholm, Sweden' },
  { id: 5,  name: 'Gamla Stan',        query: 'Gamla stan, Stockholm, Sweden' },
  { id: 6,  name: 'Norrmalm',          query: 'Norrmalm, Stockholm, Sweden' },
  { id: 7,  name: 'Hammarby Sjöstad',  query: 'Hammarby sjöstad, Stockholm, Sweden' },
  { id: 8,  name: 'Liljeholmen',       query: 'Liljeholmen, Stockholm, Sweden' },
  { id: 9,  name: 'Lidingö',           query: 'Lidingö, Sweden' },
  { id: 10, name: 'Djurgården',        query: 'Djurgården, Stockholm, Sweden' },
];

// Fallback polygon for Hammarby Sjöstad (no admin boundary in OSM)
const HAMMARBY_FALLBACK = {
  type: 'Polygon',
  coordinates: [[
    [18.083, 59.310], [18.092, 59.308], [18.102, 59.305],
    [18.114, 59.302], [18.124, 59.300], [18.132, 59.301],
    [18.137, 59.305], [18.134, 59.311], [18.126, 59.316],
    [18.114, 59.318], [18.100, 59.317], [18.090, 59.315],
    [18.083, 59.310],
  ]],
};

async function fetchDistrict(d) {
  const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
    q: d.query,
    format: 'json',
    polygon_geojson: '1',
    limit: '5',
  });

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SthlmFit/1.0 (map boundary fetch)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const results = await res.json();
  if (!results.length) throw new Error('no results');

  // Prefer results that have a Polygon or MultiPolygon geometry
  const withPoly = results.filter(r => r.geojson?.type === 'Polygon' || r.geojson?.type === 'MultiPolygon');
  const best = withPoly.find(r => r.osm_type === 'relation')
            || withPoly[0]
            || results.find(r => r.osm_type === 'relation')
            || results[0];

  const geo = best.geojson;
  const hasPolygon = geo?.type === 'Polygon' || geo?.type === 'MultiPolygon';

  if (!hasPolygon) {
    console.log(`  ~ ${d.name} — no polygon (${geo?.type}), using fallback`);
    return null;
  }

  const pts = geo.type === 'Polygon'
    ? geo.coordinates[0].length
    : geo.coordinates.reduce((s, p) => s + p[0].length, 0);

  console.log(`  ✓ ${d.name} — ${geo.type} (${pts} pts) osm:${best.osm_type}/${best.osm_id}`);
  return geo;
}

(async () => {
  console.log('Fetching Stockholm district boundaries from Nominatim...\n');

  const features = [];

  for (const d of DISTRICTS) {
    let geo = null;
    try {
      geo = await fetchDistrict(d);
    } catch (e) {
      console.error(`  ✗ ${d.name}: ${e.message}`);
    }

    if (!geo) {
      // Use fallback for known missing districts
      if (d.id === 7) {
        console.log(`  ✓ ${d.name} — using fallback polygon`);
        geo = HAMMARBY_FALLBACK;
      } else {
        console.warn(`  ✗ ${d.name}: skipping — no polygon available`);
        // Nominatim rate limit
        await new Promise(r => setTimeout(r, 1100));
        continue;
      }
    }

    features.push({
      type: 'Feature',
      properties: { id: d.id, name: d.name },
      geometry: geo,
    });

    // Nominatim rate limit: max 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }

  const geojson = { type: 'FeatureCollection', features };

  const out = 'neighbourhoods.geojson';
  fs.writeFileSync(out, JSON.stringify(geojson));

  console.log(`\nSaved ${out} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
  console.log(`Features: ${features.length}/${DISTRICTS.length}`);
  features.forEach(f => {
    const g = f.geometry;
    const pts = g.type === 'Polygon'
      ? g.coordinates[0].length
      : g.type === 'MultiPolygon'
        ? g.coordinates.reduce((s, p) => s + p[0].length, 0)
        : '?';
    console.log(`  #${f.properties.id} ${f.properties.name} — ${g.type} (${pts} pts)`);
  });
})();

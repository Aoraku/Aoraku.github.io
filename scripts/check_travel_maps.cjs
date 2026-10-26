// Run with: node scripts/check_travel_maps.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const d3 = require('../assets/vendor/d3.v7.min.js');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/travel', name + '.json')));
const world = read('world');
assert.equal(new Set(world.features.map(f => f.id)).size, world.features.length, 'Unique place IDs');
for (const [name, count] of [['china', 34], ['japan', 47], ['us', 50]]) {
  assert.equal(read(name).features.length, count, name + ' region count');
}
// Dateline corruption creates polar bands and changes Russia's spherical area.
const russia = world.features.find(f => f.id === '643');
assert(d3.geoArea(russia) > 0.41 && d3.geoArea(russia) < 0.42, 'Russia retains its source spherical area');
assert(!d3.geoContains(russia, [100, 85]), 'The Arctic Ocean is not Russian land');
const canada = world.features.find(f => f.id === '124');
assert(d3.geoArea(canada) > 0.241 && d3.geoArea(canada) < 0.245, 'Canadian latitude borders retain their shape');
for (const f of [russia, canada]) {
  for (const polygon of f.geometry.coordinates) {
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        assert(d3.geoDistance(ring[i - 1], ring[i]) < 2 * Math.PI / 180, f.properties.name + ': no artificial long chords');
      }
    }
  }
}
const china = world.features.find(f => f.id === '156');
for (const point of [[121, 23.7], [114.17, 22.3], [113.55, 22.2], [94.5, 28], [92, 27.6], [96, 28.2]]) {
  assert(d3.geoContains(china, point), 'China atlas geometry contains ' + point);
}
console.log('Travel maps: region counts, IDs, polar geometry, latitude borders and China geometry verified.');

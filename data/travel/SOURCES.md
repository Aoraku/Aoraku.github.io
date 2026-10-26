# Travel atlas sources

The atlas is a personal travel journal. China follows the Alibaba DataV boundary convention. Its 34 province-level divisions include Taiwan, Hong Kong, and Macao. The Tibet geometry includes the southern areas represented by that source. The same China geometry is used at world and subdivision levels; overlapping neighboring world polygons are clipped against it. The maritime-line feature in the source is a separate cartographic annotation, not a 35th province, and is not rendered as land.

- China: [Alibaba DataV GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector), [province geometry](https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json).
- World: [world-atlas 2](https://github.com/topojson/world-atlas), [countries-50m.json](https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json), derived from Natural Earth (public domain). World land polygons are simplified; China's geometry is supplied by DataV as described above.
- Japan: 地球地図日本 / Global Map Japan, Geospatial Information Authority of Japan, via [Data of Japan](https://github.com/dataofjapan/land). The source requires attribution for non-commercial use. [Original TopoJSON](https://raw.githubusercontent.com/dataofjapan/land/master/japan.topojson).
- United States: [us-atlas 3](https://github.com/topojson/us-atlas), derived from US Census Bureau data; [states-10m.json](https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json). The atlas includes 50 states; DC and territories are excluded from the state list.
- Rendering: [D3 7.9.0](https://github.com/d3/d3), ISC license; [TopoJSON Client 3.1.0](https://github.com/topojson/topojson-client), ISC license. Vendored license files accompany the libraries.

Source retrieval: October 26, 2026. Longitude unwrapping before planar clipping, border densification, polygon simplification, and spherical ring orientation are implemented in `scripts/prepare_travel_maps.py`.

## Adding travel notes

Edit `data/travel/visits.json`. An empty array means no notes have been published; it makes no claim about travel history. Every record has this structure:

```json
{
  "id": "unique-trip-id",
  "country": "156",
  "region": "CN-110000",
  "title": "A trip title",
  "date": "YYYY-MM-DD",
  "note": "A short memory.",
  "photos": [{ "src": "/assets/travel/photo.jpg", "alt": "Photo description" }]
}
```

Country IDs generally use the world dataset's numeric ISO/M49 codes as strings; features without a source code use a stable `area-` slug. The supported countries are: China `156`, Japan `392`, United States `840`. Region IDs use Chinese adcodes (`CN-110000`), Japanese prefecture codes (`JP-01`), and US state FIPS codes (`US-06`). Omit `region` for a country-level note. Region IDs and exact names are in the corresponding atlas JSON. Store personal photos in `assets/travel/`. Dates and photos automatically appear in the selected place's journal; countries and subdivisions with records are highlighted.

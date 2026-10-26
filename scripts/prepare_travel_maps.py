#!/usr/bin/env python3
"""Prepare the travel atlas. Requires shapely; fetch source GeoJSON/TopoJSON first.

Source paths are arguments: world GeoJSON, China GeoJSON, Japan GeoJSON, US GeoJSON.
TopoJSON can be decoded with the vendored topojson-client before running this script.
See data/travel/SOURCES.md for the exact source URLs and boundary convention.
"""
import json
import re
import subprocess
import sys
from pathlib import Path
from shapely.geometry import shape, mapping, Point, Polygon, MultiPolygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
from shapely import make_valid

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'travel'

def read(path):
    return json.loads(Path(path).read_text())['features']

def polygons(g):
    if isinstance(g, Polygon): return [g]
    if isinstance(g, MultiPolygon): return list(g.geoms)
    return [p for child in getattr(g, 'geoms', []) for p in polygons(child)]

def clean(g, tolerance=0.008):
    g = make_valid(g).simplify(tolerance, preserve_topology=True)
    # D3's spherical polygon convention is clockwise on the exterior ring.
    parts = [orient(p, sign=-1) for p in polygons(g) if not p.is_empty]
    return mapping(MultiPolygon(parts))

def feature(id, name, geometry, **props):
    return {'type':'Feature','id':id,'properties':{'name':name,**props},'geometry':geometry}

def write(name, features):
    payload={'type':'FeatureCollection','features':features}
    # Planar winding alone is ambiguous at the antimeridian. Check each island
    # with the same spherical area calculation used by the browser renderer.
    corrected=subprocess.run(['node','-e', '''
const d3=require('./assets/vendor/d3.v7.min.js');
const data=JSON.parse(require('fs').readFileSync(0,'utf8'));
for(const f of data.features){
  for(const polygon of f.geometry.coordinates){
    if(d3.geoArea({type:'Polygon',coordinates:polygon})>2*Math.PI)
      polygon.forEach(ring=>ring.reverse());
  }
}
process.stdout.write(JSON.stringify(data));
'''],input=json.dumps(payload,ensure_ascii=False),text=True,capture_output=True,cwd=ROOT,check=True).stdout
    (OUT/name).write_text(corrected+'\n')

if __name__ == '__main__':
    world, cn, jp, us = [read(p) for p in sys.argv[1:5]]
    OUT.mkdir(exist_ok=True)
    cn=[f for f in cn if isinstance(f['properties'].get('adcode'),int)]
    assert len(cn)==34
    china=unary_union([make_valid(shape(f['geometry'])) for f in cn])
    # Taiwan, Hong Kong and Macao are province-level entries in this atlas.
    assert {710000,810000,820000}.issubset({f['properties']['adcode'] for f in cn})
    tibet=shape(next(f for f in cn if f['properties']['adcode']==540000)['geometry'])
    assert all(tibet.covers(Point(*p)) for p in [(94.5,28),(92,27.6),(96,28.2)])
    grouped={}
    for f in world:
        id=str(f.get('id',''))
        if id in {'156','158','344','446'}:continue
        if not id:id='area-'+re.sub(r'[^a-z0-9]+','-',f['properties']['name'].lower()).strip('-')
        g=make_valid(shape(f['geometry']))
        if g.intersects(china):g=g.difference(china)
        if not g.is_empty:
            if id in grouped:grouped[id]['geometry']=unary_union([grouped[id]['geometry'],g])
            else:grouped[id]={'name':f['properties']['name'],'geometry':g}
    countries=[feature(id,item['name'],clean(item['geometry'],0.055)) for id,item in grouped.items()]
    countries.append(feature('156','China',clean(china,0.015)))
    write('world.json',countries)
    write('china.json',[feature(f"CN-{f['properties']['adcode']}",f['properties']['name'],clean(shape(f['geometry']),0.004),center=f['properties'].get('centroid') or f['properties']['center']) for f in cn])
    assert len(jp)==47
    write('japan.json',[feature(f"JP-{f['properties']['id']:02}",f['properties']['nam_ja'],clean(shape(f['geometry']),0.006),english=f['properties']['nam']) for f in sorted(jp,key=lambda f:f['properties']['id'])])
    states=[f for f in us if int(f['id'])<60 and int(f['id'])!=11]
    assert len(states)==50
    write('us.json',[feature(f"US-{int(f['id']):02}",f['properties']['name'],clean(shape(f['geometry']),0.012)) for f in sorted(states,key=lambda f:f['properties']['name'])])
    print(f'Prepared {len(countries)} country/area geometries and 34 / 47 / 50 subdivisions.')

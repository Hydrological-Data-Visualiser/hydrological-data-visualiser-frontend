import json
import random

generated = {"type":"FeatureCollection"}
fragments = []

offset_x, offset_y = 19, 50.5
scale = 0.01

for x in range(50):
    for y in range(20):
        coordinates = []
        coordinates += [[x*scale + offset_x, y*scale + offset_y]]
        coordinates += [[(x+1)*scale + offset_x, y*scale + offset_y]]
        coordinates += [[(x+1)*scale + offset_x, (y+1)*scale + offset_y]]
        coordinates += [[x*scale + offset_x, (y+1)*scale + offset_y]]

        fragment = {"type": "Feature", 
                   "properties": {"humidity": random.randrange(0, 50)},
                   "geometry": {
                       "type": "Polygon", 
                       "coordinates": [coordinates]
                       }
                   }
        fragments += [fragment]

generated["features"] = fragments

y = json.dumps(generated)

sourceFile = open('choropleth_example.geojson', 'w')
print(y, file = sourceFile)
sourceFile.close()


mapboxgl.accessToken =
    'pk.eyJ1Ijoia2hhdG5hMzkiLCJhIjoiY21sNXl0ZGNjMDg4YzNjb2F6djRqeWZ6dyJ9.LGvvVbi09f99mlpbidyXAQ';

const cfg = window.mapConfig;

let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 5, // starting zoom
    minZoom: 4, // minimum zoom level of the map
    center: [-98, 38], // starting center
    projection: "albers"
});

const colors = ['rgb(208,209,230)', 'rgb(103,169,207)', 'rgb(1,108,89)', 'rgb(204,706,2)', 'rgb(236,112,20)', 'rgb(254,153,41)'];

map.on('load', () => {
    map.addSource('cfg.sourceId', {
        type: 'geojson',
        data: cfg.data
    });

    if(cfg.type === 'proportional'){
        const grades = [0, 1000, 5000, 10000, 20000, 100000];
        const radii = [3, 5, 12, 15, 24, 33];
        
        map.addLayer({
                'id': 'covidCases-point',
                'type': 'circle',
                'source': 'cfg.sourceId',
                'paint': {
                    'circle-radius': {
                        'property': cfg.valueField,
                        'stops': [
                            [grades[0], radii[0]],
                            [grades[1], radii[1]],
                            [grades[2], radii[2]],
                            [grades[3], radii[3]],
                            [grades[4], radii[4]],
                            [grades[5], radii[5]]
                        ]
                    },
                    'circle-color': {
                        'property': cfg.valueField,
                        'stops': [
                            [grades[0], colors[0]],
                            [grades[1], colors[1]],
                            [grades[2], colors[2]],
                            [grades[3], colors[3]],
                            [grades[4], colors[4]],
                            [grades[5], colors[5]]
                        ]
                    },
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    'circle-opacity': 0.6
                }
            }
        );

        map.on('click', 'covidCases-point', (event) => {
            const p = event.features[0].properties;
            new mapboxgl.Popup()
                .setLngLat(event.features[0].geometry.coordinates)
                .setHTML(`<strong>${p.county}, ${p.state}</strong><br/>
                    ${cfg.title}:<strong> ${Number(p[cfg.valueField]).toLocaleString()}`)
                .addTo(map);
        });

        casesLegendHelper(cfg.title, grades, radii, colors);

    } else if(cfg.type === 'choropleth'){
        const grades = [0, 25, 50, 75, 100, 125];

        map.addLayer({
            'id' : 'covidRates-fill',
            'type' : 'fill',
            'source' : 'cfg.sourceId',
            'paint':{
                'fill-color': {
                    'property': cfg.valueField,
                    'stops': [
                        [grades[0], colors[0]],
                        [grades[1], colors[1]],
                        [grades[2], colors[2]],
                        [grades[3], colors[3]],
                        [grades[4], colors[4]],
                        [grades[5], colors[5]]
                    ]
                },
                'fill-opacity': 0.75,
                'fill-outline-color': 'rgb(255, 255, 255)'
            }
        });

        map.addLayer({
            'id' : 'covidRates-outline',
            'type' : 'line',
            'source' : 'cfg.sourceId',
            'paint':{
                'line-color' : 'white',
                'line-width' : 0.5,
                'line-opacity' : 0.2
            }
        });

        map.on('click', 'covidRates-fill', (event) => {
            const p = event.features[0].properties;
            new mapboxgl.Popup()
                .setLngLat(event.lngLat)
                .setHTML(`<strong>${p.county}, ${p.state}</strong><br/>
                    ${cfg.title}:<strong> ${Number(p[cfg.valueField]).toLocaleString()}`)
                .addTo(map);
        });

        ratesLegendHelper(cfg.title, grades, colors);
    }   
});


function casesLegendHelper(title, grades, radii, colors){
    const legend = document.getElementById('legend');
    const labels = [`<strong>${title}</strong>`];

    for (let i = 0; i < grades.length; i++){
        const next = grades[i+1];
        const range = next ? `${grades[i]}-${next}` : `${grades[i]}+`;
        const r = radii[i];

        labels.push(
            `<p class="break">
                <span class="dot" style="background:${colors[i]}; width:${r*2}px; height:${r*2}px;"></span>
                <span class="dot-label">${range}</span>
            </p>`
        );
    }
    legend.innerHTML = labels.join("");
}

function ratesLegendHelper(title, grades, colors){
    const legend = document.getElementById('legend');
    const labels = [`<strong>${title}</strong>`];

    for (let i = 0; i < grades.length; i++){
        const next = grades[i+1];
        const range = next ? `${grades[i]}-${next}` : `${grades[i]}+`;

        labels.push(
            `<p>
                <span class="swatch" style="background:${colors[i]};"></span>
                <span class="swatch-label">${range}</span>
            </p>`
        );
    }
    legend.innerHTML = labels.join("");
}

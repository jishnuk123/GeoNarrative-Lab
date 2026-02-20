mapboxgl.accessToken = '';

let map;
let scroll = scrollama();
let restaurantData;

// -----------------------------
// Initialize Map + Load Data
// -----------------------------
async function init() {

  restaurantData = await fetch('data/restaurant.geojson')
    .then(res => res.json());

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-122.335167, 47.608013],
    zoom: 11,
    pitch: 30,
    bearing: 0
  });

  map.on('load', () => {

    addLayer();

    scroll.setup({
      step: '.scene',
      offset: 0.5
    })
    .onStepEnter(handleStepEnter);
  });
}

// -----------------------------
// Add Source + Layer
// -----------------------------
function addLayer() {

  if (!map.getSource('restaurants')) {
    map.addSource('restaurants', {
      type: 'geojson',
      data: restaurantData
    });
  }

  if (!map.getLayer('restaurants-layer')) {
    map.addLayer({
      id: 'restaurants-layer',
      type: 'circle',
      source: 'restaurants',
      paint: {
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#000',
        'circle-color': [
          'match',
          ['get', 'cuisine'],
          'thai', '#e63946',
          'italian', '#457b9d',
          '#aaaaaa'
        ]
      }
    });
  }
}

// -----------------------------
// Reset Map View
// -----------------------------
function resetView() {
  map.flyTo({
    center: [-122.335167, 47.608013],
    zoom: 11,
    pitch: 30,
    bearing: 0,
    speed: 0.8
  });
}

// -----------------------------
// Safe Style Switch Helper
// -----------------------------
function changeStyle(styleURL, callback) {

  // Only change if different
  if (map.getStyle().sprite.includes(styleURL.split('/').pop())) {
    callback();
    return;
  }

  map.setStyle(styleURL);

  map.once('style.load', () => {
    addLayer();
    callback();
  });
}

// -----------------------------
// Scroll Behavior
// -----------------------------
function handleStepEnter(response) {

  const i = response.index;

  // -------------------------
  // SCENES 0–2 (LIGHT STYLE)
  // -------------------------
  if (i <= 2) {

    changeStyle('mapbox://styles/mapbox/light-v10', () => {

      map.setFilter('restaurants-layer', null);

      if (i === 0) {
        resetView();
      }

      if (i === 1) {
        map.setFilter('restaurants-layer',
          ['==', ['get', 'cuisine'], 'thai']
        );

        map.flyTo({
          zoom: 12,
          pitch: 50,
          bearing: -20
        });
      }

      if (i === 2) {
        map.setFilter('restaurants-layer',
          ['==', ['get', 'cuisine'], 'italian']
        );

        map.flyTo({
          zoom: 12,
          pitch: 50,
          bearing: 20
        });
      }

    });

  }

  // -------------------------
  // SCENE 3 — Kin Len (Satellite)
  // -------------------------
  else if (i === 3) {

    changeStyle('mapbox://styles/mapbox/satellite-streets-v11', () => {

      map.setFilter('restaurants-layer',
        ['==', ['get', 'name'], 'Kin Len Thai Night Bites']
      );

      map.flyTo({
        center: [-122.349, 47.657],
        zoom: 14,
        pitch: 60,
        bearing: -30
      });

    });

  }

  // -------------------------
  // SCENE 4 — Dué Cucina (Satellite)
  // -------------------------
  else if (i === 4) {

    changeStyle('mapbox://styles/mapbox/satellite-streets-v11', () => {

      map.setFilter('restaurants-layer',
        ['==', ['get', 'name'], 'Dué Cucina']
      );

      map.flyTo({
        center: [-122.3870027, 47.5636165],
        zoom: 14,
        pitch: 60,
        bearing: 30
      });

    });

  }
  else if (i === 5) {

  changeStyle('mapbox://styles/mapbox/light-v10', () => {

    // Reset filter to all restaurants
    map.setFilter('restaurants-layer', null);

    // Reset view to scene 1 / all restaurants
    map.flyTo({
      center: [-122.335167, 47.608013],
      zoom: 11,
      pitch: 30,
      bearing: 0
    });

  });

}
}

init();
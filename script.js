mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhcmxvdHRlYmtnIiwiYSI6ImNscjlvYzM1OTA1MW8ya24xbjdmNHRhaWkifQ.H2WW8WJZiHWFksxymyigTw'; //Add default public map token from your Mapbox account
const map = new mapboxgl.Map({
  container: 'map', // map container ID
  style: 'mapbox://styles/charlottebkg/cltadlaho00nt01qkgei36fnn', // style URL
  center: [-71.09647636158911,
    42.386864529111335], // starting position [lng, lat]
  zoom: 16, // starting zoom
  pitch: 50,
});
// Add zoom and rotation controls, position controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');


map.on('load', () => {
  map.addSource('resume', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/charlbkg/WEBMAPCV/refs/heads/main/Resume2.geojson' // make sure this path is correct
  });

  // Load the custom SVG icon
  map.loadImage('https://raw.githubusercontent.com/charlbkg/WEBMAPCV/refs/heads/main/marker.png', (error, image) => {
    if (error) throw error;

    // Add icon to the map style
    map.addImage('resume-marker', image);

    // SYMBOL layer instead of circle layer
    map.addLayer({
      id: 'resume-points',
      type: 'symbol',
      source: 'resume',
      layout: {
        'icon-image': 'resume-marker',
        'icon-size': .075,   // adjust icon size here
        'icon-anchor': 'bottom', // makes the bottom point align to coord
        'icon-allow-overlap': true
      }
    });
  });


  // Click handler for popups
  map.on('mouseenter', 'resume-points', (e) => {
    const feature = e.features[0];
    const props = feature.properties;

  // map.on('mouseenter', 'resume-points', (e) => {
  //   map.getCanvas().style.cursor = 'pointer';

  //   const feature = e.features[0];
  //   const props = feature.properties;

    // Format Description into bullet points
    const bullets = props.Description
      ? props.Description.split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => `<li>${item}</li>`)
        .join('')
      : '';

    // Build popup HTML
    const html = `
            <div class="resume-popup">
            <strong>${props.Name || 'Untitled'}</strong>
            <div class="exp-type">Experience type: ${props.ExperienceType || 'N/A'}</div>
            <div class="year">Year: ${props.Year || 'N/A'}</div>
            ${bullets ? `<ul>${bullets}</ul>` : ''}
          </div>
        `;

    hoveredPopup= new mapboxgl.Popup({ offset: 12 })
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);

  });

  map.on('mouseleave', 'resume-points', () => {
    map.getCanvas().style.cursor = '';
    if (hoveredPopup) {
      hoveredPopup.remove();
      hoveredPopup = null;
    }
  });

  // Change cursor when hovering
  map.on('mouseenter', 'resume-points', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'resume-points', () => map.getCanvas().style.cursor = '');

      map.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'resume',
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': 1,
        'heatmap-radius': 200,
        'heatmap-opacity': 0.8,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(255, 255, 255, 0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ]
      }
    });

 const slider = document.getElementById('year-slider');
  const yearLabel = document.getElementById('year-value');
  const toggleHeatmap = document.getElementById('toggle-heatmap');

  slider.value = 2026;
  yearLabel.textContent = slider.value;

  // Initial filter
  let currentYear = parseInt(slider.value);
  map.setFilter('heatmap-layer', ['<=', ['to-number', ['get', 'YearTruncated']], currentYear]);

  // Update filter when slider moves
  slider.addEventListener('input', (e) => {
    currentYear = parseInt(e.target.value);
    yearLabel.textContent = currentYear;

    const filter = ['<=', ['to-number', ['get', 'YearTruncated']], currentYear];
    map.setFilter('heatmap-layer', filter);

    console.log('Applied filter:', filter);

    });
    //Heatmap visibility toggle
toggleHeatmap.addEventListener('change', (e) => {
  const visibility = e.target.checked ? 'visible' : 'none';
  map.setLayoutProperty('heatmap-layer', 'visibility', visibility);
});
});


document.getElementById('reset-extent-btn').addEventListener('click', function () {
//     // Back to the first coordinate.
    map.flyTo({
        zoom: 2.8,
        center: [-67,
          53],
    });
    });

  

// Handle tree node clicks
document.querySelectorAll('.zoom-node').forEach(node => {
  node.addEventListener('click', () => {
    const lat = parseFloat(node.getAttribute('data-lat'));
    const lng = parseFloat(node.getAttribute('data-lng'));
    const zoom = parseFloat(node.getAttribute('data-zoom'));
    map.flyTo({ center: [lng, lat], zoom: zoom, essential: true });
document.querySelectorAll('.zoom-node.highlight')
      .forEach(el => el.classList.remove('highlight'));

    // Highlight the clicked node
    node.classList.add('highlight');
  });
});


map.on('click', 'resume-points', (e) => {
  const feature = e.features[0];
  const name = feature.properties.Name;

  // Find matching tree node
  const node = document.querySelector(`.zoom-node[data-name="${name}"]`);
  if (!node) return;

  // Use coordinates stored in the HTML list
  const lat = parseFloat(node.getAttribute('data-lat'));
  const lng = parseFloat(node.getAttribute('data-lng'));
  const zoom = parseFloat(node.getAttribute('data-zoom')) || 17;

  // Fly the map to the UL-provided coordinates
  map.flyTo({
    center: [lng, lat],
    zoom: zoom,
    essential: true
  });

  // Highlight tree item
  document.querySelectorAll('.zoom-node.highlight')
    .forEach(el => el.classList.remove('highlight'));

  node.classList.add('highlight');

  node.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
});
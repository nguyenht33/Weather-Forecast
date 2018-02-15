const geoKey = 'AIzaSyBi4p4_5i-BkoRSKAhOIzUyp9usQTqQitw';
const geoURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const openKey = '335185afd1bee6c30739e6238eec798b';
const openWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const openForecastURL = 'https://api.openweathermap.org/data/2.5/forecast';
let currentLocation;
let locationsList = [];

function getLocation(address) {
  let data = {
    address: address,
    sensor: false,
    key: geoKey
  };

  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: geoURL,
    data: data,
    async: false,
    success: addLocations           
  });
}

function getWeather(lat, lon) {
  let data = {
    lat: lat,
    lon: lon,
    units: 'imperial',
    lang: "en",
    appid: openKey
  };

  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: openWeatherURL,
    data: data,
    async: false,
    success: displayWeather
  });
}

function getForecast(lat, lon) {
  let data = {
    lat: lat,
    lon: lon,
    cnt: '5',
    units: 'imperial',
    lang: "en",
    appid: openKey
  };

  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: openForecastURL,
    data: data,
    async: false,
    success: displayForecast
  });
}

function handleAddLocation() {
  $('.js-location-form').on('submit', function(e) {
    e.preventDefault();
    const locationTarget = $(event.currentTarget).find('.js-location-input');
    const address = locationTarget.val();
    $('.js-location-input').val('');
    getLocation(address);
  });
}

function addLocations(location) {
  const city = location.results[0].address_components[0].long_name;
  const lat = location.results[0].geometry.location.lat;
  const lon = location.results[0].geometry.location.lng;
  locationsList.push({name: city, lat: lat, lon: lon});

  displayLocations(locationsList);

  //for displaying purposes right now
  getMap(lat, lon);
  getWeather(lat, lon);
  getForecast(lat, lon); 

  console.log(location);
  console.log(locationsList);
}

function displayLocations(location) {
  const newCity = location.map(function(city) {
    return `<li>
              <p>${city.name}</p>
              <button>x</button>
            </li>`
  })
  $('.js-cities').html(newCity);
}

function handleLocationClicked() {
  // shows current weather of current location
}

function handleLocationDelete() {
  //remove location from list
}

function displayWeather(weather) {
  console.log(weather);
}

function displayForecast(forecast) {
  console.log(forecast);
}

function handleMapClick() {
  // This will later be dynamic content of displayWeather/Forecast
  $('.see-map').on('click', function() {
    // Show map
  })
}

function getMap(lat, lon) {
  if (map != undefined || map != null) {
    map.remove();
    $('#map').html('');
    $('#preMap').empty();
    $('<div id="map"></div>').appendTo('#preMap');
  } 
  displayMap(lat, lon);
}

function displayMap(lat, lon) {
  let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, 
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' 
  });

  let clouds = L.OWM.clouds({showLegend: false, opacity: 0.5, appId: openKey});
  let precipitation = L.OWM.precipitation({showLegend: false, opacity: 0.5, appId: openKey});
  let pressure = L.OWM.pressure({showLegend: false, opacity: 0.5, appId: openKey});
  let temp = L.OWM.temperature({showLegend: false, opacity: 0.5, appId: openKey});
  let wind = L.OWM.wind({showLegend: false, opacity: 0.5, appId: openKey});
  let city = L.OWM.current({intervall: 15, lang: 'de'});

  let map = L.map('map', { center: new L.LatLng(lat, lon), zoom: 10, layers: [osm] });
  let baseMaps = { "OSM Standard": osm };
  let overlayMaps = { 
    "Clouds": clouds, 
    "Precipitation": precipitation, 
    "Pressure": pressure,
    "Temp": temp,
    "Wind": wind,
  };
  let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
}

function init() {
  handleAddLocation();
}

$(init)
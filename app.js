const geoKey = 'AIzaSyBi4p4_5i-BkoRSKAhOIzUyp9usQTqQitw';
const geoURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const openKey = '335185afd1bee6c30739e6238eec798b';
const openWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const openForecastURL = 'https://api.openweathermap.org/data/2.5/forecast';
let currentCity;
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
    success: addLocation           
  });
}

function getWeather() {
  let data = {
    lat: currentCity.lat,
    lon: currentCity.lon,
    units: 'imperial',
    lang: 'en',
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

function getForecast() {
  let data = {
    lat: currentCity.lat,
    lon: currentCity.lon,
    cnt: '5',
    units: 'imperial',
    lang: 'en',
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

// get search input
function handleAddLocation() {
  $('.js-location-form').on('submit', function(e) {
    e.preventDefault();
    const locationTarget = $(event.currentTarget).find('.js-location-input');
    const address = locationTarget.val();
    $('.js-location-input').val('');
    getLocation(address);
  });
}

// add location to list & local storage
function addLocation(location) {
  const city = location.results[0].address_components[0].long_name;
  const lat = location.results[0].geometry.location.lat;
  const lon = location.results[0].geometry.location.lng;

  // add locations to list & local storage
  locationsList.push({name: city, lat: lat, lon: lon});
  addListToStorage();

  // set newly added city as current city
  if (locationsList.length) {
    currentCity = locationsList[locationsList.length - 1];
    addCurrentToStorage();
  }

  displayLocationsList();
  getWeatherReports(); 

  console.log(location);
  console.log(locationsList);
  console.log(currentCity);
}

// get locations from local storage
function getFromLocalStorage() {
  let storedLocations = localStorage.getItem('locationsLIST');
  if (storedLocations !== null) {
    let parsedLocations = JSON.parse(storedLocations);
    locationsList = parsedLocations.slice(0);
  }
}

// get current city from local storage
function getCurrentFromStorage() {
  let storedCurrent = localStorage.getItem('currentCITY');
  if (storedCurrent !== null) {
    let parsedCurrent = JSON.parse(storedCurrent);
    currentCity = parsedCurrent.slice(0);
  }
}

// copy locations list to local storage
function addListToStorage() {
  localStorage.setItem('locationsLIST', JSON.stringify(locationsList));
}

// copy current city to local storage
function addCurrentToStorage() {
  localStorage.setItem('currentCITY', JSON.stringify(currentCity));
}

// remove locations list from local storage
function removeListFromStorage() {

}

// remove locations list from local storage
function removeCurrentFromStorage() {

}

// display locations list ui
function displayLocationsList() {
  const cityItems = locationsList.map(function(city, index) {
    return `<li id="city-index-${index}">
              <p class="city">${city.name}</p>
              <button class="delete">x</button>
            </li>`
  })
  $('.js-cities-list').html(cityItems);
}

function handleLocationClicked() {
  $('.js-cities-list').on('click', 'li', function() {
    const itemId = $(this).attr('id');
    const itemIndex = itemId.replace(/\D/g,'');
    
    // make clicked city current city 
    currentCity = locationsList[itemIndex];
    addCurrentToStorage(currentCity);
  });
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

function getMap(lat, lon) {
  if (map != undefined || map != null) {
    map.remove();
    $('#map').html('');
    $('#preMap').empty();
    $('<div id="map"></div>').appendTo('#preMap');
  } 
  displayMap(currentCity.lat, currentCity.lon);
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

function getWeatherReports() {
  getWeather();
  getForecast();
  getMap();
}

function init() {
  handleAddLocation();
  handleLocationClicked()
  getFromLocalStorage();
  displayLocationsList();
}

$(init)
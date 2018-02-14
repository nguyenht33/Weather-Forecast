const geoKey = 'AIzaSyBi4p4_5i-BkoRSKAhOIzUyp9usQTqQitw';
const geoURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const openKey = '335185afd1bee6c30739e6238eec798b';
const openURL = 'https://api.openweathermap.org/data/2.5/weather';

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
    success: getCoordinates           
  });
}

function getCurrentWeather(lat, lon) {
  let data = {
    lat: lat,
    lon: lon,
    appid: openKey
  };

  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: openURL,
    data: data,
    async: false,
    success: displayWeather
  });
}

function getCoordinates(location) {
  const lat = location.results[0].geometry.location.lat;
  const lon = location.results[0].geometry.location.lng;
  getCurrentWeather(lat, lon);
}

function displayWeather(weather) {
  console.log(weather);
}

function getLocationInput() {
  $('.js-location-form').on('submit', function(e) {
    e.preventDefault();
    const locationTarget = $(event.currentTarget).find('.js-location-input');
    const address = locationTarget.val();
    getLocation(address);
  })
}

function init() {
  getLocationInput();
}

$(init)
const geoKeys = 'AIzaSyBi4p4_5i-BkoRSKAhOIzUyp9usQTqQitw';
const geoURL = 'https://maps.googleapis.com/maps/api/geocode/json'
let userLocation;

function getLocation(address) {
  let position = {}
  let data = {
    address: address,
    sensor: false,
    key: geoKeys
  };

  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: geoURL,
    data: data,
    async: false,
    success: displayLocation           
  });
}

function displayLocation(location) {
  console.log(location);
  $('.js-location-result').html(`<p>Latitude:${location.results[0].geometry.location.lat}</p><p>Longtitude:${location.results[0].geometry.location.lng}</p>`)
}

function getLocationInput() {
  $('.js-location-form').on('submit', function(e) {
    e.preventDefault();
    const locationTarget = $(event.currentTarget).find('.js-location-input');
    userLocation = locationTarget.val();
    getLocation(userLocation);
  })
}

function init() {
  getLocationInput();
}

$(init)
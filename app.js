const geoKey = 'AIzaSyBi4p4_5i-BkoRSKAhOIzUyp9usQTqQitw';
const geoURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const openKey = '335185afd1bee6c30739e6238eec798b';
const openWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const openForecastURL = 'https://api.openweathermap.org/data/2.5/forecast';
let currentCity;
let locationsList = [];

// ajax functions //
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
    cnt: '40',
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
    success: generateForecast
  });
}

// add items functions //
function handleAddLocation() {
  $('.js-location-form').on('submit', function(e) {
    e.preventDefault();
    const locationTarget = $(event.currentTarget).find('.js-location-input');
    const address = locationTarget.val();
    $('.js-location-input').val('');
    getLocation(address);
  });
}

function addLocation(location) {
  const city = location.results[0].address_components[0].long_name;
  const lat = location.results[0].geometry.location.lat;
  const lon = location.results[0].geometry.location.lng;
  console.log(location);
  locationsList.push({name: city, lat: lat, lon: lon});
  setListToStorage();

  if (locationsList.length) {
    currentCity = locationsList[locationsList.length - 1];
    setCurrentToStorage();
  }

  displayLocationsList();
  displayWeatherReports(); 
}

// local storage functions //
function getListFromLocalStorage() {
  let storedLocations = localStorage.getItem('locationsLIST');
  if (storedLocations !== null) {
    let parsedLocations = JSON.parse(storedLocations);
    locationsList = parsedLocations.slice(0);
  };
}

function getCurrentFromStorage() {
  let storedCurrent = localStorage.getItem('currentCITY');
  if (storedCurrent !== null) {
    let parsedCurrent = JSON.parse(storedCurrent);
    currentCity = parsedCurrent;
  };
}

function setListToStorage() {
  localStorage.setItem('locationsLIST', JSON.stringify(locationsList));
}

function setCurrentToStorage() {
  localStorage.setItem('currentCITY', JSON.stringify(currentCity));
}

// handle click functions //
function handleLocationClicked() {
  $('.js-side-nav').on('click', 'p', function() {
    const itemIndex = $(this).closest('li').attr('id');
   
    currentCity = locationsList[itemIndex];
    setCurrentToStorage(currentCity);
    displayWeatherReports();
  });
}

function handleLocationDelete() {
  $('.js-side-nav').on('click', '.delete', function() {
    const itemIndex = $(this).closest('li').attr('id');
    locationsList.splice(itemIndex, 1);
    setListToStorage();
    displayLocationsList();

    if (locationsList.indexOf(currentCity) === -1) {
      currentCity = locationsList[0];
      setCurrentToStorage();
      displayWeatherReports();
    };
  });
}

// display functions //
function displayWelcomeMessage() {
  if (currentCity === undefined) {
    // remove map
    // display message telling user to add location
  }
}

function displayLocationsList() {
  const cityItems = locationsList.map(function(city, index) {
    return `<li id="${index}" class="sidenav">
              <div class="list-item">
                <p>${city.name}</p>
                <button class="delete">x</button>
              </div>
            </li>`
  });
  $('.js-side-nav').html(cityItems);
}

function displayWeather(weather) {
  const currentWeather = `<div class="city-name">
                            <h2>${currentCity.name}<h2>
                          </div>
                          <div class="current-temp">
                            <h1>${Math.trunc(weather.main.temp)}&#176</h1>
                            <p>${Math.trunc(weather.main.temp_min)}&#176 | ${Math.trunc(weather.main.temp_max)}&#176</p>
                          </div>
                          <div class="current-weather">
                            <h2>${weather.weather[0].description}</h2>
                          </div>
                          <div class="weather-details">
                            <h2>Details</h2>
                            <ul>
                              <li>Feels like: <span>${Math.trunc(weather.main.temp)}&#176</span></li>
                              <li>Humidity: <span>${weather.main.humidity}%</span></li>
                              <li>Wind: <span>${weather.wind.speed}m/s</span></li>
                              <li>Visibility: <span>${weather.visibility}m</span></li>
                            </ul>
                          </div>`
  $('.js-weather-results').html(currentWeather);
}

function displayForecast(dailyForecast) {
  const template = dailyForecast.map(function(d) {
    return  `<ul>
                <li>${d.day}</li>
                <li>${d.temp}&#176</li>
            </ul>`;
  });
  $('.js-forecast-results').html(template);
  $('.js-forecast-results').prepend(`<h2>Forecast</h2>`);
}

function generateForecast(forecast) {
  const forecastObj = forecast.list;
  const forecastArray = [];

  for (let key in forecastObj) {
    if (forecastObj.hasOwnProperty(key)) {
      var day = getDay(forecastObj[key].dt_txt);
      var main = forecastObj[key].main;
      var weatherList = forecastObj[key].weather[0];

      for (let i in main) {
        if (main.hasOwnProperty(i)) {
          var temp = main.temp;
        }
      }

      for (let j in weatherList) {
        if (weatherList.hasOwnProperty(j)) {
          var weather = weatherList.main;
        }
      }
    }
    forecastArray.push( {day: day, temp: temp, weather: weather} );
  }

  const dailyForecast = getAverageTemp(forecastArray);
  displayForecast(dailyForecast);
}

function getAverageTemp(arr) {
    let tempSums = {}, counts = {}, results = [], day;
    for (let i = 0; i < arr.length; i++) {
        day = arr[i].day;
        if (!(day in tempSums)) {
          tempSums[day] = 0;
          counts[day] = 0;
        }
        tempSums[day] += arr[i].temp;
        counts[day]++;
    }

    for (day in tempSums) {
        results.push({ day: day, temp: Math.trunc(tempSums[day] / counts[day]) });
    }

    return results;
}


function getDay(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(date);
  const dayday = days[d.getDay()];
  return dayday;
}


// map functions //
function getMap() {
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


// function displaySideBar() {
//   $('.side-nav-trigger').click(function() {
//     $('.js-side-nav li').toggleClass('close');
//     $('.js-side-nav').removeClass('hide-nav');
//     $('.js-side-nav').addClass('show-nav');
//   });
//   $('.js-side-nav').on('click', '.close', function() {
//     $('.js-side-nav li').toggleClass('close');
//     $('.js-side-nav').removeClass('show-nav');
//     $('.js-side-nav').addClass('hide-nav');
//   });
// }

function displayWeatherReports() {
  getWeather();
  getForecast();
  getMap();
}

function init() {
  handleAddLocation();
  handleLocationClicked();
  handleLocationDelete();
  getListFromLocalStorage();
  getCurrentFromStorage();
  displayLocationsList();
  displayWeatherReports();
}

$(init)
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
  $('.js-side-nav').on('click', 'li', function() {
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

function displayCurrentLocationMarker() {
}

function displayLocationsList() {
  const cityItems = locationsList.map((city, index) => {
    return `<li id="${index}" class="sidenav">
              <div class="list-item">
                <p><i class="fas fa-map-marker"></i>${city.name}</p>
                <button class="delete">x</button>
              </div>
            </li>`
  });
  $('.js-side-nav').html(cityItems);
}

function displayWeather(weather) {
  const main = weather.main;
  const windSpeed = getMph(weather.wind.speed);
  const currentWeather = `<div class="city-name">
                            <h2>${currentCity.name}<h2>
                          </div>
                          <div class="current-temp">
                            <h1>${Math.trunc(main.temp)}&#176F</h1>
                            <p>${Math.trunc(main.temp_min)}&#176 | ${Math.trunc(main.temp_max)}&#176</p>
                          </div>
                          <div class="current-weather">
                            <h2>${weather.weather[0].description}</h2>
                          </div>
                          <div class="weather-details">
                            <h2>Details</h2>
                            <ul>
                              <li>Feels like: <span>${getFeelsLike(main.temp, main.humidity, windSpeed)}&#176</span></li>
                              <li>Humidity: <span>${main.humidity}%</span></li>
                              <li>Wind: <span>${windSpeed} mph</span></li>
                              <li>Visibility: <span>${getMiles(weather.visibility)} mi</span></li>
                            </ul>
                          </div>`
  $('.js-weather-results').html(currentWeather);
}

function displayForecast(dailyForecast) {
  const template = dailyForecast.map(function(day) {
    return  `<ul>
                <li>${day.day}</li>
                <li>${day.temp}&#176</li>
                <li>${day.icon}</li>
                <li>${day.weather}</li>
            </ul>`;
  });
  $('.js-forecast-results').html(template);
  $('.js-forecast-results').prepend(`<h2>Forecast</h2>`);
}

function generateForecast(forecasts) {
  const forecastObj = forecasts.list;
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
          var weather = weatherList.description;
          var icon = weatherList.icon;
        }
      }
    }
    forecastArray.push( {day: day, temp: temp, weather: weather, icon: icon} );
  }

  const dailyForecast = getAverageTemp(forecastArray);
  displayForecast(dailyForecast);
}

function getAverageTemp(forecasts) {
  let tempSums = {}, tempCounts = {}, day;
  for (let i = 0; i < forecasts.length; i++) {
    day = forecasts[i].day;
    if (!(day in tempSums)) {
      tempSums[day] = 0;
      tempCounts[day] = 0;
    }
    tempSums[day] += forecasts[i].temp;
    tempCounts[day]++;
  }
  const commonWeather = mostCommonWeatherByDay(forecasts);
  const commonIcon = mostCommonIconByDay(forecasts);
  const results = concatAverageForecasts(tempSums, tempCounts, commonWeather, commonIcon);

  return results;
}

function concatAverageForecasts(temp, tempCount, weather, icon) {
  const tempResults = [], weatherResults = [], iconResults = [], firstResults = [], finalResults = [];

  for (day in temp) {
    tempResults.push({ day: day, temp: Math.trunc(temp[day] / tempCount[day]) });
  }
  for (day in weather) {
    weatherResults.push({ day: day, weather: weather[day] });
  }
  for (day in icon) {
    iconResults.push({ day: day, icon: icon[day] });
  }

  tempResults.forEach((item, i) => {
      firstResults.push(Object.assign({}, item, weatherResults[i]));
  });
  firstResults.forEach((item, i) => {
    finalResults.push(Object.assign({}, item, iconResults[i]));
  });

  return finalResults;
}

function mostCommonWeatherByDay(data) {
  const valuesByDay = data.reduce((acc, value) => {
    const { day, temp, weather, icon } = value;
    
    if (!acc[day]) acc[day] = [];
    acc[day].push(weather);
    return acc;
  }, {})
  
  const ret = Object.keys(valuesByDay).reduce((acc, key) => {
    acc[key] = mostCommonOccurence(valuesByDay[key]);
    return acc;
  }, {})
  
  return ret;
}

function mostCommonIconByDay(data) {
  const valuesByDay = data.reduce((acc, value) => {
    const { day, temp, weather, icon } = value;
    
    if (!acc[day]) acc[day] = [];
    acc[day].push(icon);
    return acc;
  }, {})
  
  const ret = Object.keys(valuesByDay).reduce((acc, key) => {
    acc[key] = mostCommonOccurence(valuesByDay[key]);
    return acc;
  }, {})
  
  return ret;
}

function mostCommonOccurence(arr = []) {
  const totals = arr.reduce((acc, val) => {
    if (!acc[val]) {
      acc[val] = 1; 
      return acc; 
    }
    
    acc[val] += 1;
    return acc;
  }, {});
  
  const keys = Object.keys(totals)
  const values = keys.map(name => totals[name]);
  const max = Math.max(...values);
  
  return keys.find(key => totals[key] === max);
}

function getFeelsLike(temp, humidity, windSpeed) {
  const heatIndex = getHeatIndex(temp, humidity);
  const windChill = getWindChill(temp, windSpeed);

  if (temp > 80) {
    return heatIndex;
  } else {
    return windChill;
  }
}

function getHeatIndex(temp, humidity) {
  let T = temp, rh = humidity, heatIndex;
  heatIndex = -42.379 + (2.04901523 * T) + (10.14333127 * rh) 
           - (0.22475541 * T * rh) - (6.83783 * (Math.pow(10, -3)) * (Math.pow(T, 2))) 
           - (5.481717 * (Math.pow(10, -2)) * (Math.pow(rh, 2))) + (1.22874 * (Math.pow(10, -3)) * (Math.pow(T, 2)) * rh)
           + (8.5282 * (Math.pow(10, -4)) * T * (Math.pow(rh, 2))) - (1.99 * (Math.pow(10, -6)) * (Math.pow(T, 2)) * (Math.pow(rh, 2)));
  return Math.round(heatIndex);
}

function getWindChill(temp, windSpeed) {
  let T = temp, V = windSpeed, windChill;
  windChill = 35.74 + (0.6215 * T) - 35.75 * (Math.pow(V, 0.16)) + (0.4275 * T) * (Math.pow(V, 0.16));
  return Math.round(windChill);
}

function getDay(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(date);
  const dayResult = days[d.getDay()];
  return dayResult;
}

function getMiles(meter) {
  const miles = meter*0.000621371192;
  return Math.round(( miles * 10 ) / 10).toFixed(1);
}

function getMph(meter) {
  const miles = meter / 0.44704;
  return Math.round(( miles * 10 ) / 10).toFixed(1);
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

function displaySidebar() {
  $('.js-sidebar-btn').click(function() {
    $('.sidebar').toggleClass('active');
    $('.js-sidebar-btn').toggleClass('toggle');
    $('.page-wrap').toggleClass('slide-right');
    $('header').toggleClass('slide-right');
    $('.form-container').toggleClass('hidden');
  })
}

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
  displaySidebar();
}

$(init)
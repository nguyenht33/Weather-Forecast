const geoKey = 'AIzaSyBi4p4_5i-BkoRSKAhOIzUyp9usQTqQitw';
const geoURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const openKey = '335185afd1bee6c30739e6238eec798b';
const openWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const openForecastURL = 'https://api.openweathermap.org/data/2.5/forecast';
let currentCity;
let locationsList = [];
let tempSettingF = true;
let tempSettingC = false;

// ajax functions //
function getReverseLocation(latlng) {
    let data = {
    latlng: latlng,
    result_type: 'locality',
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

// start app
function init() {
  getListFromLocalStorage();
  getCurrentFromStorage();
  displaySidebar();  
  displayLocationsList(); 
  displaySearchbar();
  handleAddLocation();
  handleLocationClicked();
  handleLocationDelete();
  handleTempSettingClicked();
}

// get city list from previous session if it exists
function getListFromLocalStorage() {
  let storedLocations = localStorage.getItem('locationsLIST');
  if (storedLocations !== null) {
    let parsedLocations = JSON.parse(storedLocations);
    locationsList = parsedLocations.slice(0);
  } else {
    getGeoLocation();
  };
}

// get current displaying city from previous session if it exists
function getCurrentFromStorage() {
  let storedCurrent = localStorage.getItem('currentCITY');
  if (storedCurrent !== 'undefined' && storedCurrent !== null) {
    let parsedCurrent = JSON.parse(storedCurrent);
    currentCity = parsedCurrent;
    displayWeatherReports();
  } else {
    geolocation();
  }
}

function setListToStorage() {
  localStorage.setItem('locationsLIST', JSON.stringify(locationsList));
}

function setCurrentToStorage() {
  if (currentCity) {
    localStorage.setItem('currentCITY', JSON.stringify(currentCity));
  }; 
}

// ask user's permission for their location
function getGeoLocation() {
  if (!navigator.geolocation) {
    return getDefaultCity();
  } 

  function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const latlng = lat + ' '+ lon;
    getReverseLocation(latlng);
  }

  function error() {
    getDefaultCity();
  }

  navigator.geolocation.getCurrentPosition(success, error);
}

// input New York City as default if user denies geolocation
function getDefaultCity() {
  const lat = 40.7127753;
  const lon = -74.0059728;    
  const latlng = lat + ' '+ lon;
  getReverseLocation(latlng);
}

// add name & coordinates to global objects currentCity & locationList
function addLocation(location) {
  console.log(location);
  const lat = location.results[0].geometry.location.lat;
  const lon = location.results[0].geometry.location.lng;
  const cityResult = filterLocationInput(location);

  if (cityResult === "err1" || cityResult === "err2") {
    displayErrorMessage(cityResult);
  } else {
    locationsList.push({name: cityResult, lat: lat, lon: lon});
    setListToStorage();

    if (locationsList.length) {
       currentCity = locationsList[locationsList.length - 1];
       if (currentCity !== undefined) {
         setCurrentToStorage();
       }; 
    };

    displayLocationsList();
    displayWeatherReports(); 
  };
}

//filter out input for city name or county name
function filterLocationInput(location) {
  const results = location.results;
  const resultsTypes = results[0].types;
  const addressComponents = location.results[0].address_components;
  let addressComponentsList = [], cityName, error;

  for (let i = 0; i < addressComponents.length; i++) {
    let name = addressComponents[i].long_name;
    let types = addressComponents[i].types;
    addressComponentsList.push({ name: name, types: types });
  };
  const address = addressComponentsList.find(filterAddress); 

  if (results.length > 1) {
    return error = "err1";
  } else if (resultsTypes.indexOf('route') >= 0) {
    return error = "err2";
  } else if (address) {
    return cityName = address.name;  
  } else {
    return error = "err2";
  }
}

function filterAddress(component) {
  if (component.types.indexOf('locality') >= 0) {
    return component.name;
  } else if (component.types.indexOf('sublocality') >= 0) {
    return component.name;
  } else if (component.types.indexOf('administrative_area_level_2') >= 0) {
    return component.name;
  }
};

function displayErrorMessage(error) {
  if (error === 'err1') {
    alert('Multiple locations under this name, please specify');
  } else if (error === 'err2'){
    alert('Please enter city or zip code for most accurate weather data');
  };
}

// make request calls for weather, forecast & map
function displayWeatherReports() {
  getWeather();
  getForecast();
  getMap();
}

// add items functions //
function handleAddLocation() {
  $('.js-location-form').on('submit', function(e) {
    e.preventDefault();
    if ($('.js-location-input').val() === '') {
      closeSearchbar();
    } else {
      const locationTarget = $(event.currentTarget).find('.js-location-input');
      const address = locationTarget.val();
      $('.js-location-input').val('');    
      getLocation(address);
    }
  });
}

// handle click functions //
function handleLocationClicked() {
  $('.js-side-nav').on('click', 'li', function() {
    const itemIndex = $(this).closest('li').attr('id');
   
    currentCity = locationsList[itemIndex];
    setCurrentToStorage(currentCity);
    displayWeatherReports();
    closeSidebar();
  });
}

function handleLocationDelete() {
  $('.js-side-nav').on('click', '.delete', function(e) {
    e.stopPropagation();
    const itemIndex = $(this).closest('li').attr('id');
    locationsList.splice(itemIndex, 1);
    setListToStorage();
    displayLocationsList();

    if (locationsList.length === 0) {
      getGeoLocation();
      closeSidebar();
    } else if (locationsList.indexOf(currentCity) === -1) {
      currentCity = locationsList[0];
      setCurrentToStorage();
      getCurrentFromStorage();
    } 
  });
}

function handleTempSettingClicked() {
  $('.js-weather-results').on('click', '.celcius', function(e) {
    handleCelciusConversion();
    tempSettingF = false, tempSettingC = true;
    $(this).attr('disabled', true);
    $('.fahrenheit').attr('disabled', false);
  });
  $('.js-weather-results').on('click', '.fahrenheit', function(e) {
    handleFahrenheitConversion();
    tempSettingF = true, tempSettingC = false;
    $(this).attr('disabled', true);
    $('.celcius').attr('disabled', false); 
  });
}

function handleCelciusConversion() {
    const currentTemp = $('.current-temp h1').text().slice(0, -1);
    const convertedCurrentTemp = convertToCelcius(currentTemp);
    $('.current-temp h1').html(`${convertedCurrentTemp}&#176`);

    const maxTemp = $('.current-temp p').first().text().slice(0, -1);
    const convertedMaxTemp = convertToCelcius(maxTemp);
    $('.current-temp p').first().html(`${convertedMaxTemp}&#176`);

    const minTemp = $('.current-temp p').last().text().slice(0, -1);
    const convertedMinTemp = convertToCelcius(minTemp);
    $('.current-temp p').last().html(`${convertedMinTemp}&#176`);

    const feelLike = $('.weather-details li span').first().text().slice(0, -1);
    const convertedFeelLike = convertToCelcius(feelLike);
    $('.weather-details li span').first().html(`${convertedFeelLike}&#176`);

    const visibility = $('.weather-details li span').last().text().replace(/\D/g,'');
    const convertedVisibility = getKmh(visibility);
    $('.weather-details li span').last().html(`${convertedVisibility} km/h`)

    $('.forecast-temp').each(function(index, temp) {
      const convertedTemp = convertToCelcius($(temp).text().slice(0, -1));
      $(this).html(`${convertedTemp}&#176`);
    }); 
}

function handleFahrenheitConversion() {
    const currentTemp = $('.current-temp h1').text().slice(0, -1);
    const convertedCurrentTemp = convertToFahrenheit(currentTemp);
    $('.current-temp h1').html(`${convertedCurrentTemp}&#176`);

    const maxTemp = $('.current-temp p').first().text().slice(0, -1);
    const convertedMaxTemp = convertToFahrenheit(maxTemp);
    $('.current-temp p').first().html(`${convertedMaxTemp}&#176`);

    const minTemp = $('.current-temp p').last().text().slice(0, -1);
    const convertedMinTemp = convertToFahrenheit(minTemp);
    $('.current-temp p').last().html(`${convertedMinTemp}&#176`);

    const feelLike = $('.weather-details li span').first().text().slice(0, -1);
    const convertedFeelLike = convertToFahrenheit(feelLike);
    $('.weather-details li span').first().html(`${convertedFeelLike}&#176`);

    const visibility = $('.weather-details li span').last().text().replace(/\D/g,'');
    const convertedVisibility = getMph(visibility);
    $('.weather-details li span').last().html(`${convertedVisibility} mi`)

    $('.forecast-temp').each(function(index, temp) {
      const convertedTemp = convertToFahrenheit($(temp).text().slice(0, -1));
      $(this).html(`${convertedTemp}&#176`);
    });
}

function convertToFahrenheit(temp) {
  const result = (temp * 1.8) + 32;
  return Math.round(result);
}

function convertToCelcius(temp) {
  const result = (temp - 32) / 1.8;
  return Math.round(result);
}

function checkTempSettings(temp) {
  if (tempSettingF) {
    return temp;
  } else if (tempSettingC) {
    return convertToCelcius(temp);
  }
}

function checkWindSpeedSettings(wind) {
  if (tempSettingF) {
    return `${wind} mph`
  } else if (tempSettingC) {
    return `${getKmh(wind)} km/h`
  }
}

function checkVisibilitySettings(visibility) {
  if (tempSettingF) {
    return `${getMiles(visibility)} mi`
  } else if (tempSettingC) {
    return `${Math.round(visibility/1000)} m`
  }
}

function convertTimeStampToDate(time) {

} 

function convertTimeStampToHour(time) {
  var day = moment.unix(1318781876);
  return day;
}

function closeSidebar() {
  $('.main-wrap').toggleClass('slide-right');
  $('.js-sidebar').toggleClass('active');
  $('header').toggleClass('slide-right');
  $('.js-sidebar-btn').toggleClass('toggle');
  $('.js-sidebar-btn').toggleClass('mobile');
}

function displaySidebar() {
  $('.js-sidebar-btn').click(function() {
    $('.js-sidebar').toggleClass('active');
    $('.js-sidebar-btn').toggleClass('toggle');
    $('.js-sidebar-btn').toggleClass('mobile');
    $('.main-wrap').toggleClass('slide-right');
    $('header').toggleClass('slide-right');
  })
}

function closeSearchbar() {
  $('.js-location-input').toggleClass('open');
  $('.js-add-btn').toggleClass('hidden');
  $('.js-add-icon').toggleClass('hidden');
}

function displaySearchbar() {
  $('.js-add-icon').click(function() {
    $('.js-location-input').toggleClass('open');
    $('.js-add-btn').toggleClass('hidden');
    $('.js-add-icon').toggleClass('hidden');
  })
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
  console.log(weather);
  const main = weather.main;
  const windSpeed = weather.wind.speed;
  const currentTemp = checkTempSettings(main.temp);
  const currentMaxTemp = checkTempSettings(main.temp_max);
  const currentMinTemp = checkTempSettings(main.temp_min);
  const feelLike = getFeelsLike(main.temp, main.humidity, windSpeed);
  const feelLikeTemp = checkTempSettings(feelLike);
  const visibility = checkVisibilitySettings(Math.round(weather.visibility));
  const sunrise = convertTimeStampToHour(weather.sys.sunrise);

  console.log(sunrise);

  const currentWeather = `<div class="city-name">
                            <h2>${currentCity.name}<h2>
                          </div>
                          <div class="current-temp">
                            <h1>${Math.round(currentTemp)}&#176</h1>
                            <div>
                              <p>${Math.round(currentMaxTemp)}&#176</p>
                              <p>${Math.round(currentMinTemp)}&#176</p>
                            </div>
                          </div>                              
                          <div class="temp-settings">
                            <form>
                              <input type="button" value="F&#176" class="fahrenheit" disabled></button>
                              <input type="button" value="C&#176" class="celcius"></button>
                            <form>
                          </div>                                                  
                          <div class="current-weather-container">
                            <div class="current-weather">
                              <span data-icon="&#xe001;" class="icon-${weather.weather[0].icon} current-weather-icon"></span>
                              <h3>${weather.weather[0].description}</h3>
                            </div>
                            <div class="weather-details">
                              <h3>Details</h3>
                              <ul>
                                <li><p>Feels like:</p><span>${feelLikeTemp}&#176</span></li>
                                <li><p>Humidity:</p><span>${main.humidity}%</span></li>
                                <li><p>Wind:</p><span>${windSpeed} mph</span></li>
                                <li><p>Visibility:</p><span>${visibility}</span></li>
                              </ul>
                            </div>
                          </div>
                          <div>
                              <ul>
                                <li>
                                  <span data-icon="&#xe001;" class="icon-sunrise"></span>
                                  <p>Sunrise<span></span></p>
                                </li>
                                <li>
                                  <span data-icon="&#xe001;" class="icon-sunset"></span>
                                  <p>Sunset<span></span></p>
                                </li>
                              </ul>
                            </div>`;
  $('.js-weather-results').html(currentWeather);
}

function displayForecast(dailyForecast) {
  const template = dailyForecast.map(function(day) {
    const temp = checkTempSettings(day.temp);
    const icon = day.icon.slice(0, -1);
    return  `<ul>
                <li>${day.day}</li>
                <li class="icon"><span data-icon="&#xe001;" class="icon-${icon}d forecast-icon"></span></li>
                <li class="forecast-temp">${temp}&#176</li>
             </ul>`;
  });
  $('.js-forecast-results').html(template);
  $('.js-forecast-results').prepend(`<h2>Forecast</h2>`);
}

// calculating 5 days forecast based on OWM's every 3hrs data //
function generateForecast(forecasts) {
  const forecastObj = forecasts.list;
  const forecastArray = [];

  // loop thru JSON data to pull data of day, temp, weather & icon
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

// get average temp from 5-days forecast array
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

// concat results 
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

// find most common weather pattern by day
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

// find most common icon by day
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

// find most occurences & single them out
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

// math calculations //
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

// function getMph(meter) {
//   const miles = meter / 0.44704;
//   return Math.round(( miles * 10 ) / 10).toFixed(1);
// }

function getMph(kmh) {
  const mph = Math.round(kmh) / 1.609344;
  return Math.round(mph);
}

function getKmh(mph) {
  const km = mph * 1.609344 / 10;
  return Math.round(km);
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

$(init)
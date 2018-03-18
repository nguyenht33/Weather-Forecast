const geoKey = 'AIzaSyBi4p4_5i-BkoRSKAhOIzUyp9usQTqQitw';
const geoURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const timeKey = 'AIzaSyCJVgwxq5ZNiRJeX-iw4c1lE4Rawg3werg';
const timeURL = 'https://maps.googleapis.com/maps/api/timezone/json';
const openKey = '335185afd1bee6c30739e6238eec798b';
const openWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const openForecastURL = 'https://api.openweathermap.org/data/2.5/forecast';
let currentCity;
let currentTimeZone;
let locationsList = [];
let tempSettingF;
let tempSettingC;

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
  startLoader();
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

function getTimeZone(latlng, timestamp) {
  let data = {
    location: latlng,
    timestamp: timestamp,
    key: timeKey
  };

  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: timeURL,
    data: data,
    async: false,
    success: getCurrentTime
  })
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
  getSessionStorage();
  setSessionStorage();
  getUnitSettingsFromStorage();
  getListFromLocalStorage();
  getCurrentFromStorage();
  displaySidebar(); 
  closeSidebarClicked(); 
  displayLocationsList(); 
  displaySearchbar();
  displayUnitSettings();
  closeMessage();
  expandMap();
  handleAddLocation();
  handleLocationClicked();
  handleLocationDelete();
  handleTempSettingClicked();
}

function getSessionStorage() {
  const isVisited = sessionStorage.getItem('visited');
  if (!isVisited) {
    const content = `<div class="splash">
                        <h1 class="animated bounceInDown">your
                        </br>
                        <span>weather</span>
                        </br> 
                        <span>report</span></h1>
                     </div>`
    $('body').addClass('noScroll');
    $('body').append(content);

    $('.splash').delay(3000).fadeOut('3000', e => {
        $(this).addClass('remove-splash');
            $('body').removeClass('noScroll');
    });
  }
}

function setSessionStorage() {
  sessionStorage.setItem('visited', 'true');
}

function startLoader() {
  $('.loader').addClass('loading');
}

function stopLoader() {
  $('.loader').removeClass('loading');
}

function getUnitSettingsFromStorage() {
  let storedSettingF = localStorage.getItem('tempSETTINGF');
  let storedSettingC = localStorage.getItem('tempSETTINGC');
  if (storedSettingF !== null && storedSettingC !== null) {
    let parsedSettingF = JSON.parse(storedSettingF);
    tempSettingF = parsedSettingF;
    let parsedSettingC = JSON.parse(storedSettingC);
    tempSettingC = parsedSettingC;
  } else {
    tempSettingF = true;
    tempSettingC = false;
  }
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
    getGeoLocation();
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

function setUnitSettingsToStorage() {
  localStorage.setItem('tempSETTINGF', JSON.stringify(tempSettingF));
  localStorage.setItem('tempSETTINGC', JSON.stringify(tempSettingC));
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
  if (location.results.length) {
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
  } else {
    displayErrorMessage();
  }
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
  $('.js-message').toggleClass('show');
  $('html, body').animate({scrollTop: 0}, '1000');
  if (error === 'err1') {
    const errorMessage1 = `<div class="message-box">
                              <p>Multiple locations under this name, please specify.</p>
                              <span data-icon="&#xe001;" class="icon-close"></span>
                           </div>`
    $('.js-message').html(errorMessage1);
  } else if (error === 'err2'){
    const errorMessage2 = `<div class="message-box">
                              <p>Please enter city or zip code for most accurate weather data.</p>
                              <span data-icon="&#xe001;" class="icon-close"></span>
                           </div>`
    $('.js-message').html(errorMessage2);
  } else {
    const errorMessage3 =  `<div class="message-box">
                              <p>No locations found under this name, please try again</p>
                              <span data-icon="&#xe001;" class="icon-close"></span>
                           </div>`
    $('.js-message').html(errorMessage3);
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
      $('.js-location-input').blur();
      closeSearchbar();
    } else {
      const locationTarget = $(e.currentTarget).find('.js-location-input');
      const address = locationTarget.val();
      $('.js-location-input').val(''); 
      $('.js-location-input').blur();
      closeSearchbar();   
      getLocation(address);
    }
  });
}

function handleLocationClicked() {
  $('.js-side-nav').on('click', 'li', function() {
    startLoader();

    const itemIndex = $(this).closest('li').attr('id');  
    currentCity = locationsList[itemIndex];

    displayCurrentCityMarker();
    setCurrentToStorage(currentCity);
    $('html, body').animate({scrollTop: 0}, '1000');
    displayWeatherReports();
    closeSidebar();
    stopLoader();
  });
}

function handleLocationDelete() {
  $('.js-side-nav').on('click', '.delete', function(e) {
    e.stopPropagation();
    const itemIndex = $(this).closest('li').attr('id');
    locationsList.splice(itemIndex, 1);
    setListToStorage();
    displayLocationsList();
    displayCurrentCityMarker();

    if (locationsList.length === 0) {
      getGeoLocation();
      displayCurrentCityMarker();
      closeSidebar();
    } else if (locationsList.indexOf(currentCity) === -1) {
      currentCity = locationsList[0];
      setCurrentToStorage();
      getCurrentFromStorage();
      displayCurrentCityMarker();
    } 
  });
}

function handleTempSettingClicked() {
  $('.js-temp-results').on('click', '.celcius', function(e) {
    handleCelciusConversion();
    tempSettingF = false, tempSettingC = true;
    setUnitSettingsToStorage();

    $(this).attr('disabled', true);
    $('.fahrenheit').attr('disabled', false);
    $('.units').toggleClass('show');
    $('.units').toggleClass('hidden');
  });

  $('.js-temp-results').on('click', '.fahrenheit', function(e) {
    handleFahrenheitConversion();
    tempSettingF = true, tempSettingC = false;
    setUnitSettingsToStorage();

    $(this).attr('disabled', true);
    $('.celcius').attr('disabled', false);
    $('.units').toggleClass('show'); 
    $('.units').toggleClass('hidden'); 
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

    const windSpeed = $('.weather-details li:nth-last-child(2) span').text().replace(/\D/g,'');
    const convertedWindSpeed = getKmh(windSpeed);
    $('.weather-details li:nth-last-child(2) span').html(`${convertedWindSpeed} km/h`);

    const visibility = $('.weather-details li span').last().text().replace(/\D/g,'');
    const convertedVisibility = getKilometersFromMiles(visibility);
    $('.weather-details li span').last().html(`${convertedVisibility} km`)

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

    const windSpeed = $('.weather-details li:nth-last-child(2) span').text().replace(/\D/g,'');
    const convertedWindSpeed = getMph(windSpeed);
    $('.weather-details li:nth-last-child(2) span').html(`${convertedWindSpeed} mph`);

    const visibility = $('.weather-details li span').last().text().replace(/\D/g,'');
    const convertedVisibility = getMilesFromKilometers(visibility);
    $('.weather-details li span').last().html(`${convertedVisibility} mi`)

    $('.forecast-temp').each(function(index, temp) {
      const convertedTemp = convertToFahrenheit($(temp).text().slice(0, -1));
      $(this).html(`${convertedTemp}&#176`);
    });
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
    return `${Math.round(wind)} mph`
  } else if (tempSettingC) {
    return `${getKmh(wind)} km/h`
  }
}

function checkVisibilitySettings(visibility) {
  if (tempSettingF) {
    return `${getMilesFromMeters(visibility)} mi`
  } else if (tempSettingC) {
    return `${getKilometersFromMeters(visibility)} km`
  };
}

function checkDayNight(sunrise, sunset, icon) {
  const day = moment();
  const time = day.tz(currentTimeZone).format('HH:mm');
  const sunriseTime = moment(sunrise, ['h:mm A']).format('HH:mm');
  const sunsetTime = moment(sunset, ['h:mm A']).format('HH:mm');

  if (time > sunriseTime && time < sunsetTime) {
    $('body').removeClass('night');
    if (icon !== '01d') {
      $('.js-weather-image').html('<img src="./images/sun-cloud.svg" alt="cloudy-day" class="weather-img">');
    } else {
      $('.js-weather-image').html('<img src="images/sun.svg" alt="clear-day" class="weather-img">');
    };
  } else {
    $('body').addClass('night');
    if (icon !== '01n') {
      $('.js-weather-image').html('<img src="./images/moon-cloud.svg" alt="cloudy-night" class="weather-img">');
    } else {    
      $('.js-weather-image').html('<img src="./images/moon.svg" alt="moon" class="weather-img">')
    };
  };
}

function convertTimeStampToHour(time) {
  const day = moment.unix(time);
  const hour = day.tz(currentTimeZone).format('h:mm A');
  return hour;
}

function getCurrentTime(timeZone) {
  const day = moment();
  const zone = timeZone.timeZoneId;
  currentTimeZone = zone;
  const date = day.tz(zone).format('ddd, MMMM d');
  const hour = day.tz(zone).format('h:mm');
  displayCity(date, hour);
}

function updateTime() {
  const day = moment();   
  const date = day.tz(currentTimeZone).format('ddd, MMMM d');
  const hour = day.tz(currentTimeZone).format('h:mm');
  $('.date p').first().html(hour);
  $('.date p').last().html(date);
}

function displayCity(date, hour) {
  const cityAndTime = `<div class="city-name">
                          <h2>${currentCity.name}<h2>
                      </div>
                      <div class="date">
                        <p>${hour}</p>
                        <p>${date}</p>
                      </div>`
  $('.js-city-results').html(cityAndTime);

  updateTime();
    setInterval(function(){
     updateTime();
    },60000);
}

function displayLocationsList() {
  const cityItems = locationsList.map((city, index) => {
    return `<li id="${index}" class="sidenav">
              <div class="list-item">
                <p><span data-icon="&#xe001;" class="icon-marker"></span>${city.name}</p>
                <button class="delete"><span data-icon="&#xe001;" class="icon-close"></span></button>
              </div>
            </li>`
  });
  $('.js-side-nav').html(cityItems);
  if (currentCity) {
    displayCurrentCityMarker();
  };
}

function displayCurrentCityMarker() {
  $('.list-item p span').removeClass('active-marker');
  $(".list-item p:contains('" + currentCity.name + "') span").addClass('active-marker');
}

function displayWeather(weather) {
  // current city & time
  const latlng = weather.coord.lat + ',' + weather.coord.lon;
  const timestamp = weather.dt;
  getTimeZone(latlng, timestamp);

  // current temp
  const main = weather.main;
  const currentTemp = checkTempSettings(main.temp);
  const currentMaxTemp = checkTempSettings(main.temp_max);
  const currentMinTemp = checkTempSettings(main.temp_min);
  displayTemperature(currentTemp, currentMaxTemp, currentMinTemp);

  // weather details
  const wind = weather.wind.speed;
  const windSpeed = checkWindSpeedSettings(wind);
  const feelLike = getFeelsLike(main.temp, main.humidity, wind);
  const feelLikeTemp = checkTempSettings(feelLike);  
  const visibility = checkVisibilitySettings(weather.visibility);

  // sunrise / sunset
  const sunrise = convertTimeStampToHour(weather.sys.sunrise);
  const sunset = convertTimeStampToHour(weather.sys.sunset);
  const icon = weather.weather[0].icon;
  checkDayNight(sunrise, sunset, icon);

  const weatherCondition = `<h3>Condition</h3>
                            <div class="current-condition">
                              <span data-icon="&#xe001;" class="icon-${icon} weather-condition-icon"></span>
                              <h2>${weather.weather[0].description}</h2>
                            </div>`

  const weatherDetails = `<div class="details-container">                              
                            <div class="weather-details">
                              <h3>Details</h3>
                              <ul>
                                <li><p>Feels like:</p><span>${feelLikeTemp}&#176</span></li>
                                <li><p>Humidity:</p><span>${main.humidity}%</span></li>
                                <li><p>Wind:</p><span>${windSpeed}</span></li>
                                <li><p>Visibility:</p><span>${visibility}</span></li>
                              </ul>
                            </div>
                            <div class="sunrise-sunset">
                              <ul>
                                <li>
                                  <h4>sunrise</h4>
                                  <span data-icon="&#xe001;" class="icon-sunrise icon-sun"></span>
                                  <p>${sunrise}</p>
                                </li>
                                <li>
                                  <h4>sunset</h4>
                                  <span data-icon="&#xe001;" class="icon-sunset icon-sun"></span>
                                  <p>${sunset}</p>
                                </li>
                              </ul>
                            </div>
                          </div>`;
  $('.js-weather-condition').html(weatherCondition);
  $('.js-weather-results').html(weatherDetails);
}

function displayTemperature(currentTemp, currentMaxTemp, currentMinTemp) {
  let buttonF, buttonC;
  if (tempSettingF === true) {
    buttonF = 'disabled';
    buttonC = 'enabled';
  } else if (tempSettingC === true) {
    buttonC = 'disabled';
    buttonF = 'enabled';
  }
  const currentTemperature = `<div class="current-temp">
                                <div class="temp">
                                  <h1>${Math.round(currentTemp)}&#176</h1>
                                  <p>${Math.round(currentMaxTemp)}&#176</p>
                                  <p>${Math.round(currentMinTemp)}&#176</p>
                                </div>
                                <div class="temp-settings">
                                  <div class="units hidden">
                                    <input type="button" value="F&#176" class="fahrenheit unit-btn" ${buttonF}>
                                    <input type="button" value="C&#176" class="celcius unit-btn" ${buttonC}>
                                  </div>                              
                                  <span data-icon="&#xe001;" class="icon-thermometer"></span>
                                </div> 
                              </div>`;
  $('.js-temp-results').html(currentTemperature);
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
  $('.js-forecast-results').prepend(`<h3>Forecast</h3>`);
  stopLoader();
}

// calculating 5 days forecast based on OWM's every 3hrs data //
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
function convertToFahrenheit(temp) {
  const result = (temp * 1.8) + 32;
  return Math.round(result);
}

function convertToCelcius(temp) {
  const result = (temp - 32) / 1.8;
  return Math.round(result);
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

function getMilesFromMeters(meter) {
  const miles = meter * 0.000621371192;
  return Math.round(miles);
}

function getMilesFromKilometers(kilometers) {
  const miles = kilometers * 1.60934;
  return Math.round(miles);
}

function getKilometersFromMeters(meter) {
  const km = meter / 1000;
  return Math.round(km); 
}

function getKilometersFromMiles(kilometers) {
  const miles = kilometers / 1.609347;
  return Math.round(miles);
}

function getMph(kmh) {
  const mph = kmh / 1.609344;
  return Math.round(mph);
}

function getKmh(mph) {
  const km = mph * 1.609344;
  return Math.round(km);
}

function displaySidebar() {
  $('.js-sidebar-btn').click(function() {
    toggleResize();
    $('.js-sidebar').toggleClass('active');
    $('.main-wrap').toggleClass('slide-right');
    $('header').toggleClass('slide-right');  
  });
}

function closeSidebarClicked() {
  $('.sidebar-header button').on('click', function() {
    closeSidebar();
  })
}

function closeSidebar() {
  $('.main-wrap').toggleClass('slide-right');
  $('.js-sidebar').toggleClass('active');
  $('header').toggleClass('slide-right');
  removeResize();
}

function toggleResize() {
  $('.main-wrap').toggleClass('resize');
  $('.col-2').toggleClass('resize');
  $('.details-container').toggleClass('resize');
  $('.page-wrap').toggleClass('resize');
  $('.current-condition h2').toggleClass('resize');
}

function removeResize() {
  $('.main-wrap').removeClass('resize');
  $('.col-2').removeClass('resize');
  $('.details-container').removeClass('resize');
  $('.page-wrap').removeClass('resize');
  $('.current-condition h2').removeClass('resize');
}

function closeSearchbar() {
  $('.js-location-input').toggleClass('open');
  $('.js-add-btn').toggleClass('hidden');
  $('.js-add-icon').toggleClass('hidden');
}

function closeMessage() {
  $('.js-message:not(.message-box)').on('click', function() {
    $(this).toggleClass('show');
  });
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      $('.js-message').removeClass('show');
    }
  });
}

function displaySearchbar() {
  $('.js-add-icon').click(function() {
    $('.js-location-input').toggleClass('open');
    $('.js-add-btn').toggleClass('hidden');
    $('.js-add-icon').toggleClass('hidden');
  });
}

function displayUnitSettings() {
  $('.js-temp-results').on('click', '.icon-thermometer', function() {
    $('.units').toggleClass('show');
    $('.units').toggleClass('hidden');
  });
}

function expandMap() {
  $('body').on('click', '#preMap span', function() {
    $('#preMap').toggleClass('expand');
    $('#map').toggleClass('expand');
    $('body').toggleClass('expand');
  });

  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
    $('#preMap').removeClass('expand');
    $('#map').removeClass('expand');
    $('body').removeClass('expand');
    }
  });
}

// map functions //
function getMap() {
  if (map != undefined || map != null) {
    map.remove();
    $('#map').html('');
    $('#preMap').empty();
    const mapContainer = `<h3>Map<span data-icon="&#xe001;" class="icon-expand"></span></h3>
                          <div id="map"></div>`
    $(mapContainer).appendTo('#preMap');
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
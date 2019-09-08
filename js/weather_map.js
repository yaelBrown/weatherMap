'use strict';

// Declare Variables
var show = document.getElementById("showWeather");
var inputCity = document.getElementById("input-city");
var cityNameDiv = document.getElementById("cityName");
var city = "";
var cityCoords;
var browserLocation = [];
var browserLongitude;
var browserLatitude;
var loc = "";
var proxy = 'https://cors-anywhere.herokuapp.com/';
var darkSky = 'https://api.darksky.net/forecast/';
var long = Number.MIN_SAFE_INTEGER;
var lat = Number.MIN_SAFE_INTEGER;
var currentDarkSkyData;
var cards = document.getElementById("cards");
var card = document.getElementsByClassName('card');

show.innerHTML = "this is working";


// Set loc
function setLoc(long, lat) {
  loc = lat + "," + long;
  return loc;
}

// Update Dark Sky Data
function updateDarkSkyDate() {
  $.get(proxy + darkSky + darkSkyKey + '/' + loc).done(function(data) {
    // console.log(data);
    currentDarkSkyData = data;
    show.innerText = data.currently.apparentTemperature + " F";
  }).fail(function(jqXhr, status) {
    console.log(status);
  });
}

// On [enter] keydown, take input from input-city
document.addEventListener("keydown", function(e) {
  if (e.keyCode === 13) {
    console.log(inputCity.value);
    cityNameDiv.innerText = inputCity.value;
    city = inputCity.value;
    geocode(city, mapBoxToken).then(function(result) {
      cityCoords = result;
    });
    setTimeout(function() {
      flyMe(cityCoords[0], cityCoords[1]);
      console.log("flyMe function runs 2 seconds later after keyup");
    }, 500);
    setTimeout(function() {
      setLoc(cityCoords[0], cityCoords[1]);
      updateDarkSkyDate();;
      pushCardDataToPage();
    }, 2000);
    setTimeout(function() {
      manageCardData(currentDarkSkyData);
      pushCardDataToPage();
    }, 4000);
  }
});

// ===== Browser Navigator =====

// Get browser location
function getLocation() {   // this function will show current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    // flyMe(currentDarkSkyData.longitude, currentDarkSkyData.latitude);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  show.innerHTML = "Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude;
  browserLongitude = position.coords.longitude;
  browserLatitude = position.coords.latitude;
  loc = position.coords.latitude + "," + position.coords.longitude;
  return loc;
}

// After 5 seconds, get browser location
setTimeout(function() {
  getLocation();

  // Add draggable marker (after 2 seconds (after 5 seconds total))
  // setTimeout(function() {
  //   var marker = new mapboxgl.Marker({
  //     draggable: true
  //   })
  //   .setLngLat([browserLongitude, browserLatitude])
  //   .addTo(map);
  // });
}, 3000);

// setTimeout(getLocation(), 8000);

// DarkSky api call
// $.get(proxy + darkSky + darkSkyKey + '/' + loc).done(function(data) {
//   // console.log(data);
//   currentDarkSkyData = data;
//   show.innerText = data.currently.apparentTemperature + " F";
// }).fail(function(jqXhr, status) {
//   console.log(status);
// });


// conversion formulas
function convertFtoC(num) {
  return (num - 32) / 1.8;
}

function convertCtoF(num) {
  return (num * 1.8) + 32;
}


// ===== mapBox =====

// Basic specs for map
mapboxgl.accessToken = mapBoxToken;
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  zoom: 0
});

// Fly to location when 'Fly' button is pressed
document.getElementById("fly").addEventListener("click", function() {
  console.log("fly was pressed")
  map.flyTo({
    center: [
      -74.50 + (Math.random() - 0.5) * 10,
      40 + (Math.random() - 0.5) * 10],
    zoom: 18
  });
})

// function to fly somewhere.
function flyMe(argsLong, argsLat) {
  map.flyTo({
    center: [argsLong, argsLat],
    zoom: 10
  });
}



// ===== Weather Icon =====
function selectWeatherIcon(str) {
  let icon;
  let dir = "/img/amcharts_weather_icons_1.0.0/animated/"

  switch (str) {
    case "clear-day":
      icon = dir + "day.svg";
      break;
    case "clear-night":
      icon = dir + "night.svg";
      break;
    case "rain":
      icon = dir + "rainy-4.svg";
      break;
    case "snow":
      icon = dir + "snowy-5.svg";
      break;
    case "sleet":
      icon = dir + "snowy-4.svg";
      break;
    case "cloudy":
    case "fog":
    case "wind":
      icon = dir + "cloudy-night-3.svg";
      break;
    case "hail":
      icon = dir + "rainy-7.svg";
      break;
    case "tornado":
    case "thunderstorm":
      icon = dir + "thunder.svg";
      break;
    case "partly-cloudy-day":
      icon = dir + "cloudy-day-1.svg";
      break;
    case "partly-cloudy-night":
      icon = dir + "cloudy-night-2.svg";
      break;
    default:
      icon = dir + "day.svg";
      break;
  }

  return icon;
}



// Get day of the week (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay)
// function dayOfTheWeek(obj) {
//   var options = { weekday: 'long' };
//   return new Intl.DateTimeFormat('en-US', options).format(obj);
// }

function dayOfTheWeek(date) {
let tempDateSS = date.toString().substring(0,3);
let temp = "";

switch (tempDateSS) {
  case 'Sun':
    temp = "Sunday";
    break;
  case 'Mon':
    temp = "Monday";
    break;
  case 'Tue':
    temp = "Tuesday";
    break;
  case 'Wed':
    temp = "Wednesday";
    break;
  case 'Thu':
    temp = "Thursday";
    break;
  case 'Fri':
    temp = "Friday";
    break;
  case 'Sat':
    temp = "Saturday";
    break;
}

return temp;
}

// Handle Card data
function manageCardData(obj) {
let tempStr = "";
let doNothing;
let tempDate = "";
let dayOfWeekstr = "";


obj.daily.data.forEach(function(e,i) {
  if (i <= 2) {
    tempDate = new Date(e.time * 1000);
    dayOfWeekstr = dayOfTheWeek(tempDate);

    tempStr += '<div class="card" style="width: 18rem;">';
    tempStr += '<div class="card-body">';
    if (i === 0) {
      tempStr += '<h5 class="card-title" id="summary">Today</h5>';
    } else if (i === 1) {
      tempStr += '<h5 class="card-title" id="summary">Tomorrow</h5>';
    } else {
      tempStr += '<h5 class="card-title" id="summary">' + dayOfWeekstr + '</h5>';
    };
    tempStr += '<img class="card-img" src="' + selectWeatherIcon(e.icon) + '">';
    tempStr += '<h6 class="card-subtitle mb-2 text-muted">' + e.summary + '</h6>';
    tempStr += '<p class="card-text"></br></p>'; // display current temperature
    tempStr += '<p class="card-text"><small>High / Low: </small></br>' + e.temperatureHigh + ' / ' + e.temperatureLow + '</br></p>';
    tempStr += '<p class="card-text"><small>Wind Speed</small></br>';
    tempStr += '<img class="windIcon" src="img/windVector.svg">' + e.windSpeed + '<small>mph</small></br></p>';
    tempStr += '</div>';
    tempStr += '</div>';
  } else {
    doNothing = null;
  }
})

return tempStr;
}


// Print card data to page.
function pushCardDataToPage() {
cards.innerHTML = manageCardData(currentDarkSkyData);
for (var i = 0; i < card.length; i++) {
  card[i].style.visibility = "visible";
}
}

// attempt at marker
// var marker = new mapboxgl.Marker({
//   draggable: true
// });

// function onDragEnd() {
//   var lngLat = marker.getLngLat();
//   coordinates.style.display = 'block';
//   coordinates.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
// };

// marker.on('dragend', onDragEnd);
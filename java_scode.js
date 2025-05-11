// Set to current date
document.getElementById("current-date").innerHTML = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

// Get DOM elements
const citySelect = document.getElementById("city-select");
const searchBtn = document.getElementById("search-btn");
const weatherSummary = document.getElementById("weather-summary");
const weatherDetails = document.getElementById("weather-details");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const weatherIcon = document.getElementById("weather-icon");
const cityName = document.getElementById("weather-city");
const weatherDesc = document.getElementById("weather-desc");
const weatherTemp = document.getElementById("weather-temp");
const weatherWind = document.getElementById("weather-wind");
const weatherHumidity = document.getElementById("weather-humidity");
const weatherFeels = document.getElementById("weather-feels");

// Track current selected weather type
let currentType = "wind";

// handlers for navigation button 
const navButtons = document.querySelectorAll(".nav-buttons button");
navButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentType = button.getAttribute("data-type");
    const value = citySelect.value;
    if (value) {
      const [lat, lon] = value.split(",");
      fetchWeatherData(lat, lon, currentType);
    }
  });
});

// handler for search button click 
searchBtn.addEventListener("click", () => {
  const value = citySelect.value;
  if (!value) {
    errorMessage.style.display = "none";
    weatherSummary.style.display = "none";
    weatherDetails.style.display = "none";
    return;
  }

  const [lat, lon] = value.split(",");
  fetchWeatherData(lat, lon, currentType);
});

// Fetch weather data function
function fetchWeatherData(lat, lon, type = "wind") {
  let queryParam;

  switch (type) {
    case "rain":
      queryParam = "hourly=rain";
      break;
    case "temperature":
      queryParam = "hourly=temperature_2m";
      break;
    case "wind":
    default:
      queryParam = "hourly=wind_speed_10m";
  }

  const today = new Date().toISOString().split("T")[0]; // e.g., 2025-05-10
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&${queryParam}&start_date=${today}&end_date=${today}&timezone=auto`;

  loadingMessage.style.display = "block";
  weatherSummary.style.display = "none";
  weatherDetails.style.display = "none";
  errorMessage.style.display = "none";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const time = data.hourly?.time || [];
      let values = [];

      if (type === "rain") {
        values = data.hourly?.rain || [];
        weatherDesc.textContent = "Rain (mm)";
        weatherIcon.src = "https://www.weatherbit.io/static/img/icons/r02d.png";
      } else if (type === "temperature") {
        values = data.hourly?.temperature_2m || [];
        weatherDesc.textContent = "Temperature";
        weatherIcon.src = "https://www.weatherbit.io/static/img/icons/c01d.png";
      } else {
        values = data.hourly?.wind_speed_10m || [];
        weatherDesc.textContent = "Wind Speed";
        weatherIcon.src = "https://www.weatherbit.io/static/img/icons/c02d.png";
      }

      if (!values.length || values[0] == null) {
        throw new Error(`No ${type} data available for today.`);
      }

      cityName.textContent = citySelect.options[citySelect.selectedIndex].text;
      weatherTemp.textContent = `${values[0]} ${type === "temperature" ? "°C" : type === "rain" ? "mm" : "m/s"}`;
      weatherWind.textContent = values[0];
      weatherHumidity.textContent = "45"; 
      weatherFeels.textContent = "15°C"; 

      weatherSummary.style.display = "block";
      weatherDetails.style.display = "block";
      loadingMessage.style.display = "none";
    })
    .catch(err => {
      errorMessage.textContent = `Error: ${err.message}`;
      loadingMessage.style.display = "none";
      errorMessage.style.display = "block";
    });
}

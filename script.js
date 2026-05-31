const unitSettingsBtn = document.getElementById("unitSettingsBtn");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const themeBtn = document.getElementById("themeBtn");
const result = document.getElementById("result");
const apiKey = "9d189335225cf8bf0cf72bd725197142";
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
const locationBtn = document.getElementById("locationBtn");
const historyDropdown = document.getElementById("historyDropdown");
const mapBox= document.getElementById("mapBox");

let map;
let marker;

const unitModal = document.getElementById("unitModal");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");
const closeUnitModalBtn = document.getElementById("closeUnitModalBtn");

let temperatureUnit =
localStorage.getItem("temperatureUnit");
let lastCityName = "";

function openUnitModal() {
    unitModal.classList.add("show");
}

function closeUnitModal() {
    unitModal.classList.remove("show");
}

function updateActiveUnitButton() {
    celsiusBtn.classList.remove("active-unit");
    fahrenheitBtn.classList.remove("active-unit");

    if (temperatureUnit === "C") {
        celsiusBtn.classList.add("active-unit");
    }

    if (temperatureUnit === "F") {
        fahrenheitBtn.classList.add("active-unit");
    }
}

if (!temperatureUnit) {
    openUnitModal();
} else {
    updateActiveUnitButton();
}

unitSettingsBtn.addEventListener("click", function(){
    updateActiveUnitButton();
    openUnitModal();
});

closeUnitModalBtn.addEventListener("click", function(){
    closeUnitModal();
});

celsiusBtn.addEventListener("click", function(){
    temperatureUnit = "C";
    localStorage.setItem("temperatureUnit", "C");
    updateActiveUnitButton();
    closeUnitModal();

    if (lastCityName !== "") {
        cityInput.value = lastCityName;
        searchBtn.click();
    }
});

fahrenheitBtn.addEventListener("click", function(){
    temperatureUnit = "F";
    localStorage.setItem("temperatureUnit", "F");
    updateActiveUnitButton();
    closeUnitModal();

    if (lastCityName !== "") {
        cityInput.value = lastCityName;
        searchBtn.click();
    }
});

function formatTemperature(tempC) {
    if (temperatureUnit === "F") {
        return Math.round((tempC * 9 / 5) + 32) + "°F";
    }

    return Math.round(tempC) + "°C";
}

 // Format city name to have capitalized words
function formatCityName(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const forecastBox = document.getElementById("forecast"); // Container for 5-day forecast display
const weatherOverlay = document.getElementById("weatherOverlay"); //block for background image based on weather condition


 function showWeatherIcon(condition) { // Return appropriate weather icon based on condition
   let icon = "🌤️";
    if (condition === "Clear") icon = "☀️";
    else if (condition === "Clouds") icon = "☁️";
    else if (condition === "Rain") icon = "🌧️";
    else if (condition === "Snow") icon = "❄️";
    return `<div class="city-weather-icon">${icon}</div>`;
}

locationBtn.addEventListener("click", function(){ // Get weather based on user's geolocation
    function error(){
        result.textContent = "Unable to retrieve your location. Please allow location access and try again.";
        
    }
    navigator.geolocation.getCurrentPosition(function(position){ // Get user's current position

    const lat = position.coords.latitude; 
    const lon = position.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
       
    fetch(url) 

       .then(function(response) {
        return response.json();
       })

       .then(function(data){
       console.log(data);

    const cityName = data.name;
    const weather = data.weather[0].main;
    lastCityName = cityName;

    const lat = data.coord.lat;
const lon = data.coord.lon;
showMap(lat, lon, cityName);

    const conditionText =
    weather.charAt(0).toUpperCase() +
    weather.slice(1).toLowerCase();

    result.innerHTML = `
        <div class="city-header">
            ${showWeatherIcon(weather)}         
            <strong>${cityName}</strong>
        </div>

        <div class="weather-details">
            <span>Temperature: <strong>${formatTemperature(data.main.temp)}</strong></span>
            <span>Condition: <strong>${conditionText}</strong></span>
            <span>Humidity: <strong>${data.main.humidity}%</strong></span>
            <span>Wind Speed: <strong>${Math.round(data.wind.speed)} m/s</strong></span>
            <span>Feels like: <strong>${formatTemperature(data.main.feels_like)}</strong></span>
        </div>
    `;

    let imageUrl = "";
    
        if (weather === "Clear"){
            imageUrl = "url('images/clear.jpg')";
        }else if (weather === "Clouds"){
            imageUrl = "url('images/clouds.jpg')";
        }else if (weather === "Rain"){
            imageUrl = "url('images/rain.jpg')";
        }else if (weather === "Snow"){
            imageUrl = "url('images/snow.jpg')";
        }
        weatherOverlay.style.opacity = "0"; 

    setTimeout(function() {
            weatherOverlay.style.backgroundImage = imageUrl;
            weatherOverlay.style.opacity = "0.45";
        }, 300);

        saveToHistory(cityName); // Save city name from geolocation search to history
       })
       .catch(function(error){ //
        result.textContent = "Error fetching weather data. Please check your connection.";
        });
    }, error); 
});

function saveToHistory(city){ // Save searched city to local storage and update history display
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        displayHistory();
    }
}

function displayHistory(){ // Display search history as dropdown
    historyDropdown.innerHTML = "";
    
    if (searchHistory.length === 0) { // Hide dropdown if no history
       historyDropdown.style.display = "none";
        return;
    }
    
    searchHistory.forEach(city => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = city;
        item.addEventListener("click", function(){
            cityInput.value = city;
            searchBtn.click();
            historyDropdown.style.display = "none";
        });
        historyDropdown.appendChild(item);
    });
    
    // Add clear history button
    const clearBtn = document.createElement("div");
    clearBtn.className = "clear-history";
    clearBtn.textContent = "Clear History";
    clearBtn.addEventListener("click", function(){
        searchHistory = [];
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        displayHistory();
    });
    historyDropdown.appendChild(clearBtn);
    
}

themeBtn.addEventListener("click", function(){
    document.body.classList.toggle("dark"); // Toggle dark theme class on body
});

searchBtn.addEventListener("click", function(){ //when search button is clicked, fetch weather data for entered city and display results
    const cityName = cityInput.value.trim();
    if(cityName === ""){
        return;
    }
    const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;
    result.innerHTML = `
    <div class="spinner"></div>
`;

  fetch(url)
.then(function(response){
    return response.json();
})
.then(function(data){

    console.log(data);

    const cityName = data.name;
    const weather = data.weather[0].main;
    lastCityName = cityName;

    const lat = data.coord.lat;
const lon = data.coord.lon;
showMap(lat, lon, cityName);

    const conditionText =
    weather.charAt(0).toUpperCase() +
    weather.slice(1).toLowerCase();

    result.innerHTML = `
    <div class="city-header">
        ${showWeatherIcon(weather)}
        <strong>${cityName}</strong>
    </div>

    <div class="weather-details">
        <span>Temperature: <strong>${formatTemperature(data.main.temp)}</strong></span>
        <span>Condition: <strong>${conditionText}</strong></span>
        <span>Humidity: <strong>${data.main.humidity}%</strong></span>
        <span>Wind Speed: <strong>${Math.round(data.wind.speed)} m/s</strong></span>
        <span>Feels like: <strong>${formatTemperature(data.main.feels_like)}</strong></span>
    </div>
    `;

    let imageUrl = "";

    if (weather === "Clear"){
        imageUrl = "url('./images/clear.jpg')";
    }else if (weather === "Clouds"){
        imageUrl = "url('./images/clouds.jpg')";
    }else if (weather === "Rain"){
        imageUrl = "url('./images/rain.jpg')";
    }else if (weather === "Snow"){
        imageUrl = "url('./images/snow.jpg')";
    }

    weatherOverlay.style.opacity = "0";

    setTimeout(function() {

        weatherOverlay.style.backgroundImage = imageUrl;
        weatherOverlay.style.opacity = "0.45";

    }, 300);

    saveToHistory(cityName);

})

    .catch(function(){
        result.innerHTML = "Error loading weather";
    });

    fetch(forecastUrl) // Fetch 5-day forecast data for the city

    .then(function(response){
        return response.json();
    })

    .then(function(data){

        forecastBox.innerHTML = "";

        const forecastMap = {}; // Map to group forecast entries by day
        const dayOrder = [];// Array to maintain the order of days for display
        const weekdayNames = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];

        data.list.forEach(item => {

            const date = new Date(item.dt * 1000); // Convert Unix timestamp to JavaScript Date object

            const dayKey =
            date.toISOString().split("T")[0]; // Get date in YYYY-MM-DD format

            const hour = // Format hour as HH:00
            date.getHours().toString().padStart(2, "0")
            + ":00";

            const iconCode = item.weather[0].icon; // Get weather icon code for the forecast entry

            const temp = Math.round(item.main.temp); // Get temperature for the forecast entry

            if(!forecastMap[dayKey]){ // If this day is not yet in the map, initialize it and add to day order
                forecastMap[dayKey] = [];
                dayOrder.push(dayKey);
            }

            forecastMap[dayKey].push({ 
                hour,
                temp,
                icon: iconCode,
                description: item.weather[0].main
            });

        });

        const forecastWrapper =
        document.createElement("div");

        forecastWrapper.className =
        "forecast-wrapper";

        forecastWrapper.innerHTML = `
            <div class="forecast-day-buttons"></div>
            <div class="forecast-day-info"></div>
        `;

        forecastBox.appendChild(forecastWrapper);

        const daysContainer =
        forecastWrapper.querySelector(".forecast-day-buttons");

        const infoContainer =
        forecastWrapper.querySelector(".forecast-day-info");

        function renderDay(dayKey){

            const entries =
            forecastMap[dayKey] || [];

            const dayName =
            weekdayNames[new Date(dayKey).getDay()];

            infoContainer.innerHTML = ` 
                <div class="forecast-day-header">
                    ${dayName} (${dayKey})
                </div>

                <div class="forecast-timeline"></div>
            `;

            const timeline =
            infoContainer.querySelector(".forecast-timeline");

            entries.forEach(item => {

                const cell =
                document.createElement("div");

                cell.className =
                "forecast-hour-cell";

                cell.innerHTML = `
                    <div class="forecast-hour-label">
                        ${item.hour}
                    </div>

                    <img
                    class="forecast-hour-icon"
                    src="https://openweathermap.org/img/wn/${item.icon}.png">

                    <div class="forecast-hour-temp">
                        ${formatTemperature(item.temp)}
                    </div>
                `;

                timeline.appendChild(cell);

            });

        }

        dayOrder.forEach((dayKey, index) => {

            const date = new Date(dayKey);

            const dayName =
            weekdayNames[date.getDay()];

            const button =
            document.createElement("button");

            button.className =
            "forecast-day-btn";

            button.textContent = dayName;

            button.addEventListener("click", function(){

                const active =
                daysContainer.querySelector(".active");

                if(active){
                    active.classList.remove("active");
                }

                button.classList.add("active");

                renderDay(dayKey);

            });

            daysContainer.appendChild(button);

            if(index === 0){ // Automatically click the first day button to show initial forecast
                button.classList.add("active");
                renderDay(dayKey);
            }
        });
    })

    .catch(function(){
        forecastBox.innerHTML = "";
    });
});

 function showMap(lat, lon, cityName) {
mapBox.classList.add("visible");

    if (!map) {

        map = L.map("mapBox").setView([lat, lon], 4);

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "© OpenStreetMap"
            }
        ).addTo(map);

    } else {

        map.setView([lat, lon], 4);

    }

    if (marker) {
        marker.remove();
    }

    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(cityName)
        .openPopup();

    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

cityInput.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        searchBtn.click();
    }

});

cityInput.addEventListener("focus", function(){
displayHistory(); // Show history dropdown on input focus
    if (searchHistory.length > 0) {
        historyDropdown.style.display = "block";
    }
});

document.addEventListener("click", function(event){ // Hide history dropdown when clicking outside of it
    if(!event.target.closest(".search-row")){
        historyDropdown.style.display = "none";
    }
});
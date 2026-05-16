const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");
const apiKey = "9d189335225cf8bf0cf72bd725197142";
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
const locationBtn = document.getElementById("locationBtn");
const historyDropdown = document.getElementById("historyDropdown");

function formatCityName(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const forecastBox = document.getElementById("forecast");
const weatherOverlay = document.getElementById("weatherOverlay"); 


    function showWeatherIcon(condition) {

    let icon = "🌤️";

    if (condition === "Clear") icon = "☀️";

    else if (condition === "Clouds") icon = "☁️";

    else if (condition === "Rain") icon = "🌧️";

    else if (condition === "Snow") icon = "❄️";

    return `<div class="city-weather-icon">${icon}</div>`;

}

function hideWeatherIcon() {
}

function updateBottomGradient() {
    if (window.scrollY > 0 && document.body.scrollHeight > window.innerHeight) {
        bottomGradient.classList.add("visible");
    } else {
        bottomGradient.classList.remove("visible");
    }
}


locationBtn.addEventListener("click", function(){ // Get weather based on user's geolocation
    function error(){
        result.textContent = "Unable to retrieve your location. Please allow location access and try again.";
        hideWeatherIcon();
    }
    navigator.geolocation.getCurrentPosition(function(position){ // Get user's current position

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
fetch(url) // Fetch weather data based on geolocation
       .then(function(response) {
        return response.json();
       })
       .then(function(data){
       console.log(data);
         const cityName = data.name;
        result.textContent = 
        `${cityName}: ${Math.round(data.main.temp)}°C`+
        `${data.weather[0].main} ` +
        `  Humidity: ${data.main.humidity}%` +
        `  Wind Speed: ${Math.round(data.wind.speed)} m/s` +
        `  Feels like: ${Math.round(data.main.feels_like)}°C`;
        showWeatherIcon(weather);
        
        const weather = data.weather[0].main; // Change background based on weather condition
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
        hideWeatherIcon();
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
    
    if (searchHistory.length === 0) {
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
    clearBtn.textContent = "Очистити історію";
    clearBtn.addEventListener("click", function(){
        searchHistory = [];
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        displayHistory();
    });
    historyDropdown.appendChild(clearBtn);
    
}

searchBtn.addEventListener("click", function(){

    const cityName = cityInput.value.trim();

    if(cityName === ""){
        return;
    }

    const formattedCityName = formatCityName(cityName);

    const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    result.innerHTML = "Loading...";

    fetch(url)

    .then(function(response){
        return response.json();
    })

    .then(function(data){

        if(data.cod == 404){

            result.innerHTML = "City not found";

            return;
        }

        const weather = data.weather[0].main;

        const conditionText =
        weather.charAt(0).toUpperCase() +
        weather.slice(1).toLowerCase();

        result.innerHTML = `

        <div class="city-header">

            ${showWeatherIcon(weather)}

            <strong>${formattedCityName}</strong>

        </div>

        <div class="weather-details">

            <span>
                Temperature:
                <strong>${Math.round(data.main.temp)}°C</strong>
            </span>

            <span>
                Condition:
                <strong>${conditionText}</strong>
            </span>

            <span>
                Humidity:
                <strong>${data.main.humidity}%</strong>
            </span>

            <span>
                Wind Speed:
                <strong>${Math.round(data.wind.speed)} m/s</strong>
            </span>

            <span>
                Feels like:
                <strong>${Math.round(data.main.feels_like)}°C</strong>
            </span>

        </div>
        `;

        cityInput.value = "";

        let imageUrl = "";

        if(weather === "Clear"){
            imageUrl = "url('images/clear.jpg')";
        }

        else if(weather === "Clouds"){
            imageUrl = "url('images/clouds.jpg')";
        }

        else if(weather === "Rain"){
            imageUrl = "url('images/rain.jpg')";
        }

        else if(weather === "Snow"){
            imageUrl = "url('images/snow.jpg')";
        }

        weatherOverlay.style.opacity = "0";

        setTimeout(function(){

            weatherOverlay.style.backgroundImage = imageUrl;

            weatherOverlay.style.opacity = "0.45";

        }, 300);

        saveToHistory(formattedCityName);

        historyDropdown.style.display = "none";

    })

    .catch(function(){

        result.innerHTML = "Error loading weather";

    });





    fetch(forecastUrl)

    .then(function(response){
        return response.json();
    })

    .then(function(data){

        forecastBox.innerHTML = "";

        const forecastMap = {};
        const dayOrder = [];

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

            const date = new Date(item.dt * 1000);

            const dayKey =
            date.toISOString().split("T")[0];

            const hour =
            date.getHours().toString().padStart(2, "0")
            + ":00";

            const iconCode = item.weather[0].icon;

            const temp = Math.round(item.main.temp);

            if(!forecastMap[dayKey]){

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
                        ${item.temp}°C
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

            if(index === 0){

                button.classList.add("active");

                renderDay(dayKey);

            }

        });

    })

    .catch(function(){

        forecastBox.innerHTML = "";

    });
});

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

document.addEventListener("click", function(event){

    if(!event.target.closest(".search-row")){

        historyDropdown.style.display = "none";

    }

});
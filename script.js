const weatherApiKey = "c61999f93dc38fc7c20ae5632d4f41ed";
const geoApiKey = "YOUR_GEODB_API_KEY"; // Replace with your key

const cityInput = document.getElementById("cityInput");
const resultDiv = document.getElementById("result");
const suggestionsList = document.getElementById("suggestions");
const bgVideo = document.getElementById("bgVideo");

function updateBackgroundVideo(condition) {
  const conditionMap = {
    Clear: "clear",
    Rain: "rain",
    Clouds: "clouds",
    Snow: "snow",
    Thunderstorm: "thunderstorm",
    Drizzle: "drizzle",
    Mist:"mist",
    Haze:"haze",
    Smoke:"smoke"
  };

  const videoName = conditionMap[condition] || "default";
  bgVideo.src = `videos/${videoName}.mp4`;
  bgVideo.load();
  bgVideo.play();
}

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric`;

  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    if (data.cod === "404") {
      resultDiv.innerHTML = `<p>City not found.</p>`;
      return;
    }

    updateBackgroundVideo(data.weather[0].main);

    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    resultDiv.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="${iconUrl}" alt="${data.weather[0].description}">
      <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
      <p>🌡 Temp: ${data.main.temp}°C</p>
      <p>💨 Wind: ${data.wind.speed} m/s</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p>Error fetching data.</p>`;
  }
}

async function getCitySuggestions(query) {
  if (query.length < 2) {
    suggestionsList.innerHTML = "";
    return;
  }

  const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=5&sort=-population`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": geoApiKey,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
      }
    });

    const data = await response.json();
    suggestionsList.innerHTML = "";

    data.data.forEach(city => {
      const li = document.createElement("li");
      li.textContent = `${city.city}, ${city.countryCode}`;
      li.onclick = () => {
        cityInput.value = li.textContent;
        suggestionsList.innerHTML = "";
      };
      suggestionsList.appendChild(li);
    });

  } catch (error) {
    console.error("Auto-suggest error:", error);
  }
}

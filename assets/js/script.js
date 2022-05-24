var apiKey = "a615206688fa7fa4d02f98f637bd877b";
var cityHist = [];
var url = "https://api.openweathermap.org/data/2.5/weather";
var date = moment().format("MM/DD/YYYY");
var historyLim;

var init = function () {
  getCity();
  renderHist();
};

var getCity = () => {
  cityHist = JSON.parse(localStorage.getItem("cityHist")) || [];
};

var setCity = () => {
  localStorage.setItem("cityHist", JSON.stringify(cityHist));
};

var renderHist = () => {
  if (cityHist.length < 8) {
    historyLim = cityHist.length;
  } else {
    historyLim = 8;
  }

  $("#city-history-container").html("");
  for (i = 0; i < historyLim; i++) {
    var historyBtn = $("<button>");
    historyBtn.addClass("btn cityHistBtn mt-2 mb-2");
    historyBtn.attr("search", cityHist[i]);
    historyBtn.html(cityHist[i]);
    $("#city-history-container").prepend(historyBtn);
  }
  var renderHistVal = (event) => {
    event.preventDefault();
    var city = $(event.target).attr("search");
    console.log(city);
    cityInput(city);
  };

  $(".cityHistBtn").on("click", renderHistVal);
};

var cityInput = (city) => {
  var cityUrl = `${url}?q=${city}&units=metric&appid=${apiKey}`;

  fetch(cityUrl)
    .then((response) => {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      var imgTag = $("<img>");
      imgTag.attr(
        "src",
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      );
      $(".city-input").text(data.name + ` (${date})`);
      imgTag.appendTo($(".city-input"));
      $("#temperature").text(`Temperature: ${data.main.temp} °C`);
      $("#humidity").text(`Humidity: ${data.main.humidity} %`);
      $("#wind-speed").text(`Wind Speed: ${data.wind.speed} km/h`);

      $("#weather-container").css("border", "1px solid black");
      $("#weather-container").addClass("bg-info");

      uvValue(data.coord.lat, data.coord.lon);
      fiveDay(city);
      $("#five-day-header").text("5-Day Forecast");
    });
};

var uvValue = (lat, lon) => {
  var uvUrl = `https://api.openweathermap.org/data/2.5/uvi/forecast?appid=${apiKey}&lat=${lat}&lon=${lon}&cnt=1`;
  fetch(uvUrl)
    .then((response) => {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      $("#uv-index").text(`UV-Index: ${data[0].value}`);
      if (data[0].value <= 2) {
        $("#uv-index").css("color", "green");
      } else if (data[0].value <= 7) {
        $("#uv-index").css("color", "red");
      } else if (data[0].value <= 10) {
        $("#uv-index").css("color", "purple");
      }
    });
};

var fiveDay = (city) => {
  var fiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  fetch(fiveDayUrl)
    .then((response) => {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      $("#five-day").html("");
      for (var i = 35; i >= 3; i = i - 8) {
        var temp = data.list[i].main.temp;
        console.log(temp);
        var humidity = data.list[i].main.humidity;
        console.log(humidity);
        var windSpeed = data.list[i].wind.speed;
        console.log(windSpeed);
        var dates = data.list[i].dt_txt;
        console.log(dates);

        var cardContainer = $("<div>");
        var fiveDayCard = $("<div>");
        var fiveDayDate = $("<p>").text(dates);
        var fiveDayTemp = $("<p>").text(`Temperature: ${temp} °C`);
        var fiveDayHumidity = $("<p>").text(`Humidity: ${humidity} %`);
        var fiveDayWind = $("<p>").text(`Wind Speed: ${windSpeed} km/h`);
        var fiveDayImg = $("<img>");
        fiveDayImg.attr(
          "src",
          `https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png`
        );
        fiveDayCard.css("border", "1px solid black");
        fiveDayCard.addClass("p-4 mb-4");
        fiveDayCard.appendTo(cardContainer);
        fiveDayDate.appendTo(fiveDayCard);
        fiveDayImg.appendTo(fiveDayCard);
        fiveDayTemp.appendTo(fiveDayCard);
        fiveDayHumidity.appendTo(fiveDayCard);
        fiveDayWind.appendTo(fiveDayCard);
        fiveDayDate.css("font-weight", 900);
        fiveDayCard.css("background-color", "salmon");
        fiveDayDate.css("background-color", "salmon");
        fiveDayTemp.css("background-color", "salmon");
        fiveDayHumidity.css("background-color", "salmon");

        cardContainer.prependTo($("#five-day"));
      }
    });
};

$("#searchBtn").on("click", (event) => {
  event.preventDefault();
  var userInput = $(".form-control");
  var city = userInput.val();
  if (!userInput.val()) {
    return;
  }
  if (!cityHist.includes(city)) {
    cityHist.push(city);
    setCity();
  }
  getCity();
  renderHist();
  cityInput(city);
  userInput.val("");
});

$("#clear-history").on("click", (event) => {
  event.preventDefault();
  localStorage.clear();
  location.reload();
});

init();

// Dependencies
// need search bar form element
// need submit button element
// need 5 day forecast container element so i can append new results to it
// need user input element
// need button elements for newly created button elements for history
// need element for clear history button

// Data States
// need latitude and longitude
// api link https://api.openweathermap.org/data/2.5/weather?lat=%7Blat%7D&lon=%7Blon%7D&appid=%7BAPI key}
// link for cities "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey
// need api key a615206688fa7fa4d02f98f637bd877b

// Functions

// need functions to get all the necessary data from the api
// function to get user input's city weather
// above should get me all of the necessary information from the api
// temp
// humidity
// uv index
// wind speed

// User Interactions
// submit button user interaction
// newly created button from search history button interactions

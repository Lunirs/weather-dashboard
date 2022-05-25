//data states

var apiKey = "a615206688fa7fa4d02f98f637bd877b";

//local storage array
var cityHist = [];
var url = "https://api.openweathermap.org/data/2.5/weather";
var date = moment().format("MM/DD/YYYY");
//limit of how many history items we can render
var historyLim;

//initialization function that runs at the end to get the data from local storage and render our search history
var init = () => {
  getCity();
  renderHist();
};

// function to get data from local storage

var getCity = () => {
  cityHist = JSON.parse(localStorage.getItem("cityHist")) || [];
};

// function to store data into local storage
var setCity = () => {
  localStorage.setItem("cityHist", JSON.stringify(cityHist));
};

// function to render our search input into local storage and also render them as buttons
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

  // event listener for the buttons we created with local storage values
  var renderHistVal = (event) => {
    event.preventDefault();
    var city = $(event.target).attr("search");
    console.log(city);
    cityInput(city);
  };

  $(".cityHistBtn").on("click", renderHistVal);
};

// search a city by changing up query parameters

var cityInput = (city) => {
  var cityUrl = `${url}?q=${city}&units=metric&appid=${apiKey}`;

  // fetches response from api

  fetch(cityUrl)
    .then((response) => {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      // create elements and renders text to current weather
      var imgTag = $("<img>");
      imgTag.attr(
        "src",
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      );
      imgTag.attr("alt", `${data.weather[0].description}`);
      $(".city-input").text(data.name + ` (${date})`);
      imgTag.appendTo($(".city-input"));
      $("#temperature").text(`Temperature: ${data.main.temp} °C`);
      $("#humidity").text(`Humidity: ${data.main.humidity} %`);
      $("#wind-speed").text(`Wind Speed: ${data.wind.speed} km/h`);

      $("#weather-container").css("border", "1px solid black");
      $("#weather-container").addClass("bg-info");

      // runs the function to obtain uv index with the lat and lon coordinates we obtained with the fetched data

      uvValue(data.coord.lat, data.coord.lon);

      // runs the function to render 5 day forecast to the page with the user input

      fiveDay(city);
      $("#five-day-header").text("5-Day Forecast");
    });
};

// function to obtain uv index with the lat and lon coordinates we obtained via the url with city query param
var uvValue = (lat, lon) => {
  var uvUrl = `https://api.openweathermap.org/data/2.5/uvi/forecast?appid=${apiKey}&lat=${lat}&lon=${lon}&cnt=1`;

  //fetches url for UV index with lat and lon coordinates

  fetch(uvUrl)
    .then((response) => {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      // add uv index to the html page. also changes color of uv index text based on severity of uv index.

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

// function to obtain 5 day forecast with user's input

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

      // all data was in 3 hour increments. use -8 to obtain full 24 hour cycles

      for (var i = 35; i >= 3; i = i - 8) {
        var temp = data.list[i].main.temp;
        console.log(temp);
        var humidity = data.list[i].main.humidity;
        console.log(humidity);
        var windSpeed = data.list[i].wind.speed;
        console.log(windSpeed);
        var dates = data.list[i].dt_txt;
        console.log(dates);

        // create elements, add text to created elements and append them in specific order to lay out in page.

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
        fiveDayImg.attr("alt", `${data.list[i].weather[0].description}`);
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

// search button event listener runs get local storage function, render history function, and runs city input function on submit
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
  // clears out input section so user doesnt have to backspace every time they want to search a new city
  userInput.val("");
});

// clears our local storage on click

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

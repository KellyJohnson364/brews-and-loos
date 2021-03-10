let buttonEl = $('.search');
let cityInputEl = $('.input');
let stateInputEl = $('#state');
let resultContainer = $('.results');
let city;
let state;
let breweries=[];
let brewLat;
let brewLong;
let lat 
let long
let index;
let nearBtn;
let history = $('.history');
let historyStored = JSON.parse(localStorage.getItem("history-info")) || [];


// Collect city and state information from form submission
let formSubmitHandler = function (event) {
    event.preventDefault();
    state = $('#state option:selected').text();  
    city = cityInputEl.val();

    // Ensure both fields are selected and call functions
    if (city && (state !== "Select a State" )) {
      city = city.replaceAll(" ", "%20");
      getBreweries()
      getRestrooms();
      //reset for new search    
      cityInputEl.val('')
      stateInputEl.val('')
      $('.result-div').remove();
      breweries=[]
      $(".").remove();
    } else {

      //modal for city and state entry
      $(".selectCityState").addClass("is-active")
      $(".close").click(function() {
         $(".selectCityState").removeClass("is-active");
      });
    }
}

buttonEl.on('click', formSubmitHandler);  

// Fetch lists of safe unisex restrooms using city and "Brew". 
let getRestrooms = function () {
  
  restUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/search?page=&per_page=100&offset=0&unisex=true&query=brew%20'+ city +''
  
    fetch(restUrl).then(answer => answer.json())
      .then(function(answer) {

          for (i=0; i<answer.length; i++) {
              for(let k = 0; k < breweries[0].length; k++) {
                if ((breweries[0][k].street == answer[i].street) || (breweries[0][k].name == answer[i].name)) {
                  
                  let neutral = $('<div class="safe-div"></div>').text("This brewery has a gender-neutral bathroom! 👍");
                  $('#result' + k).children('.safe-div').remove();
                  $('#result' + k).append(neutral)
                  // this removes the button a user can click to show nearest gender-neutral bathroom
                  $('#result' + k).children('.near-button').remove();
                  
                }}    
        }            
    })   
  }             
// fetch breweries by city and then ensure correct state.  

let getBreweries = function () {
 
    let brewUrl = 'https://api.openbrewerydb.org/breweries/search?query=' + city +''

      fetch(brewUrl)
        .then(response => response.json())
        .then(function(response) {
          // in cases where there's no response
          if (response.length == 0) {
            $(".noResponse").addClass("is-active")
            $(".close").click(function() {
              $(".noResponse").removeClass("is-active");
              location.reload();
            });
          }
          console.log(response);
          
          breweries.push(response)  
          // console.log(breweries)
          for (let i=0; i<response.length; i++) {
            if(response[i].state == state) {
              city = city.replaceAll("%20", " ")  
              //Dynamically create divs for Brewery information
              

              let resultDiv = $('<div class="result-div p-5 ml-6 card" id="result' + i + '"></div>');
              let brewName = $('<div class="brewName title">').text(response[i].name);
              let saveBtn = $('<button class="save-button is-pulled-right button">Save this brewery</button>');
              let brewStreet = $('<div class="brewStreet pt-2">').text(response[i].street)
              let brewAdd =$('<div class="brewAdd pb-2 is-capitalized">').text(city + ', ' + state);
              let brewWeb = $('<a class="brewLink" href='+ response[i].website_url +'>').text(response[i].website_url);
              nearBtn = $('<button class="near-button mt-3 button  has-text-centered card-footer-item">Find nearest gender-neutral bathroom!</button>');
              lat = $('<span class="lt">'+ response[i].latitude +'</span>')
              long = $('<span class="lng">'+ response[i].longitude +'</span>')
              resultContainer.append(resultDiv);
              resultDiv.append(brewName, saveBtn,brewStreet, brewWeb, nearBtn, saveBtn);
              nearBtn.append(lat, long)
              $('.lt, .lng').hide();
              console.log(response)
              
              if((response[i].latitude) == null) {
                let brewTel = $('<span class="breTel">').text('Call for additional information: ' + response[i].phone + '  ')
                nearBtn.replaceWith(brewTel)

              }
            }
            }    
        })  
       .then(renderHistory)
      }

// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
    let classCounter = 0

// event handler for fetching nearest gender-neutral bathroom
  resultContainer.on("click", ".near-button", function() {
    brewLat =  $(this).children().first().text();
    brewLong =  $(this).children().last().text();
  
    console.log(brewLat)
// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
    classCounter++
    $(this).addClass("btn" + classCounter)
// calls function for fetching nearest gender-neutral bathroom info
    nearestRestroom();
 
});

// event handler for fetching nearest gender-neutral bathrom when user clicks from history 
  history.on("click", ".near-button", function() {
    brewLat =  $(this).children().first().text();
    brewLong =  $(this).children().last().text();
    console.log(brewLong)
    classCounter++
    $(this).addClass("btn" + classCounter)

    nearestRestroom();
})

// function for fetching nearest gender-neutral bathroom info 
function nearestRestroom() {

  if (breweries[0]) {
    // if finding nearest restroom from search result, do this
  console.log(brewLat)
  
  nearUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/by_location?page=1&per_page=1&offset=0&unisex=true&lat=' + brewLat +'&lng=' + brewLong + ''
      
   fetch(nearUrl) 
       .then(stuff => stuff.json())
       .then(function(stuff) {
         console.log(stuff)

          if (stuff[0] !== undefined) {
            let nearestTitle = $('<div class="nearestTitle mt-6 card-footer"></div>').text('Nearest Gender-Neutral Bathroom:');
            let nearestName = $('<div class="nearestName mb-1 card-footer-item  subtitle"></div>').text(''+ stuff[0].name +'');
            let nearestStreet = $('<div class="nearestStreet mx-1 p-1 card-footer-item"></div>').text(''+ stuff[0].street +'');
            let nearestAddress  =$('<div class="nearestAddress mx-1 p-1 card-footer-item  is-capitalized"></div>').text(city + ', ' + state)
            console.log( $("#result" + index))
            $(".btn" + classCounter).after(nearestTitle, nearestName, nearestStreet, nearestAddress);
            $(".btn" + classCounter).remove();
          }else {
            let apology = $('<div></div>').text('No unisex restrooms found in search area')
            nearBtn.replaceWith(apology)
          }

        })
  }
};

// delegated event handler for saving brewery/bathroom info 
resultContainer.on("click", ".save-button", function() {
 
  let thisBrew = $(this).parent().html();
  console.log(thisBrew)
  console.log(historyStored)
  if (historyStored.includes(thisBrew)) {

  } else if (thisBrew == undefined || thisBrew == null) {

  } else {
      localStorage.setItem("breweries", JSON.stringify(breweries));
      console.log(historyStored)
      historyStored.push(thisBrew);
      localStorage.setItem("history-info", JSON.stringify(historyStored));
      history.append('<div class="result-div">' + thisBrew + '</div>');
      history.children($('#result-div')).children(".save-button").remove();
  };

});

// renders user's recent searches to .history
function renderHistory() {
  for (let i=0; i<historyStored.length; i++) {
    history.append('<div class="result-div">' + historyStored[i] + '</div>');
    let historyChildren = $('.history .result-div .save-button');
    historyChildren.remove();
  };
};
renderHistory();

// event handler for deleting history
history.on("click", ".delete-btn", function() {
  historyStored = [];
  localStorage.setItem("history-info", JSON.stringify([]));
  localStorage.setItem("breweries", JSON.stringify([]));
  history.children(".result-div").remove();
})
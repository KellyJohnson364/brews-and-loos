let buttonEl = $('.button')
let cityInputEl = $('.input')
let stateInputEl = $('#state')
let resultContainer = $('main')
let city
let state
let breweries=[]


// Collect city and state information from form submission

let formSubmitHandler = function (event) {
    event.preventDefault();
    state = $('#state option:selected').text()
    // console.log(state)
    city = cityInputEl.val();

// Ensure both fields are selected and call functions

    if (city && state) {
      city = city.replaceAll(" ", "%20");
      getRestrooms();
      getBreweries()
    } else {
      //! we can't use alerts, so this should be a modal
      alert('Please enter a city and select a State');
    }

    // removes all .result-divs (if any exist)
    if ($('<main>').children() == null) {

    } else {
      $('.result-div').remove();
    }
}

buttonEl.on('click', formSubmitHandler);  

// Fetch lists of safe unisex restrooms using State name and "Brew". 
let getRestrooms = function () {
     restUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/search?page=1&per_page=50&offset=0&query=brew%20' + state + ''
       
// compare arrays for breweries and restrooms to find overlap     
    fetch(restUrl) 
        .then(answer => answer.json())
        .then(function(answer) {
            // console.log(breweries[0])
          for (i=0; i<answer.length; i++) {
              for(let k = 0; k < breweries[0].length; k++) {
                if (breweries[0][k].street == answer[i].street) {
                  let neutral = $('<span class="safe-span"></span>').text("This brewery has a gender-neutral bathroom! 👍");
                  $('#result' + k).append(neutral)
                  // this removes the button a user can click to show nearest gender-neutral bathroom
                  $('#result' + k).children('.near-button').remove();
                }
              }         
          }    
        })            
}            
// fetch breweries by city and then ensure correct state.  

let getBreweries = function () {
    let brewUrl = 'https://api.openbrewerydb.org/breweries/search?query=' + city +''

    fetch(brewUrl)
        .then(response => response.json())
        .then(function(response) {
             
          breweries.push(response)  
          // console.log(breweries)
          for (let i=0; i<response.length; i++) {
            if(response[i].state == state) {

              //Dynamically create divs for Brewery information
              // console.log(response[i])
              let resultDiv = $('<div class="result-div" id="result' + i + '"></div>');
              let brewName = $('<div class="brewName">').text(response[i].name);
              let brewStreet = $('<div>').text(response[i].street);
              let brewWeb = $('<a href='+ response[i].website_url +'>').text(response[i].website_url);
              let nearBtn = $('<button class="near-button">Find nearest gender-neutral bathroom!</button>');
              resultContainer.append(resultDiv);
              resultDiv.append(brewName, brewStreet, brewWeb, nearBtn);
            }
            }    
        })       
}

// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
let classCounter = 0

// event handler for fetching nearest gender-neutral bathroom
resultContainer.on("click", ".near-button", function(){
  console.log($(this).siblings('.brewName')[0].innerHTML);

  // this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
  classCounter++
  $(this).addClass("btn" + classCounter)

  // calls function for fetching nearest gender-neutral bathroom info
  nearestRestroom();
});

// function for fetching nearest gender-neutral bathroom info 
function nearestRestroom() {
  // fetch()
  //   .then(answer => answer.json())
  //   .then(function(answer) {


  //     let nearestTitle = $('<div class="nearestTitle"></div>').text('Nearest Gender-Neutral Bathroom:');
  //     let nearestName = $('<div class="nearestName"></div>').text(answer[0].name);
  //     let nearestStreet = $('<div class="nearestStreet"></div>').text(answer[0].street);
  //     $(".btn" + classCounter).after(nearestTitle, nearestName, nearestStreet);
  //     // removes button so 
  //     $(".btn" + classCounter).remove();
  //   })

  // test
  let nearestTitle = $('<div class="nearestTitle"></div>').text('Nearest Gender-Neutral Bathroom:');
  let nearestName = $('<div class="nearestName"></div>').text('Blah blah!');
  let nearestStreet = $('<div class="nearestStreet"></div>').text('Big ol blahhhh!!!!');
  $(".btn" + classCounter).after(nearestTitle, nearestName, nearestStreet);
  $(".btn" + classCounter).remove();
}
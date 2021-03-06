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
    console.log(state)
    city = cityInputEl.val();

// Ensure both fields are selected and call functions

    if (city && state) {
      city = city.replaceAll(" ", "%20");
      getRestrooms();
      getBreweries()
    } else {
      alert('Please enter a city and select a State');
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
            console.log(breweries[0])
          for (i=0; i<answer.length; i++) {
              for(let k = 0; k < breweries[0].length; k++) {
                if (breweries[0][k].street == answer[i].street) {
                   let safe= $('<span>').text("Safe");
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
          console.log(breweries)
          for (let i=0; i<response.length; i++) {
            if(response[i].state == state) {

//Dynamically create divs for Brewery information
              console.log(response[i])
              let resultDiv = $('<div class=\"result-div\" id=\"result' + i + '\"></div>')
              let brewName = $('<div>').text(response[i].name)
              let brewStreet = $('<div>').text(response[i].street)
              let brewWeb = $('<a href='+ response[i].website_url +'>').text(response[i].website_url)
              resultContainer.append(resultDiv)
              resultDiv.append(brewName, brewStreet, brewWeb)
            }
            }    
        })       
}


    

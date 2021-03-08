let buttonEl = $('.button')
let cityInputEl = $('.input')
let stateInputEl = $('#state')
let resultContainer = $('.results')
let storageContainer = $('.fav-div')
let city
let state
let breweries=[]
let index
let nearBtn



// Collect city and state information from form submission

let formSubmitHandler = function (event) {
    event.preventDefault();
    state = $('#state option:selected').text();  
    city = cityInputEl.val();

// Ensure both fields are selected and call functions

    if (city && state) {
      city = city.replaceAll(" ", "%20");
      getBreweries()
      getRestrooms();
  //reset for new search    
      cityInputEl.val('')
      stateInputEl.val('')
      $('.result-div').remove();
      breweries=[]
    } else {
     
      $(".modal").addClass("is-active")
      $(".close").click(function() {
         $(".modal").removeClass("is-active");
      });
    }

}

buttonEl.on('click', formSubmitHandler);  

// Fetch lists of safe unisex restrooms using State name and "Brew". 
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
             
          breweries.push(response)  
          // console.log(breweries)
          for (let i=0; i<response.length; i++) {
            if(response[i].state == state) {
              
              //Dynamically create divs for Brewery information
              
              let resultDiv = $('<div class="result-div" id="result' + i + '"></div>');
              let brewName = $('<div class="brewName">').text(response[i].name);
              let brewStreet = $('<div>').text(response[i].street);
              let brewWeb = $('<a href='+ response[i].website_url +'>').text(response[i].website_url);
              let br = $('<br>')
              nearBtn = $('<button id="' + i + '" class="near-button button is-small">Find nearest gender-neutral bathroom!</button>');
              resultContainer.append(resultDiv);
              resultDiv.append(brewName,brewStreet, brewWeb, br, nearBtn);
              if((response[i].latitude) == null) {
                nearBtn.remove()
              }
            }
            }    
        })  
       
      }

// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
let classCounter = 0

// event handler for fetching nearest gender-neutral bathroom
resultContainer.on("click", ".near-button", function() {
    index =($(this).attr('id'))
  // this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
    classCounter++
    $(this).addClass("btn" + classCounter)
 
  // calls function for fetching nearest gender-neutral bathroom info
    nearestRestroom();
 
});

// function for fetching nearest gender-neutral bathroom info 
function nearestRestroom() {
  console.log(breweries[0][index])
  brewLat = breweries[0][index].latitude
  brewLong = breweries[0][index].longitude

  nearUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/by_location?page=1&per_page=1&offset=0&unisex=true&lat=' + brewLat +'&lng=' + brewLong + ''
      
   fetch(nearUrl) 
       .then(stuff => stuff.json())
       .then(function(stuff) {
         console.log(stuff)
       
  let nearestTitle = $('<div class="nearestTitle"></div>').text('Nearest Gender-Neutral Bathroom:');
  let nearestName = $('<div class="nearestName"></div>').text(''+ stuff[0].name +'');
  let nearestStreet = $('<div class="nearestStreet"></div>').text(''+ stuff[0].street +'');
  $(".btn" + classCounter).after(nearestTitle, nearestName, nearestStreet);
  $(".btn" + classCounter).remove();
})
}

 

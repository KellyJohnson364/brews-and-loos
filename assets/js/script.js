
let cityInputEl = $('.input');
let resultContainer = $('.results');
let container =$('.resultsAndHistory')
let cityEl = $('.oldCities')
let city;
let input;
let state;
let states=[]
let cityState=[];
let selectedState
let empty=[];
let allBrew
let brewLat;
let brewLong;
let uniqueCities=[];
let uniqueStates=[];
let brewName;
let lat; 
let long;
let lessBtn;
let moreBtn;
let nearBtn;
let headDiv
let history = $('.history');
let historyStored = JSON.parse(localStorage.getItem("history-info")) || [];


function renderCities() {
  cityEl.children().remove()
  let remember = JSON.parse(localStorage.getItem("cities"))
  console.log(remember)
  if (remember && !input) {
    uniqueCities = remember
  }else if (remember && input) {
    remember.unshift(input)
    list = remember.toString().split(",");
    uniqueCities = [...new Set(list)];
  }else {
    uniqueCities.unshift(input)
    console.log(uniqueCities)
  }
   if (uniqueCities[0] !== undefined) {
     console.log(uniqueCities)
     localStorage.setItem("cities", JSON.stringify(uniqueCities));
     $('<option value="">Select</option>').appendTo(cityEl);
     for (let i=0; i < uniqueCities.length; i++) {
      $('<option value ='+ uniqueCities[i] +' id=' + i + '>'+ uniqueCities[i] +'</option>').appendTo(cityEl);
     }
    }
}    
 renderCities();

// renders user's recent searches to .history

function renderHistory() {
  for (let i=0; i<historyStored.length; i++) {
   
    history.append('<div class="result-div ml-3">' + historyStored[i] + '</div>');
    history.children($('.result-div')).children($('.foot-div')).children(".save-button").remove();
    ($('.card-header')).siblings().css('display', 'none')
    moreBtn = $('<button class="card-header-icon moreBtn" aria-label="more options"><span class="icon"><i class="fa fa-chevron-down icon" aria-hidden="true"></i></span></button>')
    $('.lessBtn').replaceWith(moreBtn)
    $('.history .lessDiv').addClass('moreDiv')
    $('.history .lessDiv').toggleClass('lessDiv')

  };
};
renderHistory();
 
// Collect city and state information from form submission

function formSubmitHandler() {
 
    if (city) {
      city = city.replaceAll(" ", "%20");
      
      getBreweries()
      getRestrooms();
      //reset for new search    
      cityInputEl.val('')
      $('.result-div').remove();
      empty=[]
      $(".description").remove();
      $("#figure").height(400)
      
    } else {
 //modal for city and state entry
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2000,
        })
        Toast.fire({
          icon: 'error',
          title: 'Please enter a city or a brewery name!'
        })

    }
    
}

$('.oldCities').change(function() {
  city = $('.oldCities option:selected').text(); 
  formSubmitHandler()
})

document.querySelector("#searchButton").addEventListener("click", searchButton);

function searchButton() {
  city = cityInputEl.val().toUpperCase()
  input = city
  formSubmitHandler()
}


// Fetch lists of safe unisex restrooms using city and "Brew". 
function getRestrooms() {
  
  restUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/search?page=&per_page=100&offset=0&unisex=true&query=brew%20'+ city +''
  
    fetch(restUrl).then(answer => answer.json())
      .then(function(answer) {

          for (i=0; i<answer.length; i++) {
              for(let k = 0; k < allBrew.length; k++) {
                if ((allBrew[k].street == answer[i].street) || (allBrew[k].name == answer[i].name)) {
                  
                  let neutral = $('<div class=" mt-4 safe-div"></div>').text("This brewery has a gender-neutral restroom!");
                  $('#result' + k).children('.safe-div').remove();
                  $('#result' + k).append(neutral)
                  $('#name' + k).addClass('logo')
                  // this removes the button a user can click to show nearest gender-neutral bathroom
                  $('#result' + k).children('.nearBtn').remove();                  
                }}    
        }            
    })   
  }             
// fetch breweries by city and then ensure correct state.  

function getBreweries() {
    let brewUrl = 'https://api.openbrewerydb.org/breweries/search?query=' + city +''
  
      fetch(brewUrl)
        .then(response => response.json())
        .then(function(response) {
          // in cases where there's no response
          if (response.length == 0) {
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 2000,
            })
            Toast.fire({
              icon: 'error',
              title: 'Oops! No results found.  Please check your spelling and try again!'
            }).then(() => {
              location.reload();
            })
          }else {
           
            renderCities()

            allBrew = response.concat(empty)
     
            for (let i=0; i<response.length; i++) {
             states.push(response[i].state)
             } 
    
              list = states.toString().split(",");
              uniqueStates= [...new Set(list)];
                if (uniqueStates.length > 1) {
                  for (let i=0; i<uniqueStates.length; i++) {
                    cityState.push(uniqueStates[i])
                  }
                  Swal.fire({
                    position: 'center',
                    confirmButtonColor: 'rgb(126, 163, 145)',
                    title: 'Select state',
                    input: 'select',
                    inputOptions: {
                    'State': cityState
                    },
                    showCancelButton: true,
                  }).then(response => {
                      selectedState = cityState[response.value]
                      displayBreweries();
                      states = []
                      cityState = []
                      console.log(uniqueStates)
                  })    
                }else {
                  states = [];
                  selectedState = uniqueStates;
                  displayBreweries();
                }
          } 
        }) 
}
        function displayBreweries() {       
          $('#searched').css('display', '')
          location.href = '#searched'
         //  console.log(allBrew)
         //   console.log(selectedState)


          for (let i=0; i<allBrew.length; i++) {

           
            if(allBrew[i].state == selectedState) {
              city = city.replaceAll("%20", " ")  
              //Dynamically create divs for Brewery information
              

              let resultDiv = $('<div class="result-div ml-3"></div>');
                  headDiv = $('<header id="'+i+'"class="card-header moreDiv"></header>')
              let contentDiv = $('<div style="display: none" id="result' + i + '" class="content content'+i+'"></div)')
              let footDiv = $('<footer style="display: none" class="card-footer foot-div"></footer>')
                  moreBtn = $('<button class="card-header-icon moreBtn" aria-label="more options"><span class="icon"><i class="fa fa-chevron-down icon" aria-hidden="true"></i></span></button>')
                  brewName = $('<b id= "name'+i+'" class="card-header-title brewName">'+ allBrew[i].name + '</b>')  
              let saveBtn = $('<button style="width:20%" class="save-button button  '+ allBrew[i].name +'">Save</button>');
              let brewStreet = $('<div "class="brewStreet">').text(allBrew[i].street)
              let brewAdd =$('<div class="brewAdd  pb-2 is-capitalized">').text(city + ', ' + selectedState);
              let brewWeb = $('<a target="_blank"  class="brewWeb " href='+ allBrew[i].website_url +'>Click to visit website</a><br>');
                  nearBtn = $('<button  class="mt-3 button has-text-centered nearBtn">find nearest neutral restroom!</button><br>');
                  lat = $('<span class="lt">'+ allBrew[i].latitude +'</span>')
                  long = $('<span class="lng">'+ allBrew[i].longitude +'</span>')
              resultContainer.append(resultDiv);
              resultDiv.append(headDiv, contentDiv, footDiv)
              headDiv.append(brewName, moreBtn)
              footDiv.append(saveBtn)
              if (allBrew[i].website_url == "") {
                contentDiv.append(brewStreet, brewAdd, nearBtn)
              } else {
                contentDiv.append(brewStreet, brewAdd, brewWeb, nearBtn,)
              };

              nearBtn.append(lat, long)
              $('.lt, .lng').hide();
              // console.log(response)
              
              if((allBrew[i].latitude) == null) {
                
                let brewTel = $('<div style="display: none" class="brewTel">').text('For additional information, call: ' + allBrew[i].phone)
                if (allBrew[i].phone) {
                 
                nearBtn.replaceWith(brewTel)
                } else {
                  nearBtn.remove()
                }
              }
             }
            }    
          renderHistory();
      }

container.on("click", '.moreDiv', function() {
  $(this).addClass('lessDiv')
  $(this).toggleClass('moreDiv')
  $(this).siblings().css('display', '')
  lessBtn = $('<button class="card-header-icon lessBtn" aria-label="more options"><span class="icon"><i class="fa fa-chevron-up icon" aria-hidden="true"></i></span></button>')
  $(this).children().last().replaceWith(lessBtn)
 
})
 
container.on("click", ".lessDiv", function() { 
  $(this).addClass('moreDiv')
  $(this).toggleClass('lessDiv')
  $(this).siblings().css('display', 'none')
  moreBtn = $('<button class="card-header-icon moreBtn" aria-label="more options"><span class="icon"><i class="fa fa-chevron-down icon" aria-hidden="true"></i></span></button>')
  $(this).children().last().replaceWith(moreBtn)
})

// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
    let classCounter = 0

// event handler for fetching nearest gender-neutral bathroom
container.on("click", ".nearBtn", function() {
  brewLat =  $(this).children().first().text();
  brewLong =  $(this).children().last().text();
 
// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
    classCounter++
    $(this).addClass("btn" + classCounter)
// calls function for fetching nearest gender-neutral bathroom info
    nearestRestroom();
 
});

// function for fetching nearest gender-neutral bathroom info 
function nearestRestroom() {
  nearUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/by_location?page=1&per_page=1&offset=0&unisex=true&lat=' + brewLat +'&lng=' + brewLong + ''
      
   fetch(nearUrl) 
       .then(stuff => stuff.json())
       .then(function(stuff) {
         //console.log(stuff)

          if (stuff[0] !== undefined) {
            let nearestTitle = $('<div class="mt-6  nearestTitle"></div>').text('Nearest Gender-Neutral Restroom:');
            let nearestName = $('<div class="mb-1 nearestName"></div>').text(stuff[0].name);
            let nearestStreet = $('<div class="nearestStreet   nearestStreet"></div>').text(stuff[0].street);
            let nearestAddress  =$('<div class="is-capitalized nearestAddress"></div>').text(stuff[0].city + ', '+ stuff[0].state)
            // console.log( $("#result))

            $(".btn" + classCounter).after(nearestTitle, nearestName, nearestStreet, nearestAddress);
            $(".btn" + classCounter).remove();
          } else {
            let apology = $('<div></div>').text('No unisex restrooms found in search area')
            $('.btn' + classCounter).replaceWith(apology);
          }

        })
};
// delegated event handler for saving brewery/bathroom info 
resultContainer.on("click", ".save-button", function() {
  $(this).text("Saved")
 
  let thisBrew = $(this).parent().parent().html();

  if (historyStored.includes(thisBrew)) {

  } else if (thisBrew == undefined || thisBrew == null) {

  } else {
     
      historyStored.push(thisBrew);
      localStorage.setItem("history-info", JSON.stringify(historyStored));
      history.append('<div class="result-div ml-3">' + thisBrew + '</div>');
      history.children($('.result-div')).children($('.foot-div')).children(".save-button").remove();
      ($('.history .card-header')).siblings().css('display', 'none')
      moreBtn = $('<button class="card-header-icon moreBtn" aria-label="more options"><span class="icon"><i class="fa fa-chevron-down icon" aria-hidden="true"></i></span></button>')
      $('.history .lessBtn').replaceWith(moreBtn)
      $('.history .lessDiv').addClass('moreDiv')
      $('.history .lessDiv').toggleClass('lessDiv')
 
  };

});





// event handler for deleting history
$(".resultsAndHistory").on("click", ".delete-btn", function() {
  localStorage.removeItem('history-info');
  history.children(".result-div").remove();
  $(".save-button").text("Save It");
  renderHistory=[]
})

$('nav').on("click", "a", function() {
 
  $('.navbar-burger').toggleClass('is-active');
  $('.butts').toggleClass('is-active');
})

$('nav').on("click", ".navbar-link", function() {
  $('.oldTowns').children().remove()
  $('<a  class="navbar-item town" value ="Grand Rapids">Grand Rapids</a>').appendTo($('.oldTowns'))

    for (let i=0; i < uniqueCities.length; i++) {
      if (uniqueCities[i]) {
    $('<a  class="navbar-item town" value ='+ uniqueCities[i] +' id=' + i + '>'+ uniqueCities[i] +'</a>').appendTo($('.oldTowns'))
}
      $('.navbar-dropdown').toggleClass('is-hidden-touch');
    } 
})

$('.oldTowns').on("click", ".town", function() {
  $('.navbar-dropdown').toggleClass('is-hidden-touch');
  city = $(this).text(); 
 
  formSubmitHandler()
})
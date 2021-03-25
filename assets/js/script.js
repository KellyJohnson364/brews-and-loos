let searchEl = $('.search');
let cityInputEl = $('.input');
let stateInputEl = $('#state');
let resultContainer = $('.results');
let cityEl = $('#oldCities')
let city;
let cities=[];
let state;
let states=[]
let selectedState
let empty=[];
let allBrew
let brewLat;
let brewLong;
let unique
let brewName
let lat; 
let long;
let index;
let lessBtn;
let moreBtn;
let nearBtn;
let history = $('.history');
let historyStored = JSON.parse(localStorage.getItem("history-info")) || [];


let renderCities = function () {
  cityEl.children().remove()
  
  let remember = JSON.parse(localStorage.getItem("cities"))
 console.log(remember)
   if (remember) {
     $('<option value="">Select City</option>').appendTo(cityEl);
     cities.unshift(remember)
     list = cities.toString().split(",");
     unique = [...new Set(list)];
   for (let i=0; i < unique.length; i++) {
     $('<option value ='+ unique[i] +' id=' + i + '>'+ unique[i] +'</option>').appendTo(cityEl);
 }}else {
   $('#oldCities').hide()
   unique=cities
  
 }
 }

 renderCities();

 
// Collect city and state information from form submission

let formSubmitHandler = function () {
 
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
      $(".selectCityState").addClass("is-active")
      $(".close").click(function() {
         $(".selectCityState").removeClass("is-active");
      });
    }
}

$('#oldCities').change(function() {
  city = $('#oldCities option:selected').text(); 
  formSubmitHandler()
})

$(".searchBtn").click(function() {
  city = cityInputEl.val();
 console.log(cities)
  if (unique.includes(city)) {
  }else {
    console.log(cities)
    cities.unshift(city)
    console.log(cities)
    localStorage.setItem("cities", JSON.stringify(cities));
    renderCities
  }

  formSubmitHandler()
})

let stateModal = function() {
 // console.log("modal")
  $(".stateSelect").addClass("is-active")
 $('#stateModal').change(function() {
  selectedState = $('#stateModal option:selected').text(); 
 // console.log(selectedState)
  displayBreweries()
  $('#stateModal').children().remove()
  $(".stateSelect").removeClass("is-active") 

  })

}

// Fetch lists of safe unisex restrooms using city and "Brew". 
let getRestrooms = function () {
  
  restUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/search?page=&per_page=100&offset=0&unisex=true&query=brew%20'+ city +''
  
    fetch(restUrl).then(answer => answer.json())
      .then(function(answer) {

          for (i=0; i<answer.length; i++) {
              for(let k = 0; k < allBrew.length; k++) {
                if ((allBrew[k].street == answer[i].street) || (allBrew[k].name == answer[i].name)) {
                  
                  let neutral = $('<div class=" mt-4 safe-div"></div>').text("This brewery has a gender-neutral restroom! 👍");
                  $('#result' + k).children('.safe-div').remove();
                  $('#result' + k).append(neutral)
                  // this removes the button a user can click to show nearest gender-neutral bathroom
                  $('#result' + k).children('.nearBtn').remove();                  
                }}    
        }            
    })   
  }             
// fetch breweries by city and then ensure correct state.  

let getBreweries = function () {
 
    let brewUrl = 'https://api.openbrewerydb.org/breweries/search?query=' + city +''
   //   console.log(city)
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
          }else {

          for (let i=0; i<response.length; i++) {
           states.push(response[i].state)
        } 
          list = states.toString().split(",");
          unique = [...new Set(list)];
        if (unique.length > 1) {
         let noOpt = $('<option value="">Select a State</option>')
          $('#stateModal').append(noOpt)
          for (let i=0; i<unique.length; i++) {
          let stateOpt= $('<option value='+unique[i]+'>'+ unique[i]+'</option>')
            $('#stateModal').append(stateOpt)
            
          }
          allBrew = response.concat(empty)
        //   console.log(allBrew)
           stateModal()
        //   console.log(selectedState)
        }else {
           allBrew = response.concat(empty)
           selectedState=unique
          displayBreweries();
        }
      } 
    }) 
  }
        let displayBreweries = function () {       
          
         //  console.log(allBrew)
         //   console.log(selectedState)


          for (let i=0; i<allBrew.length; i++) {

           
            if(allBrew[i].state == selectedState) {
              city = city.replaceAll("%20", " ")  
              //Dynamically create divs for Brewery information
              

              let resultDiv = $('<div class=" result-div" ></div>');
                moreBtn = $('<button style="width:100%" class="icon-button moreBtn "><i class="fa fa-chevron-down is-pulled-right" style="font-size:14px"></i></button>')
                brewName = $('<span id="result' + i + '"  class="brewName mr-6 title">'+ allBrew[i].name + '</span>')   
              let saveBtn = $('<button style="width:20%" class="save-button">Save It</button>');
              let brewStreet = $('<div style=" display: none "class="brewStreet pt-2">').text(allBrew[i].street)
              let brewAdd =$('<div style=" display: none" class="brewAdd pb-2 is-capitalized">').text(city + ', ' + selectedState);
              let brewWeb = $('<a target="_blank" style="display: none" class="brewWeb" href='+ allBrew[i].website_url +'>Click to visit website</a><br>');
                  nearBtn = $('<button style="display: none" class="mt-3 has-text-centered nearBtn">Find nearest gender-neutral restroom!</button><br>');
              lat = $('<span class="lt">'+ allBrew[i].latitude +'</span>')
              long = $('<span class="lng">'+ allBrew[i].longitude +'</span>')
              resultContainer.append(resultDiv);

              if (allBrew[i].website_url == "") {
                resultDiv.append(moreBtn, brewName,  saveBtn);
                brewName.append(brewStreet, brewAdd, nearBtn)
              } else {
                resultDiv.append(moreBtn, brewName,  saveBtn);
                brewName.append(brewStreet, brewAdd, brewWeb, nearBtn,)
              };

              // fixes issue with save button styling on mobile viewports
              let mobileSize = window.matchMedia('(max-width: 500px)');
              if (mobileSize.matches) {
                $('.save-button').removeClass('is-pulled-right')
              }

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
      }


resultContainer.on("click", ".moreBtn", function() {
  
  $(this).siblings(brewName).children().css('display', '')
  lessBtn = $('<button style="width:98%" class="icon-button lessBtn"><i class="fa fa-chevron-up is-pulled-right" style="font-size:16px"></i></button>')
  $(this).replaceWith(lessBtn)
})

resultContainer.on("click", ".lessBtn", function() {
   
  $(this).siblings(brewName).children().css('display', 'none')
  moreBtn = $('<button style="width:98%" class="icon-button moreBtn"><i class="fa fa-chevron-down is-pulled-right" style="font-size:16px"></i></button>')
  $(this).replaceWith(moreBtn)
})

history.on("click", ".moreBtn", function() {
  
  $(this).siblings(brewName).children().css('display', '')
  lessBtn = $('<button style="width:98%" class="icon-button lessBtn"><i class="fa fa-chevron-up is-pulled-right" style="font-size:16px"></i></button>')
  $(this).replaceWith(lessBtn)
})
 
history.on("click", ".lessBtn", function() { 
  $(this).siblings(brewName).children().css('display', 'none')
  moreBtn = $('<button style="width:98%" class="icon-button moreBtn"><i class="fa fa-chevron-down is-pulled-right" style="font-size:16px"></i></button>')
  $(this).replaceWith(moreBtn)
})

// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
    let classCounter = 0

// event handler for fetching nearest gender-neutral bathroom
resultContainer.on("click", ".nearBtn", function() {
  brewLat =  $(this).children().first().text();
  brewLong =  $(this).children().last().text();
 
// this will be used to line up the rendering in nearestRestroom() with the button that was clicked 
    classCounter++
    $(this).addClass("btn" + classCounter)
// calls function for fetching nearest gender-neutral bathroom info
    nearestRestroom();
 
});

// event handler for fetching nearest gender-neutral bathrom when user clicks from history 
  history.on("click", ".nearBtn", function() {
    brewLat =  $(this).children().first().text();
    brewLong =  $(this).children().last().text();
    // console.log(brewLong)
    classCounter++
    $(this).addClass("btn" + classCounter)
    nearestRestroom();
})

// function for fetching nearest gender-neutral bathroom info 
function nearestRestroom() {
  nearUrl = 'https://www.refugerestrooms.org/api/v1/restrooms/by_location?page=1&per_page=1&offset=0&unisex=true&lat=' + brewLat +'&lng=' + brewLong + ''
      
   fetch(nearUrl) 
       .then(stuff => stuff.json())
       .then(function(stuff) {
         //console.log(stuff)

          if (stuff[0] !== undefined) {
            let nearestTitle = $('<div class="mt-6  nearestTitle"></div>').text('Nearest Gender-Neutral Restroom:');
            let nearestName = $('<div class="mb-1   subtitle nearestName"></div>').text(stuff[0].name);
            let nearestStreet = $('<div class="nearestStreet mx-1 p-1  nearestStreet"></div>').text(stuff[0].street);
            let nearestAddress  =$('<div class="mx-1 p-1   is-capitalized nearestAddress"></div>').text(stuff[0].city + ', '+ stuff[0].state)
            // console.log( $("#result" + index))

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
  $(this).text("Saved ✅")
  let thisBrew = $(this).parent().html();
  // console.log(thisBrew)
  // console.log(historyStored)
  if (historyStored.includes(thisBrew)) {

  } else if (thisBrew == undefined || thisBrew == null) {

  } else {
     
      // console.log(historyStored)
      historyStored.push(thisBrew);
      localStorage.setItem("history-info", JSON.stringify(historyStored));
      history.append('<div class="result-div p-3 mr-6 card">' + thisBrew + '</div>');
      history.children($('#result-div')).children(".save-button").remove();
  };

});



// renders user's recent searches to .history
function renderHistory() {
  for (let i=0; i<historyStored.length; i++) {
    history.append('<div class="result-div  mr-6">' + historyStored[i] + '</div>');
    let historyChildren = $('.history .result-div .save-button');
    historyChildren.remove();

  };
};
renderHistory();

// event handler for deleting history
$(".resultsAndHistory").on("click", ".delete-btn", function() {
  localStorage.removeItem('history-info');
  history.children(".result-div").remove();
  $(".save-button").text("Save It");
  renderHistory=[]
})

// media queries 
let mobileSize = window.matchMedia('(max-width: 500px)');
if (mobileSize.matches) {
  
}

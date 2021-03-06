let brewUrl = "https://api.openbrewerydb.org/breweries/search?query=kalamazoo"

fetch(brewUrl)
    .then(response => response.json())
    .then(function(response) {
        console.log(response)
        for (let i=0; i<response.length; i++) {
            let stuff = response[i].street
            stuff = stuff.replaceAll(" ", "%20");
            let restUrl = "https://www.refugerestrooms.org/api/v1/restrooms/search?page=1&per_page=10&offset=0&query=" + stuff;
            console.log(restUrl);
            fetch(restUrl)
                .then(response => response.json())
                .then(function(response) {
                console.log(response);
                })
            ;
        };
    })
;
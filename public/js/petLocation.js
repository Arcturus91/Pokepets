
//require
//findbyid
//extraigo lat,long


/* ciudad de mexic: 
lat: 19.4346835,
    lng: -99.1391493
 */



/* lima
lat: -12.0547601,
    lng: -77.0909803
     */

window.addEventListener('load', () => {
  const initLocation = {
    lat: 19.4346835,
    lng: -99.1391493
  };

 
 //initicializamos la variable map 

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: initLocation
  });


//en el get del axios debe ir algo asi3
//`/pets/api/${id}`
// no llega: console.log("hey", req.params.id)
                        //id

let url = window.location.href

let startPos = url.indexOf("profile/") + 8;
let id = url.slice(startPos)

console.log(id)
                        
  function getPet() {
    axios
      .get(`/profile/api/${id}`)
      .then(response => {
        //console.log("yo soy la respuesta",response)
        placePet(response.data.pet);
        
      })
      .catch(error => {
        console.log(error);
      });
  }
  
  function placePet(pet) {
    
      const center = {
        lat: pet.location.coordinates[1],
        lng: pet.location.coordinates[0]
      };
      //console.log("yo soy el restaurat",center)
      const pin = new google.maps.Marker({
        position: center,
        map: map,
        title: pet.name
      });
     
    
  } 


  getPet();

});

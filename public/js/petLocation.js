window.addEventListener('load', () => {
  const initLocation = {
    lat: -12.0547601,
    lng: -77.0909803
  };

 
 //initicializamos la variable map 

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: initLocation
  });


//en el get del axios debe ir algo asi3
//`/pets/api/${id}`
// no llega: console.log("hey", req.params.id)
                        //id

let url = window.location.href

//http://localhost:3000/pets/62c5d52e8ee0d26aa86320e0
//http://localhost:3000/profile/62c718f0d0e9b4eb8b270a35
let id = url.slice(30)

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

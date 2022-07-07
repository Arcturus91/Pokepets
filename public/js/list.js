window.addEventListener('load', () => {



  const initLocation = {
    lat: -12.0547601,
    lng: -77.0909803
  };

 
 //initicializamos la variable map 

  const map = new google.maps.Map(document.getElementById('map0'), {
    zoom: 13,
    center: initLocation
  });


let markers =[]
  function getPets() {
    axios
      .get('/listPets/api')
      .then(response => {
        console.log("yo soy la respuesta",response)
        placePets(response.data.pets);
        
      })
      .catch(error => {
        console.log(error);
      });
  }
  
  function placePets(pets) {
    for (let pet of pets) {
      const center = {
        lat: pet.location.coordinates[1],
        lng: pet.location.coordinates[0]
      };
      console.log("yo soy el pet",center)
      const pin = new google.maps.Marker({
        position: center,
        map: map,
        title: pet.name
      });
      markers.push(pin);
    }
  }
  getPets();

  

});



 




 

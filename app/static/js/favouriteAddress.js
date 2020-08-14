var current_user = context.current_user;
var favAddressSection = document.getElementById('favAddressSection');
var locations = []

function showForm (){
  favAddressSection.innerHTML = "";
  document.getElementById('hiddenSection').style.display= 'block';
}

function addFavAddress(){
    user = current_user
    name = document.getElementById('addName').value
    address = document.getElementById('addAddress').value
    if(name == "" || address == ""){
      console.log("Should break")
      return null;
    }
    document.getElementById('hiddenSection').style.display= 'none';

    var dataSent = {
        name: name,
        address: address,
        user:user
      };

      fetch('http://127.0.0.1:8000/api/favaddress/create/', {
        method: "post",
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataSent)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log("Data is ok", data);
    }).catch(function(ex) {
        console.log("parsing failed", ex);
    });


    //Needs to be called twice
    getFavAddressAwait();
    getFavAddressAwait(); 
    //Resets the form if users adds another location
    document.getElementById('addName').value="";
    document.getElementById('addAddress').value="";
    document.getElementById('favNameError').style.display = 'none';
    document.getElementById('favLocError').style.display = 'none';
}


function deleteLocation(primarykey){

  fetch(`http://127.0.0.1:8000/api/favaddress/destroy/${primarykey}` ,{
    method: 'DELETE',
    credentials: "same-origin",
    headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
  })
  .then(res => console.log("Success", res))
  .catch(err => console.log("Error", err))

    //Needs to be called twice
    getFavAddressAwait();
    getFavAddressAwait();
}

function enterAddress(id){
  var startLocation = document.getElementById('startLocation');
  var endLocation = document.getElementById('endLocation');
  var address;
  for (var i = 0; i < locations.length; i++){
    if (locations[i].id === id){
      address = locations[i].address;
    }
  }
  if (startLocation.value === ""){
    startLocation.value = address;
  } else {
    endLocation.value = address;
  }  
}

const getFavAddresses = () => new Promise((resolve, reject) => {
    if (current_user == 0){
        resolve(null);
    }
    fetch("api/favaddress/")
        .then(response => {
            return response.json();
        })
        .then(data => {
            locations = []
            for (var i =0; i < data.length; i++){
                locations.push(data[i]);
            }
            resolve(locations);
        })
        .catch(error => {
            reject(console.log(error));
        });
}, 1);

//This function must wait until the for loop above has resolved to run.
async function getFavAddressAwait(){
  const addresses = await getFavAddresses();
  var innerHTML = " "; 
  if(!(addresses === null)) {
    for (var i = 0; i < addresses.length; i++){
     innerHTML += '<li><div class="btn-group"><button class="favAddressBtn" onClick=enterAddress('+ addresses[i].id +')><img class="favouriteicon" src="../static/images/favAddress.png"/>'+ addresses[i].name + '</button><button class="removebtn" onClick=deleteLocation(' + addresses[i].id + ')><img class="removeicon" src="../static/images/remove_fav.png"/></button></div></li>'
    }
    if (addresses.length < 5){
      innerHTML += '<li><button id="newlocbtn" class="addFavAddressBtn" onclick=showForm()><img class="" src="../static/images/favAddress2.png"/>Add Location<img class="removeicon addicon" src="../static/images/add_fav.png"/></button></li>'
    }
    favAddressSection.innerHTML = innerHTML;
  }
}

//Called when page loads to display favourite stops
getFavAddressAwait();


document.getElementById('favAddressSubmitBtn').addEventListener('click', () => {
  if(document.getElementById('addName').value === ""){
    document.getElementById('favNameError').style.display = 'block'
    setTimeout(() =>{
      document.getElementById('favNameError').style.display = 'none'
    },5000)
  }
  if(document.getElementById('addAddress').value === ""){
    document.getElementById('favLocError').style.display = 'block'
    setTimeout(() =>{
      document.getElementById('favLocError').style.display = 'none'
    },6000)
  }
})

document.getElementById('addName').addEventListener('click', () => {
  document.getElementById('favNameError').style.display = 'none'
})

document.getElementById('addAddress').addEventListener('click', () => {
  document.getElementById('favLocError').style.display = 'none'
})






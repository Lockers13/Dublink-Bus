const get_button = document.getElementById('rget_btn')
const get_form = document.getElementById('route_get_form')


get_button.addEventListener("click", function() {
    get_form.submit
})


function handleForm(event) {
    event.preventDefault()
    let addr1 = document.getElementById('addr1').value
    let addr2 = document.getElementById('addr2').value
    addr1 = addr1.replace(" ", "%20").replace("'", "%27")
    addr2 = addr2.replace(" ", "%20").replace("'", "%27")

    fetch("http://localhost:8000/routes/api/find_route?start_addr=" + addr1 +
            "&end_addr=" + addr2)
    .then(response => response.json())
    .then(function (data) {
        console.log(data)
    })
}

get_form.addEventListener("submit", handleForm)
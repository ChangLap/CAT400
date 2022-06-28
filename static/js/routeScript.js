//set map options
let map;
// due to geocoder function issue where the data could not be passed out.
let listAddresses = [];
// marker array
let markers = [];
// direction renderer arrays

function initMap() {

    var mylatlng = { lat: 5.3696242240069285, lng: 100.31003030071015 };

    var mapOptions = {
        center: mylatlng,
        zoom: 12,
        disableDefaultUI: true,
    };

    map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

    //create a Direction service object to use route method and get a result for our request
    var directionsService = new google.maps.DirectionsService();

    var directionsRenderer = [];

    // pop out windows 
    const infowindow = new google.maps.InfoWindow();



    //part to work with normal css with jquery
    $(document).ready(function () {
        // color for routes and markers
        var colorCode = [
            '#008000', //green
            '#0000FF', //blue
            '#808080', //grey
            '#FF0000' //red
        ];

        var colorName = [
            'Green',
            'Blue',
            'Grey',
            'Red'
        ]

        // var listAddress = [];

        // // listAddress.push($('#from').val()); //Gerai Syam Bawah Pokok
        // // listAddress.push($('#to').val()); //Takoyaki u2 puchong
        // listAddress.push("Takoyaki Chef Tako Puchong Utama");
        // listAddress.push("Gerai Syam Bawah Pokok");
        // // error with aprostrophe(')
        // // listAddress.push("McDonald's, Lot 32426 Jalan Permai 2");
        // listAddress.push("Siang Hoong Trading");
        // listAddress.push("Pasar Raya PP Maju Jaya");
        // listAddress.push("Hilton Garden Inn Puchong");
        // listAddress.push("Pos Malaysia Puchong Perdana");
        // listAddress.push("Maybank Bandar Puteri Puchong");
        // listAddress.push("Oriental Kopi Bandar Puteri");


        // for (var i = 0; i < 1000; i++) {
        //     var addr = document.getElementById('delivery');
        //     var opt = document.createElement('option');
        //     opt.innerHTML = i;
        //     addr.appendChild(opt);
        // }
        // var example = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        // for (var i = 0; i < 1000; i++) {
        //     var addr = document.getElementById('pickup');
        //     var opt = document.createElement('option');
        //     opt.innerHTML = example[i % 26];
        //     addr.appendChild(opt);
        // }
        var currentList;
        var pickupList;
        var deliveryList;
        var pickupLatLng;
        var deliveryLatLng;

        // getting pick up addresses from database
        $.ajax({

            //GET, POST
            type: 'POST',

            //url 
            url: '/pickupAddress',

            dataType: "json"
        })
            .done(function (response) {
                var latlng = response.coordinates;
                var list = response.formatted_address;

                pickupLatLng = latlng;
                pickupList = list;

                for (var i = 0; i < list.length; i++) {
                    $('#pickup').append('<option>' + list[i] + '</option>');
                }

            })
            .fail(function () {
                alert("Failed to retrive list of pick up addresses.");
            });

        // getting delivery addresses from database
        $.ajax({

            //GET, POST
            type: 'POST',

            //url 
            url: '/deliveryAddress',

            dataType: "json"
        })
            .done(function (response) {
                var latlng = response.coordinates;
                var list = response.formatted_address;

                deliveryLatLng = latlng;
                deliveryList = list;

                for (var i = 0; i < list.length; i++) {
                    $('#delivery').append('<option>' + list[i] + '</option>');
                }

            })
            .fail(function () {
                alert("Failed to retrive list of pick up addresses.");
            });
        
        // getting current coordinate to address
        $.ajax({

            //GET, POST
            type: 'POST',

            //url 
            url: '/firebaseReadandConvert',

            dataType: "json"
        })
            .done(function (response) {
                currentList = response;
            })
            .fail(function () {
                alert("Fail to retrieve current address");
            });


        var currentMarker = new google.maps.Marker({
            position: {
                lat: 5.345561025092872,
                lng: 100.29570585684677
            },
            map: map,
        });

        currentLocation(currentMarker);

        // // print values after ajax has stopped
        // $(document).ajaxStop(function () {
        //     console.log(pickupLatLng);
        //     console.log(pickupList);
        //     console.log(deliveryLatLng);
        //     console.log(deliveryList);
        // });


        // synchronizing scrolls
        $('#pickup').scroll(function () {
            $('#delivery').scrollTop($('#pickup').scrollTop());
        });

        // highlighting the other select tab 
        $('#pickup').change(function () {
            $('#delivery option').attr("selected", false);

            $("#pickup :selected").each(function (i, selected) {
                var index = $(this).index();
                $('#delivery option').eq(index).attr("selected", true);
            });

            $('#delivery').scrollTop($('#pickup').scrollTop());
        });

        $("#selectButton").click(function () {

            // resetting markers and route setting
            for (var i = 0; i < directionsRenderer.length; i++) {
                directionsRenderer[i].set('directions', null);
            }

            currentLocation(currentMarker);

            directionsRenderer = [];
            setMapOnAll(null);
            markers = [];


            var numVehicle;
            var selectedPickup = [];
            var selectedDelivery = [];

            $("#pickup :selected").each(function (i, selected) {
                selectedPickup.push($(selected).text());
            });

            $("#delivery :selected").each(function (i, selected) {
                selectedDelivery.push($(selected).text());
            });

            numVehicle = $("#vehicles").val();

            // stringify array before attaching
            selectedPickup = JSON.stringify(selectedPickup);
            selectedDelivery = JSON.stringify(selectedDelivery);
            numVehicle = JSON.stringify(numVehicle);
            currentList = JSON.stringify(currentList);
            $.ajax({
                data: {
                    pickupJS: selectedPickup,
                    deliveryJS: selectedDelivery,
                    num: numVehicle,
                    currentJS: currentList,
                },

                //GET, POST 
                type: 'POST',

                //url same as @app.route
                url: "/optimisation"
            })
                // if success, goes this
                .done(function (response) {
                    // assuming response will be vehicles and their corresponding route node. 
                    // or tools return a json or array. 
                    var status = response.status;
                    var route = response.route;

                    var jsonRoute = {};
                    var output = [];
                    // {'output' = []}
                    jsonRoute.output = output;

                    selectedPickup = JSON.parse(selectedPickup);
                    selectedDelivery = JSON.parse(selectedDelivery);
                    currentList = JSON.parse(currentList);
                    var mixedAdd = selectedPickup.concat(selectedDelivery);

                    // setting first node as dummy location 
                    // arr.splice(index, 0, item); will insert item into arr at the specified index (deleting 0 items first, that is, it's just an insert)
                    mixedAdd.splice(0, 0, currentList);
                    mixedAdd.splice(0, 0, 'Soekarno-Hatta International Airport');

                    console.log(mixedAdd);

                    //displaying route in table
                    var tableList = document.getElementById('routeList');
                    tableList.innerHTML = ''

                    //route was a 2D array list
                    for (var i = 0; i < route.length; i++) {

                        arrAddress = indexToAddresses(route[i], mixedAdd);

                        var waypoints = [];
                        var ori, dest;
                        for (var a = 0; a < arrAddress.length; a++) {
                            if (a == 0)
                                ori = arrAddress[a];
                            else if (a == (arrAddress.length - 1))
                                dest = arrAddress[a];
                            else
                                waypoints.push(arrAddress[a]);
                        }

                        var jsonObj = {
                            "route": arrAddress,
                            "origin": ori,
                            "destination": dest,
                            "waypoints": waypoints,
                            "status": status[i],
                            "color": colorCode[i],
                            "colorName": colorName[i]
                        }

                        jsonRoute.output.push(jsonObj);
                    }

                    for (var i = 0; i < jsonRoute.output.length; i++) {
                        directionsRendererTemp = new google.maps.DirectionsRenderer({ map: map, suppressMarkers: true });
                        calculateAndDisplay(directionsService, directionsRendererTemp, jsonRoute.output[i], tableList);
                        directionsRenderer.push(directionsRendererTemp);
                    }


                })
                // if fail, goes here 
                .fail(function (err) {
                    alert("Data failed to pass to python due to " + err);
                    console.log(err);
                })
        });

        var interval;
        $('#startButton').click(function () {

            var refresh = $('#delayOption').val();
            $('#startButton').prop('disabled', true);
            $('#stopButton').prop('disabled', false);

            interval = setInterval(function () {
                currentLocation(currentMarker);

                $.ajax({

                    //GET, POST
                    type: 'POST',
        
                    //url 
                    url: '/firebaseReadandConvert',
        
                    dataType: "json"
                })
                    .done(function (response) {
                        currentList = response;
                    })
                    .fail(function () {
                        alert("Fail to retrieve current address");
                    });
            }, refresh);

            setTimeout(function () {
                clearInterval(interval);
                $('#startButton').prop('disabled', false);
                $('#stopButton').prop('disabled', true);
            }, (refresh * 10));
        });

        $('#stopButton').click(function () {
            clearInterval(interval);
            $('#startButton').prop('disabled', false);
            $('#stopButton').prop('disabled', true);
        });

    });

}

function calculateAndDisplay(directionService, directionsRenderer, json, tableList) {

    const wp = [];
    for (var i = 0; i < json.waypoints.length; i++) {
        wp.push({
            location: json.waypoints[i],
            stopover: true
        });
    }

    // data input for requesting route
    var request = {
        origin: json.origin,
        destination: json.destination,
        //other routes to go 
        waypoints: wp,
        travelMode: google.maps.TravelMode['DRIVING'], // WALKING, BYCYLING AND TRANSIT
        unitSystem: google.maps.UnitSystem.IMPERIAL
    };

    var options = {
        polylineOptions: {
            strokeColor: json.color,

            // 0.0 to 1.0 
            strokeOpacity: 0.5,

            // 10 too large, 2 too small 
            strokeWeight: 6
        },
    };

    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var labelIndex = 0;
    var alphabet;

    //Pass the request to the route method
    directionService.route(request)

        .then((response) => {

            directionsRenderer.setDirections(response);

            // Setting direction's route option, in this case is route color
            directionsRenderer.setOptions(options);

            const route = response.routes[0];

            // //see the content of json, can remove div #jsonString
            // const strings = document.getElementById("jsonString");
            // strings.innerHTML = JSON.stringify(response, null, 2);

            // summaryPanel.innerHTML = "";,
            // for marker labels


            var rowList = '';
            for (var i = 0; i < route.legs.length; i++) {

                // displaying content for each route 
                // getting the alphabets
                alphabet = labels[labelIndex++ % labels.length];

                //setting the list of rows
                var km = route.legs[i].distance.value / 1000;
                rowList += '<tr><td>'
                    + alphabet
                    + ". "
                    + route.legs[i].start_address
                    + '</td><td>'
                    + labels[(labelIndex) % labels.length]
                    + ". "
                    + route.legs[i].end_address
                    + '</td><td>'
                    + km
                    + " km"
                    + '</td><td>'
                    + route.legs[i].duration.text
                    + '</td></tr>';

                // summaryPanel.innerHTML += "<h3>Route Segment " + routeSegment + ":</h3>";
                // summaryPanel.innerHTML += "<p>" + route.legs[i].start_address + " to " + route.legs[i].end_address + 
                //                             "<br>Distance: " + km + " km " +
                //                             "<br>Duration: " + route.legs[i].duration.text + "<br><br></p>";


                // setting for google marker to same solor as route
                // setting google marker with labels

                addMarker(route.legs[i].start_location, alphabet, json.color);

                //for the last location labelling
                if (i == (route.legs.length - 1)) {
                    alphabet = labels[labelIndex++ % labels.length];
                    addMarker(route.legs[i].end_location, alphabet, json.color);
                }
            }

            // for table listing initiation for title
            tableList.innerHTML += "<h3>"
                + json.colorName
                + " route segment</h3>"
                + "<table class='table table-sm'><thead><tr>"
                + "<th>From</th>"
                + "<th>To</th>"
                + "<th>Distance</th>"
                + "<th>Duration</th>"
                + "</tr></thead><tbody>"
                + rowList
                + "</tbody></table>";


        })
        .catch((e) => console.log("Direction request failed due to " + e));

}

function indexToAddresses(dataIndex, dataAddresses) {
    var temp = [];

    for (var i = 0; i < dataIndex.length; i++) {

        //skip when 0 is one of the path 
        if (dataIndex[i] == 0)
            continue;
        temp.push(dataAddresses[dataIndex[i]]);
    }

    return temp;
}

function addMarker(location, label, color) {
    var color = color.replace('#', '');
    var urlString = 'http://www.googlemapsmarkers.com/v1/' + label + '/' + color + '/FFFFFF/' + color + '/';

    var mark = new google.maps.Marker({
        position: location,
        map: map,
        icon:
        {
            // http://www.googlemapsmarkers.com/v1/LABEL/COLOR/
            // http://www.googlemapsmarkers.com/v1/LABEL/FILL COLOR/LABEL COLOR/STROKE COLOR/
            url: urlString,

            // default Size(21, 34)
            scaledSize: new google.maps.Size(25, 41)
        }

    });

    markers.push(mark);
}

function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function currentLocation(curMarker) {
    $.ajax({
        //GET, POST
        type: 'POST',

        //url 
        url: '/firebaseRead',

        dataType: "json"
    })
        .done(function (response) {
            var stat = response.status;

            var latitude = parseFloat(response.lat);
            var longitude = parseFloat(response.long);

            if (stat == 'updated') {
                var loc = new google.maps.LatLng(latitude, longitude);
                curMarker.setPosition(loc);
            }
        })
        .fail(function () {
            alert("Failed getting current location.");
        })
}

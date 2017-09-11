


var embedAPIkey = "AIzaSyADcGH--swBBpg6-7tYcluAngele15Sz6M";
var userinput;
var PoI = "food";
var nameofPOI = "";


var lat;
var long;
var numIndex = 1;

/*Google long. lat. coordinates GEOCODING API*/
var coordinatequeryURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+userinput+"&key="+embedAPIkey;
var nearbyqueryURL = "";
var map;
var infowindow;
var results;

//Set point of interest to user's input
$("#options").on("change", function(){
	PoI = $(this).val();
})


//On submit search for places according to user input and load the map
$("#searchplaces").on("submit", function(){
	userinput   = $("#destination").val();
	console.log(userinput);
	console.log("here!");
	nameofPOI   = $("#namepoi").val();
	coordinatequeryURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+userinput+"&key="+embedAPIkey;
	$("#destination").empty();
	$("#namepoi").empty();
	event.preventDefault();
	initMap();

});

//Loading the map according to user input and put in markers
function initMap() {
	$.ajax({
		url: coordinatequeryURL,
		method: "GET"
	}).done(function(response) {

		console.log(response);
		console.log(userinput);
		lat = (response.results[0].geometry.location.lat);
		long = (response.results[0].geometry.location.lng);
		console.log("Lat: "+lat);
		console.log("Lng: "+long);
		console.log("Point of Interest: "+PoI);
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: lat, lng: long},
			zoom: 15
		});
		infowindow = new google.maps.InfoWindow();
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location: {lat: lat, lng: long},
			radius: 500,
			type: [PoI],
			name: nameofPOI
		}, callback);

	});
	weatherMAP(lat,long);
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		$(".placespanel").empty(); 
		//Marker # index
		numIndex = 1;
		for(var i=0; i<results.length;i++){
			try{

        //Title of place
        var title = $("<div class='div-save'>");
        title.append("<h3>"+numIndex+". "+"<span class='placetitle'>"+results[i].name+"</span></h3>");
        //title.append("<span>");
        var btn = $('<button type="button" class="btn btn-default btn-save">Save</button>');
        if (firebase.auth().currentUser != null) {
        //  console.log('button append');
           title.append(btn);
        };
        //Hidden info in the title
        var imageurl = $("<div class='poi-imgurl'>");
        imageurl.append(results[i].photos[0].getUrl({'maxWidth': 1000}));
        var address  = $("<div class='poi-address'>");
        address.append(results[i].vicinity);
        var placesrating = $("<div class='poi-rating'>");
        placesrating.append(results[i].rating);
        imageurl.css("display","none");
        address.css("display","none");
        placesrating.css("display","none");
        title.append(imageurl);
        title.append(address);
        title.append(placesrating);

        //Formatting title css
        title.css("background-color","black");
        title.css("color","white");
        title.css("text-align","center");
        title.css("padding","3px 0px 7px 0px");
        title.css("margin","15px 0px 0px 0px");
        $(".placespanel").append(title);

        

        var placesInfo = $("<div>");

        var picture = $("<img>");
        var picUrl = results[i].photos[0].getUrl({'maxWidth': 1000});
        var pictureDiv = $("<div>");
        picture.attr("src", picUrl);
        pictureDiv.append(picture);
        pictureDiv.css("width","40%");
        pictureDiv.css("float","left");



        //Address and info of places
        var picInfo    = $("<div>");
        //Rating if exist
        if(results[i].rating!=undefined){
        	picInfo.append("<p class='poi-rating'><b>Rating:</b> "
        		+results[i].rating+"</p>");
        }
        picInfo.append("<p class='poi-address'>"+"<b>Address:</b> "+results[i].vicinity+"</p>");
        picInfo.css("width","60%")
        picInfo.css("float","right");
        picInfo.css("margin-top","30px")




        
        placesInfo.append(pictureDiv);
        placesInfo.append(picInfo);
        placesInfo.append('<br style="clear:both;"/>');


        $(".placespanel").append(placesInfo);


        //Create markers on the map
        createMarker(results[i]);     
    }
    catch(err){
    }
}
}
}


function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		label: numIndex.toString()
	});
	numIndex++;
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	});
}


function weatherMAP(latitude,longitude){
	console.log('start');
	var api = "63f2fa3cfc2e61381b22c657bc65c0cf"
	var lat = latitude;
	var long = longitude;
	var queryURL = 
	"https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat +  
	"&lon=" + long + "&cnt=5" + "&APPID=" + api;
	$.ajax({
		url: queryURL,
		method: "GET"
	})
	.done(function(response) {
		callWeather(response);
	});
};

var day =[];
console.log("DATE:"+moment().format('dddd MMM Do'));

function callWeather(response) {

	$('#wx').empty();
	$("#5days").empty();
	for (var i = 0; i < 5; i++) {
		var wx = response;
		var city = wx.city.name;
		var weather = wx.list[i]
		.weather[0].description;
		var icon = wx.list[i]
		.weather[0].icon;

        //Date and weather formattinig  
        var td = $("<td>");
        var th = $("<th>");

        //GET 5 DAYS OF WEEK FROM NOW
        var date = moment().add(i, 'days');

        th.addClass("date");
        th.append(moment(date).format('dddd MM/DD'));


        var gifDiv = $("<div class='icon'>");
        var iconUrl = "http://openweathermap.org/img/w/" + icon + ".png";
        var p = $("<p>").append('<span>' + weather + '</span>' );
        gifDiv.append("<img src='" + iconUrl  + "'>");
        gifDiv.append(p);
        td.append(gifDiv);
        $("#wx").append(td);
        $("#5days").append(th);
    };
};
//
//  USER INPUT and authentication
//  ========================================================== 
//
//  =================================================
//  Initialize Firebase
//  =================================================

var config = {
    apiKey: "AIzaSyDeRYoE5fWhh3ZA7aN-UDKOiNgP2hI_N6A",
    authDomain: "daytrippersandiego.firebaseapp.com",
    databaseURL: "https://daytrippersandiego.firebaseio.com",
    projectId: "daytrippersandiego",
    storageBucket: "daytrippersandiego.appspot.com",
    messagingSenderId: "616812924303"
};

firebase.initializeApp(config);

var database = firebase.database();
var snapshot = "";

//  =================================================
//  function to show appropriate information 
//  and buttons on log-on
//  =================================================

function showLogon(name) {
    var user = firebase.auth().currentUser.displayName;
    console.log('showLogon user = ', user);
    if (user == null || user == undefined) {
        console.log('inside ')
    }

    $('#auth').hide();
    $('#greeting > span').empty();
    $("#greeting").prepend("<span>Nice to see you, " 
        + user + 
        " - now you can look at your saved Points of Interest </span><br>");
    $('#greeting').show();
    $('#btn-user').show();
    $('#btn-logout').show();
};

//  =================================================
//  function to show sign-in info and buttons when
//  not logged on; hide buttons to log off
//  =================================================

function showSignIn() {
    $('#auth').show();
    $('#greeting > span').empty();
    $('#btn-user').hide();
    console.log('before logout');
    $('#btn-logout').hide();
    console.log('after logout');
};
//  =================================================
//  function to update user profile to include name
//  =================================================

function addName(name) {
    var userUid = firebase.auth().currentUser.uid;
    //  setting up the unique URL for the write/delete

    var user = firebase.auth().currentUser;
    user.updateProfile({
        displayName: name,
        }).then(function() {
            // Update successful, add name in /user record.
            var userUid = firebase.auth().currentUser.uid;
            var usersDir = database.ref("/"+userUid);
            var rec = {
                name: name,
            }
            var newRec = usersDir.push(rec).key;
            console.log('newRec = '+newRec);
            showLogon();
        },  function(error) {
            alert(errorMessage);
            });
};

//  =================================================
//  function to save the Point of Interest 
//  under the user's URL
//  =================================================

function savedPoi() {
    var userUid = firebase.auth().currentUser.uid;
    var usersDir = database.ref("/"+userUid);
    
    usersDir.on('value', function(childSnapshot) {
        snapshot  = childSnapshot;
        var object = JSON.stringify(snapshot);
        console.log('user key ' + snapshot.key);
        console.log('user object ' + object);
    });
};

//  =================================================
//  function to populate the list of Points 
//  Interest with the ones saved under the user.
//  Only shows when the user is logged in.
//  =================================================

function populateList() {
    $(".placespanel").empty();

    var nameLoggedIn = firebase.auth().currentUser.displayName;

    console.log(snapshot.val());
    console.log(JSON.stringify(snapshot));

    snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
        snap= childSnapshot.val();

        console.log(key);
        console.log(firebase.auth().currentUser.displayName)
        console.log(snap.name);
        console.log(childSnapshot);
        if (snap.name == nameLoggedIn) {
            console.log('first record, dummy')
            return
        }

        //Title of place
        var title = $("<div class='div-save'>");
        title.append("<h3>"+numIndex+". "+"<span class='placetitle'>"+key+"</span></h3>");
        //title.append("<span>");
        var btn = $('<button type="button" class="btn btn-danger btn-save">Delete</button>');
        if (firebase.auth().currentUser != null) {
        //  console.log('button append');
        title.append(btn);
    };

        //Formatting title css
        title.css("background-color","black");
        title.css("color","white");
        title.css("text-align","center");
        title.css("padding","3px 0px 7px 0px");
        title.css("margin","15px 0px 0px 0px");
        $(".placespanel").append(title);        

        var placesInfo = $("<div>");

        var picture = $("<img>");
        var picUrl = snap.imgUrl;;
        var pictureDiv = $("<div>");
        picture.attr("src", picUrl);
        pictureDiv.append(picture);
        pictureDiv.css("width","40%");
        pictureDiv.css("float","left");

        //Address and info of places
        var picInfo    = $("<div>");
        //Rating if exist
        picInfo.append("<p class='poi-rating'><b>Rating:</b> "
            +snap.rating+"</p>");

        picInfo.append("<p class='poi-address'>"+"<b>Address:</b> "+snap.address+"</p>");
        picInfo.css("width","60%")
        picInfo.css("float","right");
        picInfo.css("margin-top","30px")

        placesInfo.append(pictureDiv);
        placesInfo.append(picInfo);
        placesInfo.append('<br style="clear:both;"/>');

        $(".placespanel").append(placesInfo);
    });
};

//  =============================================================
//  Authentication
//  =============================================================

//  =================================================

//  event handler to determine if user logged on/off
//  state has changed
//  =================================================

firebase.auth().onAuthStateChanged(function(user) {
    console.log('onAuthStateChanged');
    if (user) {
    // User is signed in.
    // showLogon();
    var btn = $('<button type="button" class="btn btn-default btn-save">Save</button>');
    console.log('user'+user);
    $('.div-save').append(btn);
} 
else {
    // No user is signed in.
    showSignIn();
    console.log('user'+user);
    $('.btn-save').remove();
}
});
//  =================================================
//  event handler for login/Register link
//  =================================================

$('.flipper-btn').click(function(event){
    event.preventDefault();
    console.log('flip = ', $('.flip').find('.card'));
    $('.flip').find('.card').toggleClass('flipped');
    console.log("flipped");
});

$('#btn-login').on("click", function(event) {
    event.preventDefault();
    var email = $('#email').val().trim();
    var pass = $('#password').val().trim();
    console.log('login ' + email);
    console.log('password ' + password);

    var auth = firebase.auth();
    
    console.log('auth ' + auth);
    // sign In
    var promise = auth.signInWithEmailAndPassword(email, pass)
    .then(function(result) {
        showLogon();
        console.log('uid ' + auth.currentUser.uid);
        savedPoi();
        $("#myModal").modal("hide");
    })
    .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
            // check password
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
        });
});
//  =================================================
//  Sign-In event
//  =================================================

$('#btn-signup').on("click", function(event) {
    event.preventDefault();
    var name = $('#name-signup').val().trim();
    var email = $('#email-signup').val().trim();
    var pass = $('#password-signup').val().trim();
    console.log('email-signup ' + email);
    console.log('password-signup ' + password);

    var auth = firebase.auth();
    console.log('auth ' + auth);

    if (name == "") {
        alert("Please tell me what to call you. If you don't, I will find an appropriate name for you...");
    }

    // create user
    var promise = auth.createUserWithEmailAndPassword(email, pass)
    .then(function(result) {
        console.log("sign-in");
        addName(name);
        // showLogon();
        savedPoi();
        $("#myModal").modal("hide");
    })
    .catch(function (error) {
        alert(error.code)
        console.log(error);
    });
});

//  =================================================
//  Logout event
//  =================================================

$('#btn-logout').on("click", function() {
    firebase.auth().signOut();
    $('#email').val('');
    $('#password').val('');
});

//  =================================================
//  Saving the point of interest to Firebase
//  to the logged-in user URL
//  =================================================

$(document.body).on("click", '.btn-save', function() {

    // getting the data from the DOM
    poiKey = $(this).siblings().find(".placetitle").html();
    console.log(poiKey);
    poiRating = $(this).siblings(".poi-rating").text();
    poiAddress = $(this).siblings('.poi-address').text();
    poiImgUrl  = $(this).siblings('.poi-imgurl').text();
    console.log(poiAddress);
    console.log(poiRating);

    
    var userUid = firebase.auth().currentUser.uid;
    //  setting up the unique URL for the write/delete
    var usersDir = database.ref("/"+userUid+"/"+poiKey);
    //  if the button clicked is equal to save, 
    //  we prepare the object to be written to firebase
    if ($(this).text() == "Save") {

        var poi = {
            desc    : "",
            imgUrl  : poiImgUrl,
            lat     : "",
            long    : "",
            name    : poiKey,
            rating  : poiRating,
            address : poiAddress
        };
        
        // checking that the record does not exist in the database 
        console.log('child object =' + usersDir); 

        var childExists = false;
        console.log(JSON.stringify(snapshot));
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            console.log('===============================');
            console.log('key ' + key);
            console.log('poiKey ' + poiKey);
            console.log('===============================');
            if (key == poiKey) {
                childExists = true;
                console.log('TRUE');
                return;               
            }
        }); 

        if (!childExists) {
            var poiRec = usersDir.set(poi);
            
            console.log('**************');
            console.log('key ' + poiKey);
        }
        else {
            alert('already saved!')
        } 
        $(this).text("Delete");
        $(this).removeClass('btn-default')
        .addClass('btn-danger')
        .val(poiKey);
    }
    else if ($(this).text() == "Delete") {
        // btnKey =  $(this).val();
        console.log('poiKey ' + poiKey);
        var poiKey = database.ref("/"+userUid+"/"+poiKey);
        poiKey.remove();
        $(this).text("Save");
        $(this).removeClass('btn-danger')
        .addClass('btn-default');
    };
});

//  =================================================
//  Event listener: when the 'show me' button
//  is clicked, show the user's Points of Interest
//  =================================================

$(document.body).on("click", '#btn-user', function() {
    console.log('show me');
    populateList();
})


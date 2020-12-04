var auth2; // The Sign-In object.
var googleUser; // The current user.

var appStart = function() {
  gapi.load('auth2', initSigninV2); 
};

var initSigninV2 = function() {
  auth2 = gapi.auth2.init({
      client_id: '342980464169-2jqomrchsthgjpdafk50ba8akj22g2v0.apps.googleusercontent.com',
      scope: 'profile'
  });
  auth2.then(()=>{
      if(auth2.isSignedIn.get()!=true){
          signIn();
      }
 })
};

let signIn =()=>{
    auth2.signIn().then((googleUser)=>{
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present
    })
}

function signOut() {
    auth2.signOut().then(function () {
      console.log('User signed out.');
    })
}



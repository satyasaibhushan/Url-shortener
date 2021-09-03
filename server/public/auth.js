var auth2; // The Sign-In object.
var googleUser; // The current user.
var id_token;
let started = false;
var verified = false;

var appStart = function () {
  gapi.load("auth2", initSigninV2);
};

var initSigninV2 = async () => {
  auth2 = gapi.auth2.init({
    client_id: "342980464169-2jqomrchsthgjpdafk50ba8akj22g2v0.apps.googleusercontent.com",
    scope: "profile",
    ux_mode: "redirect",
  });
  auth2
    .then(async googleUser => {
      await signIn();
      //   if (auth2.isSignedIn.get() != true) {
      //     await signIn();
      //   } else {
      //     console.log(googleUser);
      //     googleUser = auth2.currentUser.Wd;
      //     id_token = googleUser.getAuthResponse().id_token;
      //     await verify(id_token);
      //   }
    })
    .catch(err => {
      if (err.details == "Cookies are not enabled in current environment.")
        alert("App cannot function in incognito mode/enable your cookies");
      console.log(err);
      // if(auth2.isSignedIn.get()!=true ){
      //     signIn();
      // }
    });
};

let signIn = async () => {
  if (auth2.isSignedIn.get() != true) {
    console.log("signing in");
    auth2.signIn().then(async googleUser => {
      console.log(googleUser);
      id_token = googleUser.getAuthResponse().id_token;
      verify(id_token);
    });
  } else {
    googleUser = auth2.currentUser.Wd;
    id_token = googleUser.getAuthResponse().id_token;
    await verify(id_token);
  }
};

let verify = async id_token => {
  console.log("verifying");
  await fetch("/tokenVerify", {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify({ id_token }),
  })
    .then(res => res.json())
    .then(x => {
      let { isValid } = x;
      if (isValid) {
        console.log("You are allowed");
        verified = true;
        getUrls();
        return true;
      } else {
        console.log("You are not allowed");
        signOut();
        window.location.href = window.location.href + "error";
        // window.redirect('../error');
        return false;
      }
    })
    .then(() => {
      loader = document.getElementsByClassName("loader")[0];
      loader.style.display = "none";
    });
};

function signOut() {
  auth2.signOut().then(function () {
    console.log("User signed out.");
  });
}

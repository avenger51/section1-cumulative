"use strict";
//contains code for starting the UI of the application, and other miscellaneous things.
// So we don't have to keep re-finding things on page, find DOM elements once:


const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");
const $storiesContainer = $("#stories-container")


// selector that finds all three story lists
const $storiesLists = $(".stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $submitForm = $("#submit-form");

const $navSubmitStory = $("#nav-submit-story");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $userProfile = $("#user-profile");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
  ];
  components.forEach(c => c.hide());  //loop and send to hide() to hide each page element...not entirely sure why...
}

/** Overall function to kick off the app. */

//LINKED TO stories.js
//------------>checkForRememberedUser()  and getAndShowStoriesOnStart()
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

async function start() {
  console.log("start and calling checkForRememberedUser()  and getAndShowStoriesOnStart() in stories.js");
  //why isn't this logging to console?

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Once the DOM is entirely loaded, begin the app

console.warn("This is coming from main.js");
$(start);

//main.js:60  Yikes
//(anonymous) @ main.js:60
//main.js:48 start
//user.js:77 checkForRememberedUser
//stories.js:67 putStoriesOnPage
//user.js:112 updateUIOnUserLogin
//stories.js:67 putStoriesOnPage
//nav.js:71 updateNavOnLogin
//user.js:126 generateUserProfile
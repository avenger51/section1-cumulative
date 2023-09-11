"use strict";
//MANAGE THE DATA AND API 

//contains classes to manage the data of the app and the connection to the API. The name models.js to 
//describe a file containing these kinds of classes that focus on the data and logic about the data. UI stuff
//shouldn’t go here.
const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */
//
//
//SEE EXAMPLE BELOW
//
//
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
   
    return new URL(this.url).host;
  }
}
//URL is a built-in JavaScript constructor for working with URLs.
//1.  URL is a built-in JavaScript constructor for working with URLs.
//2.  new URL(this.url): creates a new URL object based on the value of this.url, where this.url is a string 
//    representing a URL.
//3.  .host is then accessed on the newly created URL object to retrieve the host (domain) part of the URL
/******************************************************************************
 * 
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  //Should do:
  //let newStory = await storyList.addStory(currentUser,
  //{title: "Test", author: "Me", url: "http://meow.com"});
  //Helpful....https://hackorsnoozev3.docs.apiary.io/#introduction/quickstart
//Also helpful...https://hack-or-snooze-v3.herokuapp.com/stories
 
async addStory(user, { title, author, url }) {
  const token = user.loginToken;
  const response = await axios({
    method: "POST",
    url: `${BASE_URL}/stories`,
    data: { token, story: { title, author, url } },
  });

  const story = new Story(response.data.story);
  this.stories.unshift(story);
  user.ownStories.unshift(story);

  return story;
}

async removeStory(user, storyId) {
  const token = user.loginToken;
  await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "DELETE",
    data: { token: user.loginToken }
  });

  // filter out the story whose ID we are removing
  this.stories = this.stories.filter(story => story.storyId !== storyId);

  // do the same thing for the user's list of stories & their favorites
  user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
  user.favorites = user.favorites.filter(s => s.storyId !== storyId);
}
}





/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // k...
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  
  async addFavorite(story) {
    this.favorites.push(story);
    await this._addOrRemoveFavorite("add", story)
  }


  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }
  

  async _addOrRemoveFavorite(newState, story) {
    const method = newState === "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }

  
  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }
}


const storyData = {
  storyId: 1,
  title: "Sample Story",
  author: "John Doe",
  url: "https://example.com",
  username: "johndoe",
  createdAt: "2023-09-04T12:00:00Z"
};

//CLASS REFRESHER:
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//FOR:
//class Story {
//
//  constructor({ storyId, title, author, url, username, createdAt }) {
//    this.storyId = storyId;
//    this.title = title;
//    this.author = author;
//    this.url = url;
//    this.username = username;
//    this.createdAt = createdAt;
//  }
//}
//DATA TO INSTANCE:
//
//const storyData = {
//  storyId: 1,
//  title: "Sample Story",
//  author: "John Doe",
//  url: "https://example.com",
//  username: "johndoe",
//  createdAt: "2023-09-04T12:00:00Z"
//};
//CREATE NEW INSTANCE:
//
//const storyInstance = new Story(storyData);


//TOKEN?????
//root@W10CC0RX93:/mnt/c/Personal/Umass_Sftware_Eng/HowTheWebWorks/Hack-or-Snooze-proj/hack-or-snooze-ajax-api# curl -i \
//     -H "Content-Type: application/json" \
//     -X POST \
//     -d '{"user":{"name":"test123abc","username":"test123abc","password":"foo"}}' \
//      https://hack-or-snooze-v3.herokuapp.com/signup
//HTTP/1.1 201 Created
//Server: Cowboy
//Connection: keep-alive
//X-Powered-By: Express
//Access-Control-Allow-Origin: *
//Content-Type: application/json; charset=utf-8
//Content-Length: 308
//Etag: W/"134-iTJW1KeItLqF73168MJUFkSHa0Y"
//Date: Fri, 08 Sep 2023 16:36:13 GMT
//Via: 1.1 vegur
//
//{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxMjNhYmMiLCJpYXQiOjE2OTQxOTA5NzN9.raqPlhM6SDXW9SWA9AQ1A04QgnK_5Mx1tfpvvNDPqVE","user":{"createdAt":"2023-09-08T16:36:13.461Z","favorites":[],"name":"test123abc","stories":[],"updatedAt":"2023-09-08T16:36:13.461Z","username":"test123abc"}}
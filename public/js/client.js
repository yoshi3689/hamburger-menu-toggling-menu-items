const ready = (callback) => {
  if (document.readyState != "loading") {
      callback();
  } else {
      document.addEventListener("DOMContentLoaded", callback);
  }
}

ready(() => {

  const ajaxGET = (url, callback) => {
      console.log("Hi this is AJAX get");
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
          if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
              console.log('responseText:' + xhr.responseText);
              callback(this.responseText);

          } else {
              console.log(this.status);
          }
      }
      xhr.open("GET", url);
      xhr.send();
  }

  function ajaxPOST(url, callback, data) {

      let params = typeof data == 'string' ? data : Object.keys(data).map(
              function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
          ).join('&');
      console.log("params in ajaxPOST", params);

      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
          if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
              callback(this.responseText);
          } else {
              console.log(this.status);
          }
      }
      xhr.open("POST", url);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(params);
  }
  // ids changed
// #loginForm -> login 
// #formTitle -> title
  // POST TO THE SERVER
  // POST as in adding a new set of data
  document.querySelector("#loginBtn").addEventListener("click", function(e) {
      e.preventDefault();
      let email = document.getElementById("email");
      let password = document.getElementById("password");
      let favWord = document.getElementById("favWord");
      let queryString = "email=" + email.value + "&password=" + password.value + "&fav_word=" + favWord.value;
    //   console.log("data that we will send", email.value, password.value, favWord.value);

      ajaxPOST("/login", function(data) {
          if(data) {
              let dataParsed = JSON.parse(data);
              if(dataParsed.status == "fail") {
                  document.getElementById("login-error-msg").innerHTML = dataParsed.msg;
              } else {
                  window.location.replace("/user");
              }
          }
          document.getElementById("errorMsg").innerHTML = dataParsed.msg;
      }, queryString);
  });

});
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const {
  JSDOM
} = require('jsdom');

app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/images", express.static("public/images"));
app.use("/fonts", express.static("public/fonts"));
app.use("/html", express.static("public/html"));
app.use("/media", express.static("public/media"));

const authenticate = (email, pwd, fav_word, callback) => {

  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "my_set"
  });
  connection.connect();
  connection.query(
    "SELECT * FROM person WHERE email = ? AND password = ? AND fav_word = ?", [email, pwd, fav_word],
    function (error, results, fields) {
      console.log("and the # of records returned", results.length, email, pwd, fav_word);

      if (error) {
        console.log(error);
      }
      if (results.length > 0) {
        return callback(results[0]);
      } else {
        return callback(null);
      }
    }

  );
}

const init = async () => {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    multipleStatements: true
  });

  const createDBAndTables1 = `CREATE DATABASE IF NOT EXISTS my_set;
      use my_set;
      CREATE TABLE IF NOT EXISTS person (
      ID int NOT NULL AUTO_INCREMENT,
      firstName varchar(30),
      lastName varchar(30),
      DOB varchar(11),
      fav_word varchar(20),
      phone varchar(15),
      email varchar(30),
      password varchar(30),
      PRIMARY KEY (ID));
      CREATE TABLE IF NOT EXISTS dish (
      ID int NOT NULL AUTO_INCREMENT,
      name varchar(40),
      imgURL varchar(30),
      date varchar(11),
      location varchar(150),
      phone varchar(15),
      PRIMARY KEY (ID));
      `;
  await connection.query(createDBAndTables1);

  const [personRows, personFields] = await connection.query("SELECT * FROM person");
  if (personRows.length == 0) {
    let personRecords = "insert into person (firstName, lastName, DOB, fav_word, phone, email, password) values ?";
    let recordValues = [
      ["Yoshi", "Nagai", "08/02/1998", "reciprocal", "80-4836-1511", "ynagai1@bcit.ca", "yoshi1998"],
      ["Dennis", "Kim", "02/28/1997", "it's lit", "90-4236-3141", "dkim1@bcit.ca", "dennis1997"],
      ["Sarah", "Semkow", "01/31/1999", "artichoke", "12-4256-3118", "ssemkow1@bcit.ca", "sarah1999"],
      ["Ash", "Zahenezeraki", "02/28/2001", "spaghettio", "56-4222-3589", "azahene@bcit.ca", "ash2001K"],
      ["Iliya", "Habibi", "09/23/2001", "hello", "70-9032-3280", "ihabibi@bcit.ca", "iliya2001"]
    ];
    await connection.query(personRecords, [recordValues]);
  }

  const [dishRows, dishFields] = await connection.query("SELECT * FROM dish");
  if (dishRows.length == 0) {
    let dishRecords = "insert into dish (name, imgURL, date, location, phone) values ?";
    let recordValues = [
      ["ramen", "/images/ramen.jpg", "01/30/2020", "Thaigo, 4567 Lougheed Hwy., Burnaby, BC V5C 3Z6", "90344891240"],
      ["pho", "/images/pho.jpg", "07/29/2018", "4525 Lougheed Hwy., Burnaby, BC V5C 3Z6", "890491223"],
      ["lasagna", "/images/lasagna.jpg", "09/12/2020", "3850 Lougheed Hwy., Burnaby, BC V5C 6N4", "980234836"],
      ["pasta", "/images/pasta.jpg", "08/23/2021", "6011 Hastings St, Burnaby, BC V5B 1R8", "7568322145"],
      ["burger", "/images/burger.jpg", "04/15/2010", "4441 Boundary Rd, Vancouver, BC V5R 2N3", "446870812"],
      ["pizza", "/images/pizza.jpg", "08/19/2020", "3891 E Hastings St, Burnaby, BC V5C 2H7", "900126589"],
      ["garlic bread", '/images/garlic_bread.jpg', "08/03/2020", "1-2231 Clarke St, Port Moody, BC V3H 1Y6", "+123456789"],
      ["fried dumplings", "/images/fried_dumplings.jpg", "03/19/2090", "3726 Canada Way, Burnaby, BC V5G 1G4", "129056781"],
      ["burrito", '/images/burrito.jpg', "04/01/2017", "1-2231 Clarke St, Port Moody, BC V3H 1Y6", "+123789234"],
      ["sandwich", '/images/sandwich.jpg', "05/02/2019", "3224 W Hastings St, Burnaby, BC V3H 1Y6", "+123789234"],
      ["stir-fried noodle", '/images/stir_fried_noodle.jpg', "9/1/2021", "3825 Ridgelawn, Burnanby, BC V5H 2Y8", "890237190"],
    ];
    await connection.query(dishRecords, [recordValues]);
  }

  console.log("Listening on port " + port + "!");
}

app.use(session({
  secret: "session has started",
  name: "session1",
  resave: false,
  saveUninitialized: true
}))

app.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/user");
  } else {
    let doc = fs.readFileSync("./app/html/index.html", "utf8");

    res.set("Server", "server 1");
    res.set("X-Powered_By", "Yoshi");
    res.send(doc);
  }
});


app.get("/user", (req, res) => {
  let user = fs.readFileSync("./app/html/user.html");
  let userDOM = new JSDOM(user);

  if (req.session.loggedIn) {
    const mysql = require("mysql2");
    const connection = mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "my_set"
    });
    connection.connect();
    connection.query(
      // selecting a specific table from mySQL
      "SELECT * FROM dish",
      function (error, results, fields) {
        if (error) {
          console.log(error);
        }
        if (results.length > 0) {
          userDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.firstName + " " + req.session.lastName + "'s user user";
          userDOM.window.document.getElementById("userName").innerHTML = req.session.firstName + " " + req.session.lastName;

          const userNameContainer = userDOM.window.document.getElementsByClassName("hero__headings")[0];
          const cardHero = userDOM.window.document.createElement('div');
          cardHero.setAttribute("class", "hero__card");
          cardHero.innerHTML = `
            <p class="hero__card__detail"><b>First:</b><span id="first">${req.session.firstName}</span></p>
            <p class="hero__card__detail"><b>Last:</b><span id="last">${req.session.lastName}</span></p>
            <p class="hero__card__detail"><b>Birth date:</b> <span id="DOB">${req.session.DOB}</span></p>
            <p class="hero__card__detail"><b>Favorite word:</b> <span id="favWord">${req.session.fav_word}</span></p>
            <p class="hero__card__detail"><b>Phone Number:</b> <span id="phone">${req.session.phone}</span></p>
            <p class="hero__card__detail"><b>Email:</b> <span id="email">${req.session.email}</span></p>
          `;
          userNameContainer.appendChild(cardHero);

          const cardContainer = userDOM.window.document.getElementById("cards");
          results.forEach((dish, index) => {
            const card1 = userDOM.window.document.createElement('div');
            card1.setAttribute('class', "content__card c-c${index + 1}");

            card1.innerHTML = `
              <img src="${dish.imgURL}" alt="${dish.name}" class="content__card__img"/>
              <h3 class="content__card__title text-shadow">${dish.name}</h3>
              <div class="content__card__body">
                <h4 class="content__card__title--sub">${dish.location}</h4>
                <p class="content__card__detail">Date Visited: <span class="content__card__detail--color">${dish.date}</span></p>
                <p class="content__card__detail">Phone #: <span class="content__card__detail--color">${dish.phone}</span></p>
              </div>
              <button class="content__card__btn btn">See More <i></i></button>
            `;
            cardContainer.appendChild(card1);

          })
          res.set("Server", "server 1");
          res.set("X-Powered_By", "Yoshi");
          res.send(userDOM.serialize());
        } else {
          // user not found
          return callback(null);
        }
      }
    );
  } else {
    res.redirect("/");
  }
});



app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


app.post("/login", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // gets the name and email from the client
  let results = authenticate(req.body.email, req.body.password, req.body.fav_word, (userRecord) => {

    if (userRecord == null) {
      res.send({
        status: "fail",
        msg: "User account not found."
      });
    } else {
      req.session.loggedIn = true;
      req.session.email = userRecord.email;
      req.session.firstName = userRecord.firstName;
      req.session.lastName = userRecord.lastName;
      req.session.fav_word = userRecord.fav_word;
      req.session.DOB = userRecord.DOB;
      req.session.phone = userRecord.phone;
      req.session.password = userRecord.password;

      res.send({
        status: "success",
        msg: "Logged in."
      });
    }
  })
});

app.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(function (error) {
      if (error) {
        res.status(400).send("Unable to log out")
      } else {
        res.redirect("/");
      }
    });
  }
});

// Go to: http://localhost:8000
let port = 8000;
app.listen(port, init);
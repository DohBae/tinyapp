const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080;

app.set("view engine", "ejs");


// Simulates generation of unique short URL id's
const generateRandomStrings = function() {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  // const alphabetArray = alphabet.split("");
  // const numbersArray = numbers.split("");
  const alphaNumeric = alphabet + numbers;
  let resultArray = [];
  for (let i = 0; i < 6; i++) {
    resultArray.push(alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)]);
  }
  return resultArray.join("");
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true}));
///////////////////////////////////////////////////////////////////////////////////////
// Routes for different pages of the url maker
///////////////////////////////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// passes URL data to template
app.get("/urls", (req, res) => {
  username: req.cookies["username"];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  username: req.cookies["username"];
  res.render("urls_new");
});
// displays a single URL and it's shortened form
app.get("/urls/:id", (req, res) => {
  username: req.cookies["username"];
  const {id} = req.params;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

// saves id and longURL key value pair to urlDatabase
app.post("/urls", (req, res) => {
  const id = generateRandomStrings();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

// Allow us to see the short URL and long URL in the browser
// app.post("/urls", (req, res) => {
//   console.log(req.body); //Log the POST request body to the console
//   res.send("Ok"); //Respond with "OK" (will be replaced)
// });

// redirects short URL to the long URL website
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  console.log(urlDatabase[shortURL]);
  res.redirect(urlDatabase[shortURL]);
});

// edits and replaces long URL
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const longURL = req.body.longURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = longURL;
  }
  res.redirect("/urls");
});

// remove the url when delete button is pressed
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
});

// cookie to remember username for login
app.use(cookieParser());
app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log("Cookies:", req.cookies)
  res.cookie('name', username);
  res.redirect("/urls");
});

///////////////////////////////////////////////////////////////////////////////////////
//
///////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log((`Example app listening on port ${PORT}!`));
});
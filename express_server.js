const express = require("express");
const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

// Simulates generation of unique short URL id's
function generateRandomStrings() {}

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
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});

// Allow us to see the new form in the browser
app.post("/urls", (req, res) => {
  console.log(req.body); //Log the POST request body to the console
  res.send("Ok"); //Respond with "OK" (will be replaced)
});
///////////////////////////////////////////////////////////////////////////////////////
// 
///////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log((`Example app listening on port ${PORT}!`));
});
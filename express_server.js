const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;
const morgan = require("morgan");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


const generateRandomStrings = function() {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const alphaNumeric = alphabet + numbers;
  let resultArray = [];
  for (let i = 0; i < 6; i++) {
    resultArray.push(alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)]);
  }
  return resultArray.join("");
};


const urlDatabase = {
b2xVn2: {
  longURL: "http://www.lighthouselabs.ca",
  userID: "userRandomID",
},
"9sm5xk": {
  longURL: "http://www.google.com",
  userID: "userRandomID",
},  
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "obiwan@gmail.com",
    password: "helloThere"
  },
};

const getUserByEmail = function(userEmail, usersDatabase) {
  for (let user in usersDatabase) {
    if (usersDatabase[user]["email"] === userEmail) {
      return usersDatabase[user];
    }
  }
  return null;
};

const urlsForUser = function (user) {
  let userOnlyUrlDatabase = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === user.id) {
      userOnlyUrlDatabase[url] = urlDatabase[url];
    }
  }
  return userOnlyUrlDatabase;
}
 

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
  const user = users[req.cookies["user_id"]];
  if (user) {
    const userDatabase = urlsForUser(user)
    let templateVars = { urls: userDatabase, user: user };
    // console.log(user.id);
      return res.render("urls_index", templateVars);
    }
    // console.log(urlDatabase)
    res.status(400).send("400 Error: please login or register to view your URLs")
  });

// Old code in case I screw up
// passes URL data to template
// app.get("/urls", (req, res) => {
//   const user = users[req.cookies["user_id"]];
//   let templateVars = { urls: urlDatabase, user: user };
//   res.render("urls_index", templateVars);
// });

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  if (user) {
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

// displays a single URL and it's shortened form
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    const { id } = req.params;
    const longURL = urlDatabase[id].longURL;
    const templateVars = { id, longURL, user };
    res.render("urls_show", templateVars);
  }
  res.status(400).send("400 Error: please login or register to view your URLs")
});

//old code in case i screw up 
// displays a single URL and it's shortened form
// app.get("/urls/:id", (req, res) => {
//   const user = users[req.cookies["user_id"]];
//   const { id } = req.params;
//   const longURL = urlDatabase[id].longURL;
//   const templateVars = { id, longURL, user };
//   res.render("urls_show", templateVars);
// });

// saves id and longURL key value pair to urlDatabase
app.post("/urls", (req, res) => {
  const id = generateRandomStrings();
  const longURL = req.body.longURL;
  console.log("longURL: ",req.body)
  urlDatabase[id] = {
    longURL,
    userID: req.cookies["user_id"]};
  res.redirect("/urls")
});

// redirects short URL to the long URL website
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  
  if (!urlDatabase[shortURL]) {
    res.status(400).send("400 Error: URL doesn't exist")
  }
  res.redirect(urlDatabase[shortURL].longURL);
});

// edits and replaces long URL
app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const { id } = req.params;
  const longURL = req.body.longURL;
  if (user) {
    if (urlDatabase[id].longURL) {
      urlDatabase[id].longURL = longURL;
    }
    res.redirect("/urls");
  }
  res.status(400).send("400 Error: please login to make changes to URLs");
});

// remove the url when delete button is pressed
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const { id } = req.params;
  for (let shortURL in urlDatabase) {
    if (user) {
      if (shortURL === id) {
        delete urlDatabase[shortURL];
      }
      res.redirect("/urls");
    }
  }
  res.status(400).send("400 Error: please login to make changes to URLs");
});

// cookie to remember username for login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (email === "") {
    res.status(403).send("403 Error: email not found");
  }
  if (user.password !== password) {
    res.status(403).send("403 Error: password does not match");
  } 
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

// clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// registration page for users
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user: user };
  if (user) {
    res.redirect("/urls");
  }
  res.render("registration_page", templateVars);//links and displays registration_page.ejs to the browser page
});

// store user data from registratoin
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomStrings();
  
  if (email === "" || password === "") {
    res.status(400).send("400 Error: please enter valid email or password");
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("400 Error: email already registered");
  }
  const user = { id, email, password };
  users[id] = user;
  res.cookie('user_id', id);
  res.redirect("/urls");
});

// login page
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user: user };
  if (user) {
    res.redirect("/urls");
  }
  res.render("user-login", templateVars);//links and displays login_page.ejs to the browser page
});
///////////////////////////////////////////////////////////////////////////////////////
//PART OF THE SERVER
///////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log((`Example app listening on port ${PORT}!`));
});
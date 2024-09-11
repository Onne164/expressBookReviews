const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
      const token = jwt.sign({ username }, 'access_secret_key', { expiresIn: '1h' });
      return res.status(200).json({ message: "Login successful", token });
  } else {
      return res.status(401).json({ message: "Invalid username or password" });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) {
      return res.status(403).json({ message: "Authorization token is missing" });
  }

  jwt.verify(token, 'access_secret_key', (err, user) => {
      if (err) {
          return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
  });
};
// Add a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { review } = req.body;
    const isbn = req.params.isbn;
    const username = req.user.username;

    // Check if the book exists
    if (books[isbn]) {
        // Add or update the review for the book
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully", book: books[isbn] });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

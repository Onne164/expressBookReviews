const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop (local data)
public_users.get('/books', (req, res) => {
  return res.status(200).json(books);
});

// Get the book list available using async-await with Axios (server request)
public_users.get("/server/asynbooks", async function (req, res) {
  try {
    let response = await axios.get("http://localhost:5000/books");  
    console.log(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error getting book list" });
  }
});

// Get book details based on ISBN (local data)
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on ISBN using Promise callbacks with Axios
public_users.get("/server/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/books/${isbn}`)  
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving book details" });
    });
});

// Get book details based on ISBN using async-await with Axios
public_users.get("/async/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    let response = await axios.get(`http://localhost:5000/books/${isbn}`);  
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving book details" });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(book => book.author === author);

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter(book => book.title === title);

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;

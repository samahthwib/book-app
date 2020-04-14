'use strict';

//-----------------APPLICATION-DEPENDINCIES--------------//
//application dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

//get the DB_URL
const client = new pg.Client(process.env.DATABASE_URL);

//initialaization
const PORT = process.env.PORT || 3030;
const app = express();


//use the static files inside the public
app.use(express.static('./public'));

//to get all the data form and send it inside req.body
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//to till the express that I want to use the ejs engine template
app.set('view engine', 'ejs');

// LISTEN ON PORT
client.connect() //this is a promise fn
  .then(() => {
    app.listen(PORT, () =>
      console.log(`listening on ${PORT}`)
    );
  });

//-------------------------ROUTS-----------------------//
app.get('/hello', (req, res) => {
  res.send('HELLO WORLD!');
});

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/search', (req, res) => {
  res.render('pages/searches/new');
});

app.get('/index', (req, res) => {
  res.redirect('/');
});

//To get the data from API
app.post('/searches', getBookData);

//this route to add book to DB
app.post('/books' , addBook) ;

//-------------------------HELPER-FUNCTIONS------------------------//

//This one for SEARCHES
function getBookData(req, res) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search[1]}:${req.body.search[0]}`;
  //console.log(url);
  superagent.get(url)
    .then(results => {
      let theBook = results.body.items.map((bookData) => {
        let book = new Book(bookData.volumeInfo);
        return book;
      });
        // console.log(theBook);
      res.render('pages/searches/show', { books: theBook });

    })
    .catch(error => handleError(error, res));
}

//This one for ADDBOOK
function addBook(req , res){
  let {authors, title, isbn, image, description, bookshelf} = req.body ;
  let SQL = 'INSERT INTO books(authors, title, isbn, image, description, bookshelf) VALUES ($1, $2, $3, $4 ,$5 ,$6);' ;
  let values = [authors, title, isbn, image, description, bookshelf] ;
  return client.query(SQL , values)
    .then(() => {
      return res.redirect('/');
    });
}

//-------------------------CONSTRUCTOR------------------------//

function Book(data) {
  this.id = data.id ;
  this.title = data.title || '';
  this.authors = (data.authors) ? data.authors.join(', ') : 'Not a known author';
  this.description = data.description || 'No description available.';
  this.isbn = data.industryIdentifiers[0].identifier || 'N/A';
  this.image = data.imageLinks.thumbnail.replace('http://', 'https://') || 'https://unmpress.com/sites/default/files/default_images/no_image_book.jpg';
  this.bookshelf = (data.bookshelf && data.bookshelf !== '') ? (data.bookshelf) : ('Not Shelved');
}

//-------------------------ERROR-HANDLER------------------------//
function handleError(error, res) {
  if (res) {
    res.render('pages/error', {
      error: 'An error has occurred, please retry.'
    });
  }
}

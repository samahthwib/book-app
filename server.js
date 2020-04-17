
'use strict';

//-----------------APPLICATION-DEPENDINCIES--------------//
//application dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

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
app.use(methodOverride('_method'));

//to till the express that I want to use the ejs engine template
// app.set('view engine', 'ejs');

// LISTEN ON PORT
client.connect() //this is a promise fn
  .then(() => {
    app.listen(PORT, () =>
      console.log(`listening on ${PORT}`)
    );
  });

//-------------------------ROUTS-----------------------//
//For testing
app.get('/hello', (req, res) => {
  res.send('HELLO WORLD!');
});

//To get data from database
app.get('/', getBooksFromDatabase);

// app.get('/', (req, res) => {
//   res.render('pages/index');
// });

app.get('/search', (req, res) => {
  res.render('pages/searches/new');
});

//return the user to the home page
app.get('/index', (req, res) => {
  res.redirect('/');
});

//To get the data from API
app.post('/searches', getBookData);

//this route to add book to DB
app.post('/books', addBook);



//To show me the details
app.get('/books/:book_id', getBookDetails);

// //To delete any book
app.delete('/delete/:book_id', deleteBook);

//To update any detail
app.put('/update/:book_id', updateBook);
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
function addBook(req, res) {
  console.log('hiiiiiiiiii');
  //  let title = req.body.title;
  //   console.log(title);
  let { authors, title, isbn, image_url, description, bookshelf } = req.body;
  //console.log(authors, title, isbn, image_url, description, bookshelf);
  let SQL = 'INSERT INTO books(authors, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4 ,$5 ,$6);';
  let values = [authors, title, isbn, image_url, description, bookshelf];
  return client.query(SQL, values)
    .then(results => {
      res.redirect('/');
    });

}

function getBooksFromDatabase(req, res) {
  let selectSql = 'SELECT * FROM books;';
  return client.query(selectSql)
    .then(result => {
      res.render('pages/index', { bookResult: result.rows });
    })
    .catch(error => handleError(error, res));
}

function getBookDetails(req, res) {
  console.log('------------------');
  let sql = 'SELECT * FROM books where id=$1 ;';
  let safeValues = [req.params.book_id];
  //console.log(req.params.book_id);
  return client.query(sql, safeValues)
    .then(result => {
      // console.log(result.rows);
      res.render('pages/books/details', { book: result.rows[0] });
    });
}

function deleteBook(req, res) {
  let SQL = 'DELETE FROM books WHERE id=$1';
  let value = [req.params.book_id];
  client.query(SQL, value)
    .then(res.redirect('/'));
}

function updateBook(req, res) {
  // collect the info from the form
  // update the DB
  // resdirect to the same page with the new values
  let { authors, title, isbn, image_url, description, bookshelf } = req.body;
  let SQL = 'UPDATE books SET authors=$1,title=$2,isbn=$3,image_url=$4,description=$5,bookshelf=$6 WHERE id=$7;';
  let values = [authors, title, isbn, image_url, description, bookshelf, req.params.book_id];
  client.query(SQL, values)
    .then(res.redirect(`/books/${req.params.book_id}`));

}

//-------------------------CONSTRUCTOR------------------------//

function Book(data) {
  this.id = data.id;
  this.title = data.title || '';
  this.authors = (data.authors) ? data.authors.join(', ') : 'Not a known author';
  this.description = data.description || 'No description available.';
  this.isbn = data.industryIdentifiers[0].identifier || 'N/A';
  this.image_url = data.imageLinks.thumbnail.replace('http://', 'https://') || 'https://unmpress.com/sites/default/files/default_images/no_image_book.jpg';
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

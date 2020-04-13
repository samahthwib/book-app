
'use-strict';

//application dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');

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

//To test the connection
// app.get('/hello', (req, res) => {
//   res.render('./pages/index');
// });

//routs
app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/search', (req, res) => {
  res.render('pages/searches/new');
});

app.get('/index', (req, res) => {
  res.redirect('/');
});

app.post('/searches', (req, res) => {
  console.log(req.body.search);//will give the result depends on the user input ex: ['science','title']
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  //console.log(url);
  //the url needs q=search+terms so I want to specify the search term and th q has some keywords, intitle for the title and inauthor for the author
  if (req.body.search[1] === 'title') {
    url += `+intitle:${req.body.search[0]}`;
    //console.log(url);
  }
  if (req.body.search[1] === 'author') {
    url += `+inauthor:${req.body.search[0]}`;
    console.log(url);
  }

  console.log(url);
  superagent.get(url)
    .then(data => {
      //console.log(data);
      let book = data.body.items.map((val) => {
        return new Book(val);
      });
      res.render('pages/searches/show', { books: book });
    })
    .catch(errorHandler);
});

//-------------constructor Function--------------//

function Book(data) {
  this.title = data.volumeInfo.title ? data.volumeInfo.title : 'Not Found';
  this.smallThumbnail = data.volumeInfo.imageLinks.smallThumbnail ? data.volumeInfo.imageLinks.smallThumbnail : 'Not Found';
  this.authors = data.volumeInfo.authors[0] ? data.volumeInfo.authors[0] : 'Not Found';
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'Not Found';
}



//listen to server
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

//-------------------Errors---------------------//
app.use('*', (req, res) => {
  res.status(404).send('NOT FOUND');
});


function errorHandler(error, req, res) {
  res.render('pages/error', { error: 'somthing wrong' });
}


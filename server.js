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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//to till the express that I want to use the ejs engine template
app.set('view engine', 'ejs');


app.get('/',(req,res)=>{
  res.render('./pages/index');

});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

app.use('*', (req, res) => {
  res.status(404).send('NOT FOUND');
});



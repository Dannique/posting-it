//jshint esversion:6



// data resets if i reset node app.js and signup again
////////////// SIGN UP, LOG IN THEN MAKE POST IN COMPOSE AND DISPLAYED IN POSTS

///////////////////packages
const express = require("express");
const ejs = require("ejs");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const multerSharpResizer = require("multer-sharp-resizer");
const sharp = require('sharp');

////////////////////required shit
const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({
  extended: true
}));

////////////////////multer = for uploading the image
const storage = multer.memoryStorage();
const upload = multer({
  storage
});

///////////////////costum global vars
const usersData = [];
const posts = [];

// var postings = JSON.parse(require('fs').readFileSync('postings.json', 'utf8'));

// const data = fs.readFileSync('data.json', {
//   encoding: 'utf8',
//   flag: 'r'
// });
//
// console.log(data);



/////////////////uploadMiddleware
// var storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, __dirname + '/public/uploads') //you tell where to upload the files, cb stands for callback
//   },
//   filename: function(req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + '.png') //change name
//   }
// });
//
// var upload = multer({
//   storage: storage,
//   onFileUploadStart: function(file) {
//     console.log(file.originalname + ' is starting ...')
//   },
// });





app.get("/", function(req, res) {

  res.render('home')

});

app.post("/", function(req, res) {



});




app.get('/auth/:method?', function(req, res) {

  if (req.params.method == 'login' || req.params.method == 'signin') {

    res.render('auth', {
      method: 'login'
    });

  } else if (req.params.method == 'signup' || req.params.method == 'register') {

    res.render('auth', {
      method: 'signup'
    });
    // var data = JSON.parse(require('fs').readFileSync('data.json', 'utf8'));
  };

});



app.post('/auth/:method?', function(req, res) {


//////////////////////////////////////////SIGNUP PAGE
  if (req.params.method == 'signup') {


    const password = crypto.createHash('sha256').update(req.body.password).digest('hex');
    const passwordRetype = crypto.createHash('sha256').update(req.body.passwordRetype).digest('hex');

    usersData.push({
      id: Date.now().toString(),
      uName: req.body.uName,
      email: req.body.email,
      password: password,
      passwordRetype: passwordRetype

    });

    if (usersData.password === usersData.passwordRetype) {

      fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(usersData, "", 2));
      // fs.readFileSync(path.resolve(__dirname, 'data.json'));
      res.redirect('/auth/login');
    } else {
      res.redirect('/wrong');
    };

    // var data = JSON.parse(require('fs').readFileSync('data.json', 'utf8'));

    console.log(usersData);

    // var data = JSON.stringify(userInput);
    // console.log(data);
    //     fs.writeFileSync('data.json', data , finished);
    //
    //     function finished(err){
    //       console.log('all set');
    //     }
    //     console.log(data);
    // for (var i = 0; i < usersData.length; i++) {
    //   usersData[i];
    // };

////////////////////////////////////////////// LOGIN PAGE
  } else if (req.params.method == 'login') {


    const uNameLogin = req.body.uNameLogin;
    const passwordLogin = crypto.createHash('sha256').update(req.body.passwordLogin).digest('hex');

    for (var i = 0; i < usersData.length; i++) {
      if (uNameLogin === usersData[i].uName) {
        if (passwordLogin === usersData[i].password) {

          console.log('logged in');
          res.redirect('/compose');
        }
      } else {

        console.log('not logged in');
        res.redirect('/wrong');
      }
    };
  };

});


app.get("/post", function(req, res) {

  res.render('post', {
    content: posts
  })
});



app.get('/compose', function(req, res) {
  res.render('compose', {
    username: usersData
  })
});

app.post('/compose', upload.single('image'), function(req, res) {

  /* IMPORTANT!: click upload image button after you typed the title or text atfter that click the 'POST' button. You go to an TYPE ERROR page, but this means it worked.
  if you go directly to the posts page, it means it didn't work.. don't know how to fix it.*/

  //doesn't work either if you upload the same img with the same name. I need to use multer diskStorage for that

  posts.push({
    title: req.body.titlePost,
    text: req.body.textPost
  });

  fs.writeFileSync(path.resolve(__dirname, 'postings.json'), JSON.stringify(posts, "", 2));
  // res.redirect('/post');
  console.log(posts);

  fs.access('./public/uploads', function(err) {

    if (err) {
      fs.mkdirSync('./public/uploads');
    }
  });


  var image = req.file.buffer ? req.file.buffer : null;

  sharp(image).resize({
    fit: sharp.fit.contain,
    width: 250,
    height: 250
  }).toFile('./public/uploads/' + req.file.originalname);
  // req.file is the `image` file
});

// app.post('/compose', function(req, res) {
//   // const fileInput = req.body.fileUpload;
//   const postInputs = {
//     title: req.body.titlePost,
//     text: req.body.textPost
//   };
//
//   posts.push(postInputs);
//   fs.writeFileSync(path.resolve(__dirname, 'postings.json'), JSON.stringify(posts, "", 2));
//   res.redirect('/post');
//   console.log(postInputs);
// //fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(posts, "", 2));
// });


app.get('/wrong', function(req, res) {
  res.render('wrong')
});




app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const upload = require("express-fileupload");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


  const date = new Date().toLocaleDateString();


const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true}));
app.use(upload());

app.use(express.static("public"));

app.use(session({
  secret : "our little secret" ,
  resave : false ,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-cronus:cronus-123@cluster1.invlznu.mongodb.net/cronusDB");




const pattamSchema = new mongoose.Schema({

      name: String,
    latitude: String,
    longitude: String,
    pattamdetails: String,
    pattamamount: String,
    pattamimg: {
      data: Buffer,
      contenttype: String
    }

});

const Pattam = mongoose.model("Pattam", pattamSchema);

const itemsSchema = new mongoose.Schema({

      name: String,
    quantity: String,
    specifications: String,
    description: String,
    amount: String,
    itemimg: {
      data: Buffer,
      contenttype: String
    }

});
const Item = mongoose.model("Item", itemsSchema);

const messageSchema = new mongoose.Schema({
  data: String,
  time: String,
  user: String
});

const Message =  mongoose.model("Message", messageSchema);



const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  farmer: String,
  dob: String,
  phone: String,
  pattam  : [pattamSchema],
  items: [itemsSchema],
  messages: [messageSchema]


});

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const admSchema = new mongoose.Schema({
  username: String,
  password: String,
  donation: {
    accountnumber: String,
    ifsc: String,
    name: String,
    others: String
  }
});



const Adm = mongoose.model("Adm", admSchema);

const postSchema = new mongoose.Schema({
  title : String,
  content : String
});

const Post = mongoose.model("Post" , postSchema);









app.get("/", function(req,res){





  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/logout", function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }
  });
  res.redirect("/");
});

app.get("/farmersPage", function(req,res){
  if(req.isAuthenticated()){


res.render("farmersPage");



};



});



app.get("/usersPage", function(req,res){
  if(req.isAuthenticated()){
      res.render("usersPage");

  }
  else{
    res.redirect("/register");
  }

}
);


app.get("/pattam", function(req,res){
  if(req.isAuthenticated()){


User.findById(req.user._id, function (err, founduser) {



    res.render("pattam", { pattams : founduser.pattam });

})



  }
  else{
    res.redirect("/register");
  }
  }


);



app.get("/pattam/:pattamname", function(req, res){

  if(req.isAuthenticated()){

    const requestedPattamId = req.params.pattamname;




  User.findById(req.user._id, function (err, founduser) {

    const users = founduser.pattam;

    users.forEach(function(user){
      if(requestedPattamId === user.name){
        res.render("singlePattam", {foundsingle: user});
      }


   });
});

}else{
  res.redirect("/register");
}
});


app.get("/pattams/:pattamname", function(req, res){

  if(req.isAuthenticated()){

    const requestedPattamId = req.params.pattamname;






Pattam.findOne({ name: requestedPattamId }, function (err, singlepattam) {
  res.render("singlePattam", {foundsingle: singlepattam});
});


}else{
  res.redirect("/register");
}
});




app.get("/location", function(req,res){
 res.sendFile(__dirname + "/location.html");
});


app.get("/pattams", function(req,res){
Pattam.find({}, function(err,pattams){
res.render("pattams", {pattams: pattams})
});


});

app.get("/marketSelling", function(req,res){
  if(req.isAuthenticated()){


User.findById(req.user._id, function (err, founduser) {



    res.render("marketSelling", { items : founduser.items });

});



  }
  else{
    res.redirect("/register");
  }

});

app.get("/marketSelling/:itemname", function(req, res){

  if(req.isAuthenticated()){

    const requestedPattamId = req.params.itemname;




  User.findById(req.user._id, function (err, founduser) {

    const users = founduser.items;

    users.forEach(function(user){
      if(requestedPattamId === user.name){
        res.render("singleitem", {foundsingle: user});
      }


   });
});

}else{
  res.redirect("/register");
}
});



app.get("/marketBuying", function(req,res){
  if(req.isAuthenticated()){

  Item.find({}, function(err,items){
  res.render("marketBuying", {items: items})

})

}else{
  res.redirect("/register");
}

});

app.get("/marketBuying/:itemname", function(req, res){


    if(req.isAuthenticated()){

      const requestedPattamId = req.params.itemname;






  Item.findOne({ name: requestedPattamId }, function (err, singleitem) {
    res.render("singleitem", {foundsingle: singleitem});
  });


}else{
  res.redirect("/register");
}
});



app.get("/adminlogin", function(req,res){
  res.render("adminlogin");

});

app.get("/govtin", function(req,res){

    if(req.isAuthenticated()){
  Post.find({}, function(err,post){
    res.render("govtin", {posts: post});
  });

}else{
  res.redirect("/register");
}
});

app.get("/govtin/:govtId", function(req, res){
    if(req.isAuthenticated()){
  const requestedPostId = req.params.govtId;

  Post.findOne({_id: requestedPostId}, function(err, post){


     res.render("post", {

       title: post.title,

       content: post.content

     });

   });
 }else{
   res.redirect("/register");
 }
});

app.get("/govt", function(req,res){
  res.render("govt")
});


app.get("/donationinfo", function(req,res){

  Adm.findOne({ username: 'admin' }, function (err, admin) {
    res.render("donationinfo", {donation: admin.donation})

  });

});

app.get("/donation", function(req,res){

    if(req.isAuthenticated()){

  Adm.findOne({ username: 'admin' }, function (err, admin) {
    res.render("donation", {donation: admin.donation})

  });
}else{
  res.redirect("/register");
}
});

app.get("/community", function(req,res){
    if(req.isAuthenticated()){

    Message.find({}, function(err,msg){
      if(msg){
        res.render("community", {messages: msg})
      }else{
        console.log(err);
      }
    })



}else{
  res.redirect("/register");
}
});


app.post("/register", function(req,res){

  const farmerOrNot = req.body.radio;


    User.register({username: req.body.username},
    req.body.password, function(err,user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }else{
        passport.authenticate("local")(req, res, function(){
   User.findByIdAndUpdate(req.user._id, { farmer: farmerOrNot, dob: req.body.DOB, phone: req.body.phone }, function(err){
     if(err){
       console.log(err);
     }
   });

   if(farmerOrNot === "yes"){
     res.redirect("/farmersPage");
   }else{
     res.redirect("/usersPage");
   }

        });
      }
    });



  });




app.post("/login", function(req,res){

  const username = req.body.username;
  const password = req.body.password;




  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res, function(){
      User.findById(req.user._id, function(err, user) {
        if(user.farmer === "yes"){
          res.redirect("/farmersPage");
        }else{
          res.redirect("/usersPage");
        }
      });
      });
    }
  });


});

app.post("/pattam", function(req,res){



   const pattamimg = req.files.pattamimg;
   const pattamimgname = pattamimg.name;

   pattamimg.mv("public/uploads/" + pattamimgname, function(err){
     if(err){
       console.log(err);
     }else{
       res.redirect("/pattam")
     }
   });

   const pattamenterd = {

     name: req.body.pattamname,
     latitude: req.body.latitude,
  longitude: req.body.longitude,
    pattamdetails: req.body.pattamdetails,
   pattamamount: req.body.pattamamount,
    pattamimg: {
       data: req.files.pattamimg.name,
       contenttype: "image/png/jpeg"
    }}



User.findOne({username: req.user.username}, function(err, foundpattam){
foundpattam.pattam.push(pattamenterd);
foundpattam.save();

});

const pattam = new Pattam({
  name: req.body.pattamname,
  latitude: req.body.latitude,
longitude: req.body.longitude,
 pattamdetails: req.body.pattamdetails,
pattamamount: req.body.pattamamount,
 pattamimg: {
    data: req.files.pattamimg.name,
    contenttype: "image/png/jpeg"
 }


});

pattam.save();





});

app.post("/marketSelling", function(req,res){

     const itemimg = req.files.itemimg;
     const itemimgname = itemimg.name;

     itemimg.mv("public/uploads/" + itemimgname, function(err){
       if(err){
         console.log(err);
       }else{
         res.redirect("/marketselling")
       }
     });

     const itementerd = {

       name: req.body.itemname,
       quantity: req.body.quantity,
    specifications: req.body.specifications,
      description: req.body.description,
     amount: req.body.amount,
      itemimg: {
         data: req.files.itemimg.name,
         contenttype: "image/png/jpeg"
      }}



  User.findOne({username: req.user.username}, function(err, founditem){
  founditem.items.push(itementerd);
  founditem.save();

  });

  const item = new Item({
    name: req.body.itemname,
    quantity: req.body.quantity,
 specifications: req.body.specifications,
   description: req.body.description,
  amount: req.body.amount,
   itemimg: {
      data: req.files.itemimg.name,
      contenttype: "image/png/jpeg"
   }

  });

  item.save();





});

app.post("/adminlogin", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  Adm.findOne({username: username}, function(err,admin){
    if(admin.password === password){
      res.render("admPage");
    }
  });

});

app.post("/govt", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });



  post.save();

  res.redirect("/govt");

});

app.post("/donationinfo", function(req,res){

  Adm.findOneAndUpdate({username: "admin"}, { donation: {
    accountnumber: req.body.accountnumber,
    ifsc: req.body.ifsc,
    name: req.body.name,
    others: req.body.other
  }  }, function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/donationinfo");
    }
  });

});

app.post("/community", function(req,res){

const newmsg = {
  data: req.body.data,
  time: date,
  user: req.user.username

}




User.findOne({username: req.user.username}, function(err, founduser){
founduser.messages.push(newmsg);
founduser.save();

});

const msg = new Message({
  data: req.body.data,
  time: date,
  user: req.user.username

});

msg.save();
res.redirect("/community");


});





app.listen(3000,function(){
  console.log("server started");
});

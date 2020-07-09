
var express=require("express");
var app=express();
var bodyParser = require("body-parser");
var mongoose=require("mongoose");
const request = require("request");
var Camp=require("./models/camp");
var Comment=require("./models/comment");
var User=require("./models/user");
var passport=require("passport"),
	LocalStrategy=require("passport-local"),
	flash=require("connect-flash");


// mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect("mongodb+srv://khaled:vdhgl]vd]1902@cluster0-5yieo.mongodb.net/test?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});




app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// seedDB();
app.use(flash());
// PASSPORT CONFIGURATION
app.use(require("express-session")({
		secret:"khaled is the best programmer",
		resave:false,
		saveUninitialized: false
		}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dk2s9wdyc', 
  api_key: "722642847521728", 
  api_secret: "p_0_IvRliQ4fD7Ip5lkDccUyg0A"
});



app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error = req.flash("error");
   	res.locals.success = req.flash("success");
	next();
});


app.get("/",function(req,res){
	
	res.render("landing");
	
})

app.get("/camps",function(req,res){
	
	Camp.find({},function(err,camps){
		
		if(!err){
		res.render("camps",{camps:camps});
		}
		else
			{
				console.log("problem var");
			}
	});
	
	
});

app.get("/camps/new",isLoggedIn,function(req,res){
	
	res.render("new");
	
});

app.get("/camp/:id",function(req,res){
	
	
	 Camp.findById(req.params.id).populate("comments").exec(function(err, camp){
		if(!err)
			{
				res.render("show",{camp:camp});
			}
		
	});
	
})

app.get("/signup",function(req,res){
	if(!req.user)
	res.render("signup");
	else
		{
		req.flash("error","you already have an account");
		res.redirect("/camps");
		}
});

app.get("/login",isLoggedIn,function(req,res){
	
	res.redirect("/camps");
});

app.post("/login", passport.authenticate("local",{
	
	successRedirect: "/camps",
	
	failureRedirect: "/login",
}),function(req,res){
	
	
});



app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
			req.flash("error","you can't sign up with this information");
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function(){
			req.flash("success","you signed up successfully");
           res.redirect("/camps"); 
        });
    });
});

app.post("/camps", isLoggedIn,upload.single('image'), function(req, res){
    // get data from form and add to campgrounds array
	cloudinary.uploader.upload(req.file.path, function(result) {
    var name = req.body.camp["name"],
		image=result.secure_url;
		des=req.body.camp["description"],
		
		user={
			id:req.user._id,
			username:req.user.username
		};
	var newCampground ={name:name,img:image,description:des,user:user};
		console.log(des);
		console.log(newCampground);
    Camp.create(newCampground,function(err,camp){
		
		if(!err)
			{
				console.log("new camp inserted successfully");
			}
		else{
			console.log("can't add a camp");
		}
			
	});
    //redirect back to campgrounds page
    res.redirect("/camps");
})});

app.get("/camp/update/comment/:id",isLoggedIn,function(req,res){
	
	Comment.findById(req.params.id,function(err,comment){
		if(!err)
			{
				if(comment.user.id.equals(req.user._id)){
					
					res.render("updateComment",{comment:comment});
				}
				else 
					{
						console.log("u didn't write this commen")
						res.redirect("back");
					}
			}
		
		
		
	})
	
	
});
app.post("/comment/:id/update",isLoggedIn,function(req,res){
	Comment.findByIdAndUpdate(req.params.id,req.body.comment,function(err,comment){
		if(err)
			{
				res.redirect("/camps");
			}
		else
			{
				console.log("it worked");
				res.redirect("/camps");
			}
		
	})
	
	
});

app.get("/camp/delete/comment/:id",isLoggedIn,function(req,res){
	
	Comment.findById(req.params.id,function(err,comment){
		if(!err)
			{
				if(comment.user.id.equals(req.user._id)){
					
					comment.remove();
					res.redirect("back");
				}
				else 
					{
						console.log("u didn't write this commen")
						res.redirect("back");
					}
			}
		
		
		
	})
	
	
});

app.post("/camp/:id/comments",isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
	Camp.findById(req.params.id,function(err,camp){
		if(!err){
			 var text = req.body.comment["text"];
			var user={ id:req.user._id, username:req.user.username };
			var newComment={text:text,user:user};	
			
    		Comment.create(newComment,function(err,comment){
		
			if(!err)
			{	
				
				comment.save()
				camp.comments.push(comment);
				
				camp.save();
			}
			else{
			console.log("can't add a comment");
			}
			
			}); 
		}
		else 
			console.log(err);
		
	});
   
    //redirect back to campgrounds page
	var url="/camp/"+req.params.id;
    res.redirect(url);
});

app.get("/camp/update/:id", isLoggedIn, function(req,res){
	Camp.findById(req.params.id,function(err,camp){
		if(!err){
			if(camp.user.id.equals(req.user._id)){
				
				res.render("update",{camp:camp});
			}
			else
				res.redirect("back");
			
		}
			
		else 
			console.log(err);
		
	});
});

app.get("/camp/:id/comments/new",function(req,res){
	Camp.findById(req.params.id,function(err,camp){
		if(!err)
			res.render("Newcomment",{camp:camp});
		else 
			console.log(err);
		
	});
});	
	
app.get("/camp/delete/:id",function(req,res){
	Camp.findById(req.params.id,function(err,camp){
		if(!err)
			{
			if(camp.user.id.equals(req.user._id)){
				camp.remove();
				res.redirect("/camps");
			}
				else
					{
						console.log("this is not ur camp");
						res.redirect("back");
					}
			}
		else 
			{
			console.log(err);
			res.redirect("/camps");
			}
		
	});
});	
app.post("/camp/update/:id",isLoggedIn,function(req,res){
	Camp.findByIdAndUpdate(req.params.id,req.body.camp,function(err,camp){
		if(!err)
			res.redirect("/camps");
		else 
			console.log(err);
		
	});
	
	
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.render("login");
}

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

// app.listen(process.env.PORT, process.env.IP, function(){
//    console.log("The YelpCamp Server Has Started!");
// });


app.listen(3000,function(){
	
	console.log("yelpcam has started");
});
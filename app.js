
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

// var express     = require("express"),
//     app         = express(),
//     bodyParser  = require("body-parser"),
//     mongoose    = require("mongoose"),
//     passport    = require("passport"),
//     LocalStrategy = require("passport-local"),
//     Campground  = require("./models/camp"),
//     Comment     = require("./models/comment"),
//     User        = require("./models/user");
//     // seedDB      = require("./seeds")
    

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(express.static(__dirname + "/public"));
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



app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error = req.flash("error");
   	res.locals.success = req.flash("success");
	next();
});





// seedDB = require("./seeds");
// seedDB();


// Camp.update({name:"khaled"},{$set:{img:"https://media.istockphoto.com/photos/colorful-landscape-with-high-himalayan-mountains-beautiful-curving-picture-id968630976?k=6&m=968630976&s=612x612&w=0&h=YTO-4FYXUXpBa0ABfmypqOxc-jeEkvfiF875J4H6E6E="}},function(err,camp){
// 	if(!err){
// 		console.log("updated successfully");
// 	}
// })

// app.use(bodyParser.urlencoded({extended: true}));
// Camp.create({
// 	name:"khaled",
// 	img:"https://media.istockphoto.com/photos/holding-up-photos-of-the-leaning-tower-of-pisa-	picture-id932767686?k=6&m=932767686&s=612x612&w=0&h=Z0Z0-m6kXQDwAevCNHRXkDqqEzUvjaBHmVzh29yHsLA="},
// 			{
// 	name:"ahmad",
// 	img:"https://media.istockphoto.com/photos/happy-smiling-woman-looks-out-from-window-traveling-by-train-on-most-picture-id952716620?k=6&m=952716620&s=612x612&w=0&h=EbkMuef2Szx40moYM_C-48zV9rgLFjuHxqSoMKVQ0f4="},
// 			{
// 	name:"salem",
// 	img:"https://media.istockphoto.com/photos/middleaged-man-and-his-companion-handsome-blond-lady-on-a-boat-ride-picture-id647424102?k=6&m=647424102&s=612x612&w=0&h=oX5DuW155N9_khlAKz7ITSSxiId1jOro_77vX9Ux940="},function(err,Camp){
	
// 	if(err){
// 		console.log("sth went wrong");
// 	}
// 	else{
// 		console.log("3 camps are created");
// 	}
// }
// 		   );

		  
// app.set("view engine","ejs");
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

app.post("/camps", isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.camp["name"],
		image=req.body.camp["img"],
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
});

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




app.listen(3000,function(){
	
	console.log("yelpcam has started");
});
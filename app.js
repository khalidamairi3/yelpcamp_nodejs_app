var express=require("express");
var app=express();
var mongoose=require("mongoose");
const request = require('request');
var bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/yelp_camp");


var Camp=require("./models/camp");
var Comment=require("./models/Comment");
// seedDB = require("./seeds");
// seedDB();


// Camp.update({name:"khaled"},{$set:{img:"https://media.istockphoto.com/photos/colorful-landscape-with-high-himalayan-mountains-beautiful-curving-picture-id968630976?k=6&m=968630976&s=612x612&w=0&h=YTO-4FYXUXpBa0ABfmypqOxc-jeEkvfiF875J4H6E6E="}},function(err,camp){
// 	if(!err){
// 		console.log("updated successfully");
// 	}
// })

app.use(bodyParser.urlencoded({extended: true}));
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

		  
app.set("view engine","ejs");
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

app.get("/camps/new",function(req,res){
	
	res.render("new");
	
});

app.get("/show/:id",function(req,res){
	
	var id=req.params.id;
	
	Camp.findById(id,function(err,camp){
		if(!err)
			{
				res.render("show",{camp:camp});
			}
		
	});
	
})

app.post("/camps", function(req, res){
    // get data from form and add to campgrounds array
    var newCampground = req.body.camp;
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




app.listen(3000,function(){
	
	console.log("yelpcam has started");
})
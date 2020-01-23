var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var user_schema = new mongoose.Schema({
	Password : String,
	username:String,
	

});
user_schema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",user_schema);
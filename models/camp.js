var mongoose=require("mongoose");

var camp_schema = new mongoose.Schema({
	name : String,
	img:String,
	description: String,

});

module.exports=mongoose.model("Camp",camp_schema);
var mongoose=require("mongoose");

var comment_schema = new mongoose.Schema({
	author : String,
	body :String
	
});

module.exports=mongoose.model("Comment",comment_schema);
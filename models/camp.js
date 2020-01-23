var mongoose=require("mongoose");

var camp_schema = new mongoose.Schema({
	name : String,
	img:String,
	description: String,
	user:{
	
	id:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
		username:String
	},
	comments:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
}]

});

module.exports=mongoose.model("Camp",camp_schema);
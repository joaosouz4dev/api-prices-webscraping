const mongoose = require("../database");

const StoreSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true,
	},
	createAt: {
		type: Date,
		default: Date.now,
	},
});

const store = mongoose.model("Stores", StoreSchema);
module.exports = store;

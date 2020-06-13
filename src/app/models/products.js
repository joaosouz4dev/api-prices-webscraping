const mongoosePaginate = require("mongoose-paginate");
const mongoose = require("../database");

const ProductsSchema = new mongoose.Schema({
	title: {
		type: String,
		require: true,
	},
	specs: {
		type: String,
		require: true,
	},
	description: [
		{
			text: {
				type: String,
			},
			iframe: {
				type: String,
			},
		},
	],
	allprices: [
		{
			image: { type: String, require: true },
			storeTitle: { type: String, require: true },
			storeUrl: { type: String, require: true },
			price: { type: String, require: true },
		},
	],

	createAt: {
		type: Date,
		default: Date.now,
	},
});

ProductsSchema.plugin(mongoosePaginate);

const products = mongoose.model("Products", ProductsSchema);
module.exports = products;

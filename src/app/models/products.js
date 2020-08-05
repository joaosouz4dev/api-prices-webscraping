const mongoosePaginate = require("mongoose-paginate");
const mongoose = require("../database");

const ProductsSchema = new mongoose.Schema({
	title: {
		type: String,
		require: true,
	},
	link: {
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
			html: {
				type: String,
			},
		},
	],
	price: {
		type: String,
		require: true,
	},
	imgs: [{ url: { type: String } }],
	updateAt: {
		type: Date,
	},

	createAt: {
		type: Date,
		default: Date.now,
	},
});

ProductsSchema.plugin(mongoosePaginate);

const products = mongoose.model("Products", ProductsSchema);
module.exports = products;

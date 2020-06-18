/* eslint-disable radix */
const express = require("express");
const Products = require("../models/products");
const getInfos = require("../Utils");

const router = express.Router();

function days_between(date1, date2) {
	// The number of milliseconds in one day
	const ONE_DAY = 1000 * 60 * 60 * 24;

	// Calculate the difference in milliseconds
	const differenceMs = Math.abs(date1 - date2);

	// Convert back to days and return
	return Math.round(differenceMs / ONE_DAY);
}

async function updateProduct(name, id) {
	console.log("[!] Update product ->", name);
	const { allprices } = await getInfos(name, false);
	let updateAt = new Date();
	let updatedProduct = await Products.findByIdAndUpdate(id, {
		allprices,
		updateAt,
	});

	return updatedProduct;
}

router.get("/", async (req, res) => {
	try {
		const { name } = req.query;
		console.log(name);
		const docs = await Products.find({
			title: {
				$regex: new RegExp(name, "ig"),
			},
		});

		if (docs.length > 0) {
			let { updateAt, _id } = docs[0];
			let dt = new Date();
			let days = days_between(dt, updateAt);
			console.log("days ->", days);

			if (days >= 0) {
				let updatedProduct = await updateProduct(name, _id);
				return res.status(200).send({ updatedProduct });
			}

			return res.status(200).send({ docs });
		}

		const { title, description, specs, allprices } = await getInfos(name);

		const newProduct = await Products.create({
			title,
			description,
			specs,
			allprices,
			updateAt: new Date(),
		});

		return res.json(newProduct);
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			error: "product not found",
			message:
				"Tente especificar mais detalhes: Galaxy S7 Edge, ao inves de Galaxy S7",
		});
	}
});

module.exports = (app) => app.use("/product", router);

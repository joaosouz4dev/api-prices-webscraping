/* eslint-disable radix */
const express = require("express");
const Products = require("../models/products");
const getInfosMagazine = require("../Utils/magazine");

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
	const { ...data } = await getInfosMagazine(name);
	let updateAt = new Date();
	let updatedProduct = await Products.findByIdAndUpdate(id, {
		...data,
		updateAt,
	});

	return updatedProduct;
}

function compareDate(date) {
	let dt = new Date();
	let days = days_between(dt, date);
	console.log("days ->", days);

	if (days >= 5) {
		return true;
	}

	return false;
}

let verifyProductInBd = async (name, res) => {
	let docs = await Products.find({
		title: {
			$regex: new RegExp(name, "ig"),
		},
	});

	if (docs.length > 0) {
		let { updateAt, _id } = docs[0];
		if (compareDate(updateAt)) {
			let updatedProduct = await updateProduct(name, _id);
			// return res.status(200).send({ updatedProduct });
			return { flag: true, docs: updatedProduct };
		}
		// return res.status(200).send({ docs });
		return { flag: true, docs };
	}

	return { flag: false };
};

router.get("/", async (req, res) => {
	try {
		const { name } = req.query;
		console.log(name);

		let { flag, docs = null } = await verifyProductInBd(name, res);

		if (flag) {
			return res.status(200).send({ docs });
		}

		const { ...data } = await getInfosMagazine(name);

		let { title } = data;

		flag = undefined;

		//caso o usuario insira um nome errado: iphhone X, mas o site responde iphone X, ai ele verifica no banco de novo
		let obj = await verifyProductInBd(title, res);

		if (obj.flag) {
			return res.status(200).send({ docs: obj.docs });
		}

		const newProduct = await Products.create({
			...data,
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

router.get("/all", async (req, res) => {
	let docs = await Products.find({});
	return res.json(docs);
});

module.exports = (app) => app.use("/magazine", router);

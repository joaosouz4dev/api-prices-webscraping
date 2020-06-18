// inicia as rotas
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors"); // permitir acesso de determinado dominio

const allRoutes = require("express-list-endpoints"); // testes

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

require("./app/controllers/productsController")(app);

app.get("/", (req, res) => {
	res.json({ sucess: true });
});
const porta = process.env.PORT || 3001;
console.log(`[D]Porta: ${porta}`);
app.listen(porta);

console.log("All routes:");
console.log(allRoutes(app));

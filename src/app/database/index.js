// conexao com o banco de dados
const mongoose = require("mongoose");

// mongoose.connect('mongodb://matheus:muhnabanco@10.1.21.184/noderest', {
//     useNewUrlParser: true
// })

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);

mongoose.connection.on("connected", () => {
	console.log(
		`[D] Conectado ao banco de dados, url:${mongoose.connection.client.s.url}`
	);
});
mongoose.connection.on("error", (err) => {
	console.log(`[D] Erro na conexao: ${err}`);
});
mongoose.connection.on("disconnect", () => {
	console.log("[D] Desconectado do banco de dados");
});

module.exports = mongoose;

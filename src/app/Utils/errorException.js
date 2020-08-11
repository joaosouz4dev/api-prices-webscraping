module.exports = function createCustomError(message, store) {
	this.message = message;
	this.store = store;
};

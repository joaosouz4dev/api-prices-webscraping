function days_between(date1, date2) {
	// The number of milliseconds in one day
	const ONE_DAY = 1000 * 60 * 60 * 24;

	// Calculate the difference in milliseconds
	const differenceMs = Math.abs(date1 - date2);

	// Convert back to days and return
	return Math.round(differenceMs / ONE_DAY);
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

module.exports = compareDate;

function yesterdayDate() {
	const today = new Date();
	return new Date(today.setDate(today.getDate() - 1));
}

function dateToISOString(date: Date) {
	return date.toISOString().split(".")[0] + "Z";
}

// Formato corretto YYYY-MM-DD HH:mm:ss oppure YYYY-MM-DDTHH:mm:ss;
// oppue: ^(([0]?[1-9]|1[0-2])\/([0-2]?[0-9]|3[0-1])\/[1-2]\d{3}) (20|21|22|23|[0-1]?\d{1}):([0-5]?\d{1})$
function isValidDateTime(date: string): boolean {
	return date &&
		/\d{4}-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/gm.test(date)
		? true
		: false;
}

function isValidDate(date: string): boolean {
	return date && /\d{4}-[01]\d-[0-3]\d$/gm.test(date) ? true : false;
}

export { yesterdayDate, dateToISOString, isValidDateTime, isValidDate };

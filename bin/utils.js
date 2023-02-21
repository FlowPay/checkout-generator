import { basename, dirname, join } from "node:path";
import { existsSync } from "node:fs";

function buildNewFileName(path, nameToAdd) {
	let filename = basename(path, ".csv");
	filename = `${filename} ${nameToAdd}.csv`;

	const dir = dirname(path);
	const newPath = join(dir, filename);

	if (existsSync(newPath)) {
		return buildNewFileName(newPath, nameToAdd);
	}

	return newPath;
}

function currencyToFloat(value) {
	if (!value) throw "Value is undefined";

	// rimuovo eventuali spazi bianchi
	value = value.replace(/\s/g, "");

	const regexCurrency = /€|\$|£/gi;
	if (regexCurrency.test(value)) {
		value = value.replace(regexCurrency, "");
	}

	// questa regex ottiene le migliai e decimali
	const decimalRegex =
		/^((?=.*[1-9]|0)(?:\d{1,3}))((?=.*\d)(?:\.\d{3})?)*((?=.*\d)(?:\,\d\d){1}?){0,1}$/gm;
	if (decimalRegex.test(value)) {
		value = value
			.replace(".", "") // rimuovo punteggiatura per migliaia
			.replace(",", "."); // converto in decimali
	}

	return parseFloat(value);
}

function yesterdayDate() {
	const today = new Date();
	return new Date(today.setDate(today.getDate() - 1));
	// const yesterdayISO = new Date(yesterday).toISOString().split(".")[0] + "Z"; // ISO string withou milliseconds
	// return yesterdayISO;
}

function dateToISOString(date) {
	return date.toISOString().split(".")[0] + "Z";
}

function replaceDataInArray(data, array) {
	const index = array.indexOf(data);
	array[index] = data;
	return array;
}

function someValues(obj) {
	return Object.values(obj).some((m) => m);
}

// if (
// 	data.expire_date &&
// 	!/\d{4}-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/gm.test(
// 		data.expire_date
// 	)
// ) {
// 	throw "Errore! Il formato della data non è corretto. Formato corretto YYYY-MM-DD HH:mm:ss oppure YYYY-MM-DDTHH:mm:ss";
// }

export {
	buildNewFileName,
	currencyToFloat,
	yesterdayDate,
	dateToISOString,
	replaceDataInArray,
	someValues,
};

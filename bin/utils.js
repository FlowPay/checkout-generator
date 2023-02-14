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

function yesterdayISOString() {
	const today = new Date();
	const yesterday = today.setDate(today.getDate() - 1);
	const yesterdayISO = new Date(yesterday).toISOString().split(".")[0] + "Z"; // ISO string withou milliseconds
	return yesterdayISO;
}

export { buildNewFileName, currencyToFloat, yesterdayISOString };

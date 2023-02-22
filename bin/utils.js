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

function isInt(n) {
	return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
	return Number(n) === n && n % 1 !== 0;
}

function currencyToFloat(value) {
	if (!value) throw "Value is undefined";

	if (isInt(value) || isFloat(value)) return value;

	// rimuovo eventuali spazi bianchi
	value = value.replace(/[^0-9\,\.]/g, "");

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

function mapMerge(fromJson, fromOption) {
	let newMap = Object.assign({}, fromJson);

	for (const [key, value] of Object.entries(fromOption)) {
		if (value) newMap[key] = value;
	}

	return newMap;
}

function mapTo(array, map) {
	return array.map((a) => {
		let o = Object.assign({}, a);
		for (const [key, value] of Object.entries(map)) {
			if (!a.hasOwnProperty(value)) continue;
			o[key] = a[value];
			delete o[value];
		}
		return o;
	});
}

function mapFrom(array, map) {
	return array.map((a) => {
		let o = Object.assign({}, a);
		for (const [key, value] of Object.entries(map)) {
			if (!a.hasOwnProperty(key)) continue;
			o[value] = a[key];
			delete o[key];
		}
		return o;
	});
}

function fromArrayToObject(row, columns) {
	return row.map((r) =>
		columns.reduce((o, key, i) => ({ ...o, [key]: r[i] }), {})
	);
}

function buildContentCsv(array, columns) {
	const keys = Object.keys(array[0]).sort((a, b) => sortFrom(a, b, columns));
	const content = [keys, ...array.map((v) => keys.map((k) => v[k]))];

	return `${content.map((m) => m.join(";")).join("\r\n")}`;
}

function sortFrom(a, b, arr) {
	return arr.indexOf(a) - arr.indexOf(b);
}

// Formato corretto YYYY-MM-DD HH:mm:ss oppure YYYY-MM-DDTHH:mm:ss;
// oppue: ^(([0]?[1-9]|1[0-2])\/([0-2]?[0-9]|3[0-1])\/[1-2]\d{3}) (20|21|22|23|[0-1]?\d{1}):([0-5]?\d{1})$
function isValidDateTime(date) {
	return (
		date && /\d{4}-[01]\d-[0-3]\d$/gm.test(date)
		// /\d{4}-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/gm.test(date)
	);
}

function assertScript(data, i) {
	if (!data.creditor_iban || !data.hasOwnProperty("creditor_iban"))
		throw `Errore! creditor_iban è undefined nella riga ${i}`;

	if (!data.vat_code || !data.hasOwnProperty("vat_code"))
		throw `Errore! vat_code è undefined nella riga ${i}`;

	if (!data.amount || !data.hasOwnProperty("amount"))
		throw `Errore! amount è undefined nella riga ${i}`;

	if (!data.remittance || !data.hasOwnProperty("remittance"))
		throw `Errore! remittance è undefined nella riga ${i}`;

	if (!data.expire_date || !data.hasOwnProperty("expire_date"))
		throw `Errore! expire_date è undefined nella riga ${i}`;
}

function assertConfig(config) {
	if (!config.clientId || !config.clientSecret)
		throw "Attenzione! Non ho il client id o il client secret";

	if (!existsSync(config.csvPath))
		throw `Errore! Non esiste il file nel path ${config.csvPath}`;

	if (!/^.*\.(csv)$/gi.test(config.csvPathOutput))
		throw `Errore! Il file di output impostato o generato non è valido: ${config.csvPathOutput}`;

	if (!/^.*\.(csv)$/gi.test(config.csvPath))
		throw "Errore! Il file richiesto non è supportato, deve essere un csv.";

	if (
		config.mapPath &&
		(!existsSync(config.mapPath) || !/^.*\.(json)$/gi.test(config.mapPath))
	)
		throw 'Errore! Il file richiesto non esiste o non è supportato, deve essere un "json".';

	if (
		config.scriptPath &&
		(!existsSync(config.scriptPath) ||
			!/^.*\.(mjs)$/gi.test(config.scriptPath))
	)
		throw 'Errore! Il file richiesto non esiste o non è supportato, deve essere uno script in "mjs".';
}

export {
	buildNewFileName,
	currencyToFloat,
	yesterdayDate,
	dateToISOString,
	replaceDataInArray,
	someValues,
	mapMerge,
	mapTo,
	mapFrom,
	sortFrom,
	fromArrayToObject,
	buildContentCsv,
	isValidDateTime,
	assertScript,
	assertConfig,
};

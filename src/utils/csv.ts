import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export function removeEmptyRows(rows: string[]) {
	return rows.filter((r) => /[^;]/gi.test(r));
}

export function csvExtract(path: string) {
	const rawFile = readFileSync(path, { encoding: "utf-8" });
	let rows = rawFile.split(/\r?\n/);
	rows = removeEmptyRows(rows); // rimuovo righe vuote
	const columnNames = rows.splice(0, 1)[0].split(";"); // ottieni intestazione colonne
	const rowDatas = rows.map((row) => row.split(";")); // ottieni dati per riga
	const datas = fromArrayToObject(rowDatas, columnNames); // genera un array di oggetti da nome colonna
	return { columnNames, rowDatas, datas };
}

export function fromArrayToObject(row: string[][], columns: string[]) {
	return row.map((r) =>
		columns.reduce((o, key, i) => ({ ...o, [key]: r[i] }), {}),
	);
}

export function buildNewFileName(
	path: string | undefined,
	nameToAdd: string,
): string {
	if (!path) throw "Errore! Il path richiesto non esiste.";

	let filename = basename(path, ".csv");
	filename = `${filename} ${nameToAdd}.csv`;

	const dir = dirname(path);
	const newPath = join(dir, filename);

	if (existsSync(newPath)) {
		return buildNewFileName(newPath, nameToAdd);
	}

	return newPath;
}

export function sortFrom(a: string, b: string, arr: string[]) {
	return arr.indexOf(a) - arr.indexOf(b);
}

export function buildContentCsv(array: any[], columns: string[]) {
	const keys = Object.keys(array[0]).sort((a, b) => sortFrom(a, b, columns));
	const content = [keys, ...array.map((v) => keys.map((k) => v[k]))];

	return `${content.map((m) => m.join(";")).join("\r\n")}`;
}

import { readFileSync } from "fs";
import { IMapping } from "../models/mapping.js";

export class Mapping {
	constructor(path: string, mapField: IMapping) {
		this.path = path;
		this.mapField = mapField;
	}

	path: string;
	mapField: IMapping;

	merge(fromJson: IMapping, fromOption: IMapping): IMapping {
		let newMap: any = Object.assign({}, fromJson);

		for (const [key, value] of Object.entries(fromOption)) {
			if (value) newMap[key] = value;
		}

		return newMap;
	}

	to(array: Array<any>) {
		return array.map((a) => {
			let o: any = Object.assign({}, a);
			for (const [key, value] of Object.entries(this.mapField)) {
				if (!a.hasOwnProperty(value)) continue;
				o[key] = a[value];
				delete o[value];
			}
			return o;
		});
	}

	from(array: Array<any>) {
		return array.map((a) => {
			let o = Object.assign({}, a);
			for (const [key, value] of Object.entries(this.mapField)) {
				if (!a.hasOwnProperty(key)) continue;
				o[value] = a[key];
				delete o[key];
			}
			return o;
		});
	}

	build() {
		const rawdata = readFileSync(this.path, { encoding: "utf-8" });
		const mapField = JSON.parse(rawdata);
		const mapMerged = this.merge(mapField, this.mapField);

		// imposta la nuova mapFiled mergiata
		this.mapField = mapMerged;
	}
}

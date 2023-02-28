import { IMapping } from "../models/mapping.js";

export class Mapping {
	constructor(mapField: IMapping) {
		this.mapField = mapField;
	}

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

	build(otherMapField?: IMapping) {
		if (!otherMapField) return;

		const mapMerged = this.merge(this.mapField, otherMapField);

		// imposta la nuova mapFiled mergiata
		this.mapField = mapMerged;
	}
}

export type IMapping = {
	[key: string]: string;
};

// to use generics
export type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

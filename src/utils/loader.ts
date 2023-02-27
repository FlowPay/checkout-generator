export class Loader {
	constructor(
		max: number,
		text = "",
		char = "#",
		charEmpty = " ",
		startIndex = 0,
	) {
		this.max = max;
		this.text = text;
		this.char = char;
		this.charEmpty = charEmpty;
		this.i = startIndex;
	}

	max: number;
	text: string;
	char: string;
	charEmpty: string;
	i: number;

	start = () => this.progressBar(this.i);

	next = (i?: number) => this.progressBar(i ? i : this.i++);

	progressBar(i: number) {
		/* using 20 to make the progress bar length 20 charactes, multiplying by 5 below to arrive to 100 */

		const dots = this.char.repeat(i);
		const left = this.max - i;
		const empty = this.charEmpty.repeat(left);
		const percentage = Math.round((i * 100) / this.max);

		/* Set max length progress bar to fix impagination */
		if (this.max > 50) {
			process.stdout.write(`\r${this.text}${percentage}%`);
			return;
		}

		/* need to use  `process.stdout.write` becuase console.log print a newline character */
		/* \r clear the current line and then print the other characters making it looks like it refresh*/
		process.stdout.write(`\r${this.text}[${dots}${empty}] ${percentage}%`);
	}
}

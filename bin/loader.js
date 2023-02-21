// Adapted from https://stackoverflow.com/questions/34848505/how-to-make-a-loading-animation-in-console-application-written-in-javascript-or

import process from "process";

/**
 * Create and display a loader in the console.
 *
 * @param {string} [text=""] Text to display after loader
 * @param {array.<string>} [chars=["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"]]
 * Array of characters representing loader steps
 * @param {number} [delay=100] Delay in ms between loader steps
 * @example
 * let loader = loadingAnimation("Loading…");
 *
 * // Stop loader after 1 second
 * setTimeout(() => clearInterval(loader), 1000);
 * @returns {number} An interval that can be cleared to stop the animation
 */
function loadingAnimation(
	text = "",
	chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
	delay = 100
) {
	let x = 0;

	return setInterval(function () {
		process.stdout.write("\r" + chars[x++] + " " + text);
		x = x % chars.length;
	}, delay);
}

function progressBar(max, i, tex = "", char = "#", charEmpty = " ") {
	/* using 20 to make the progress bar length 20 charactes, multiplying by 5 below to arrive to 100 */

	const dots = char.repeat(i);
	const left = max - i;
	const empty = charEmpty.repeat(left);
	const percentage = Math.round((i * 100) / max);

	/* Set max length progress bar to fix impagination */
	if (max > 50) {
		process.stdout.write(`\r${tex}${percentage}%`);
		return;
	}

	/* need to use  `process.stdout.write` becuase console.log print a newline character */
	/* \r clear the current line and then print the other characters making it looks like it refresh*/
	process.stdout.write(`\r${tex}[${dots}${empty}] ${percentage}%`);
}

export { progressBar, loadingAnimation };

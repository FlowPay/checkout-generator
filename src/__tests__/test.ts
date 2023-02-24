import { CSV } from "../csv";

test("My Greeter", () => {
	expect(CSV("pippo")).toBe("Hello pippo");
});

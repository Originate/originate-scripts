import { dbStart } from "./dbStart";

it("starts a database", async () => {
  await dbStart();
});

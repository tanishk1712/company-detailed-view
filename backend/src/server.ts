import { env } from "./config/env";
import { createApp } from "./app";
import cors from "cors";

const app = createApp();


app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

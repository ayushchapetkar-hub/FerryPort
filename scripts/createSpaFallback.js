import { copyFile } from "node:fs/promises";

// GitHub Pages only serves physical files. Copying the app shell as 404.html
// lets React Router render client-side routes such as /FerryPort/schedules.
await copyFile("dist/index.html", "dist/404.html");

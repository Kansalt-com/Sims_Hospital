import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "app", "dist");

const copyRecursive = (source, target) => {
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
  });
};

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

copyRecursive(path.join(rootDir, "backend", "dist"), path.join(outputDir, "backend", "dist"));
copyRecursive(path.join(rootDir, "backend", "public"), path.join(outputDir, "backend", "public"));
copyRecursive(path.join(rootDir, "backend", "prisma"), path.join(outputDir, "backend", "prisma"));
copyRecursive(path.join(rootDir, "backend", "node_modules"), path.join(outputDir, "backend", "node_modules"));
copyRecursive(path.join(rootDir, "backend", "package.json"), path.join(outputDir, "backend", "package.json"));
copyRecursive(path.join(rootDir, "backend", "package-lock.json"), path.join(outputDir, "backend", "package-lock.json"));
copyRecursive(path.join(rootDir, "deployment", "scripts", "start-appservice.sh"), path.join(outputDir, "start-appservice.sh"));

fs.mkdirSync(path.join(outputDir, "backend", "uploads"), { recursive: true });
fs.mkdirSync(path.join(outputDir, "backend", "logs"), { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  entrypoint: "backend/dist/src/server.js",
  publicDir: "backend/public",
};

fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Packaged monolith runtime to ${outputDir}`);

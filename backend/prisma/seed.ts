import "dotenv/config";
import { initializeRuntime } from "../src/bootstrap/startup.js";
import { prisma } from "../src/db/prisma.js";

async function main() {
  await initializeRuntime();

  console.log("Seed complete");
  console.log("System metadata initialized: permissions, hospital settings, rooms, beds.");

  if (process.env.INITIAL_ADMIN_USERNAME) {
    console.log(
      `Initial admin ensured for username: ${process.env.INITIAL_ADMIN_USERNAME} (password change required on first login).`,
    );
  } else {
    console.log("No initial admin credentials provided. Set INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD to bootstrap one.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

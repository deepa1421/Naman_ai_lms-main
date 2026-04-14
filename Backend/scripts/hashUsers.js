const fs = require("fs");
const csv = require("csvtojson");
const bcrypt = require("bcrypt");

async function run() {
  const users = await csv().fromFile("data/users.csv");

  for (let user of users) {
    const plainPassword = user["Password"]; // ✅ correct column

    if (!plainPassword) {
      console.log("❌ Missing password for:", user);
      continue;
    }

    user.Password = await bcrypt.hash(plainPassword, 10); // overwrite with hashed
  }

  fs.writeFileSync("data/users_hashed.json", JSON.stringify(users, null, 2));
  console.log("✅ Passwords hashed and saved");
}

run();
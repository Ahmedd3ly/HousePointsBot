const db = require("./db"); // Import the database connection

async function updateAllHouseNames() {
  try {
    // Update Gryffindor to Lion House
    await db.query(
      "UPDATE house_points SET house_name = $1 WHERE house_name = $2",
      ["Gryffindor", "جريـفندور"]
    );

    // Update Hufflepuff to Badger House
    await db.query(
      "UPDATE house_points SET house_name = $1 WHERE house_name = $2",
      ["Hufflepuff", "هـافلـباف"]
    );

    // Update Ravenclaw to Eagle House
    await db.query(
      "UPDATE house_points SET house_name = $1 WHERE house_name = $2",
      ["Ravenclaw", "ريـڤينكلو"]
    );

    // Update Slytherin to Snake House
    await db.query(
      "UPDATE house_points SET house_name = $1 WHERE house_name = $2",
      ["Slytherin", "سـلـيذرين"]
    );

    console.log("All house names updated successfully!");
  } catch (err) {
    console.error("Error updating house names:", err);
  } finally {
    db.end(); // Close the database connection after the operation
  }
}

// Call the function to update the names
updateAllHouseNames();

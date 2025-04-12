module.exports = (client) => {
  client.assignHeadmasterPermission = async (guildId) => {
    try {
      const guild = await client.guilds.fetch(guildId);
      const roles = await guild.roles.fetch();

      // Find the "Headmaster" role by name
      const headmasterRole = roles.find((role) => role.name === "Headmaster");

      if (!headmasterRole) {
        console.error(
          "Headmaster role not found. Please ensure that the role exists in the server."
        );
        return;
      }

      // Add the "doAllOfTheAbove" permission to the Headmaster role
      const db = require("../../database/db"); // Import your database connection
      const permission = "doAllOfTheAbove";

      // Check if the permission is already assigned to the Headmaster role
      const permissionCheck = await db.query(
        "SELECT * FROM permissions WHERE role_id = $1 AND permission = $2",
        [headmasterRole.id, permission]
      );

      // If not assigned, add the permission to the role
      if (permissionCheck.rows.length === 0) {
        await db.query(
          "INSERT INTO permissions (role_id, permission) VALUES ($1, $2)",
          [headmasterRole.id, permission]
        );
        console.log(`Assigned "${permission}" to the "Headmaster" role.`);
      } else {
        console.log(
          `"Headmaster" role already has the "${permission}" permission.`
        );
      }
    } catch (error) {
      console.error(
        `Error assigning permissions to Headmaster role: ${error.message}`
      );
    }
  };
};

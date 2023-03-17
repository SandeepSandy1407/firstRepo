const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

app.get("/players/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  const getPlayerDetails = `
    SELECT
    *
    FROM
    cricket_team;`;
  const playersList = await db.all(getPlayerDetails);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
     INSERT INTO
     cricket_team (player_name, jersey_number, role)
     VALUES
     (
         '${playerName}',
         '${jerseyNumber}',
         '${role}'
     );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerDetails = `
    SELECT
    *
    FROM
    cricket_team
    WHERE
    player_id = ${playerId};`;
  const player = await db.get(getPlayerDetails);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
    UPDATE
     cricket_team
    SET
    player_name = ${playerName}
    jersey_number = ${jerseyNumber}
    role = ${role}
    WHERE
    player_id = ${playerId};`;
  const player = await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetails = `
    DELETE FROM
    cricket_team
    WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerDetails);
  response.send("Player Deleted Successfully");
});

module.exports = app;

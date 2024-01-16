import dotenv from "dotenv/config";
import express from "express";
import pg from "pg";
const db = new pg.Pool({ 
    host: process.env.PG_HT,
    port: process.env.PG_PT,
    database: process.env.PG_DB,
    user: process.env.PG_UR,
    password: process.env.PG_PW,
})
const server = express();
const port = process.env.PORT || 4040;
server.use(express.json()); //

server.get("/api/v1/allblogs", async (req, res) => {
  const response = await db.query("SELECT *, TO_CHAR(date_modified, 'DD Mon YYYY | HH24:MI am') FROM blogs ORDER BY date_modified ASC;");
  res.status(200).json(response.rows);  
});
server.get("/api/v1/blogs/:id", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM blogs WHERE key=$1;", [req.params.id]);
    res.status(200).json(response.rows);
  } catch (err) {
    console.error("Database error: ", err);  
    res.status(500).json({message: "Internal server error"});
  }
});
server.post("/api/v1/newblog", async (req, res) => {
  const { title, content, author } = req.body
  try {
    await db.query("INSERT INTO blogs (title, content, author) VALUES ($1, $2, $3);", [title, content, author]);
    const response = await db.query("SELECT * FROM blogs;");
    res.json(response.rows);
  } catch (err) {
    if(err.code === "ECONNRESET") {
      res.status(500).json({message: "Server error: Connection reset by peer"});
    } else {
      res.status(500).json({message: "Server error"});
    }
  }
});
server.post("/api/v1/filter", async (req, res) => {
  let { options } = req.body;
  let response;
  try {
    switch(options) {
      case "author-asc":
        response = await db.query("SELECT *, TO_CHAR(date_modified, 'DD Mon YYYY | HH24:MI am') FROM blogs ORDER BY author ASC;");
        res.status(200).json(response.rows); break;
      case "author-desc":
        response = await db.query("SELECT *, TO_CHAR(date_modified, 'DD Mon YYYY | HH24:MI am') FROM blogs ORDER BY author DESC;");
        res.status(200).json(response.rows); break;
      case "title":
        response = await db.query("SELECT *, TO_CHAR(date_modified, 'DD Mon YYYY | HH24:MI am') FROM blogs ORDER BY title ASC;");
        res.status(200).json(response.rows); break;
      case "latest":
        response = await db.query("SELECT *, TO_CHAR(date_modified, 'DD Mon YYYY | HH24:MI am') FROM blogs ORDER BY date_modified DESC;");
        res.status(200).json(response.rows); break;
      default:
        response = await db.query("SELECT * FROM blogs;");
        res.status(200).json(response.rows); break;
    }
  } catch (err) {
    res.status(500).json({message: "Server error"});
  }
});

server.patch("/api/v1/blogs/:id", async (req, res) => {
  const { title, content, author } = req.body;
  const selected = parseInt(req.params.id);
  const SQL = "UPDATE blogs SET title=$1, content=$2, author=$3, date_modified=now() WHERE key=$4 RETURNING *;";
  try {
    const response = await db.query(SQL, [title, content, author, selected]);
    res.status(200).json(response.rows);
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).json({message: "Internal server error"});
  }
});
server.delete("/api/v1/blogs/:id", async (req, res) => {
  const selected = parseInt(req.params.id);
  try {
    await db.query("DELETE FROM blogs WHERE key=$1;", [selected]);
    res.json({message: `blog ID ${selected} was successfully deleted.`})
  } catch (err) {
    console.log(err.message);
    res.json({message: "ERROR"});
  }
});
server.listen(port, () => console.log("server is running on port: " + port) );

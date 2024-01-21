import dotenv from "dotenv/config";
import express from "express";
import axios from "axios";
import pg from "pg";
const db = new pg.Client({
    host: process.env.PG_HT,
    port: process.env.PG_PT,
    database: process.env.PG_DB,
    user: process.env.PG_UR,
    password: process.env.PG_PW,
})
db.connect();
const API_URL1 = process.env.API_CGG;
const API_URL2 = process.env.API_PG;
const app = express();
const port = process.env.CONNPORT;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");

async function trendingCoins() {
    const response = await axios.get(API_URL1);
    return response.data.coins; 
}
async function currentQuest() {
    const response = await db.query("SELECT * FROM lang1;");
    const result = response.rows;
    return result[Math.floor(Math.random() * result.length)];
}
let quests; 
let score = 0;

app.get("/home", async (req,res) => { res.render("nav/projects") });
app.get("/coins", async (req,res) => {
    res.render("pages/coins", { topCoins: await trendingCoins() });
})
app.post("/coins", async (req,res) => {
    let search = String(req.body["coinid"]).toLowerCase();
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${search}`);
    const result = response.data;
    res.render("pages/coins", {
        searchCoin: result,
        topCoins: await trendingCoins(),
    })
})
app.get("/lang1", async (req,res) => {
    quests = await currentQuest(); 
    try {
        res.render("pages/lang1", {
            q: quests,
            score: score,
        });
    } catch (err) {
        console.log(err.message);
    }
});
app.post("/lang1", async (req,res)=> {
    let ans = String(req.body["ans"]).toLowerCase();
    if(ans === quests.ans) {
        score++
        quests = await currentQuest();
        res.render("pages/lang1", {
            q: quests,
            score: score,
            check: "correct"
        });
    } else {
        score = 0; 
        quests = await currentQuest();
        res.render("pages/lang1", {
            q: quests,
            score: score, 
            check: "wrong, misspell or empty"
        });
    }
});
app.get("/git", async (req, res) => {
    res.render("pages/git");
});
app.get("/untitled", async (req, res) => {
    res.render("pages/untitled");
});
app.get("/project", (req,res) => {
    res.render("nav/projects");
});
app.get("/blog", async (req,res) => {
    try {
        const data = await axios.get(`${API_URL2}/api/v1/allblogs`);
        res.render("nav/blog", {blogs: data.data});
    } catch (err) {
        console.log(err.message)
    }
})
app.get("/mod/:id", async (req, res) => {
    try {
        const data = await axios.get(`${API_URL2}/api/v1/blogs/${req.params.id}`);
        res.render("pages/blog-mod", {blog: data.data[0]});
    } catch(err) {
        if(err.code === "ECONNRESET") {
            console.log("Connection reset by peer");
        } else {
            console.log("Error: ", err.message) 
        }
        res.status(500).send("Internal server error");
    }
});
app.get("/del/:id", async (req, res) => {
    try {
       await axios.delete(`${API_URL2}/api/v1/blogs/${req.params.id}`);
        res.redirect("/blog");
    } catch(err) {
        res.json({err: err.message})
    }
});
app.post("/modblg/:id", async (req, res) => {
    try {
        await axios.patch(`${API_URL2}/api/v1/blogs/${req.params.id}`, req.body);
        res.redirect("/blog");
    } catch(err) {
        if(err.code === "ECONNREFUSED") {
            console.log("Connection refused. Make sure the server is running and accessible.");
        } else {
            console.log("Error: ", err.message)
        }
        res.status(500).send("Internal server error");
    }
});
app.post("/add", async (req, res) => {
    try {
        const data = await axios.post(`${API_URL2}/api/v1/newblog`, req.body, {
            timeout: 5000,
        });
        const lastIn = data.data.length-1;
        console.log("new blog ID " + data.data[lastIn].key + " is created" );
        res.redirect("/blog");
    } catch (err) {
        if(err.code === "ECONNRESET") {
            console.log("Connection reset by peer");
        } else {
            console.log(err.message);
        }
        res.redirect("/blog");
    }
});
app.post("/sort", async (req, res) => {
    try {
        const data = await axios.post(`${API_URL2}/api/v1/filter`, req.body);
        res.render("nav/blog", {blogs: data.data});
    } catch (err) {
        console.log("Error", err.message);
    }
})
app.get("/todo", async (req,res) => {
    try {
        const response = await db.query("SELECT *, TO_CHAR(due, 'DD Mon YYYY') AS formatted_due FROM todos ORDER BY due ASC;");
        res.render("nav/todo", {lists: response.rows});
    } catch(err) {
        console.log(err);
        res.redirect("/todo");
    }
})
app.post("/addtodo", async (req,res) => {
    try {
        await db.query("INSERT INTO todos (item_todo, due) VALUES ($1, $2);", 
        [req.body["todo-item"], req.body["todo-due"]]);
        res.redirect("/todo");
    } catch(err) {
        console.log(err);
        res.redirect("/todo");
    }
})
app.get("/deltodo/:id", async (req,res) => {
    try {
        await db.query("DELETE FROM todos WHERE id=($1);", [req.params.id]);
        res.redirect("/todo");
    } catch (err) {
        console.log(err);
    }
})
app.get("/price", (req,res) => {
    res.render("nav/price", {year: new Date().getFullYear()});
});
app.get("/login", (req, res) => {
    res.render("pages/form-signin");
});
app.get("/regis", (req, res) => {
    res.render("pages/form-signup");
});


app.listen(port, "127.1.0.0", () => console.log("server is running on port: " + port) );
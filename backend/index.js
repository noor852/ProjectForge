require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const sanitizeBody = require("./middleware/sanitize");

const app = express();
connectDB();

// CORS: only these origins may read our responses in the browser
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // no origin = Postman, curl or a same-origin request
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());
app.use(sanitizeBody); // strip HTML and scripts from every text field before it is saved
app.get("/", (req, res) => {
    res.send("server is up!");
});

app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));  
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
const express = require("express");

const app = express();
app.use(express.json());

app.use("/api/movies", require("./routes/api/movies"));

const PORT = 5000;
app.listen(PORT, console.log(`Server started on PORT ${PORT}`));
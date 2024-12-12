const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 連接到 MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/411631269.students", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 定義學生資料的 Schema 和模型
const studentSchema = new mongoose.Schema({
  account: String,
  seatNo: Number,
  name: String,
  department: String,
  grade: Number,
  class: String,
  email: String,
  absences: Number,
});

const Student = mongoose.model("Student", studentSchema);

// 提供一個 API 來獲取學生資料
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).send("Error fetching students data.");
  }
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

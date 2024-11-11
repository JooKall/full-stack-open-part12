const express = require("express");
const { Todo } = require("../mongo");
const router = express.Router();
const redis = require("../redis");

/* GET todos listing. */
router.get("/", async (_, res) => {
  const todos = await Todo.find({});
  res.send(todos);
});

router.get("/statistics", async (req, res) => {
  const todoCounter = await redis.getAsync("todoCount");
  const added_todos = todoCounter ? parseInt(todoCounter) : 0;
  return res.json({ added_todos });
});

/* POST todo to listing. */
router.post("/", async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false,
  });

  const currentCount = await redis.getAsync("todoCount");
  const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
  await redis.setAsync("todoCount", newCount);

  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params;
  req.todo = await Todo.findById(id);
  if (!req.todo) return res.sendStatus(404);

  next();
};

/* DELETE todo. */
singleRouter.delete("/", async (req, res) => {
  await req.todo.delete();
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get("/", async (req, res) => {
  if (req.todo) {
    return res.json(req.todo);
  }
  res.sendStatus(405);
});

/* PUT todo. */
singleRouter.put("/", async (req, res) => {
  try {
    console.log(req.body);
    const { text, done } = req.body;

    req.todo.text = text;
    req.todo.done = done;
    const updatedTodo = await req.todo.save();
    res.json(updatedTodo);
  } catch (error) {
    console.log(error);
  }
});

router.use("/:id", findByIdMiddleware, singleRouter);

module.exports = router;

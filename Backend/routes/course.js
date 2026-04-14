router.post("/create-course", async (req, res) => {
  try {
    const { role } = req.body;

    if (role !== "admin") {
      return res.status(403).json({
        error: "Only admin can create courses"
      });
    }

    const course = await Course.create(req.body);
    res.json(course);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
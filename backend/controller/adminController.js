const adminLogin = (req, res) => {
  console.log(req.body);

  res.status(200).json({
    success: true,
    message: "Login API Working",
  });
};

export { adminLogin };

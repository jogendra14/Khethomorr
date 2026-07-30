const adminLogin = (req, res) => {
    res.status(200).json({
    success: true,
    message: "Login API Working",
  });
};

export { adminLogin };

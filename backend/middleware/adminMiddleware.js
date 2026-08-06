const admin = (req, res, next) => {
  console.log("admin reached")
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export { admin };

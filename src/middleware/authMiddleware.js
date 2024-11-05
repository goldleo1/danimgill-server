const isAdmin = (req, res, next) => {
  if (
    (req.session.user && req.session.user.admin) ||
    process.env.NODE_ENV == "development"
  ) {
    req.session.user = {
      admin: true,
    };
    return next();
  } else {
    return res.status(404).send("not found"); // hide admin page
  }
};

const isLogined = (req, res, next) => {
  if (req.session.user || process.env.NODE_ENV == "development") {
    return next();
  } else {
    return res.redirect("/login");
  }
};

module.exports = { isAdmin, isLogined };

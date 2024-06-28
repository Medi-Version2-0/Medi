const User = require("./../database/models/users");
const bcrypt = require("bcryptjs");
const user = new User();

module.exports.registerUser = (email, password, permissions) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const parsedPermission = permissions.toString();
  const data = {
    email,
    password: hashedPassword,
    permissions: parsedPermission,
  };
  return user.insert(data);
};

module.exports.authenticateUser = (email, password) => {
  const emai = email.toString();
  const users = user.getAll("email = ?", "", "", [email]);
  const loginedUser = users.find((e) => e.email === email);
  if (!bcrypt.compareSync(password, loginedUser.password)) {
    throw new Error("Invalid credentials");
  }
  return loginedUser;
};

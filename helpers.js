
const getUserByEmail = function(userEmail, usersDatabase) {
  for (const id in usersDatabase) {
    const user = usersDatabase[id];
    if (user.email === userEmail) {
      return user;
    }
  }
  return null;
};

module.exports = { getUserByEmail };
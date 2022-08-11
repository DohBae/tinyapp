
const getUserByEmail = function(userEmail, usersDatabase) {
  for (let user in usersDatabase) {
    if (usersDatabase[user]["email"] === userEmail) {
      return usersDatabase[user];
    }
  }
  return null;
};

module.exports = { getUserByEmail };
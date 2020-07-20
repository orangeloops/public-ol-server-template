"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "user",
      [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "John Doe",
          email: "test@orangeloops.com",
          password: await bcrypt.hash("Password01", 10),
          imageUrl: "https://storage.googleapis.com/ideasource.appspot.com/image/user-default.png",
          status: 1,
          createdDate: new Date(),
          modifiedDate: new Date(),
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("user", null, {});
  },
};

const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  return await oracledb.getConnection({
    user: "system",
        password: "12Ac45RJ%",
        connectString: "localhost:1521/orcl2"
    });
}

module.exports = { getConnection };

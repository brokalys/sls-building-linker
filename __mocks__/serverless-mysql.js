const query = jest.fn().mockReturnValue([]);

const mysql = jest.fn().mockReturnValue({
  query,
});

mysql.query = query;
module.exports = mysql;

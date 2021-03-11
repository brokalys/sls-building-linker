const serverlessMysql = require('serverless-mysql');

const mysql = serverlessMysql({
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: 'Z',
    typeCast: true,
  },
});

function updatePropertyBuildingId(propertyId, buildingId) {
  return mysql.query({
    sql: `
      UPDATE properties
      SET building_id = ?
      WHERE id = ?
   `,
    values: [buildingId, propertyId],
  });
}

async function findBuildingId(lat, lng) {
  const distance = 0.0005;
  const data = await mysql.query({
    sql: `
      Select id, ST_DISTANCE(bounds, POINT(?, ?)) as distance
      FROM buildings
      WHERE MBRIntersects(bounds, LineString(Point(?, ?), Point(?, ?)))
      ORDER BY distance ASC
      LIMIT 1
   `,
    values: [
      lat,
      lng,
      lat - distance,
      lng - distance,
      lat + distance,
      lng + distance,
    ],
  });

  if (data.length) {
    return data[0].id;
  }
}

module.exports = {
  updatePropertyBuildingId,
  findBuildingId,
};

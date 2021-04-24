const db = require('./shared/db');

exports.run = async (event) => {
  const properties = event.Records.map((row) => JSON.parse(row.body));

  await Promise.all(
    properties
      .filter(
        (property) =>
          property.lat &&
          property.lng &&
          (!property.location_country ||
            property.location_country === 'Latvia'),
      )
      .map(async (property) => {
        const buildingId = await db.findBuildingId(property.lat, property.lng);

        if (!buildingId) {
          return;
        }

        return db.updatePropertyBuildingId(property.id, buildingId);
      }),
  );
};

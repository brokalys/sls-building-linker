const addressParser = require('@brokalys/address-normalization');
const db = require('./shared/db');

exports.run = async (event) => {
  const classifieds = event.Records.map((row) => JSON.parse(row.body));

  // Link by lat/lng
  await Promise.all(
    classifieds
      .filter(
        (classified) =>
          classified.lat &&
          classified.lng &&
          (!classified.location_country ||
            classified.location_country === 'Latvia') &&
          ['apartment', 'house', 'office'].includes(classified.category),
      )
      .map(async (classified) => {
        const buildingId = await db.findVzdBuildingIdByLatLng(
          classified.lat,
          classified.lng,
        );

        if (!buildingId) {
          return;
        }

        return db.createPropertyBuildingLink(
          classified.id,
          buildingId,
          'latlng',
        );
      }),
  );
};

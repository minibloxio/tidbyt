import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from "node-fetch";

let stops = [
  "1093", // Columbia / Phillip NW Corner
  "3887", // Phillip in front of ICON
  "3889", // Phillip across from ICON
  "6004", // ION Southbound
  "6120", // ION Northbound
];

let nextStopTimes = new Map<string, Date[]>();

(async () => {
  try {
    // const response = await fetch("https://webapps.regionofwaterloo.ca/api/grt-routes/api/vehiclepositions", {});
    const response = await fetch("https://webapps.regionofwaterloo.ca/api/grt-routes/api/tripupdates", {});
    if (!response.ok) {
      throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    feed.entity.forEach((entity) => {
      // console.log(entity.tripUpdate?.trip.routeId);
      entity.tripUpdate?.stopTimeUpdate?.forEach((stopTimeUpdate) => {
        let stopId = stopTimeUpdate.stopId || "";
        if (stops.includes(stopId)) {
          console.log(stopId);
          const num = stopTimeUpdate.arrival?.time?.toString() || "0";
          const date = new Date(parseInt(num) * 1000);
          console.log(`${entity.tripUpdate?.trip.routeId} ${date.toLocaleTimeString()}`);
        }
      });
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

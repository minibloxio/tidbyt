import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from "node-fetch";

let stops = [
  "1093", // Columbia / Phillip NW Corner
  "3887", // Phillip in front of ICON
  "3889", // Phillip across from ICON
  "6004", // ION Southbound
  "6120", // ION Northbound
];

export enum Stop {
  ColumbiaPhillipNWCorner = "1093",
  PhillipInFrontOfICON = "3887",
  PhillipAcrossFromICON = "3889",
  IONSouthbound = "6004",
  IONNorthbound = "6120",
}

export async function getData(): Promise<Map<string, [string, Date][]>> {
  let nextStopTimes = new Map<string, [string, Date][]>(stops.map((stop) => [stop, []]));
  try {
    // const response = await fetch("https://webapps.regionofwaterloo.ca/api/grt-routes/api/vehiclepositions", {});
    const response = await fetch("https://webapps.regionofwaterloo.ca/api/grt-routes/api/tripupdates", {});
    if (!response.ok) {
      throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    feed.entity.forEach((entity) => {
      let routeId = entity.tripUpdate?.trip.routeId || "";
      entity.tripUpdate?.stopTimeUpdate?.forEach((stopTimeUpdate) => {
        let stopId = stopTimeUpdate.stopId || "";
        if (stops.includes(stopId)) {
          const num = stopTimeUpdate.arrival?.time?.toString() || "0";
          const date = new Date(parseInt(num) * 1000);
          nextStopTimes.get(stopId)?.push([routeId, date]);
        }
      });
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  return nextStopTimes;
}

export const portConnections = {
  Mumbai: ["Mandwa", "Alibaug", "Elephanta Island"],
  Mandwa: ["Mumbai", "Alibaug"],
  Alibaug: ["Mumbai", "Mandwa"],
  "Elephanta Island": ["Mumbai"],
  Goa: ["Kochi"],
  Kochi: ["Goa", "Lakshadweep"],
  Lakshadweep: ["Kochi"],
  Chennai: ["Port Blair"],
  "Port Blair": ["Chennai", "Havelock Island", "Neil Island"],
  "Havelock Island": ["Port Blair", "Neil Island"],
  "Neil Island": ["Port Blair", "Havelock Island"],
  Kolkata: ["Gangasagar"],
  Gangasagar: ["Kolkata"],
  Diu: ["Okha"],
  Okha: ["Diu", "Beyt Dwarka"],
  "Beyt Dwarka": ["Okha"]
};

export const isApprovedConnection = (source, destination) =>
  source !== destination && portConnections[source]?.includes(destination) === true;

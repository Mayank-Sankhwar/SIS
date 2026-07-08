export interface ImportSheetSchema {
  sheetName: string;
  headers: readonly string[];
  enforceHeaderOrder: boolean;
}

export const SUBSTATION_WORKBOOK_SHEETS = [
  {
    sheetName: "Discoms",
    headers: ["Name", "Code"],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Zones",
    headers: ["Discom Code", "Name", "Code"],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Verticals",
    headers: ["Zone Code", "Name", "Code"],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Sub Verticals",
    headers: ["Vertical Code", "Name", "Code"],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Substations",
    headers: [
      "Sub Vertical Code",
      "Name",
      "Code",
      "Voltage Level KV",
      "Address",
      "Latitude",
      "Longitude",
      "Commissioning Date",
      "Is Active"
    ],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Incoming Sources",
    headers: [
      "Substation Code",
      "Source Name",
      "Source Type",
      "Voltage Level KV",
      "Feeder Name",
      "Meter Number",
      "Is Active"
    ],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Outgoing Feeders",
    headers: [
      "Substation Code",
      "Feeder Name",
      "Feeder Code",
      "Voltage Level KV",
      "Feeder Type",
      "Connected Load MW",
      "Is Active"
    ],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Transformers",
    headers: [
      "Substation Code",
      "Transformer Code",
      "Capacity MVA",
      "Primary Voltage KV",
      "Secondary Voltage KV",
      "Make",
      "Serial Number",
      "Commissioning Date",
      "Is Active"
    ],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Lightning Arresters",
    headers: [
      "Substation Code",
      "Arrester Code",
      "Location Description",
      "Voltage Rating KV",
      "Make",
      "Serial Number",
      "Installation Date",
      "Is Active"
    ],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Battery Banks",
    headers: [
      "Substation Code",
      "Battery Bank Code",
      "Battery Type",
      "Voltage V",
      "Capacity Ah",
      "Cell Count",
      "Make",
      "Installation Date",
      "Is Active"
    ],
    enforceHeaderOrder: true
  },
  {
    sheetName: "Capacitor Banks",
    headers: [
      "Substation Code",
      "Capacitor Bank Code",
      "Capacity MVAR",
      "Voltage Level KV",
      "Steps Count",
      "Make",
      "Installation Date",
      "Is Active"
    ],
    enforceHeaderOrder: true
  }
] as const satisfies readonly ImportSheetSchema[];

// Sample data only: this deployment is a front-end prototype with no backend.
export type Vehicle = {
  id: string; year: number; make: string; model: string; trim: string; title: string;
  price: number; city: string; dist: number; fuel: "Gasoline" | "Electric" | "Hybrid"; miles: number;
  img: string; photos: string[]; body: string; condition: "New" | "Certified" | "Used";
  seller: "Dealership" | "Private seller"; transmission: "Automatic" | "Manual"; drivetrain: string; engine: string;
  exterior: string; exteriorHex: string; interior: string; interiorHex: string;
  stock: string; vin: string; dealer: string; greatDeal?: boolean;
};

const shots = (n: string) => [`/cars/${n}.jpg`, `/cars/${n}-2.jpg`, `/cars/${n}-3.jpg`];

export const VEHICLES: Vehicle[] = [
  { id: "aston-db12", year: 2024, make: "Aston Martin", model: "DB12", trim: "Volante", title: "Aston Martin DB12 Volante", price: 245000, city: "Saratoga Springs, NY", dist: 24, fuel: "Gasoline", miles: 1200, img: "/cars/aston.jpg", photos: ["/cars/aston.jpg", "/cars/aston-int.jpg", "/cars/aston-front.jpg", "/cars/aston-rear.jpg", "/cars/aston-wheel.jpg"], body: "Convertible", condition: "Used", seller: "Private seller", transmission: "Automatic", drivetrain: "RWD", engine: "4.0L V8", exterior: "Grey", exteriorHex: "#CFCFCF", interior: "Tan", interiorHex: "#A9673A", stock: "X4007", vin: "SCFRMFEV2RGL10042", dealer: "Solid Rock Auto Group" },
  { id: "bentley-gt", year: 2023, make: "Bentley", model: "Continental GT", trim: "Speed", title: "Bentley Continental GT Speed", price: 178500, city: "Albany, NY", dist: 12, fuel: "Gasoline", miles: 7600, img: "/cars/bentley.jpg", photos: shots("bentley"), body: "Coupe", condition: "Used", seller: "Dealership", transmission: "Automatic", drivetrain: "AWD", engine: "6.0L W12", exterior: "Green", exteriorHex: "#1F4A38", interior: "Black", interiorHex: "#111111", stock: "B2210", vin: "SCBCT2ZG7PC012345", dealer: "Capital Region Motors" },
  { id: "rivian-r1s", year: 2024, make: "Rivian", model: "R1S", trim: "Adventure Package", title: "Rivian R1S Adventure Package", price: 62300, city: "Troy, NY", dist: 9, fuel: "Electric", miles: 14200, img: "/cars/rivian.jpg", photos: shots("rivian"), body: "SUV", condition: "Used", seller: "Private seller", transmission: "Automatic", drivetrain: "AWD", engine: "Quad motor", exterior: "Green", exteriorHex: "#55655A", interior: "Black", interiorHex: "#111111", stock: "R1188", vin: "7PDSGABA5RN004512", dealer: "Hudson Valley EV" },
  { id: "amg-gt63", year: 2023, make: "Mercedes-AMG", model: "GT 63", trim: "S Coupe", title: "Mercedes-AMG GT 63 S Coupe", price: 134900, city: "Clifton Park, NY", dist: 16, fuel: "Gasoline", miles: 3400, img: "/cars/mercedes.jpg", photos: shots("mercedes"), body: "Coupe", condition: "Certified", seller: "Dealership", transmission: "Automatic", drivetrain: "AWD", engine: "4.0L V8", exterior: "Black", exteriorHex: "#141414", interior: "Black", interiorHex: "#111111", stock: "M6630", vin: "W1K7X8KB5PA056231", dealer: "Mercedes-Benz of Latham", greatDeal: true },
  { id: "polestar-2", year: 2023, make: "Polestar", model: "2", trim: "Long Range Dual Motor", title: "Polestar 2 Long Range Dual Motor", price: 38750, city: "Schenectady, NY", dist: 1, fuel: "Electric", miles: 22100, img: "/cars/polestar.jpg", photos: ["/cars/polestar.jpg", "/cars/polestar-2.jpg"], body: "Sedan", condition: "Used", seller: "Dealership", transmission: "Automatic", drivetrain: "AWD", engine: "Dual motor", exterior: "Blue", exteriorHex: "#1E2B3F", interior: "Grey", interiorHex: "#5B5B5B", stock: "P0212", vin: "LPSED3KA1PL099812", dealer: "Tri City Auto Sales", greatDeal: true },
  { id: "alfa-giulia", year: 2022, make: "Alfa Romeo", model: "Giulia", trim: "Quadrifoglio", title: "Alfa Romeo Giulia Quadrifoglio", price: 56800, city: "Rotterdam, NY", dist: 5, fuel: "Gasoline", miles: 11500, img: "/cars/alfa.jpg", photos: shots("alfa"), body: "Sedan", condition: "Used", seller: "Dealership", transmission: "Automatic", drivetrain: "RWD", engine: "2.9L V6", exterior: "Red", exteriorHex: "#8E1420", interior: "Black", interiorHex: "#111111", stock: "A7741", vin: "ZARFAMEV7N7654321", dealer: "Capital Region Motors", greatDeal: true },
  { id: "toyota-supra", year: 2023, make: "Toyota", model: "GR Supra", trim: "3.0 Premium", title: "Toyota GR Supra 3.0 Premium", price: 44200, city: "Latham, NY", dist: 13, fuel: "Gasoline", miles: 8900, img: "/cars/toyota.jpg", photos: ["/cars/toyota.jpg", "/cars/toyota-2.jpg"], body: "Coupe", condition: "Used", seller: "Private seller", transmission: "Manual", drivetrain: "RWD", engine: "3.0L I6", exterior: "Yellow", exteriorHex: "#EEB61B", interior: "Black", interiorHex: "#111111", stock: "T3390", vin: "WZ1DB0G05PW045871", dealer: "Tri City Auto Sales" },
  { id: "hyundai-ioniq6", year: 2024, make: "Hyundai", model: "Ioniq 6", trim: "Limited AWD", title: "Hyundai Ioniq 6 Limited AWD", price: 41100, city: "Cohoes, NY", dist: 10, fuel: "Electric", miles: 5300, img: "/cars/hyundai.jpg", photos: ["/cars/hyundai.jpg", "/cars/hyundai-2.jpg"], body: "Sedan", condition: "Certified", seller: "Dealership", transmission: "Automatic", drivetrain: "AWD", engine: "Dual motor", exterior: "White", exteriorHex: "#E9E6EA", interior: "Grey", interiorHex: "#5B5B5B", stock: "H9921", vin: "KMHM34AC5RA031987", dealer: "Hudson Valley EV", greatDeal: true },
  { id: "ford-explorer", year: 2022, make: "Ford", model: "Explorer", trim: "XLT", title: "Ford Explorer XLT", price: 31672, city: "Amsterdam, NY", dist: 18, fuel: "Gasoline", miles: 34900, img: "/cars/suv-copper.jpg", photos: ["/cars/suv-copper.jpg"], body: "SUV", condition: "Used", seller: "Dealership", transmission: "Automatic", drivetrain: "AWD", engine: "2.3L I4", exterior: "Copper", exteriorHex: "#8A5A3C", interior: "Black", interiorHex: "#111111", stock: "F1120", vin: "1FMSK8DH0NGA11223", dealer: "Tri City Auto Sales" },
  { id: "toyota-rav4", year: 2023, make: "Toyota", model: "RAV4", trim: "Hybrid XLE", title: "Toyota RAV4 Hybrid XLE", price: 34200, city: "East Greenbush, NY", dist: 19, fuel: "Hybrid", miles: 18200, img: "/cars/suv-sage.jpg", photos: ["/cars/suv-sage.jpg"], body: "SUV", condition: "Certified", seller: "Dealership", transmission: "Automatic", drivetrain: "AWD", engine: "2.5L Hybrid", exterior: "Green", exteriorHex: "#7E8B73", interior: "Black", interiorHex: "#111111", stock: "T7702", vin: "2T3RWRFV1PW154210", dealer: "Capital Region Motors", greatDeal: true },
  { id: "subaru-forester", year: 2021, make: "Subaru", model: "Forester", trim: "Premium", title: "Subaru Forester Premium", price: 24240, city: "Glens Falls, NY", dist: 44, fuel: "Gasoline", miles: 52000, img: "/cars/suv-silver.jpg", photos: ["/cars/suv-silver.jpg"], body: "SUV", condition: "Used", seller: "Private seller", transmission: "Automatic", drivetrain: "AWD", engine: "2.5L H4", exterior: "Silver", exteriorHex: "#BFC3C7", interior: "Grey", interiorHex: "#5B5B5B", stock: "S4418", vin: "JF2SKAJC7MH501234", dealer: "Tri City Auto Sales" },
];

export const byId = (id: string) => VEHICLES.find((v) => v.id === id);
export const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const initials = (s: string) => s.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export const FEATURES: Record<string, string[]> = {
  Exterior: ["Upgraded paint", "Advanced headlight control", "Upgraded tires", "Heated door mirrors", "Rear parking sensors"],
  "Audio & Controls": ["Premium speakers", "Touch screen audio", "Steering wheel controls"],
  "Comfort & Convenience": ["Leather seats", "Heated seats", "Memory seats", "Automatic climate control"],
};

export type Filters = {
  sort: string; brands: string[]; models: string[]; yearMin: string; condition: string[]; seller: string[];
  transmission: string; fuel: string[]; body: string[]; priceMax: string; milesMax: string; colors: string[];
};
export const EMPTY_FILTERS: Filters = { sort: "Best match", brands: [], models: [], yearMin: "", condition: [], seller: [], transmission: "", fuel: [], body: [], priceMax: "", milesMax: "", colors: [] };

export const SORTS = ["Best match", "Price: low to high", "Price: high to low", "Mileage: low to high", "Newest first"];
export const COLORS = [...new Map(VEHICLES.map((v) => [v.exterior, v.exteriorHex])).entries()];

export function applyFilters(list: Vehicle[], f: Filters, radius: number, query: string) {
  const q = query.trim().toLowerCase();
  const out = list.filter((v) =>
    v.dist <= radius &&
    (!q || `${v.year} ${v.title} ${v.body} ${v.fuel}`.toLowerCase().includes(q)) &&
    (!f.brands.length || f.brands.includes(v.make)) &&
    (!f.models.length || f.models.includes(v.model)) &&
    (!f.yearMin || v.year >= +f.yearMin) &&
    (!f.condition.length || f.condition.includes(v.condition)) &&
    (!f.seller.length || f.seller.includes(v.seller)) &&
    (!f.transmission || v.transmission === f.transmission) &&
    (!f.fuel.length || f.fuel.includes(v.fuel)) &&
    (!f.body.length || f.body.includes(v.body)) &&
    (!f.priceMax || v.price <= +f.priceMax) &&
    (!f.milesMax || v.miles <= +f.milesMax) &&
    (!f.colors.length || f.colors.includes(v.exterior)));
  const s = f.sort;
  if (s === "Price: low to high") out.sort((a, b) => a.price - b.price);
  if (s === "Price: high to low") out.sort((a, b) => b.price - a.price);
  if (s === "Mileage: low to high") out.sort((a, b) => a.miles - b.miles);
  if (s === "Newest first") out.sort((a, b) => b.year - a.year);
  return out;
}

export function suggestions(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const seen = new Map<string, { label: string; hint: string; make?: string; model?: string; body?: string; fuel?: string }>();
  const add = (k: string, v: { label: string; hint: string; make?: string; model?: string; body?: string; fuel?: string }) => { if (!seen.has(k)) seen.set(k, v); };
  const count = (fn: (v: Vehicle) => boolean) => VEHICLES.filter(fn).length;
  const n = (c: number) => `${c} ${c === 1 ? "car" : "cars"}`;
  for (const v of VEHICLES) {
    if (v.make.toLowerCase().includes(q)) add("m" + v.make, { label: `All ${v.make}`, hint: n(count((x) => x.make === v.make)), make: v.make });
    if (`${v.make} ${v.model}`.toLowerCase().includes(q)) add("o" + v.model, { label: `${v.make} ${v.model}`, hint: n(count((x) => x.model === v.model)), make: v.make, model: v.model });
    if (v.body.toLowerCase().includes(q)) add("b" + v.body, { label: `${v.body}s near you`, hint: n(count((x) => x.body === v.body)), body: v.body });
    if (v.fuel.toLowerCase().includes(q)) add("f" + v.fuel, { label: `${v.fuel} cars`, hint: n(count((x) => x.fuel === v.fuel)), fuel: v.fuel });
  }
  return [...seen.values()].slice(0, 6);
}

export type Deal = { id: string; vehicleId: string; kind: "Dealership Deal" | "Advisor Deal"; number: string; created: string; stage: number; agent: "Active" | "Paused"; inactive?: boolean; unread: boolean; message: string };

export const SEED_DEALS: Deal[] = [
  { id: "d336", vehicleId: "aston-db12", kind: "Dealership Deal", number: "D00336", created: "Oct 12, 2026", stage: 1, agent: "Active", unread: true, message: "The DB12 is available for viewing. Would you prefer to schedule a test drive?" },
  { id: "d341", vehicleId: "bentley-gt", kind: "Advisor Deal", number: "D00341", created: "Oct 19, 2026", stage: 2, agent: "Paused", unread: true, message: "Your advisor has a counter-offer ready for the Continental GT." },
  { id: "d298", vehicleId: "polestar-2", kind: "Dealership Deal", number: "D00298", created: "Sep 28, 2026", stage: 1, agent: "Paused", inactive: true, unread: false, message: "This car has sold. We found two similar ones nearby." },
];

export type Offer = { id: string; vehicleId: string; amount: number; days: number; kind: "Cash" | "Loyalty" | "Incentive"; maker: string; states: string[]; dealer: string; dealerType: string };

const STATES = ["New York", "California", "Texas", "Florida", "Illinois", "Washington"];
export const OFFERS: Offer[] = [
  ["aston-db12", 750, 14, "Cash"], ["bentley-gt", 5000, 30, "Loyalty"], ["rivian-r1s", 1000, 21, "Cash"], ["amg-gt63", 2500, 9, "Incentive"],
  ["polestar-2", 3000, 11, "Cash"], ["alfa-giulia", 1750, 18, "Loyalty"], ["toyota-supra", 1000, 7, "Cash"], ["hyundai-ioniq6", 3500, 26, "Incentive"],
].map(([vehicleId, amount, days, kind], i) => {
  const v = byId(vehicleId as string)!;
  return { id: "o" + i, vehicleId: v.id, amount: amount as number, days: days as number, kind: kind as Offer["kind"], maker: v.make, states: STATES.slice(0, 3 + (i % 4)), dealer: v.dealer, dealerType: "Dealership" };
});

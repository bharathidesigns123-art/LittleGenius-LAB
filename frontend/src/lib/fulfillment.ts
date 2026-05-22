const indiaDateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

export function parseShipsInDays(shipsIn: string | null | undefined, fallbackDays = 2) {
  const match = shipsIn?.match(/\d+/);
  return match ? Number(match[0]) : fallbackDays;
}

export function addCalendarDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function formatEstimatedDispatchDate(shipsIn: string | null | undefined, fromDate = new Date()) {
  const productionDays = parseShipsInDays(shipsIn);
  return indiaDateFormatter.format(addCalendarDays(fromDate, productionDays));
}

export function getDeliveryTimeline(shipsIn: string | null | undefined) {
  const productionDays = parseShipsInDays(shipsIn);

  return {
    production: `${productionDays}-${productionDays + 1} working days`,
    shipping: "2-5 days after dispatch",
    customProduction: "5-7 working days after design approval",
    cod: "COD is temporarily unavailable; prepaid UPI, cards, and netbanking are supported.",
    returns: "Free replacement for damaged or defective items reported within 48 hours.",
  };
}

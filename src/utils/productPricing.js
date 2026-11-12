export function calculateProductPricing(unitCost, markupPercent) {
  const cost = Number(unitCost);
  const markup = Number(markupPercent);

  if (
    !Number.isFinite(cost) ||
    !Number.isFinite(markup) ||
    cost < 0 ||
    markup < 0
  ) {
    throw new Error("Invalid product cost or markup");
  }

  const round = (value) =>
    Math.round((value + Number.EPSILON) * 100) / 100;

  const sellingPrice = round(cost * (1 + markup / 100));
  const profit = round(sellingPrice - cost);

  const margin = sellingPrice > 0
    ? round((profit / sellingPrice) * 100)
    : 0;

  return {
    unitCost: round(cost),
    markupPercent: markup,
    sellingPrice,
    profit,
    margin
  };
}
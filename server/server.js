const express = require("express");

const PORT = 3000;
const app = express();
app.use(express.json());

/**
 * Validate mortgage parameters.
 * @param {Number} propertyPrice
 * @param {Number} downPayment
 * @param {Number} annualInterestRate
 * @param {Number} amortizationPeriod
 * @param {String} paymentSchedule
 * @returns {String | null} - error message or null
 */
function mortgageParamValidation(
  propertyPrice,
  downPayment,
  annualInterestRate,
  amortizationPeriod,
  paymentSchedule
) {
  if (!propertyPrice || isNaN(propertyPrice)) {
    return "Property price is missing or invalid.";
  }

  if (!downPayment || isNaN(downPayment)) {
    return "Down payment is missing or invalid.";
  }

  if (!annualInterestRate || isNaN(annualInterestRate)) {
    return "Annual interest rate is missing or invalid.";
  }

  if (!amortizationPeriod || isNaN(amortizationPeriod)) {
    return "Amortization period is missing or invalid.";
  }

  if (!paymentSchedule) {
    return "Payment schedule is missing.";
  }

  // check if payment schedule is 'abw', 'bw', or 'm'
  if (!/^(abw|bw|m)$/.test(paymentSchedule)) {
    return "Payment schedule must be 'accelerated bi-weekly', 'bi-weekly', or 'monthly'.";
  }

  // check if property price, down payment, and interest rate are positive
  if (propertyPrice < 0 || downPayment < 0 || annualInterestRate < 0) {
    return "Property price, down payment, and interest rate must be positive.";
  }

  // check if annual interest rate is less than or equal to 100
  if (annualInterestRate > 100) {
    return "Annual interest rate must be less than or equal to 100.";
  }

  // check if property price is above $1 million and down payment is at least 20%
  if (propertyPrice > 1000000 && downPayment < propertyPrice * 0.2) {
    return "Property prices above $1 million must have at least 20% down payment.";
  }

  // check if amortization period is in 5-year increments between 5 and 30 years
  if (
    amortizationPeriod < 5 ||
    amortizationPeriod > 30 ||
    amortizationPeriod % 5 !== 0
  ) {
    return "Amortization period must be in 5-year increments between 5 and 30 years.";
  }

  return null;
}

/**
 * Calculate BC mortgage with CMHC insurance.
 * @param {Number} propertyPrice - Property price
 * @param {Number} downPayment - Down payment
 * @returns {Number} - CMHC premium
 */
function calculateCMHCPremium(propertyPrice, downPayment) {
  const downPaymentPercentage = (downPayment / propertyPrice) * 100;
  let cmhcRate = 0;

  // check if down payment is at least 5% of property price
  if (downPaymentPercentage < 5) {
    throw Error("Down payment must be at least 5% of property price.");
  }

  if (downPaymentPercentage >= 5 && downPaymentPercentage < 10) {
    cmhcRate = 0.04;
  } else if (downPaymentPercentage >= 10 && downPaymentPercentage < 15) {
    cmhcRate = 0.031;
  } else if (downPaymentPercentage >= 15 && downPaymentPercentage < 20) {
    cmhcRate = 0.028;
  } else {
    cmhcRate = 0; // no CMHC premium
  }

  return (propertyPrice - downPayment) * cmhcRate;
}

/**
 * Calculate mortgage payment based on payment schedule and amortization period.
 * @param {Number} totalMortgage - total mortgage loan amount
 * @param {String} paymentSchedule - payment schedule ('abw' = accelerated bi-weekly, 'bw' = bi-weekly, 'm' = monthly)
 * @param {Number} amortizationPeriod - amortization period (5 years increments between 5 and 30 years)
 * @param {Number} annualInterestRate - annual interest rate
 * @returns {Number} - mortgage payment per period
 */
function calculateMortgagePayment(
  totalMortgage,
  paymentSchedule,
  amortizationPeriod,
  annualInterestRate
) {
  const numPaymentsPerYear = paymentSchedule === "bw" ? 26 : 12;
  const totalNumPayments = amortizationPeriod * numPaymentsPerYear;
  const peroidicInterestRate = annualInterestRate / 100 / numPaymentsPerYear;
  let payment =
    (totalMortgage *
      (peroidicInterestRate *
        Math.pow(1 + peroidicInterestRate, totalNumPayments))) /
    (Math.pow(1 + peroidicInterestRate, totalNumPayments) - 1);

  // accelerated bi-weekly payment is half of monthly payment made 26 times per year
  if (paymentSchedule === "abw") payment /= 2;

  console.log({
    numPaymentsPerYear,
    totalNumPayments,
    peroidicInterestRate,
    payment,
  });

  return Number(payment.toFixed(2));
}
app.post("/api/v1/calculate-mortgage", (req, res) => {
  try {
    const {
      propertyPrice,
      downPayment,
      annualInterestRate,
      amortizationPeriod,
      paymentSchedule,
    } = req.body;

    // check if all parameters are present and valid
    const isParamValid = mortgageParamValidation(
      propertyPrice,
      downPayment,
      annualInterestRate,
      amortizationPeriod,
      paymentSchedule
    );

    if (isParamValid !== null) {
      res.status(400).json({ error: isParamValid });
      return;
    }

    // calculate CMHC insurance premium if applicable
    const cmhcPremium = calculateCMHCPremium(propertyPrice, downPayment);

    // calculate total mortgage payment
    const mortgageAmount = propertyPrice - downPayment + cmhcPremium;

    // calculate periodic mortgage payment based on payment schedule
    const payment = calculateMortgagePayment(
      mortgageAmount,
      paymentSchedule,
      amortizationPeriod,
      annualInterestRate
    );

    res.status(200).json({ payment: payment });
  } catch (error) {
    console.error("Error calculating mortgage:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Not found route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(PORT, () =>
  console.log(`Server listening at http://localhost:${PORT}`)
);

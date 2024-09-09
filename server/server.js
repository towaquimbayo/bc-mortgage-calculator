const express = require("express");

const PORT = 3000;
const app = express();
app.use(express.json());

app.post("/api/v1/calculate-mortgage", (req, res) => {
  try {
    const {
      propertyPrice,
      downPayment,
      annualInterestRate,
      amortizationPeriod,
      paymentSchedule,
    } = req.body;

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

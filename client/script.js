/**
 * Calculate mortgage with CMHC insurance.
 * @param {Event} e - form submit event
 */
function calculateMortgage(e) {
  e.preventDefault();
  const endpoint = "http://localhost:3000/api/v1/calculate-mortgage";
  const result = document.getElementById("result");

  result.style.display = "block";
  result.innerHTML = "Calculating...";
  result.style.color = "#b9b9b9";

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyPrice: document.getElementById("propertyPrice").value,
      downPayment: document.getElementById("downPayment").value,
      annualInterestRate: document.getElementById("annualInterestRate").value,
      amortizationPeriod: document.getElementById("amortizationPeriod").value,
      paymentSchedule: document.getElementById("paymentSchedule").value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const isError = data.error;
      result.style.color = isError ? "#ff0033" : "#00cc66";
      result.innerHTML = isError
        ? `Error: ${data.error}`
        : `$${data.payment} ${data.paymentSchedule}`;
    })
    .catch((error) => console.error("Error:", error));
}

/**
 *  Autofill form inputs with default values.
 * @param {Event} e - form submit event
 */
function autofill(e) {
  e.preventDefault();
  document.getElementById("propertyPrice").value = 300000;
  document.getElementById("downPayment").value = 42000;
  document.getElementById("annualInterestRate").value = 4.19;
  document.getElementById("amortizationPeriod").value = 25;
  document.getElementById("paymentSchedule").value = "m";
}

/**
 * On page load, attach the event listener to the calculate
 * mortgage button and autofill button.
 */
window.onload = () => {
  const calculateMortgageBtn = document.getElementById("calculateBtn");
  const autofillBtn = document.getElementById("autofillBtn");
  calculateMortgageBtn.addEventListener("click", calculateMortgage);
  autofillBtn.addEventListener("click", autofill);
};

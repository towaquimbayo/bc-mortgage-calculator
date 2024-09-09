/**
 * Calculate mortgage based on inputs:
 * @param {Event} e - form submit event
 */
function calculateMortgage(e) {
  e.preventDefault();
  const endpoint = "http://localhost:3000/api/v1/calculate-mortgage";
  const result = document.getElementById("result");

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
    .then((data) => (result.innerHTML = JSON.stringify(data)))
    .catch((error) => console.error("Error:", error));
}

/**
 * Attaches the event listener to the calculate mortgage button
 * upon page load.
 */
window.onload = () => {
  const calculateMortgageBtn = document.getElementById("calculateBtn");
  calculateMortgageBtn.addEventListener("click", calculateMortgage);
};

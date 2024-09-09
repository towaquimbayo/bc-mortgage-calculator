const request = require("supertest");
const express = require("express");
const app = require("./server");
const endpoint = "/api/v1/calculate-mortgage";

describe(`POST ${endpoint}`, () => {
  it("should return a 200 status response with a valid mortgage payment amount", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("payment");
    expect(response.body.payment).toBe(1432.09);
  });

  it("should return a 400 status response with an invalid property price", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: "invalid",
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Property price is missing or invalid.");
  });

  it("should return a 400 status response with an invalid down payment", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: "invalid",
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Down payment is missing or invalid.");
  });

  it("should return a 400 status response with an invalid annual interest rate", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: "invalid",
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Annual interest rate is missing or invalid."
    );
  });

  it("should return a 400 status response with an invalid amortization period", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: "invalid",
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Amortization period is missing or invalid."
    );
  });

  it("should return a 400 status response with an invalid payment schedule", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "invalid",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Payment schedule must be 'accelerated bi-weekly', 'bi-weekly', or 'monthly'."
    );
  });

  it("should return a 400 status response with negative property price, down payment, or interest rate", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: -50000,
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Property price, down payment, and interest rate must be positive."
    );
  });

  it("should return a 400 status response with an annual interest rate greater than 100", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: 150,
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Annual interest rate must be less than or equal to 100."
    );
  });

  it("should return a 400 status response with a property price above $1 million and down payment less than 20% of property price", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 1500000,
      downPayment: 100000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Property prices above $1 million must have at least 20% down payment."
    );
  });

  it("should return a 400 status response with an amortization period above 30 years", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: 32,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Amortization period must be in 5-year increments between 5 and 30 years."
    );
  });

  it("should return a 500 status response with a down payment lower than 5% of property price", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 4000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "m",
    });

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Down payment must be at least 5% of property price."
    );
  });

  it("should return a 200 status response with a valid accelerated bi-weekly mortgage payment amount", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "abw",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("payment");
    expect(response.body.payment).toBe(716.05);
  });

  it("should return a 200 status response with a valid bi-weekly mortgage payment amount", async () => {
    const response = await request(app).post(endpoint).send({
      propertyPrice: 300000,
      downPayment: 42000,
      annualInterestRate: 4.19,
      amortizationPeriod: 25,
      paymentSchedule: "bw",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("payment");
    expect(response.body.payment).toBe(660.61);
  });
});

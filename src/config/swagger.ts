import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "A comprehensive API for tracking personal expenses and income",
      contact: {
        name: "Developer",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            userId: { type: "integer" },
            budget: { type: "number", nullable: true },
          },
        },
        Expense: {
          type: "object",
          properties: {
            id: { type: "integer" },
            amount: { type: "number" },
            description: { type: "string", nullable: true },
            date: { type: "string", format: "date" },
            userId: { type: "integer" },
            categoryId: { type: "integer" },
            category: { $ref: "#/components/schemas/Category" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Profile", description: "User profile management" },
      { name: "Categories", description: "Category management" },
      { name: "Expenses", description: "Expense management" },
      { name: "Dashboard", description: "Analytics and reports" },
      { name: "Budget", description: "Budget management" },
      { name: "Export", description: "Data export" },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

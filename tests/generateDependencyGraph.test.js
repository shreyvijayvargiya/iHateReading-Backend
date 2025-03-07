import request from "supertest";
import app from "../../server"; // Adjust the path to your server file

describe("POST /generateDependencyGraph", () => {
	it("should generate a dependency graph successfully", async () => {
		const response = await request(app)
			.post("/generateDependencyGraph") // Adjust the endpoint as necessary
			.send({
				userPrompt: "Create a simple web application",
				temperature: 0.8,
				model: "gpt-4o-mini",
			})
			.set("x-user-id", "test-user-id"); // Set any required headers

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("dependencies"); // Adjust based on expected response structure
		expect(response.body).toHaveProperty("devDependencies"); // Adjust based on expected response structure
	});

	it("should return an error if userPrompt is missing", async () => {
		const response = await request(app)
			.post("/generateDependencyGraph")
			.send({
				temperature: 0.8,
				model: "gpt-4o-mini",
			})
			.set("x-user-id", "test-user-id");

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("error", "User prompt is required"); // Adjust based on actual error message
	});

	it("should return an error if the model is invalid", async () => {
		const response = await request(app)
			.post("/generateDependencyGraph")
			.send({
				userPrompt: "Create a simple web application",
				temperature: 0.8,
				model: "invalid-model", // Invalid model
			})
			.set("x-user-id", "test-user-id");

		expect(response.status).toBe(500); // Adjust based on actual error handling
		expect(response.body).toHaveProperty("error"); // Check for error message
	});
});

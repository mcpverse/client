/// <reference types="jest" />
import { MCPVerseClient } from "../src/index";
import { setupTestClient, cleanupTestClient, wait } from "./utils/test-setup";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Increase timeout for network-dependent tests
jest.setTimeout(30000);

describe("Profile Tools", () => {
  let client: MCPVerseClient;

  beforeAll(async () => {
    const setup = await setupTestClient(true);
    client = setup.client;
  });

  afterAll(async () => {
    await cleanupTestClient(client);
  });

  it("should get the current agent profile", async () => {
    const result = await client.tools.profile.getProfile();

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(result.data.id).toBeDefined();
      expect(typeof result.data.id).toBe("string");
      expect(result.data.displayName).toBeDefined();
      expect(typeof result.data.displayName).toBe("string");
      expect(result.data.bio).toBeDefined();
      expect(typeof result.data.bio).toBe("string");
      expect(result.data.impact).toBeDefined();
      expect(typeof result.data.impact).toBe("number");
      expect(result.data.isBanned).toBeDefined();
      expect(typeof result.data.isBanned).toBe("boolean");
      expect(result.data.bannedReason).toBeDefined();
      expect(result.data.bannedAt).toBeDefined();
    }
  });

  it("should update the agent profile", async () => {
    // First get the original profile
    const originalResult = await client.tools.profile.getProfile();
    expect(originalResult.isError).toBe(false);
    if (originalResult.isError) return;

    const originalName = originalResult.data.displayName;
    const originalBio = originalResult.data.bio;
    const newName = `Test Agent ${Date.now()}`;
    const newBio = `Updated bio at ${new Date().toISOString()}`;

    // Update the profile
    const updateResult = await client.tools.profile.updateProfile({
      displayName: newName,
      bio: newBio,
    });

    expect(updateResult.isError).toBe(false);
    if (!updateResult.isError) {
      // The update response should be a BasicSuccessResponse
      expect(updateResult.message).toBeDefined();
      expect(typeof updateResult.message).toBe("string");
    }

    // Wait for the update to propagate
    await wait(2000);

    // Verify the update by fetching the profile again
    const verifyResult = await client.tools.profile.getProfile();
    expect(verifyResult.isError).toBe(false);
    if (!verifyResult.isError) {
      expect(verifyResult.data.displayName).toBe(newName);
      expect(verifyResult.data.bio).toBe(newBio);
    }

    // Revert the changes
    const revertResult = await client.tools.profile.updateProfile({
      displayName: originalName,
      bio: originalBio,
    });

    expect(revertResult.isError).toBe(false);
    if (!revertResult.isError) {
      // The revert response should be a BasicSuccessResponse
      expect(revertResult.message).toBeDefined();
      expect(typeof revertResult.message).toBe("string");
    }

    // Wait for the revert to propagate
    await wait(2000);

    // Verify the revert
    const finalResult = await client.tools.profile.getProfile();
    expect(finalResult.isError).toBe(false);
    if (!finalResult.isError) {
      expect(finalResult.data.displayName).toBe(originalName);
      expect(finalResult.data.bio).toBe(originalBio);
    }
  });

  it("should get the reputation history for the profile", async () => {
    const result = await client.tools.profile.getReputationHistory();

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(Array.isArray(result.data)).toBe(true);

      // Check structure of history items if any exist
      if (result.data.length > 0) {
        const item = result.data[0];
        expect(item.impact).toBeDefined();
        expect(typeof item.impact).toBe("number");
        expect(item.createdAt).toBeDefined();
        expect(typeof item.createdAt).toBe("string");
      }
    }
  });
});

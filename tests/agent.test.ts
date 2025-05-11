/// <reference types="jest" />
import { MCPVerseClient } from "../src/index";
import { setupTestClient, cleanupTestClient } from "./utils/test-setup";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Increase timeout for network-dependent tests
jest.setTimeout(30000);

describe("Agent Tools", () => {
  let client: MCPVerseClient;
  const otherAgentId = process.env.TEST_OTHER_AGENT_ID;

  beforeAll(async () => {
    const setup = await setupTestClient(true);
    client = setup.client;

    if (!otherAgentId) {
      console.warn(
        "Skipping Agent tests: TEST_OTHER_AGENT_ID not set in .env.test",
      );
    }
  });

  afterAll(async () => {
    await cleanupTestClient(client);
  });

  // Skip tests if the required ID is missing
  const describeOrSkip = otherAgentId ? describe : describe.skip;

  describeOrSkip("Operations requiring another Agent ID", () => {
    it("should get information about another agent", async () => {
      const result = await client.tools.agent.getAgent({
        agentId: otherAgentId!,
      });

      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(result.data.id).toBe(otherAgentId);
        expect(result.data.displayName).toBeDefined();
        expect(result.data.bio).toBeDefined();
        expect(result.data.impact).toBeDefined();
        expect(result.data.isBanned).toBeDefined();
        expect(result.data.bannedReason).toBeDefined();
        expect(result.data.bannedAt).toBeDefined();
      }
    });

    it("should get the reputation history for another agent", async () => {
      const result = await client.tools.agent.getAgentReputationHistory({
        agentId: otherAgentId!,
      });

      if (result.isError) {
        console.error("Reputation history error:", result.error);
      }
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(Array.isArray(result.data)).toBe(true);

        // Check structure of history items if any exist
        if (result.data.length > 0) {
          const item = result.data[0];
          expect(item.impact).toBeDefined();
          expect(item.createdAt).toBeDefined();
        }
      }
    });

    it("should list the latest publications for another agent", async () => {
      const result = await client.tools.agent.listLatestAgentPublications({
        agentId: otherAgentId!,
        limit: 10,
      });

      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.items.length).toBeLessThanOrEqual(10);

        // Check structure of publication items if any exist
        if (result.items.length > 0) {
          const item = result.items[0];
          expect(item.id).toBeDefined();
          expect(item.title).toBeDefined();
          expect(item.impact).toBeDefined();
          expect(item.createdAt).toBeDefined();
        }
      }
    });

    it("should list the top-ranked publications for another agent", async () => {
      const result = await client.tools.agent.listTopRankedAgentPublications({
        agentId: otherAgentId!,
        limit: 10,
      });

      if (result.isError) {
        console.error("Top-ranked publications error:", result.error);
      }
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.items.length).toBeLessThanOrEqual(10);

        // Check structure of publication items if any exist
        if (result.items.length > 0) {
          const item = result.items[0];
          expect(item.id).toBeDefined();
          expect(item.title).toBeDefined();
          expect(item.impact).toBeDefined();
          expect(item.createdAt).toBeDefined();

          // Verify items are sorted by impact (descending)
          for (let i = 1; i < result.items.length; i++) {
            expect(result.items[i].impact).toBeLessThanOrEqual(
              result.items[i - 1].impact,
            );
          }
        }
      }
    });
  });
});

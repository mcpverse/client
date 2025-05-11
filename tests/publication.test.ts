/// <reference types="jest" />
import { MCPVerseClient } from "../src/index";
import { setupTestClient, cleanupTestClient, wait } from "./utils/test-setup";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Increase timeout for network-dependent tests
jest.setTimeout(30000);

describe("Publication Tools", () => {
  let client: MCPVerseClient;
  let createdPublicationId: string | null = null;
  const existingPublicationId = process.env.TEST_EXISTING_PUBLICATION_ID;

  beforeAll(async () => {
    const setup = await setupTestClient(true);
    client = setup.client;
  });

  afterAll(async () => {
    if (createdPublicationId) {
      await client.tools.publication.delete({
        publicationId: createdPublicationId,
      });
    }
    await cleanupTestClient(client);
  });

  it("should create a new publication and verify details", async () => {
    const title = `Test Publication ${Date.now()}`;
    const content = `This is the content for the test publication created at ${new Date().toISOString()}`;

    // Create the publication
    const createResult = await client.tools.publication.create({
      title,
      content,
    });

    expect(createResult.isError).toBe(false);
    if (!createResult.isError) {
      expect(createResult.data.publicationId).toBeDefined();
      expect(typeof createResult.data.publicationId).toBe("string");
      createdPublicationId = createResult.data.publicationId;
    }

    // Wait for the publication to be created
    await wait(2000);

    // Fetch the created publication to verify its details
    const getResult = await client.tools.publication.get({
      publicationId: createdPublicationId!,
    });

    expect(getResult.isError).toBe(false);
    if (!getResult.isError) {
      expect(getResult.data.id).toBe(createdPublicationId);
      expect(getResult.data.title).toBe(title);
      expect(getResult.data.content).toBe(content);
      expect(getResult.data.publishedById).toBeDefined();
      expect(getResult.data.createdAt).toBeDefined();
      expect(getResult.data.impact).toBeDefined();
      expect(typeof getResult.data.impact).toBe("number");
    }
  });

  it("should list latest publications and include the created one", async () => {
    expect(createdPublicationId).not.toBeNull();

    const result = await client.tools.publication.listLatest();

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(Array.isArray(result.items)).toBe(true);

      const found = result.items.find((pub) => pub.id === createdPublicationId);
      expect(found).toBeDefined();
      if (found) {
        expect(found.id).toBe(createdPublicationId);
        expect(found.title).toBeDefined();
        expect(found.publishedById).toBeDefined();
        expect(found.createdAt).toBeDefined();
        expect(found.impact).toBeDefined();
        expect(typeof found.impact).toBe("number");
      }
    }
  });

  it("should update the created publication", async () => {
    expect(createdPublicationId).not.toBeNull();

    // Get original publication
    const originalPub = await client.tools.publication.get({
      publicationId: createdPublicationId!,
    });
    expect(originalPub.isError).toBe(false);
    if (originalPub.isError) return;

    const newTitle = `Updated Title ${Date.now()}`;
    const newContent = `Updated content at ${new Date().toISOString()}`;

    // Update the publication
    const updateResult = await client.tools.publication.update({
      publicationId: createdPublicationId!,
      title: newTitle,
      content: newContent,
    });

    expect(updateResult.isError).toBe(false);
    if (!updateResult.isError) {
      expect(updateResult.message).toBeDefined();
      expect(typeof updateResult.message).toBe("string");
    }

    // Wait for the update to propagate
    await wait(2000);

    // Verify the update
    const verifyResult = await client.tools.publication.get({
      publicationId: createdPublicationId!,
    });
    expect(verifyResult.isError).toBe(false);
    if (!verifyResult.isError) {
      expect(verifyResult.data.title).toBe(newTitle);
      expect(verifyResult.data.content).toBe(newContent);
    }
  });

  it("should get the reputation history for the created publication", async () => {
    expect(createdPublicationId).not.toBeNull();

    const result = await client.tools.publication.getReputationHistory({
      publicationId: createdPublicationId!,
    });

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

  it("should add a reaction to the created publication", async () => {
    expect(createdPublicationId).not.toBeNull();
    const reaction = "👍";

    const result = await client.tools.publication.addReaction({
      publicationId: createdPublicationId!,
      reaction,
    });

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe("string");
    }
  });

  // Tests requiring an existing publication ID
  const describeOrSkip = existingPublicationId ? describe : describe.skip;
  describeOrSkip("Operations requiring existing Publication ID", () => {
    it("should get an existing publication by ID", async () => {
      const result = await client.tools.publication.get({
        publicationId: existingPublicationId!,
      });

      // If we get an error, check that it's the expected type
      if (result.isError) {
        expect(result.error.code).toBeDefined();
        expect(typeof result.error.code).toBe("string");
        expect(result.error.message).toBeDefined();
        console.warn(
          `Note: Could not access publication ${existingPublicationId}:`,
          result.error.message,
        );
        return;
      }

      // If we successfully get the publication, verify its structure
      expect(result.data.id).toBe(existingPublicationId);
      expect(result.data.title).toBeDefined();
      expect(result.data.content).toBeDefined();
      expect(result.data.publishedById).toBeDefined();
      expect(result.data.createdAt).toBeDefined();
      expect(result.data.impact).toBeDefined();
      expect(typeof result.data.impact).toBe("number");
    });
  });
});

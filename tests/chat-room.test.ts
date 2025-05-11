/// <reference types="jest" />
import { MCPVerseClient } from "../src/index";
import { setupTestClient, cleanupTestClient, wait } from "./utils/test-setup";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Increase timeout for network-dependent tests
jest.setTimeout(120000); // 2 minutes for room operations

describe("Chat Room Tools", () => {
  let client: MCPVerseClient;
  let createdRoomId: string | null = null;
  const otherAgentId = process.env.TEST_OTHER_AGENT_ID;
  const writeRoomId = process.env.TEST_EXISTING_ROOM_ID; // Room where test agent has WRITE
  const readOnlyRoomId = process.env.TEST_EXISTING_READONLY_ROOM_ID; // Room where test agent has READ

  beforeAll(async () => {
    const setup = await setupTestClient(true);
    client = setup.client;
    if (!otherAgentId || !writeRoomId || !readOnlyRoomId) {
      console.warn(
        `Skipping some Chat Room tests: Required IDs missing in .env.test ` +
          `(Need TEST_OTHER_AGENT_ID, TEST_EXISTING_ROOM_ID, TEST_EXISTING_READONLY_ROOM_ID)`,
      );
    }
  });

  afterAll(async () => {
    if (createdRoomId) {
      await client.tools.chatRoom.delete({ roomId: createdRoomId });
    }
    await cleanupTestClient(client);
  });

  it("should create a new chat room", async () => {
    const roomName = `Test Room ${Date.now()}`;
    const description = `A test room created at ${new Date().toISOString()}`;
    const ttl = 3600;

    const result = await client.tools.chatRoom.create({
      displayName: roomName,
      description,
      messageTtlSeconds: ttl,
    });

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(result.data.roomId).toBeDefined();
      expect(typeof result.data.roomId).toBe("string");
      createdRoomId = result.data.roomId;
    }

    // Wait for the room to be created
    await wait(2000);
  });

  it("should list rooms the agent has access to", async () => {
    const result = await client.tools.chatRoom.listRoomsWithAccess();
    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(Array.isArray(result.items)).toBe(true);
      if (createdRoomId) {
        const found = result.items.find((room) => room.id === createdRoomId);
        expect(found).toBeDefined();
      }
    }
  });

  it("should list public rooms", async () => {
    const result = await client.tools.chatRoom.listPublicRooms();
    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(Array.isArray(result.items)).toBe(true);
    }
  });

  // --- Tests requiring createdRoomId ---
  describe("Operations on Created Room", () => {
    beforeAll(async () => {
      if (!createdRoomId)
        throw new Error("Created room ID is null, cannot run tests");
      const getResult = await client.tools.chatRoom.get({
        roomId: createdRoomId!,
      });
      if (getResult.isError) {
        throw new Error(
          `Created room ${createdRoomId} not found or accessible: ${getResult.error.message}`,
        );
      }
    });

    it("should get the details of the created room", async () => {
      const result = await client.tools.chatRoom.get({
        roomId: createdRoomId!,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(result.data.id).toBe(createdRoomId);
        expect(result.data.displayName).toBeDefined();
      }
    });

    it("should get the current agent's permission for the created room (should be ADMIN)", async () => {
      const result = await client.tools.chatRoom.getRoomPermission({
        roomId: createdRoomId!,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(result.data.permissionLevel).toBe("ADMIN");
      }
    });

    it("should update the created room", async () => {
      const newName = `Updated Test Room ${Date.now()}`;
      const newDesc = "Updated description.";
      const newTtl = 120;

      const updateResult = await client.tools.chatRoom.update({
        roomId: createdRoomId!,
        displayName: newName,
        description: newDesc,
        messageTtlSeconds: newTtl,
      });
      expect(updateResult.isError).toBe(false);

      // Wait for the update to propagate
      await wait(2000);

      // Verify
      const getResult = await client.tools.chatRoom.get({
        roomId: createdRoomId!,
      });
      expect(getResult.isError).toBe(false);
      if (!getResult.isError) {
        expect(getResult.data.displayName).toBe(newName);
        expect(getResult.data.description).toBe(newDesc);
        expect(getResult.data.messageTtlSeconds).toBe(newTtl);
      }
    });

    it("should list permissions for the created room (should include self)", async () => {
      const result = await client.tools.chatRoom.listPermissions({
        roomId: createdRoomId!,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(Array.isArray(result.items)).toBe(true);
        const selfPermission = result.items.find(
          (p) => p.agentId === client["credentials"]?.agentId,
        );
        expect(selfPermission).toBeDefined();
        expect(selfPermission?.permissionLevel).toBe("ADMIN");
      }
    });

    it("should grant WRITE permission to another agent", async () => {
      if (!otherAgentId) return;

      const grantResult = await client.tools.chatRoom.grantPermission({
        roomId: createdRoomId!,
        agentId: otherAgentId,
        permissionLevel: "WRITE",
      });
      expect(grantResult.isError).toBe(false);

      await wait(2000);

      const perms = await client.tools.chatRoom.listPermissions({
        roomId: createdRoomId!,
      });
      expect(perms.isError).toBe(false);
      if (!perms.isError) {
        const otherPerm = perms.items.find((p) => p.agentId === otherAgentId);
        expect(otherPerm).toBeDefined();
        expect(otherPerm?.permissionLevel).toBe("WRITE");
      }
    });

    it("should revoke permission from the other agent", async () => {
      if (!otherAgentId) return;

      const revokeResult = await client.tools.chatRoom.revokePermission({
        roomId: createdRoomId!,
        agentId: otherAgentId,
      });
      expect(revokeResult.isError).toBe(false);

      await wait(2000);
      const perms = await client.tools.chatRoom.listPermissions({
        roomId: createdRoomId!,
      });
      expect(perms.isError).toBe(false);
      if (!perms.isError) {
        const otherPerm = perms.items.find((p) => p.agentId === otherAgentId);
        expect(otherPerm).toBeUndefined();
      }
    });

    it("should send a message to the created room", async () => {
      const content = `Test message @ ${Date.now()}`;

      const result = await client.tools.chatRoom.sendMessage({
        roomId: createdRoomId!,
        content,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(result.message).toBeDefined();
        expect(typeof result.message).toBe("string");
      }

      await wait(2000);
    });

    it("should get messages from the created room", async () => {
      const content = `Message to fetch @ ${Date.now()}`;

      const sendResult = await client.tools.chatRoom.sendMessage({
        roomId: createdRoomId!,
        content,
      });
      expect(sendResult.isError).toBe(false);

      await wait(2000);

      const result = await client.tools.chatRoom.getMessages({
        roomId: createdRoomId!,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.items.length).toBeGreaterThan(0);
        const foundMessage = result.items.find((m) => m.content === content);
        expect(foundMessage).toBeDefined();
        expect(foundMessage?.authorId).toBe(client["credentials"]?.agentId);
      }
    });

    it("should get reputation history for the created room", async () => {
      const result = await client.tools.chatRoom.getReputationHistory({
        roomId: createdRoomId!,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it("should list latest publications in the created room", async () => {
      const result = await client.tools.chatRoom.listLatestPublications({
        roomId: createdRoomId!,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(Array.isArray(result.items)).toBe(true);
      }
    });
  });

  // --- Tests requiring existing room IDs from .env.test ---
  const describeEnvRoom = () =>
    writeRoomId && readOnlyRoomId ? describe : describe.skip;
  describeEnvRoom()("Operations on Existing Rooms (from Env)", () => {
    beforeAll(async () => {
      // Verify the READ_ONLY room's permission level
      const permissionResult = await client.tools.chatRoom.getRoomPermission({
        roomId: readOnlyRoomId!,
      });
      expect(permissionResult.isError).toBe(false);
      if (!permissionResult.isError) {
        expect(permissionResult.data.permissionLevel).toBe("READ");
      }
    });

    it("should successfully send a message to a room with WRITE access", async () => {
      const content = `Test message to write room @ ${Date.now()}`;
      const result = await client.tools.chatRoom.sendMessage({
        roomId: writeRoomId!,
        content,
      });
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(result.message).toBeDefined();
      }
    });

    it("should FAIL to send a message to a room with READ_ONLY access", async () => {
      const content = `This should fail @ ${Date.now()}`;
      const response = await client.tools.chatRoom.sendMessage({
        roomId: readOnlyRoomId!,
        content,
      });
      expect(response.isError).toBe(true);
      if (response.isError) {
        expect(response.error.message).toContain(
          "WRITE permission required to send messages to this room.",
        );
      }
    });

    it("should FAIL to update a room with READ_ONLY access", async () => {
      const response = await client.tools.chatRoom.update({
        roomId: readOnlyRoomId!,
        displayName: `Attempted Update ${Date.now()}`,
      });
      expect(response.isError).toBe(true);
      if (response.isError) {
        expect(response.error.message).toContain(
          "ADMIN permission required to update this room.",
        );
      }
    });
  });
});

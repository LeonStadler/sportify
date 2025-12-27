import jwt from "jsonwebtoken";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { TestDatabase } from "./helpers/test-database.js";

process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

const serverModulePromise = import("../server.js");

const db = new TestDatabase();
let app;
let pool;
let ensureFriendInfrastructure;
let server;
let baseUrl;

const authFetch = async (
  path,
  { method = "GET", token, body, headers = {} } = {}
) => {
  const requestHeaders = { ...headers };
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return response;
};

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

before(async () => {
  try {
    ({ app, pool, ensureFriendInfrastructure } = await serverModulePromise);
    pool.query = (sql, params) => db.query(sql, params);
    pool.connect = async () => ({
      query: (sql, params) => db.query(sql, params),
      release: () => { },
    });
    await ensureFriendInfrastructure();

    await new Promise((resolve, reject) => {
      server = app.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (!address) {
          reject(
            new Error("Server address is null - server may have failed to start")
          );
          return;
        }
        if (typeof address === "string") {
          reject(new Error(`Unexpected server address type: ${address}`));
          return;
        }
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
      server.on("error", reject);
    });
  } catch (error) {
    console.error("Failed to start test server:", error);
    throw error;
  }
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

beforeEach(() => {
  db.reset();
});

describe("Friends API", () => {
  it("handles friend request lifecycle end-to-end", async () => {
    const alice = db.insertUser({
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Anderson",
    });
    const bob = db.insertUser({
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Brown",
    });
    const aliceToken = signToken(alice.id);
    const bobToken = signToken(bob.id);

    const createResponse = await authFetch("/api/friends/requests", {
      method: "POST",
      token: aliceToken,
      body: { targetUserId: bob.id },
    });
    assert.equal(createResponse.status, 201);
    const { requestId } = await createResponse.json();
    assert.ok(requestId);

    const bobRequestsResponse = await authFetch("/api/friends/requests", {
      token: bobToken,
    });
    assert.equal(bobRequestsResponse.status, 200);
    const bobRequests = await bobRequestsResponse.json();
    assert.equal(bobRequests.incoming.length, 1);
    assert.equal(bobRequests.incoming[0].user.id, alice.id);

    const aliceRequestsResponse = await authFetch("/api/friends/requests", {
      token: aliceToken,
    });
    const aliceRequests = await aliceRequestsResponse.json();
    assert.equal(aliceRequests.outgoing.length, 1);
    assert.equal(aliceRequests.outgoing[0].user.id, bob.id);

    const acceptResponse = await authFetch(
      `/api/friends/requests/${requestId}`,
      {
        method: "PUT",
        token: bobToken,
        body: { action: "accept" },
      }
    );
    assert.equal(acceptResponse.status, 200);
    const acceptPayload = await acceptResponse.json();
    assert.equal(acceptPayload.status, "accepted");

    const friendsResponse = await authFetch("/api/friends", {
      token: aliceToken,
    });
    assert.equal(friendsResponse.status, 200);
    const friends = await friendsResponse.json();
    assert.equal(friends.length, 1);
    assert.equal(friends[0].id, bob.id);
    assert.ok(friends[0].friendshipId);

    const bobFriendsResponse = await authFetch("/api/friends", {
      token: bobToken,
    });
    const bobFriends = await bobFriendsResponse.json();
    assert.equal(bobFriends.length, 1);
    assert.equal(bobFriends[0].id, alice.id);
  });

  it("prevents unauthorized acceptance and supports declining requests", async () => {
    const charlie = db.insertUser({
      email: "charlie@example.com",
      firstName: "Charlie",
      lastName: "Clark",
    });
    const diana = db.insertUser({
      email: "diana@example.com",
      firstName: "Diana",
      lastName: "Doe",
    });
    const charlieToken = signToken(charlie.id);
    const dianaToken = signToken(diana.id);

    const createResponse = await authFetch("/api/friends/requests", {
      method: "POST",
      token: charlieToken,
      body: { targetUserId: diana.id },
    });
    const { requestId } = await createResponse.json();

    const invalidAccept = await authFetch(
      `/api/friends/requests/${requestId}`,
      {
        method: "PUT",
        token: charlieToken,
        body: { action: "accept" },
      }
    );
    assert.equal(invalidAccept.status, 403);

    const declineResponse = await authFetch(
      `/api/friends/requests/${requestId}`,
      {
        method: "PUT",
        token: dianaToken,
        body: { action: "decline" },
      }
    );
    assert.equal(declineResponse.status, 200);
    const declinePayload = await declineResponse.json();
    assert.equal(declinePayload.status, "declined");

    const friendsResponse = await authFetch("/api/friends", {
      token: charlieToken,
    });
    const friends = await friendsResponse.json();
    assert.equal(friends.length, 0);
  });
});

describe("User search API", () => {
  it("searches case-insensitively and excludes the current user", async () => {
    const alpha = db.insertUser({
      email: "alpha@example.com",
      firstName: "Alice",
      lastName: "Zenith",
    });
    const bravo = db.insertUser({
      email: "bravo@example.com",
      firstName: "Bob",
      lastName: "Allan",
      nickname: "Bobby",
    });
    const charlie = db.insertUser({
      email: "charlie@example.com",
      firstName: "Carla",
      lastName: "Stone",
    });

    const token = signToken(alpha.id);

    const searchResponse = await authFetch("/api/users/search?query=bo", {
      token,
    });
    assert.equal(searchResponse.status, 200);
    const results = await searchResponse.json();
    assert.equal(results.length, 1);
    assert.equal(results[0].id, bravo.id);
    assert(!results.some((user) => user.id === alpha.id));

    const caseInsensitiveResponse = await authFetch(
      "/api/users/search?query=STO",
      { token }
    );
    const caseInsensitiveResults = await caseInsensitiveResponse.json();
    assert.equal(caseInsensitiveResults.length, 1);
    assert.equal(caseInsensitiveResults[0].id, charlie.id);
  });

  it("requires authentication for search", async () => {
    const response = await fetch(`${baseUrl}/api/users/search?query=test`);
    assert.equal(response.status, 401);
  });
});

describe("Activity feed", () => {
  it("returns activities from the user and their friends only", async () => {
    const user = db.insertUser({
      email: "user@example.com",
      firstName: "Una",
      lastName: "User",
    });
    const friend = db.insertUser({
      email: "friend@example.com",
      firstName: "Frank",
      lastName: "Friend",
    });
    const stranger = db.insertUser({
      email: "stranger@example.com",
      firstName: "Sam",
      lastName: "Stranger",
    });

    const userToken = signToken(user.id);
    const friendToken = signToken(friend.id);

    const requestResponse = await authFetch("/api/friends/requests", {
      method: "POST",
      token: userToken,
      body: { targetUserId: friend.id },
    });
    const { requestId } = await requestResponse.json();

    await authFetch(`/api/friends/requests/${requestId}`, {
      method: "PUT",
      token: friendToken,
      body: { action: "accept" },
    });

    const userWorkout = db.insertWorkout({
      userId: user.id,
      title: "Solo Run",
      workoutDate: new Date("2024-01-01T08:00:00Z"),
    });
    db.insertWorkoutActivity({
      workoutId: userWorkout.id,
      activityType: "running",
      quantity: 5,
      createdAt: new Date("2024-01-01T09:00:00Z"),
    });

    const friendWorkout = db.insertWorkout({
      userId: friend.id,
      title: "Friend Ride",
      workoutDate: new Date("2024-02-01T08:00:00Z"),
    });
    db.insertWorkoutActivity({
      workoutId: friendWorkout.id,
      activityType: "cycling",
      quantity: 20,
      createdAt: new Date("2024-02-01T09:00:00Z"),
    });

    const strangerWorkout = db.insertWorkout({
      userId: stranger.id,
      title: "Hidden Session",
      workoutDate: new Date("2024-03-01T08:00:00Z"),
    });
    db.insertWorkoutActivity({
      workoutId: strangerWorkout.id,
      activityType: "pullups",
      quantity: 15,
      createdAt: new Date("2024-03-01T09:00:00Z"),
    });

    const feedResponse = await authFetch("/api/feed", { token: userToken });
    assert.equal(feedResponse.status, 200);
    const feed = await feedResponse.json();

    // Feed returns 'workouts' with 'userName' instead of 'activities' with 'displayName'
    assert.equal(feed.workouts.length, 2);
    const userNames = feed.workouts.map((workout) => workout.userName);
    assert(userNames.includes("Una"));
    assert(userNames.includes("Frank"));
    assert(!userNames.includes("Sam"));
    // Frank's workout is more recent (2024-02-01) than Una's (2024-01-01)
    assert.equal(feed.workouts[0].userName, "Frank");
  });
});

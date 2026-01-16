import jwt from "jsonwebtoken";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { TestDatabase } from "./helpers/test-database.js";

process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

const serverModulePromise = import("../server.js");

const db = new TestDatabase();
let app;
let pool;
let ensureFriendInfrastructure;
const createMockRequest = ({ method, path, headers, body }) => {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.method = method;
  req.url = path;
  req.headers = Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  );
  req.connection = { remoteAddress: "127.0.0.1" };
  if (body && req.headers["content-type"] === "application/json") {
    try {
      req.body = JSON.parse(body);
    } catch {
      req.body = undefined;
    }
  }
  process.nextTick(() => {
    if (body) {
      req.push(body);
    }
    req.push(null);
  });
  return req;
};

const createMockResponse = (req) => {
  const socket = new Socket();
  const chunks = [];
  socket.write = (chunk, _encoding, callback) => {
    chunks.push(Buffer.from(chunk));
    if (callback) callback();
    return true;
  };
  socket.end = (chunk, _encoding, callback) => {
    if (chunk) chunks.push(Buffer.from(chunk));
    if (callback) callback();
    socket.emit("finish");
    return socket;
  };
  const res = new ServerResponse(req);
  res.assignSocket(socket);
  res.getBody = () => Buffer.concat(chunks).toString("utf-8");
  return res;
};

const appFetch = async (
  path,
  { method = "GET", token, body, headers = {} } = {}
) => {
  const requestHeaders = { ...headers };
  let payload = null;
  if (token) {
    requestHeaders.authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    payload = JSON.stringify(body);
    requestHeaders["content-type"] = "application/json";
    requestHeaders["content-length"] = Buffer.byteLength(payload).toString();
  }

  const req = createMockRequest({
    method,
    path,
    headers: requestHeaders,
    body: payload,
  });
  const res = createMockResponse(req);

  await new Promise((resolve) => {
    res.on("finish", resolve);
    app.handle(req, res);
  });

  const rawBody = res.getBody();
  const responseBody = rawBody.includes("\r\n\r\n")
    ? rawBody.split("\r\n\r\n").slice(1).join("\r\n\r\n")
    : rawBody;

  return {
    status: res.statusCode,
    json: async () => {
      return responseBody ? JSON.parse(responseBody) : {};
    },
    text: async () => responseBody,
  };
};

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

before(async () => {
  ({ app, pool, ensureFriendInfrastructure } = await serverModulePromise);
  pool.query = (sql, params) => db.query(sql, params);
  pool.connect = async () => ({
    query: (sql, params) => db.query(sql, params),
    release: () => {},
  });
  await ensureFriendInfrastructure();
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

    const createResponse = await appFetch("/api/friends/requests", {
      method: "POST",
      token: aliceToken,
      body: { targetUserId: bob.id },
    });
    assert.equal(createResponse.status, 201);
    const { requestId } = await createResponse.json();
    assert.ok(requestId);

    const bobRequestsResponse = await appFetch("/api/friends/requests", {
      token: bobToken,
    });
    assert.equal(bobRequestsResponse.status, 200);
    const bobRequests = await bobRequestsResponse.json();
    assert.equal(bobRequests.incoming.length, 1);
    assert.equal(bobRequests.incoming[0].user.id, alice.id);

    const aliceRequestsResponse = await appFetch("/api/friends/requests", {
      token: aliceToken,
    });
    const aliceRequests = await aliceRequestsResponse.json();
    assert.equal(aliceRequests.outgoing.length, 1);
    assert.equal(aliceRequests.outgoing[0].user.id, bob.id);

    const acceptResponse = await appFetch(
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

    const friendsResponse = await appFetch("/api/friends", {
      token: aliceToken,
    });
    assert.equal(friendsResponse.status, 200);
    const friends = await friendsResponse.json();
    assert.equal(friends.length, 1);
    assert.equal(friends[0].id, bob.id);
    assert.ok(friends[0].friendshipId);

    const bobFriendsResponse = await appFetch("/api/friends", {
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

    const createResponse = await appFetch("/api/friends/requests", {
      method: "POST",
      token: charlieToken,
      body: { targetUserId: diana.id },
    });
    const { requestId } = await createResponse.json();

    const invalidAccept = await appFetch(
      `/api/friends/requests/${requestId}`,
      {
        method: "PUT",
        token: charlieToken,
        body: { action: "accept" },
      }
    );
    assert.equal(invalidAccept.status, 403);

    const declineResponse = await appFetch(
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

    const friendsResponse = await appFetch("/api/friends", {
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

    const searchResponse = await appFetch("/api/users/search?query=bo", {
      token,
    });
    assert.equal(searchResponse.status, 200);
    const results = await searchResponse.json();
    assert.equal(results.length, 1);
    assert.equal(results[0].id, bravo.id);
    assert(!results.some((user) => user.id === alpha.id));

    const caseInsensitiveResponse = await appFetch(
      "/api/users/search?query=STO",
      { token }
    );
    const caseInsensitiveResults = await caseInsensitiveResponse.json();
    assert.equal(caseInsensitiveResults.length, 1);
    assert.equal(caseInsensitiveResults[0].id, charlie.id);
  });

  it("requires authentication for search", async () => {
    const response = await appFetch("/api/users/search?query=test");
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

    const requestResponse = await appFetch("/api/friends/requests", {
      method: "POST",
      token: userToken,
      body: { targetUserId: friend.id },
    });
    const { requestId } = await requestResponse.json();

    await appFetch(`/api/friends/requests/${requestId}`, {
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

    const feedResponse = await appFetch("/api/feed", { token: userToken });
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

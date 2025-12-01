import { randomUUID } from "crypto";

const normalize = (sql) => sql.replace(/\s+/g, " ").trim().toLowerCase();

const SCHEMA_TABLES = {
  users: [
    "id",
    "email",
    "password_hash",
    "first_name",
    "last_name",
    "two_factor_enabled_at",
    "password_changed_at",
  ],
  email_verification_tokens: [
    "id",
    "user_id",
    "token_hash",
    "expires_at",
    "used",
    "used_at",
  ],
  password_reset_tokens: [
    "id",
    "user_id",
    "token_hash",
    "expires_at",
    "used",
    "used_at",
  ],
  outbound_emails: ["id", "recipient", "subject", "body", "sent_at"],
  invitations: [
    "id",
    "email",
    "token_hash",
    "expires_at",
    "status",
    "used",
    "used_at",
  ],
  user_backup_codes: ["id", "user_id", "code_hash", "used_at"],
  friend_requests: ["id", "requester_id", "target_id", "status", "created_at"],
  friendships: ["id", "requester_id", "addressee_id", "status", "created_at"],
  workouts: ["id", "user_id", "title", "workout_date", "duration"],
  workout_activities: [
    "id",
    "workout_id",
    "activity_type",
    "quantity",
    "created_at",
  ],
};

const likeToRegex = (pattern) => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = "^" + escaped.replace(/%/g, ".*").replace(/_/g, ".") + "$";
  return new RegExp(regex, "i");
};

export class TestDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [];
    this.friendRequests = [];
    this.friendships = [];
    this.workouts = [];
    this.workoutActivities = [];
  }

  insertUser({
    id = randomUUID(),
    email,
    firstName,
    lastName,
    nickname = null,
    displayPreference = "firstName",
    avatarUrl = null,
  }) {
    const user = {
      id,
      email,
      first_name: firstName,
      last_name: lastName,
      nickname,
      display_preference: displayPreference,
      avatar_url: avatarUrl,
    };
    this.users.push(user);
    return user;
  }

  insertFriendship({
    id = randomUUID(),
    userOneId,
    userTwoId,
    requesterId,
    addresseeId,
    status = "accepted",
    createdAt = new Date(),
  }) {
    const resolvedRequester = requesterId ?? userOneId;
    const resolvedAddressee = addresseeId ?? userTwoId;
    const ordered = [resolvedRequester, resolvedAddressee]
      .filter(Boolean)
      .sort();

    const friendship = {
      id,
      requester_id: resolvedRequester,
      addressee_id: resolvedAddressee,
      status,
      created_at: createdAt,
      user_one_id: ordered[0] ?? resolvedRequester,
      user_two_id: ordered[1] ?? resolvedAddressee,
    };
    this.friendships.push(friendship);
    return friendship;
  }

  insertFriendRequest({
    id = randomUUID(),
    requesterId,
    targetId,
    status = "pending",
    createdAt = new Date(),
  }) {
    const request = {
      id,
      requester_id: requesterId,
      target_id: targetId,
      status,
      created_at: createdAt,
    };
    this.friendRequests.push(request);
    return request;
  }

  insertWorkout({
    id = randomUUID(),
    userId,
    title,
    workoutDate = new Date(),
    startTime,
    duration = null,
  }) {
    const resolvedStart = startTime ?? workoutDate;
    const workout = {
      id,
      user_id: userId,
      title,
      workout_date: workoutDate,
      start_time: resolvedStart,
      duration,
    };
    this.workouts.push(workout);
    return workout;
  }

  insertWorkoutActivity({
    id = randomUUID(),
    workoutId,
    activityType,
    quantity,
    pointsEarned = 0,
    createdAt = new Date(),
  }) {
    const activity = {
      id,
      workout_id: workoutId,
      activity_type: activityType,
      quantity,
      points_earned: pointsEarned,
      created_at: createdAt,
    };
    this.workoutActivities.push(activity);
    return activity;
  }

  async query(sql, params = []) {
    const normalized = normalize(sql);

    if (normalized.startsWith("select to_regclass")) {
      return { rows: [{ has_users: "users" }], rowCount: 1 };
    }

    if (
      normalized.startsWith(
        "select column_name from information_schema.columns"
      )
    ) {
      const match = sql.match(/table_name\s*=\s*'?([a-zA-Z0-9_]+)'?/i);
      const tableName = (match ? match[1] : params[0])?.toLowerCase();
      const columns =
        tableName && SCHEMA_TABLES[tableName] ? SCHEMA_TABLES[tableName] : [];
      return {
        rows: columns.map((column_name) => ({ column_name })),
        rowCount: columns.length,
      };
    }

    if (
      normalized.startsWith("select exists") &&
      normalized.includes("information_schema.tables")
    ) {
      const tableName = params[0]?.toLowerCase();
      const exists = Boolean(tableName && SCHEMA_TABLES[tableName]);
      return { rows: [{ exists }], rowCount: 1 };
    }

    if (
      normalized.startsWith("select exists") &&
      normalized.includes("information_schema.columns")
    ) {
      const tableName = params[0]?.toLowerCase();
      const columnName = params[1]?.toLowerCase();
      const columns =
        tableName && SCHEMA_TABLES[tableName] ? SCHEMA_TABLES[tableName] : [];
      const exists = columns.some((name) => name.toLowerCase() === columnName);
      return { rows: [{ exists }], rowCount: 1 };
    }

    if (
      normalized.startsWith("create table if not exists friend_requests") ||
      normalized.startsWith("create table if not exists friendships")
    ) {
      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith("select id from users where id = $1")) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
    }

    if (
      normalized.startsWith(
        "select 1 from friendships where ((requester_id = $1 and addressee_id = $2) or (requester_id = $2 and addressee_id = $1)) and status = 'accepted'"
      )
    ) {
      // Handled by the generic friendship existence check below
      // (kept here for query shape parity)
    }

    if (
      normalized.startsWith(
        "select 1 from friendships where user_one_id = $1 and user_two_id = $2"
      )
    ) {
      const [a, b] = params;
      const ordered = [a, b].sort();
      const exists = this.friendships.some(
        (f) => f.user_one_id === ordered[0] && f.user_two_id === ordered[1]
      );
      return {
        rows: exists ? [{ "?column?": 1 }] : [],
        rowCount: exists ? 1 : 0,
      };
    }

    if (
      normalized.startsWith(
        "select 1 from friendships where ((requester_id = $1 and addressee_id = $2) or (requester_id = $2 and addressee_id = $1))"
      )
    ) {
      const [a, b] = params;
      const requireAccepted = normalized.includes("status = 'accepted'");
      const exists = this.friendships.some((f) => {
        const match =
          (f.requester_id === a && f.addressee_id === b) ||
          (f.requester_id === b && f.addressee_id === a);
        return match && (!requireAccepted || f.status === "accepted");
      });
      return {
        rows: exists ? [{ "?column?": 1 }] : [],
        rowCount: exists ? 1 : 0,
      };
    }

    if (
      normalized.startsWith(
        "select 1 from friend_requests where ((requester_id = $1 and target_id = $2) or (requester_id = $2 and target_id = $1)) and status = "
      )
    ) {
      const [a, b] = params;
      const exists = this.friendRequests.some(
        (req) =>
          req.status === "pending" &&
          ((req.requester_id === a && req.target_id === b) ||
            (req.requester_id === b && req.target_id === a))
      );
      return {
        rows: exists ? [{ "?column?": 1 }] : [],
        rowCount: exists ? 1 : 0,
      };
    }

    if (normalized.startsWith("insert into friend_requests")) {
      const [id, requesterId, targetId] = params;
      this.insertFriendRequest({ id, requesterId, targetId });
      return { rows: [], rowCount: 1 };
    }

    if (
      normalized.startsWith(
        "select id, requester_id, target_id, status from friend_requests where id = $1"
      )
    ) {
      const request = this.friendRequests.find((req) => req.id === params[0]);
      return { rows: request ? [request] : [], rowCount: request ? 1 : 0 };
    }

    if (
      normalized.startsWith(
        "update friend_requests set status = $1 where id = $2"
      )
    ) {
      const [status, id] = params;
      const request = this.friendRequests.find((req) => req.id === id);
      if (request) {
        request.status = status;
      }
      return { rows: [], rowCount: request ? 1 : 0 };
    }

    if (
      normalized.startsWith(
        "insert into friendships (id, user_one_id, user_two_id) values ($1, $2, $3) on conflict (user_one_id, user_two_id) do nothing"
      )
    ) {
      const [id, userOneId, userTwoId] = params;
      const ordered = [userOneId, userTwoId].sort();
      const exists = this.friendships.some(
        (f) => f.user_one_id === ordered[0] && f.user_two_id === ordered[1]
      );
      if (!exists) {
        this.insertFriendship({
          id,
          userOneId: ordered[0],
          userTwoId: ordered[1],
        });
      }
      return { rows: [], rowCount: exists ? 0 : 1 };
    }

    if (
      normalized.startsWith(
        "insert into friendships (id, requester_id, addressee_id, status) values ($1, $2, $3, 'accepted') on conflict on constraint friendships_requester_id_addressee_id_key do update set status = 'accepted'"
      )
    ) {
      const [id, requesterId, addresseeId] = params;
      const ordered = [requesterId, addresseeId].sort();
      const existing = this.friendships.find(
        (f) => f.user_one_id === ordered[0] && f.user_two_id === ordered[1]
      );
      if (existing) {
        existing.status = "accepted";
        return { rows: [], rowCount: 1 };
      }
      this.insertFriendship({
        id,
        userOneId: ordered[0],
        userTwoId: ordered[1],
        status: "accepted",
      });
      return { rows: [], rowCount: 1 };
    }

    if (
      normalized.startsWith(
        "insert into friendships (id, requester_id, addressee_id, status)"
      )
    ) {
      const [id, requesterId, addresseeId] = params;
      const existing = this.friendships.find(
        (f) =>
          (f.requester_id === requesterId && f.addressee_id === addresseeId) ||
          (f.requester_id === addresseeId && f.addressee_id === requesterId)
      );
      if (existing) {
        existing.status = "accepted";
        existing.requester_id = requesterId;
        existing.addressee_id = addresseeId;
      } else {
        this.insertFriendship({
          id,
          requesterId,
          addresseeId,
          status: "accepted",
        });
      }
      return { rows: [], rowCount: 1 };
    }

    if (
      normalized.startsWith(
        "select id, requester_id, addressee_id from friendships where id = $1"
      )
    ) {
      const friendship = this.friendships.find((f) => f.id === params[0]);
      if (!friendship) {
        return { rows: [], rowCount: 0 };
      }
      const { id, requester_id, addressee_id } = friendship;
      return { rows: [{ id, requester_id, addressee_id }], rowCount: 1 };
    }
    if (
      normalized.startsWith(
        "select id, user_one_id, user_two_id from friendships where id = $1"
      )
    ) {
      const friendship = this.friendships.find((f) => f.id === params[0]);
      if (!friendship) {
        return { rows: [], rowCount: 0 };
      }
      const { id, user_one_id, user_two_id } = friendship;
      return { rows: [{ id, user_one_id, user_two_id }], rowCount: 1 };
    }

    if (normalized.startsWith("delete from friendships where id = $1")) {
      const index = this.friendships.findIndex((f) => f.id === params[0]);
      if (index >= 0) {
        this.friendships.splice(index, 1);
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (
      normalized.startsWith("select f.id as friendship_id") &&
      normalized.includes("case when f.requester_id = $1")
    ) {
      const userId = params[0];
      const rows = this.friendships
        .filter((f) => f.requester_id === userId || f.addressee_id === userId)
        .sort(
          (a, b) =>
            (b.created_at?.getTime?.() || 0) - (a.created_at?.getTime?.() || 0)
        )
        .map((f) => {
          const friendId =
            f.requester_id === userId ? f.addressee_id : f.requester_id;
          const user = this.users.find((u) => u.id === friendId);
          return {
            friendship_id: f.id,
            friend_id: friendId,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? "firstName",
            avatar_url: user?.avatar_url ?? null,
          };
        });
      return { rows, rowCount: rows.length };
    }

    if (
      normalized.startsWith(
        "select case when requester_id = $1 then addressee_id else requester_id end as friend_id from friendships"
      )
    ) {
      const userId = params[0];
      const rows = this.friendships
        .filter(
          (f) =>
            (f.requester_id === userId || f.addressee_id === userId) &&
            f.status === "accepted"
        )
        .map((f) => ({
          friend_id:
            f.requester_id === userId ? f.addressee_id : f.requester_id,
        }));
      return { rows, rowCount: rows.length };
    }

    if (normalized.startsWith("select f.id as friendship_id")) {
      const userId = params[0];
      const rows = this.friendships
        .filter((f) => f.status === "accepted")
        .filter((f) => f.user_one_id === userId || f.user_two_id === userId)
        .sort(
          (a, b) =>
            (b.created_at?.getTime?.() || 0) - (a.created_at?.getTime?.() || 0)
        )
        .map((f) => {
          const friendId =
            f.user_one_id === userId ? f.user_two_id : f.user_one_id;
          const user = this.users.find((u) => u.id === friendId);
          return {
            friendship_id: f.id,
            friend_id: friendId,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? "firstName",
            avatar_url: user?.avatar_url ?? null,
          };
        });
      return { rows, rowCount: rows.length };
    }

    if (
      normalized.startsWith(
        "select case when requester_id = $1 then addressee_id else requester_id end as friend_id from friendships"
      )
    ) {
      const [userId] = params;
      const rows = this.friendships
        .filter(
          (f) =>
            f.status === "accepted" &&
            (f.user_one_id === userId || f.user_two_id === userId)
        )
        .map((f) => ({
          friend_id: f.user_one_id === userId ? f.user_two_id : f.user_one_id,
        }));
      return { rows, rowCount: rows.length };
    }

    if (
      normalized.startsWith("select fr.id as request_id") &&
      normalized.includes("fr.target_id = $1")
    ) {
      const userId = params[0];
      const rows = this.friendRequests
        .filter((req) => req.target_id === userId && req.status === "pending")
        .sort((a, b) => b.created_at - a.created_at)
        .map((req) => {
          const user = this.users.find((u) => u.id === req.requester_id);
          return {
            request_id: req.id,
            created_at: req.created_at,
            user_id: user?.id ?? null,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? "firstName",
            avatar_url: user?.avatar_url ?? null,
          };
        });
      return { rows, rowCount: rows.length };
    }

    if (
      normalized.startsWith("select fr.id as request_id") &&
      normalized.includes("fr.requester_id = $1")
    ) {
      const userId = params[0];
      const rows = this.friendRequests
        .filter(
          (req) => req.requester_id === userId && req.status === "pending"
        )
        .sort((a, b) => b.created_at - a.created_at)
        .map((req) => {
          const user = this.users.find((u) => u.id === req.target_id);
          return {
            request_id: req.id,
            created_at: req.created_at,
            user_id: user?.id ?? null,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? "firstName",
            avatar_url: user?.avatar_url ?? null,
          };
        });
      return { rows, rowCount: rows.length };
    }

    if (normalized.startsWith("select wa.id, wa.activity_type")) {
      const [userIds = [], limit = 20, offset = 0] = params;
      const targetIds = new Set(userIds);
      const rows = this.workoutActivities
        .map((activity) => {
          const workout = this.workouts.find(
            (w) => w.id === activity.workout_id
          );
          if (!workout || !targetIds.has(workout.user_id)) {
            return null;
          }
          const user = this.users.find((u) => u.id === workout.user_id);
          return {
            id: activity.id,
            activity_type: activity.activity_type,
            amount: activity.quantity,
            points: activity.points_earned ?? 0,
            start_time: workout.start_time ?? workout.workout_date,
            workout_title: workout.title,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? "firstName",
            avatar_url: user?.avatar_url ?? null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const dateDiff =
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
          if (dateDiff !== 0) return dateDiff;
          return String(b.id).localeCompare(String(a.id));
        });

      const sliced = rows.slice(offset, offset + limit);
      return { rows: sliced, rowCount: sliced.length };
    }

    if (
      normalized.startsWith(
        "select id, email, first_name, last_name, nickname, display_preference, avatar_url from users where ("
      )
    ) {
      const [searchPattern, currentUserId, exactPattern, limit, offset] =
        params;
      const regex = likeToRegex(searchPattern);
      const exactRegex = likeToRegex(exactPattern);

      const filtered = this.users
        .filter((user) => user.id !== currentUserId)
        .filter((user) => {
          const fields = [
            user.first_name,
            user.last_name,
            user.nickname,
            user.email,
          ];
          return fields.some((field) => field && regex.test(field));
        })
        .sort((a, b) => {
          const aPriority = exactRegex.test(a.first_name)
            ? 1
            : exactRegex.test(a.last_name)
              ? 2
              : exactRegex.test(a.nickname ?? "")
                ? 3
                : 4;
          const bPriority = exactRegex.test(b.first_name)
            ? 1
            : exactRegex.test(b.last_name)
              ? 2
              : exactRegex.test(b.nickname ?? "")
                ? 3
                : 4;
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          const first = a.first_name.localeCompare(b.first_name, "de", {
            sensitivity: "base",
          });
          if (first !== 0) return first;
          return a.last_name.localeCompare(b.last_name, "de", {
            sensitivity: "base",
          });
        });

      const sliced = filtered.slice(offset, offset + limit);
      const rows = sliced.map((user) => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        nickname: user.nickname,
        display_preference: user.display_preference,
        avatar_url: user.avatar_url,
      }));
      return { rows, rowCount: rows.length };
    }

    if (
      normalized.startsWith(
        "select id, first_name, last_name, nickname, display_preference, avatar_url from users where id <> $1"
      )
    ) {
      const [currentUserId, pattern, limit, offset] = params;
      const regex = likeToRegex(pattern);
      const filtered = this.users
        .filter((user) => user.id !== currentUserId)
        .filter((user) => {
          const fields = [
            user.first_name,
            user.last_name,
            user.nickname,
            user.email,
          ];
          return fields.some((field) => field && regex.test(field));
        })
        .sort((a, b) => {
          const first = a.first_name.localeCompare(b.first_name, "de", {
            sensitivity: "base",
          });
          if (first !== 0) return first;
          return a.last_name.localeCompare(b.last_name, "de", {
            sensitivity: "base",
          });
        });
      const sliced = filtered.slice(offset, offset + limit);
      const rows = sliced.map((user) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        nickname: user.nickname,
        display_preference: user.display_preference,
        avatar_url: user.avatar_url,
      }));
      return { rows, rowCount: rows.length };
    }

    if (
      normalized.startsWith(
        "select id, email, first_name, last_name, nickname, display_preference, avatar_url from users where ("
      )
    ) {
      const [patternParam, currentUserId, directMatchParam, limit, offset] =
        params;
      const patternRegex = likeToRegex(patternParam);
      const directRegex = likeToRegex(directMatchParam);
      const filtered = this.users
        .filter((user) => user.id !== currentUserId)
        .filter((user) => {
          const fields = [
            user.first_name,
            user.last_name,
            user.nickname,
            user.email,
          ];
          return fields.some((field) => field && patternRegex.test(field));
        })
        .sort((a, b) => {
          const priorityA = directRegex.test(a.first_name)
            ? 1
            : directRegex.test(a.last_name)
              ? 2
              : directRegex.test(a.nickname)
                ? 3
                : 4;
          const priorityB = directRegex.test(b.first_name)
            ? 1
            : directRegex.test(b.last_name)
              ? 2
              : directRegex.test(b.nickname)
                ? 3
                : 4;
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          const first = a.first_name.localeCompare(b.first_name, "de", {
            sensitivity: "base",
          });
          if (first !== 0) return first;
          return a.last_name.localeCompare(b.last_name, "de", {
            sensitivity: "base",
          });
        });
      const sliced = filtered.slice(offset, offset + limit);
      const rows = sliced.map((user) => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        nickname: user.nickname,
        display_preference: user.display_preference,
        avatar_url: user.avatar_url,
      }));
      return { rows, rowCount: rows.length };
    }

    if (normalized.startsWith("with friend_ids as")) {
      const [userId] = params;
      const friendIds = new Set(
        this.friendships
          .filter((f) => f.user_one_id === userId || f.user_two_id === userId)
          .map((f) =>
            f.user_one_id === userId ? f.user_two_id : f.user_one_id
          )
      );
      friendIds.add(userId);

      const rows = this.workoutActivities
        .filter((activity) => {
          const workout = this.workouts.find(
            (w) => w.id === activity.workout_id
          );
          return workout && friendIds.has(workout.user_id);
        })
        .map((activity) => {
          const workout = this.workouts.find(
            (w) => w.id === activity.workout_id
          );
          const user = this.users.find((u) => u.id === workout.user_id);
          return {
            id: activity.id,
            activity_type: activity.activity_type,
            amount: activity.quantity,
            workout_title: workout.title,
            workout_date: workout.workout_date,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? "firstName",
            avatar_url: user?.avatar_url ?? null,
          };
        })
        .sort((a, b) => {
          const dateDiff =
            new Date(b.workout_date).getTime() -
            new Date(a.workout_date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return String(b.id).localeCompare(String(a.id));
        })
        .slice(0, 20);

      return { rows, rowCount: rows.length };
    }

    if (
      normalized.startsWith(
        "select wa.id, wa.activity_type, wa.quantity as amount"
      )
    ) {
      const [userIdsParam, limit, offset] = params;
      let allowedIds = [];
      if (Array.isArray(userIdsParam)) {
        allowedIds = userIdsParam;
      } else if (typeof userIdsParam === "string") {
        allowedIds = userIdsParam
          .replace(/[{}]/g, "")
          .split(",")
          .map((value) => value.trim().replace(/^"|"$/g, ""))
          .filter(Boolean);
      }
      const activities = this.workoutActivities
        .map((activity) => {
          const workout = this.workouts.find(
            (w) => w.id === activity.workout_id
          );
          const user = workout
            ? this.users.find((u) => u.id === workout.user_id)
            : null;
          if (!workout || !user || !allowedIds.includes(workout.user_id)) {
            return null;
          }
          return {
            id: activity.id,
            activity_type: activity.activity_type,
            amount: activity.quantity,
            points: 0,
            start_time: workout.workout_date,
            workout_title: workout.title,
            first_name: user.first_name,
            last_name: user.last_name,
            nickname: user.nickname,
            display_preference: user.display_preference,
            avatar_url: user.avatar_url,
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const dateDiff =
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
          if (dateDiff !== 0) return dateDiff;
          return String(b.id).localeCompare(String(a.id));
        });
      const sliced = activities.slice(
        offset ?? 0,
        (offset ?? 0) + (limit ?? activities.length)
      );
      return { rows: sliced, rowCount: sliced.length };
    }

    // Query: INSERT INTO notifications - just accept it (notifications are non-critical)
    if (
      normalized.startsWith("insert into notifications") &&
      normalized.includes("values")
    ) {
      // Notifications are non-critical, just return success
      return { rows: [], rowCount: 1 };
    }

    // Query: SELECT push_subscriptions for a user (for push notifications)
    if (
      normalized.includes("from push_subscriptions") &&
      normalized.includes("where user_id = $1")
    ) {
      // Return empty array - no push subscriptions in test environment
      return { rows: [], rowCount: 0 };
    }

    // Query: Complex feed query with json_agg (grouped workouts with activities)
    if (
      normalized.includes("json_agg") &&
      normalized.includes("from workouts w") &&
      normalized.includes("join users u on w.user_id = u.id")
    ) {
      const [userIdsParam, limit, offset] = params;
      let allowedIds = [];
      if (Array.isArray(userIdsParam)) {
        allowedIds = userIdsParam;
      } else if (typeof userIdsParam === "string") {
        allowedIds = userIdsParam
          .replace(/[{}]/g, "")
          .split(",")
          .map((value) => value.trim().replace(/^"|"$/g, ""))
          .filter(Boolean);
      }

      // Group activities by workout
      const workoutMap = new Map();
      for (const workout of this.workouts) {
        if (!allowedIds.includes(workout.user_id)) continue;
        const user = this.users.find((u) => u.id === workout.user_id);
        if (!user) continue;

        const activities = this.workoutActivities
          .filter((wa) => wa.workout_id === workout.id)
          .map((wa) => ({
            id: wa.id,
            activityType: wa.activity_type,
            amount: wa.quantity,
            points: 0,
          }));

        workoutMap.set(workout.id, {
          workout_id: workout.id,
          workout_title: workout.title,
          start_time: workout.workout_date,
          workout_notes: workout.notes || null,
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          nickname: user.nickname,
          display_preference: user.display_preference,
          avatar_url: user.avatar_url,
          activities: activities,
          total_points: 0,
        });
      }

      const rows = Array.from(workoutMap.values())
        .sort(
          (a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        )
        .slice(offset ?? 0, (offset ?? 0) + (limit ?? 20));

      return { rows, rowCount: rows.length };
    }

    // Query: SELECT first_name, last_name, nickname, display_preference FROM users WHERE id = $1
    if (
      normalized ===
      "select first_name, last_name, nickname, display_preference from users where id = $1"
    ) {
      const [userId] = params;
      const user = this.users.find((u) => u.id === userId);
      if (!user) {
        return { rows: [], rowCount: 0 };
      }
      return {
        rows: [
          {
            first_name: user.first_name,
            last_name: user.last_name,
            nickname: user.nickname,
            display_preference: user.display_preference,
          },
        ],
        rowCount: 1,
      };
    }

    // Query: Complex user search with NOT EXISTS clauses (friendships and friend_requests exclusions)
    if (
      normalized.includes("from users u") &&
      normalized.includes("and not exists") &&
      normalized.includes("from friendships f") &&
      normalized.includes("from friend_requests fr")
    ) {
      const [patternParam, currentUserId, directMatchParam, limit, offset] =
        params;
      const patternRegex = likeToRegex(patternParam);
      const directRegex = likeToRegex(directMatchParam);

      // Get existing friends
      const friendIds = new Set(
        this.friendships
          .filter(
            (f) =>
              f.status === "accepted" &&
              (f.requester_id === currentUserId ||
                f.addressee_id === currentUserId)
          )
          .map((f) =>
            f.requester_id === currentUserId ? f.addressee_id : f.requester_id
          )
      );

      // Get pending friend requests (both directions)
      const pendingRequestUserIds = new Set(
        this.friendRequests
          .filter(
            (fr) =>
              fr.status === "pending" &&
              (fr.requester_id === currentUserId ||
                fr.target_id === currentUserId)
          )
          .map((fr) =>
            fr.requester_id === currentUserId ? fr.target_id : fr.requester_id
          )
      );

      const filtered = this.users
        .filter((user) => user.id !== currentUserId)
        .filter((user) => !friendIds.has(user.id))
        .filter((user) => !pendingRequestUserIds.has(user.id))
        .filter((user) => {
          const fields = [
            user.first_name,
            user.last_name,
            user.nickname,
            user.email,
          ];
          return fields.some((field) => field && patternRegex.test(field));
        })
        .sort((a, b) => {
          const priorityA = directRegex.test(a.first_name)
            ? 1
            : directRegex.test(a.last_name)
              ? 2
              : directRegex.test(a.nickname)
                ? 3
                : 4;
          const priorityB = directRegex.test(b.first_name)
            ? 1
            : directRegex.test(b.last_name)
              ? 2
              : directRegex.test(b.nickname)
                ? 3
                : 4;
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          const first = a.first_name.localeCompare(b.first_name, "de", {
            sensitivity: "base",
          });
          if (first !== 0) return first;
          return a.last_name.localeCompare(b.last_name, "de", {
            sensitivity: "base",
          });
        });

      const sliced = filtered.slice(offset ?? 0, (offset ?? 0) + (limit ?? 20));
      const rows = sliced.map((user) => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        nickname: user.nickname,
        display_preference: user.display_preference,
        avatar_url: user.avatar_url,
      }));
      return { rows, rowCount: rows.length };
    }

    // Query: SELECT COUNT(DISTINCT w.id) as total FROM workouts w WHERE w.user_id = ANY($1::uuid[])
    if (
      normalized.includes("select count(distinct w.id) as total") &&
      normalized.includes("from workouts w") &&
      normalized.includes("w.user_id = any")
    ) {
      const [userIdsParam] = params;
      let allowedIds = [];
      if (Array.isArray(userIdsParam)) {
        allowedIds = userIdsParam;
      } else if (typeof userIdsParam === "string") {
        allowedIds = userIdsParam
          .replace(/[{}]/g, "")
          .split(",")
          .map((value) => value.trim().replace(/^"|"$/g, ""))
          .filter(Boolean);
      }
      const count = this.workouts.filter((w) =>
        allowedIds.includes(w.user_id)
      ).length;
      return { rows: [{ total: count }], rowCount: 1 };
    }

    throw new Error(`Unsupported query in test database: ${sql}`);
  }
}

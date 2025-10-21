import { randomUUID } from 'crypto';

const normalize = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();

const likeToRegex = (pattern) => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = '^' + escaped.replace(/%/g, '.*').replace(/_/g, '.') + '$';
  return new RegExp(regex, 'i');
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

  insertUser({ id = randomUUID(), email, firstName, lastName, nickname = null, displayPreference = 'firstName', avatarUrl = null }) {
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

  insertFriendship({ id = randomUUID(), userOneId, userTwoId, createdAt = new Date() }) {
    const friendship = {
      id,
      user_one_id: userOneId,
      user_two_id: userTwoId,
      created_at: createdAt,
    };
    this.friendships.push(friendship);
    return friendship;
  }

  insertFriendRequest({ id = randomUUID(), requesterId, targetId, status = 'pending', createdAt = new Date() }) {
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

  insertWorkout({ id = randomUUID(), userId, title, workoutDate = new Date(), duration = null }) {
    const workout = {
      id,
      user_id: userId,
      title,
      workout_date: workoutDate,
      duration,
    };
    this.workouts.push(workout);
    return workout;
  }

  insertWorkoutActivity({ id = randomUUID(), workoutId, activityType, quantity, createdAt = new Date() }) {
    const activity = {
      id,
      workout_id: workoutId,
      activity_type: activityType,
      quantity,
      created_at: createdAt,
    };
    this.workoutActivities.push(activity);
    return activity;
  }

  async query(sql, params = []) {
    const normalized = normalize(sql);

    if (normalized.startsWith('select to_regclass')) {
      return { rows: [{ has_users: 'users' }], rowCount: 1 };
    }

    if (normalized.startsWith('create table if not exists friend_requests') || normalized.startsWith('create table if not exists friendships')) {
      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith('select id from users where id = $1')) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select 1 from friendships where user_one_id = $1 and user_two_id = $2')) {
      const [a, b] = params;
      const exists = this.friendships.some((f) => (f.user_one_id === a && f.user_two_id === b) || (f.user_one_id === b && f.user_two_id === a));
      return { rows: exists ? [{ '?column?': 1 }] : [], rowCount: exists ? 1 : 0 };
    }

    if (normalized.startsWith('select 1 from friend_requests where ((requester_id = $1 and target_id = $2) or (requester_id = $2 and target_id = $1)) and status = ')) {
      const [a, b] = params;
      const exists = this.friendRequests.some((req) => req.status === 'pending' && ((req.requester_id === a && req.target_id === b) || (req.requester_id === b && req.target_id === a)));
      return { rows: exists ? [{ '?column?': 1 }] : [], rowCount: exists ? 1 : 0 };
    }

    if (normalized.startsWith('insert into friend_requests')) {
      const [id, requesterId, targetId] = params;
      this.insertFriendRequest({ id, requesterId, targetId });
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith('select id, requester_id, target_id, status from friend_requests where id = $1')) {
      const request = this.friendRequests.find((req) => req.id === params[0]);
      return { rows: request ? [request] : [], rowCount: request ? 1 : 0 };
    }

    if (normalized.startsWith('update friend_requests set status = $1 where id = $2')) {
      const [status, id] = params;
      const request = this.friendRequests.find((req) => req.id === id);
      if (request) {
        request.status = status;
      }
      return { rows: [], rowCount: request ? 1 : 0 };
    }

    if (normalized.startsWith('insert into friendships (id, user_one_id, user_two_id) values ($1, $2, $3) on conflict (user_one_id, user_two_id) do nothing')) {
      const [id, userOneId, userTwoId] = params;
      const ordered = [userOneId, userTwoId].sort();
      const exists = this.friendships.some((f) => f.user_one_id === ordered[0] && f.user_two_id === ordered[1]);
      if (!exists) {
        this.insertFriendship({ id, userOneId: ordered[0], userTwoId: ordered[1] });
      }
      return { rows: [], rowCount: exists ? 0 : 1 };
    }

    if (normalized.startsWith('select id, user_one_id, user_two_id from friendships where id = $1')) {
      const friendship = this.friendships.find((f) => f.id === params[0]);
      return { rows: friendship ? [friendship] : [], rowCount: friendship ? 1 : 0 };
    }

    if (normalized.startsWith('delete from friendships where id = $1')) {
      const index = this.friendships.findIndex((f) => f.id === params[0]);
      if (index >= 0) {
        this.friendships.splice(index, 1);
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith('select f.id as friendship_id')) {
      const userId = params[0];
      const rows = this.friendships
        .filter((f) => f.user_one_id === userId || f.user_two_id === userId)
        .sort((a, b) => (b.created_at?.getTime?.() || 0) - (a.created_at?.getTime?.() || 0))
        .map((f) => {
          const friendId = f.user_one_id === userId ? f.user_two_id : f.user_one_id;
          const user = this.users.find((u) => u.id === friendId);
          return {
            friendship_id: f.id,
            friend_id: friendId,
            first_name: user?.first_name ?? '',
            last_name: user?.last_name ?? '',
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? 'firstName',
            avatar_url: user?.avatar_url ?? null,
          };
        });
      return { rows, rowCount: rows.length };
    }

    if (normalized.startsWith('select fr.id as request_id') && normalized.includes('fr.target_id = $1')) {
      const userId = params[0];
      const rows = this.friendRequests
        .filter((req) => req.target_id === userId && req.status === 'pending')
        .sort((a, b) => b.created_at - a.created_at)
        .map((req) => {
          const user = this.users.find((u) => u.id === req.requester_id);
          return {
            request_id: req.id,
            created_at: req.created_at,
            user_id: user?.id ?? null,
            first_name: user?.first_name ?? '',
            last_name: user?.last_name ?? '',
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? 'firstName',
            avatar_url: user?.avatar_url ?? null,
          };
        });
      return { rows, rowCount: rows.length };
    }

    if (normalized.startsWith('select fr.id as request_id') && normalized.includes('fr.requester_id = $1')) {
      const userId = params[0];
      const rows = this.friendRequests
        .filter((req) => req.requester_id === userId && req.status === 'pending')
        .sort((a, b) => b.created_at - a.created_at)
        .map((req) => {
          const user = this.users.find((u) => u.id === req.target_id);
          return {
            request_id: req.id,
            created_at: req.created_at,
            user_id: user?.id ?? null,
            first_name: user?.first_name ?? '',
            last_name: user?.last_name ?? '',
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? 'firstName',
            avatar_url: user?.avatar_url ?? null,
          };
        });
      return { rows, rowCount: rows.length };
    }

    if (normalized.startsWith('select id, first_name, last_name, nickname, display_preference, avatar_url from users where id <> $1')) {
      const [currentUserId, pattern, limit, offset] = params;
      const regex = likeToRegex(pattern);
      const filtered = this.users
        .filter((user) => user.id !== currentUserId)
        .filter((user) => {
          const fields = [user.first_name, user.last_name, user.nickname, user.email];
          return fields.some((field) => field && regex.test(field));
        })
        .sort((a, b) => {
          const first = a.first_name.localeCompare(b.first_name, 'de', { sensitivity: 'base' });
          if (first !== 0) return first;
          return a.last_name.localeCompare(b.last_name, 'de', { sensitivity: 'base' });
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

    if (normalized.startsWith('with friend_ids as')) {
      const [userId] = params;
      const friendIds = new Set(
        this.friendships
          .filter((f) => f.user_one_id === userId || f.user_two_id === userId)
          .map((f) => (f.user_one_id === userId ? f.user_two_id : f.user_one_id))
      );
      friendIds.add(userId);

      const rows = this.workoutActivities
        .filter((activity) => {
          const workout = this.workouts.find((w) => w.id === activity.workout_id);
          return workout && friendIds.has(workout.user_id);
        })
        .map((activity) => {
          const workout = this.workouts.find((w) => w.id === activity.workout_id);
          const user = this.users.find((u) => u.id === workout.user_id);
          return {
            id: activity.id,
            activity_type: activity.activity_type,
            amount: activity.quantity,
            workout_title: workout.title,
            workout_date: workout.workout_date,
            first_name: user?.first_name ?? '',
            last_name: user?.last_name ?? '',
            nickname: user?.nickname ?? null,
            display_preference: user?.display_preference ?? 'firstName',
            avatar_url: user?.avatar_url ?? null,
          };
        })
        .sort((a, b) => {
          const dateDiff = new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return String(b.id).localeCompare(String(a.id));
        })
        .slice(0, 20);

      return { rows, rowCount: rows.length };
    }

    throw new Error(`Unsupported query in test database: ${sql}`);
  }
}

/* eslint-disable @typescript-eslint/no-require-imports */
// Real students and the demo sandbox (sample profiles + demo@my.yorku.ca) never see
// each other, and simulated activity only ever reaches the demo account.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { load, mock, useTempWorkspace } = require("./support/harness.cjs");

const workspace = useTempWorkspace("sandbox");
let activeUserId = null;
const currentUser = () => get("SELECT * FROM users WHERE id = ?", [activeUserId]);
mock("@/server/auth/session", { getCurrentUser: currentUser, assertOnboardedUser: currentUser });
mock("next/cache", { revalidatePath() {} });

const { get, run } = load("@/server/db/client");
const { saveProfile } = load("@/server/actions/profile");
const { demoFastForwardCooldowns, demoResetSwipes } = load("@/server/actions/settings");
const { resetDemoAccount } = load("@/server/demo/account");
const { buildDeck } = load("@/server/deck");
const { countUnreadInbox, listInbox } = load("@/server/inbox");
const { getMatchForViewer, listMatches } = load("@/server/matches");
const { canSee } = load("@/server/visibility");
const { birthDateForAge } = load("@/lib/age");

const profile = () => ({
  name: "Sam", birthDate: birthDateForAge(20), major: "Psychology", mainCampus: "keele", degree: "BA", hometown: "",
  residenceStatus: "commuter", residenceId: null, gender: "rather_not_say", genderFilterMode: "everyone",
  photos: [0, 1, 2, 3].map((i) => `/api/placeholder/sandbox-${i}`),
  tagIds: [1, 2, 3], customTag: "",
  prompts: [1, 2, 3].map((promptId) => ({ promptId, answer: "Coffee after class", imageUrl: null })),
});

let real, friend, demo, seedId;
const reload = (id) => get("SELECT * FROM users WHERE id = ?", [id]);

before(async () => {
  await run("INSERT INTO users (id, email, phone, created_at) VALUES ('real-student', 'real@my.yorku.ca', '14165550150', 1)");
  await run("INSERT INTO users (id, email, name, age, major, main_campus, degree, gender, profile_complete, created_at) VALUES ('real-friend', 'friend@my.yorku.ca', 'Real Friend', 21, 'History', 'keele', 'BA', 'female', 1, 1)");
  activeUserId = "real-student";
  assert.deepEqual(await saveProfile(profile()), { ok: true });

  activeUserId = (await resetDemoAccount()).id;
  await run("UPDATE users SET phone = '14165550151' WHERE id = ?", [activeUserId]);
  assert.deepEqual(await saveProfile(profile()), { ok: true });

  [real, friend, demo] = await Promise.all(["real-student", "real-friend", activeUserId].map(reload));
  seedId = (await get("SELECT id FROM users WHERE is_seed = 1 LIMIT 1")).id;
});
after(() => workspace.cleanup());

test("sample profiles and the demo account start in the sandbox; real students don't", async () => {
  assert.equal(real.is_sandbox, 0);
  assert.equal(friend.is_sandbox, 0);
  assert.equal(demo.is_sandbox, 1);
  assert.equal((await get("SELECT COUNT(*) AS n FROM users WHERE is_seed = 1 AND is_sandbox = 0")).n, 0);
});

test("real students only see real students in Discover", async () => {
  const deck = await buildDeck(real);
  assert.deepEqual(deck.map((card) => card.profile.id), ["real-friend"]);
  assert.equal(await canSee(real, seedId), false);
  assert.equal(await canSee(real, demo.id), false);
  assert.equal(await canSee(await reload(seedId), real.id), false);
});

test("the demo account only sees sample profiles", async () => {
  const deck = await buildDeck(demo);
  assert.ok(deck.length > 0);
  const ids = deck.map((card) => card.profile.id);
  const sandboxIds = new Set((await load("@/server/db/client").all("SELECT id FROM users WHERE is_sandbox = 1")).map((row) => row.id));
  assert.ok(ids.every((id) => sandboxIds.has(id)));
  assert.equal(await canSee(demo, real.id), false);
  assert.equal(await canSee(demo, friend.id), false);
});

test("only the demo account receives simulated likes and comments", async () => {
  const incoming = (id) => Promise.all([
    get("SELECT COUNT(*) AS n FROM swipes WHERE swipee_id = ?", [id]),
    get("SELECT COUNT(*) AS n FROM comments WHERE target_user_id = ?", [id]),
  ]).then(([swipes, comments]) => ({ swipes: swipes.n, comments: comments.n }));
  assert.deepEqual(await incoming(real.id), { swipes: 0, comments: 0 });
  const demoActivity = await incoming(demo.id);
  assert.ok(demoActivity.swipes > 0);
  assert.ok(demoActivity.comments > 0);
  assert.ok((await listInbox(demo)).length > 0);
});

test("activity that crossed audiences before the sandbox existed stays hidden", async () => {
  await run("INSERT INTO comments (id, author_id, target_user_id, target_type, target_id, text, created_at) VALUES ('old-comment', ?, ?, 'photo', 'x', 'hi', 1)", [seedId, real.id]);
  await run("INSERT INTO matches (id, user_a_id, user_b_id, source, created_at) VALUES ('old-match', ?, ?, 'swipe', 1)", [seedId, real.id]);
  assert.deepEqual(await listInbox(real), []);
  assert.equal(await countUnreadInbox(real), 0);
  assert.deepEqual(await listMatches(real), []);
  assert.equal(await getMatchForViewer(real, "old-match"), null);
});

test("demo tools refuse real accounts", async () => {
  activeUserId = real.id;
  assert.equal((await demoResetSwipes()).ok, false);
  assert.equal((await demoFastForwardCooldowns()).ok, false);
  activeUserId = demo.id;
  assert.equal((await demoResetSwipes()).ok, true);
  assert.equal((await demoFastForwardCooldowns()).ok, true);
});

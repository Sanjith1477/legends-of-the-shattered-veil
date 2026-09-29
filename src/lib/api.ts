/**
 * Supabase-backed replacement for src/game/highscores.ts.
 *
 * All functions are async and return `{ data | error }` style results so the
 * existing UI handlers (which already await) can switch over with minimal
 * changes. Keep highscores.ts as the offline fallback / cache layer.
 */
import {
  supabase,
  isSupabaseConfigured,
  usernameEmail,
  type DbProfile,
  type DbMatchResult,
  type OverallRow,
  type HeroRow,
} from './supabase';
import { CLASSES, unlockedClassIdsAtWave } from '../game/data';
import type { HeroBest, PlayerProfile, ScoreEntry } from '../game/highscores';

export interface RunInput {
  classId: string;
  score: number;
  wave: number;
  level: number;
  kills: number;
  gold: number;
  durationSeconds: number;
}

function unavailable() {
  return {
    data: null,
    error: 'OFFLINE MODE: no .env found. Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev.',
  } as const;
}

/**
 * Verifies the browser can actually reach the database and that the
 * tables/policies from the migrations exist. Logged on startup.
 */
export async function checkConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: 'No .env — running offline on localStorage only.' };
  }
  const { error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    if (/does not exist|schema cache|relation/i.test(error.message)) {
      return { ok: false, message: 'Connected, but tables are missing. Run supabase/migrations/0001_init.sql in the SQL Editor.' };
    }
    if (/permission|denied|rls/i.test(error.message)) {
      return { ok: false, message: 'Connected, but permissions are blocked. Run supabase/migrations/0002_grants.sql.' };
    }
    return { ok: false, message: `Supabase error: ${error.message}` };
  }
  return { ok: true, message: 'Connected to Supabase.' };
}

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------

export async function signUpWithUsername(username: string, password: string) {
  if (!isSupabaseConfigured || !supabase) return unavailable();
  const { data, error } = await supabase.auth.signUp({
    email: usernameEmail(username),
    password,
    options: { data: { username } }, // read by the handle_new_user() trigger
  });
  if (error) {
    const msg = /already|registered/i.test(error.message)
      ? 'That username is already registered.'
      : error.message;
    return { data: null, error: msg } as const;
  }
  if (!data.session || !data.user) {
    return {
      data: null,
      error: 'Account created but not signed in. In Supabase: Auth → Providers → Email → turn off Confirm email.',
    } as const;
  }
  const profile = await fetchProfile(data.user.id);
  return { data: profile.data, error: profile.error } as const;
}

export async function signInWithUsername(username: string, password: string) {
  if (!isSupabaseConfigured || !supabase) return unavailable();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameEmail(username),
    password,
  });
  if (error) {
    const msg = /invalid login|invalid credentials/i.test(error.message)
      ? 'Incorrect username or password.'
      : error.message;
    return { data: null, error: msg } as const;
  }
  const profile = data.user ? await fetchProfile(data.user.id) : { data: null, error: null };
  return { data: profile.data, error: profile.error } as const;
}

export async function signOut() {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}

/**
 * Change the signed-in adventurer's password. Verifies the current password
 * by re-authenticating first, so a walk-up attacker on an open session cannot
 * silently take over the account.
 */
export async function changeCloudPassword(username: string, currentPassword: string, newPassword: string) {
  if (!isSupabaseConfigured || !supabase) return unavailable();
  const check = await supabase.auth.signInWithPassword({ email: usernameEmail(username), password: currentPassword });
  if (check.error) return { data: null, error: 'Current password is incorrect.' } as const;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    const msg = /should be different|same/i.test(error.message) ? 'New password must differ from the old one.' : error.message;
    return { data: null, error: msg } as const;
  }
  return { data: true, error: null } as const;
}

export async function currentProfile(): Promise<{ data: DbProfile | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) return { data: null, error: null };
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { data: null, error: null };
  return fetchProfile(data.session.user.id);
}

// ---------------------------------------------------------------------------
// PROFILES
// ---------------------------------------------------------------------------

async function fetchProfile(id: string) {
  if (!supabase) return { data: null, error: 'Supabase is not configured.' } as const;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  return { data: (data as DbProfile) ?? null, error: error?.message ?? null } as const;
}

export async function setPreferredClass(classId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.rpc('set_preferred_class', { p_class_id: classId });
}

function unlocksForWave(wave: number) {
  return unlockedClassIdsAtWave(wave);
}

export function dbProfileToLocal(row: DbProfile, heroBests: Record<string, HeroBest> = {}): PlayerProfile {
  return {
    id: row.id,
    name: row.username,
    createdAt: Date.parse(row.created_at) || Date.now(),
    lastSeen: Date.parse(row.last_seen) || Date.now(),
    preferredClass: row.preferred_class,
    bestScore: row.best_score,
    bestWave: row.best_wave,
    totalKills: row.total_kills,
    runs: row.runs,
    unlockedClasses: unlocksForWave(row.best_wave),
    heroBests,
    discoveredPowers: row.discovered_powers ?? [],
    discoveredShopItems: row.discovered_shop_items ?? [],
  };
}

export async function markCloudDiscovery(kind: 'power' | 'shop', id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.rpc('record_discovery', { p_kind: kind, p_id: id });
}

export async function hydrateProfile(row: DbProfile): Promise<PlayerProfile> {
  if (!supabase) return dbProfileToLocal(row);
  const { data } = await supabase.rpc('my_hero_records');
  const heroBests: Record<string, HeroBest> = {};
  for (const rec of (data as { class_id: string; best_score: number; best_wave: number; runs: number }[] | null) ?? []) {
    heroBests[rec.class_id] = { score: rec.best_score, wave: rec.best_wave, runs: rec.runs };
  }
  return dbProfileToLocal(row, heroBests);
}

export async function fetchCloudState(): Promise<{ profiles: PlayerProfile[]; scores: ScoreEntry[]; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { profiles: [], scores: [], error: 'Supabase is not configured.' };
  }
  const matchPageSize = 500;
  const [profilesRes, matchesRes] = await Promise.all([
    (async () => {
      const rows: DbProfile[] = [];
      for (let offset = 0; ; offset += matchPageSize) {
        const { data, error } = await supabase!
          .from('profiles')
          .select('id,username,preferred_class,best_score,best_wave,total_kills,runs,created_at,last_seen')
          .order('id', { ascending: true })
          .range(offset, offset + matchPageSize - 1);
        if (error) return { data: null, error };
        const page = (data as DbProfile[] | null) ?? [];
        rows.push(...page);
        if (page.length < matchPageSize) break;
      }
      return { data: rows, error: null };
    })(),
    (async () => {
      type MatchRow = Pick<DbMatchResult, 'id' | 'user_id' | 'class_id' | 'score' | 'wave' | 'level' | 'duration_seconds' | 'created_at'> & {
      };
      const rows: MatchRow[] = [];
      for (let offset = 0; ; offset += matchPageSize) {
        const { data, error } = await supabase!
          .from('match_results')
          .select('id,user_id,class_id,score,wave,level,duration_seconds,created_at')
          .order('score', { ascending: false })
          .order('id', { ascending: true })
          .range(offset, offset + matchPageSize - 1);
        if (error) return { data: null, error };
        const page = (data as MatchRow[] | null) ?? [];
        rows.push(...page);
        if (page.length < matchPageSize) break;
      }
      return { data: rows, error: null };
    })(),
  ]);
  if (profilesRes.error) return { profiles: [], scores: [], error: profilesRes.error.message };
  if (matchesRes.error) return { profiles: [], scores: [], error: matchesRes.error.message };

  const profiles = ((profilesRes.data as DbProfile[]) ?? []).map((row) => dbProfileToLocal(row));
  const names = new Map(profiles.map((profile) => [profile.id, profile.name]));
  const scores: ScoreEntry[] = (matchesRes.data ?? [])
    .map((row) => {
      const name = names.get(row.user_id);
      if (!name) return null;
      return {
        name,
        userId: row.user_id,
        userName: name,
        classId: row.class_id,
        score: row.score,
        wave: row.wave,
        level: row.level,
        durationSeconds: row.duration_seconds,
        date: Date.parse(row.created_at),
      };
    })
    .filter((score): score is NonNullable<typeof score> => score !== null);
  return { profiles, scores, error: null };
}

// ---------------------------------------------------------------------------
// MATCHES & UNLOCKS
// ---------------------------------------------------------------------------

export async function recordRun(input: RunInput) {
  if (!isSupabaseConfigured || !supabase) return unavailable();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { data: null, error: 'Not signed in.' } as const;
  const { error } = await supabase.rpc('record_run', {
    p_class_id: input.classId,
    p_score: input.score,
    p_wave: input.wave,
    p_level: input.level,
    p_kills: input.kills,
    p_gold: input.gold,
    p_duration_seconds: input.durationSeconds,
  });
  if (error) return { data: null, error: error.message } as const;
  const profile = await fetchProfile(data.session.user.id);
  return { data: profile.data, error: null } as const;
}

// ---------------------------------------------------------------------------
// LIVE WORLD FEED  (real achievements from real adventurers)
// ---------------------------------------------------------------------------

export interface WorldEvent {
  id: string;
  text: string;
  color: string;
  at: number;
}

const UNLOCK_WAVES: [number, string][] = [
  [8, 'Shieldthane'],
  [15, 'Jaguar Knight'],
  [25, 'Sandseer'],
  [40, 'Tidecaller'],
  [60, 'Riftblade'],
];

const BOSS_NAMES = ['Mizuchi', 'Khorzun', 'Isbrekk', "Balam K'in", "Zar'qun"];
let worldFeedNames = new Map<string, string>();
let worldFeedTopScore = 0;

/** Turn one match row into 1–3 human-readable achievement lines. */
export function eventsFromRun(
  row: { id: string; user_id: string; class_id: string; score: number; wave: number; created_at: string },
  username: string,
  className: string,
  isRecord: boolean
): WorldEvent[] {
  const at = Date.parse(row.created_at) || Date.now();
  const out: WorldEvent[] = [];
  if (isRecord) {
    out.push({ id: `${row.id}-rec`, at, color: '#ffd97a', text: `[Legend] ${username} set a new realm record: ${row.score.toLocaleString()} as the ${className}!` });
  }
  if (row.wave >= 5 && row.wave % 5 === 0) {
    const boss = BOSS_NAMES[((row.wave / 5 - 1) % BOSS_NAMES.length + BOSS_NAMES.length) % BOSS_NAMES.length];
    out.push({ id: `${row.id}-boss`, at, color: '#ff9a9a', text: `[Realm] ${username} felled ${boss} on wave ${row.wave}!` });
  }
  const unlock = UNLOCK_WAVES.find(([w]) => w === row.wave || (row.wave > w && row.wave < w + 2));
  if (unlock && row.wave >= unlock[0]) {
    out.push({ id: `${row.id}-unlock`, at, color: '#46c8a8', text: `[Realm] ${username} has earned the ${unlock[1]}.` });
  }
  if (out.length === 0) {
    out.push({ id: `${row.id}-run`, at, color: '#9fb0c8', text: `[World] ${username} reached wave ${row.wave} as the ${className} · ${row.score.toLocaleString()} pts` });
  }
  return out;
}

export async function fetchRecentEvents(limit = 14): Promise<WorldEvent[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const [runsRes, profilesRes, topRes] = await Promise.all([
    supabase.from('match_results').select('id,user_id,class_id,score,wave,created_at').order('created_at', { ascending: false }).limit(limit),
    supabase.from('profiles').select('id,username'),
    supabase.from('match_results').select('score').order('score', { ascending: false }).limit(1),
  ]);
  const names = new Map(((profilesRes.data as { id: string; username: string }[]) ?? []).map((p) => [p.id, p.username]));
  const top = ((topRes.data as { score: number }[]) ?? [])[0]?.score ?? 0;
  worldFeedNames = names;
  worldFeedTopScore = top;
  const out: WorldEvent[] = [];
  for (const row of ((runsRes.data as { id: string; user_id: string; class_id: string; score: number; wave: number; created_at: string }[]) ?? [])) {
    const cls = CLASSES.find((c) => c.id === row.class_id);
    out.push(...eventsFromRun(row, names.get(row.user_id) ?? 'A wanderer', cls?.name ?? row.class_id, row.score >= top && top > 0));
  }
  return out.sort((a, b) => b.at - a.at).slice(0, limit);
}

/** Subscribe to new runs in real time. Returns an unsubscribe function. */
export function subscribeToRuns(onEvents: (events: WorldEvent[]) => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const channel = supabase
    .channel('world-feed')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_results' }, async (payload) => {
      const row = payload.new as { id: string; user_id: string; class_id: string; score: number; wave: number; created_at: string };
      if (row.score > worldFeedTopScore) worldFeedTopScore = row.score;
      const cls = CLASSES.find((c) => c.id === row.class_id);
      onEvents(eventsFromRun(row, worldFeedNames.get(row.user_id) ?? 'A wanderer', cls?.name ?? row.class_id, row.score >= worldFeedTopScore));
    })
    .subscribe();
  return () => {
    supabase!.removeChannel(channel);
  };
}

/** True realm presence: how many adventurers currently have the game open. */
export function joinPresence(profileId: string, username: string, onCount: (n: number) => void): () => void {
  if (!isSupabaseConfigured || !supabase) {
    onCount(1);
    return () => {};
  }
  const channel = supabase.channel('realm-presence', { config: { presence: { key: profileId } } });
  channel
    .on('presence', { event: 'sync' }, () => {
      onCount(Math.max(1, Object.keys(channel.presenceState()).length));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ username, at: Date.now() });
    });
  return () => {
    supabase!.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// REMOTE PATCH NOTES (optional — merged with bundled notes)
// ---------------------------------------------------------------------------

export interface RemotePatchNote {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  changes: { kind: 'new' | 'improved' | 'balance' | 'fixed'; text: string }[];
}

export async function fetchRemotePatchNotes(): Promise<RemotePatchNote[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('patch_notes').select('version,date,title,highlights,changes').eq('published', true);
  if (error || !data) return [];
  return (data as RemotePatchNote[]).map((n) => ({ ...n, highlights: n.highlights ?? [], changes: n.changes ?? [] }));
}

// ---------------------------------------------------------------------------
// LEADERBOARDS
// ---------------------------------------------------------------------------

export async function overallLeaderboard(limit = 10) {
  if (!isSupabaseConfigured || !supabase) return unavailable();
  const { data, error } = await supabase.rpc('overall_leaderboard', { p_limit: limit });
  return { data: (data as OverallRow[]) ?? [], error: error?.message ?? null } as const;
}

export async function heroLeaderboard(classId: string, limit = 10) {
  if (!isSupabaseConfigured || !supabase) return unavailable();
  const { data, error } = await supabase.rpc('hero_leaderboard', { p_class_id: classId, p_limit: limit });
  return { data: (data as HeroRow[]) ?? [], error: error?.message ?? null } as const;
}

export async function recentRuns(classId?: string, limit = 10) {
  if (!isSupabaseConfigured || !supabase) return unavailable();
  let query = supabase
    .from('match_results')
    .select('*, profiles(username)')
    .order('score', { ascending: false })
    .limit(limit);
  if (classId) query = query.eq('class_id', classId);
  const { data, error } = await query;
  return { data: (data as (DbMatchResult & { profiles: { username: string } | null })[]) ?? [], error: error?.message ?? null } as const;
}

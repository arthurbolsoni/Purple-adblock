//! The HTTP side: requests for Twitch's hosts (forwarded by the e2e Fetch bridge with the original URL in
//! `X-Sim-Url`, or sent straight with their `Host`), the isolated page (T-008) and the control API under `/_sim/`.

use crate::gql;
use crate::playlist::{self, Counts, Timeline};
use crate::scenario::Scenario;
use axum::body::{Body, Bytes};
use axum::extract::{Request, State};
use axum::http::{HeaderMap, HeaderValue, Method, StatusCode};
use axum::response::Response;
use axum::Router;
use percent_encoding::percent_decode_str;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

pub type Clock = Arc<dyn Fn() -> i64 + Send + Sync>;

pub fn system_clock() -> Clock {
    Arc::new(|| chrono::Utc::now().timestamp_millis())
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry {
    /// ms since the scenario was loaded
    pub at: i64,
    pub method: String,
    pub url: String,
    pub host: String,
    pub path: String,
    pub status: u16,
    /// segment requests: whether the URI is an ad segment (or the ad rendition's init)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ad: Option<bool>,
    /// usher requests: the session created; playlist and segment requests: the session asked for
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub player_type: Option<String>,
    pub headers: BTreeMap<String, String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub id: u64,
    pub player_type: String,
    /// global segment that was the newest at its first media playlist poll
    pub first: Option<i64>,
}

pub struct Sim {
    pub scenario: Option<Scenario>,
    pub epoch_ms: i64,
    pub sessions: Vec<Session>,
    pub log: Vec<LogEntry>,
    counts: HashMap<String, Counts>,
    dirs: Dirs,
}

#[derive(Clone)]
pub struct Dirs {
    pub scenarios: PathBuf,
    pub media: PathBuf,
    pub page: PathBuf,
}

#[derive(Clone)]
pub struct App {
    pub sim: Arc<Mutex<Sim>>,
    pub clock: Clock,
}

impl App {
    pub fn new(dirs: Dirs, clock: Clock) -> App {
        let sim = Sim { scenario: None, epoch_ms: clock(), sessions: Vec::new(), log: Vec::new(), counts: HashMap::new(), dirs };
        App { sim: Arc::new(Mutex::new(sim)), clock }
    }

    /// Loads a scenario: new stream clock, no session, empty log.
    pub fn load(&self, scenario: Scenario) {
        let mut sim = self.sim.lock().unwrap();
        sim.counts = scenario
            .variants
            .iter()
            .map(|v| (v.name.clone(), Counts { live: count(&sim.dirs.media.join(&v.live)), ad: count(&sim.dirs.media.join(&v.ad)) }))
            .collect();
        sim.scenario = Some(scenario);
        sim.epoch_ms = (self.clock)();
        sim.sessions.clear();
        sim.log.clear();
    }

    pub fn router(self) -> Router {
        Router::new().fallback(handle).with_state(self)
    }
}

/// Media files in a rendition folder (`seg-000.ts`, ...); 30 when the folder is not there (playlists still work).
fn count(dir: &Path) -> u64 {
    match std::fs::read_dir(dir) {
        Ok(entries) => entries.filter_map(Result::ok).filter(|e| e.file_name().to_string_lossy().starts_with("seg-")).count() as u64,
        Err(_) => 30,
    }
}

struct Target {
    url: String,
    host: String,
    path: String,
    query: HashMap<String, String>,
}

fn target(headers: &HeaderMap, uri: &axum::http::Uri) -> Target {
    let url = headers
        .get("x-sim-url")
        .and_then(|v| v.to_str().ok())
        .map(String::from)
        .unwrap_or_else(|| format!("http://{}{}", headers.get("host").and_then(|h| h.to_str().ok()).unwrap_or("127.0.0.1"), uri));
    let without_scheme = url.split("://").nth(1).unwrap_or(&url);
    let (host, rest) = without_scheme.split_once('/').map(|(h, r)| (h, format!("/{r}"))).unwrap_or((without_scheme, "/".into()));
    let (path, query) = rest.split_once('?').map(|(p, q)| (p.to_string(), q.to_string())).unwrap_or((rest.clone(), String::new()));
    let query = query
        .split('&')
        .filter(|p| !p.is_empty())
        .map(|p| {
            let (k, v) = p.split_once('=').unwrap_or((p, ""));
            (k.to_string(), percent_decode_str(&v.replace('+', " ")).decode_utf8_lossy().into_owned())
        })
        .collect();
    Target { url: url.clone(), host: host.split(':').next().unwrap_or(host).to_string(), path, query }
}

fn respond(status: StatusCode, content_type: &str, body: impl Into<Body>) -> Response {
    let mut response = Response::new(body.into());
    *response.status_mut() = status;
    let h = response.headers_mut();
    h.insert("content-type", HeaderValue::from_str(content_type).unwrap());
    h.insert("access-control-allow-origin", HeaderValue::from_static("*"));
    h.insert("access-control-allow-headers", HeaderValue::from_static("*"));
    h.insert("access-control-allow-methods", HeaderValue::from_static("GET, POST, OPTIONS"));
    response
}

const M3U8: &str = "application/vnd.apple.mpegurl";

async fn handle(State(app): State<App>, request: Request) -> Response {
    let (parts, body) = request.into_parts();
    let body: Bytes = axum::body::to_bytes(body, 16 * 1024 * 1024).await.unwrap_or_default();
    let t = target(&parts.headers, &parts.uri);
    let now = (app.clock)();
    let headers: BTreeMap<String, String> = parts
        .headers
        .iter()
        .filter(|(k, _)| k.as_str() != "x-sim-url")
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();

    if parts.method == Method::OPTIONS {
        return respond(StatusCode::NO_CONTENT, "text/plain", Body::empty());
    }
    if t.path.starts_with("/_sim/") && !t.host.ends_with("twitch.tv") && !t.host.ends_with("ttvnw.net") {
        return control(&app, &parts.method, &t, &body);
    }
    if t.path.starts_with("/page/") && !t.host.ends_with("twitch.tv") && !t.host.ends_with("ttvnw.net") {
        let dir = app.sim.lock().unwrap().dirs.page.clone();
        return file(&dir, t.path.trim_start_matches("/page/"));
    }

    let mut entry = LogEntry {
        at: 0,
        method: parts.method.to_string(),
        url: t.url.clone(),
        host: t.host.clone(),
        path: t.path.clone(),
        status: 0,
        ad: None,
        session: None,
        player_type: None,
        headers,
    };
    let response = twitch(&app, &parts.method, &t, &body, now, &mut entry);
    let mut sim = app.sim.lock().unwrap();
    entry.at = now - sim.epoch_ms;
    entry.status = response.status().as_u16();
    sim.log.push(entry);
    response
}

fn twitch(app: &App, method: &Method, t: &Target, body: &Bytes, now: i64, entry: &mut LogEntry) -> Response {
    let mut sim = app.sim.lock().unwrap();
    let Some(scenario) = sim.scenario.clone() else {
        return respond(StatusCode::SERVICE_UNAVAILABLE, "text/plain", "no scenario loaded");
    };
    let host = t.host.as_str();

    if host == "usher.ttvnw.net" {
        let channel = t
            .path
            .strip_prefix("/api/channel/hls/")
            .or_else(|| t.path.strip_prefix("/api/v2/channel/hls/"))
            .and_then(|p| p.strip_suffix(".m3u8"));
        if channel != Some(scenario.channel.as_str()) {
            return respond(StatusCode::NOT_FOUND, "text/plain", "channel offline");
        }
        let player_type = gql::player_type_of(t.query.get("token").map(String::as_str));
        let id = sim.sessions.len() as u64 + 1;
        sim.sessions.push(Session { id, player_type: player_type.clone(), first: None });
        entry.session = Some(id);
        entry.player_type = Some(player_type);
        return respond(StatusCode::OK, M3U8, playlist::master(&scenario, id, now));
    }

    if host.ends_with(".ttvnw.net") && t.path.starts_with("/v1/playlist/") {
        let rest = t.path.trim_start_matches("/v1/playlist/").trim_end_matches(".m3u8");
        let Some((session, variant)) = rest.split_once('/') else {
            return respond(StatusCode::NOT_FOUND, "text/plain", "no such playlist");
        };
        let (Ok(id), Some(v)) = (session.parse::<u64>(), scenario.variant(variant).cloned()) else {
            return respond(StatusCode::NOT_FOUND, "text/plain", "no such playlist");
        };
        let epoch = sim.epoch_ms;
        let newest = playlist::newest(&scenario, epoch, now);
        let Some(s) = sim.sessions.get_mut(id as usize - 1) else {
            return respond(StatusCode::NOT_FOUND, "text/plain", "no such session");
        };
        let first = *s.first.get_or_insert(newest);
        let timeline = Timeline { session: id, epoch_ms: epoch, first, breaks: scenario.breaks_for(&s.player_type) };
        entry.session = Some(id);
        entry.player_type = Some(s.player_type.clone());
        let counts = sim.counts.get(&v.name).copied().unwrap_or(Counts { live: 30, ad: 30 });
        let (text, _) = playlist::media(&scenario, &v, &timeline, counts, now);
        return respond(StatusCode::OK, M3U8, text);
    }

    // segments on *.ttvnw.net; the player's POSTs to <id>.rufio.hls.live-video.net/v1/segment/ (B-047)
    if (host.ends_with(".ttvnw.net") || host.ends_with(".live-video.net")) && t.path.starts_with("/v1/segment/") {
        if method == Method::POST {
            return respond(StatusCode::NO_CONTENT, "text/plain", Body::empty());
        }
        let counts = sim.counts.clone();
        let session = t.path.trim_start_matches("/v1/segment/").split('/').next().and_then(|s| s.parse().ok());
        entry.session = session;
        let parsed = t
            .path
            .split('/')
            .nth(4)
            .and_then(|variant| counts.get(variant))
            .and_then(|c| playlist::parse_segment_path(&t.path, *c));
        let Some(seg) = parsed else {
            return respond(StatusCode::NOT_FOUND, "text/plain", "no such segment");
        };
        let Some(v) = scenario.variant(&seg.variant) else {
            return respond(StatusCode::NOT_FOUND, "text/plain", "no such variant");
        };
        entry.ad = Some(seg.ad);
        let folder = sim.dirs.media.join(if seg.ad { &v.ad } else { &v.live });
        let name = match seg.number {
            None => "init.mp4".to_string(),
            Some(n) => format!("seg-{n:03}.{}", if v.fmp4 { "m4s" } else { "ts" }),
        };
        drop(sim);
        return file(&folder, &name);
    }

    if host == "gql.twitch.tv" {
        if t.path == "/integrity" {
            return respond(StatusCode::OK, "application/json", gql::integrity(now).to_string());
        }
        if t.path == "/gql" {
            let text = String::from_utf8_lossy(body);
            return respond(StatusCode::OK, "application/json", gql::answer(&scenario, &text).to_string());
        }
    }

    if host == "edge.ads.twitch.tv" {
        // the client-side ad request; it should never get here with Purple on (F-04)
        return respond(StatusCode::NO_CONTENT, "text/plain", Body::empty());
    }

    respond(StatusCode::NOT_FOUND, "text/plain", "not simulated")
}

fn file(dir: &Path, name: &str) -> Response {
    if name.split('/').any(|p| p == ".." || p.is_empty()) {
        return respond(StatusCode::NOT_FOUND, "text/plain", "not found");
    }
    let path = dir.join(name);
    let content_type = match path.extension().and_then(|e| e.to_str()) {
        Some("ts") => "video/mp2t",
        Some("mp4") => "video/mp4",
        Some("m4s") => "video/iso.segment",
        Some("html") => "text/html",
        Some("js") => "text/javascript",
        Some("wasm") => "application/wasm",
        Some("m3u8") => M3U8,
        _ => "application/octet-stream",
    };
    match std::fs::read(&path) {
        Ok(bytes) => respond(StatusCode::OK, content_type, bytes),
        Err(_) => respond(StatusCode::NOT_FOUND, "text/plain", "not found"),
    }
}

fn control(app: &App, method: &Method, t: &Target, body: &Bytes) -> Response {
    match (method.as_str(), t.path.as_str()) {
        ("GET", "/_sim/health") => respond(StatusCode::OK, "text/plain", "ok"),
        ("GET", "/_sim/scenario") => {
            let sim = app.sim.lock().unwrap();
            respond(StatusCode::OK, "application/json", serde_json::to_string(&sim.scenario).unwrap())
        }
        ("POST", "/_sim/scenario") => {
            // a scenario file name (`?name=l2-02-preroll`) or a scenario in the body
            let text = match t.query.get("name") {
                Some(name) => {
                    let dir = app.sim.lock().unwrap().dirs.scenarios.clone();
                    if name.contains(['/', '\\', '.']) {
                        return respond(StatusCode::BAD_REQUEST, "text/plain", "bad name");
                    }
                    match std::fs::read_to_string(dir.join(format!("{name}.json"))) {
                        Ok(text) => text,
                        Err(e) => return respond(StatusCode::NOT_FOUND, "text/plain", e.to_string()),
                    }
                }
                None => String::from_utf8_lossy(body).into_owned(),
            };
            match Scenario::from_json(&text) {
                Ok(scenario) => {
                    let id = scenario.id.clone();
                    app.load(scenario);
                    respond(StatusCode::OK, "text/plain", format!("loaded {id}"))
                }
                Err(e) => respond(StatusCode::BAD_REQUEST, "text/plain", e),
            }
        }
        ("GET", "/_sim/log") => {
            let sim = app.sim.lock().unwrap();
            respond(StatusCode::OK, "application/json", serde_json::to_string(&serde_json::json!({ "sessions": sim.sessions, "log": sim.log })).unwrap())
        }
        ("DELETE", "/_sim/log") => {
            app.sim.lock().unwrap().log.clear();
            respond(StatusCode::NO_CONTENT, "text/plain", Body::empty())
        }
        _ => respond(StatusCode::NOT_FOUND, "text/plain", "unknown control path"),
    }
}

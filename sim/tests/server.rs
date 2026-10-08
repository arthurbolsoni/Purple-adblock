//! The server end to end through its router: usher sessions per token, media playlists on the stream clock, segment
//! files with their ad flag in the request log, GQL, `edge.ads` and the control API.

use axum::body::Body;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use serde_json::Value;
use sim::gql::token_value;
use sim::scenario::Scenario;
use sim::server::{App, Dirs};
use std::path::PathBuf;
use std::sync::atomic::{AtomicI64, Ordering};
use std::sync::Arc;
use tower::ServiceExt;

const PREROLL: &str = r#"{
  "id": "T-preroll", "channel": "simchannel", "window": 6,
  "variants": [{ "name": "720p30", "resolution": "1280x720", "bandwidth": 3000000, "codecs": "avc1.4D401F,mp4a.40.2", "live": "live-720p", "ad": "ad-720p" }],
  "breaks": [{ "at": 0, "segments": 4, "roll": "PREROLL" }],
  "playerTypes": { "frontpage": { "breaks": false } }
}"#;

struct Fixture {
    app: App,
    now: Arc<AtomicI64>,
    _dir: TempDir,
}

struct TempDir(PathBuf);
impl Drop for TempDir {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

fn fixture(scenario: &str) -> Fixture {
    let dir = std::env::temp_dir().join(format!("sim-test-{}-{}", std::process::id(), rand_suffix()));
    for (folder, count) in [("live-720p", 3), ("ad-720p", 2)] {
        std::fs::create_dir_all(dir.join("media").join(folder)).unwrap();
        for i in 0..count {
            std::fs::write(dir.join("media").join(folder).join(format!("seg-{i:03}.ts")), format!("{folder} {i}")).unwrap();
        }
    }
    std::fs::create_dir_all(dir.join("page")).unwrap();
    std::fs::write(dir.join("page").join("index.html"), "<html>page</html>").unwrap();
    let now = Arc::new(AtomicI64::new(1_791_400_000_000));
    let clock = {
        let now = now.clone();
        Arc::new(move || now.load(Ordering::SeqCst))
    };
    std::fs::write(dir.join("bundle.js"), "/* purple */").unwrap();
    let dirs = Dirs { scenarios: PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("scenarios"), media: dir.join("media"), page: dir.join("page"), purple: dir.join("bundle.js") };
    let app = App::new(dirs, clock);
    app.load(Scenario::from_json(scenario).unwrap());
    Fixture { app, now, _dir: TempDir(dir) }
}

// one folder per fixture: the tests run in parallel and a clock-based name could be shared
fn rand_suffix() -> u64 {
    static NEXT: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    NEXT.fetch_add(1, Ordering::SeqCst)
}

impl Fixture {
    fn advance(&self, ms: i64) {
        self.now.fetch_add(ms, Ordering::SeqCst);
    }

    /// A request for a Twitch URL as the Fetch bridge forwards it.
    async fn twitch(&self, method: &str, url: &str, body: &str) -> (StatusCode, String) {
        let request = Request::builder().method(method).uri("/").header("host", "127.0.0.1:8787").header("x-sim-url", url).body(Body::from(body.to_string())).unwrap();
        self.send(request).await
    }

    async fn local(&self, method: &str, path: &str, body: &str) -> (StatusCode, String) {
        let request = Request::builder().method(method).uri(path).header("host", "127.0.0.1:8787").body(Body::from(body.to_string())).unwrap();
        self.send(request).await
    }

    async fn send(&self, request: Request<Body>) -> (StatusCode, String) {
        let response = self.app.clone().router().oneshot(request).await.unwrap();
        let status = response.status();
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        (status, String::from_utf8_lossy(&bytes).into_owned())
    }

    async fn log(&self) -> Value {
        serde_json::from_str(&self.local("GET", "/_sim/log", "").await.1).unwrap()
    }
}

fn usher(player_type: &str) -> String {
    let token = token_value("simchannel", player_type, "web");
    let encoded: String = percent_encoding::utf8_percent_encode(&token, percent_encoding::NON_ALPHANUMERIC).to_string();
    format!("https://usher.ttvnw.net/api/v2/channel/hls/simchannel.m3u8?token={encoded}&sig=simsignature")
}

fn variant_url(master: &str) -> String {
    master.lines().find(|l| l.starts_with("https://")).unwrap().to_string()
}

fn uris(playlist: &str) -> Vec<String> {
    playlist.lines().filter(|l| l.starts_with("https://")).map(String::from).collect()
}

#[tokio::test]
async fn each_usher_request_is_a_session_with_its_player_type() {
    let f = fixture(PREROLL);
    let (status, master) = f.twitch("GET", &usher("site"), "").await;
    assert_eq!(status, StatusCode::OK);
    assert!(variant_url(&master).ends_with("/v1/playlist/1/720p30.m3u8"));
    let (_, backup) = f.twitch("GET", &usher("frontpage"), "").await;
    assert!(variant_url(&backup).ends_with("/v1/playlist/2/720p30.m3u8"));
    let log = f.log().await;
    assert_eq!(log["sessions"][0]["playerType"], "site");
    assert_eq!(log["sessions"][1]["playerType"], "frontpage");
    assert_eq!(f.twitch("GET", "https://usher.ttvnw.net/api/channel/hls/other.m3u8", "").await.0, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn the_site_token_gets_its_preroll_and_the_frontpage_token_plays_live() {
    let f = fixture(PREROLL);
    let main = variant_url(&f.twitch("GET", &usher("site"), "").await.1);
    let backup = variant_url(&f.twitch("GET", &usher("frontpage"), "").await.1);
    f.twitch("GET", &main, "").await;
    f.twitch("GET", &backup, "").await;
    f.advance(4_000);
    let (_, ads) = f.twitch("GET", &main, "").await;
    let (_, live) = f.twitch("GET", &backup, "").await;
    assert!(ads.contains("CLASS=\"twitch-stitched-ad\""));
    assert_eq!(ads.matches(",Amazon|SIMAD\n").count(), 3);
    assert!(!live.contains("stitched"));
    // same stream clock: the same PROGRAM-DATE-TIME lines
    let dates = |t: &str| t.lines().filter(|l| l.starts_with("#EXT-X-PROGRAM-DATE-TIME")).map(String::from).collect::<Vec<_>>();
    assert_eq!(dates(&ads), dates(&live));
    // after the break the site token is live too
    f.advance(20_000);
    assert!(!f.twitch("GET", &main, "").await.1.contains("stitched"));
}

#[tokio::test]
async fn segments_come_from_the_rendition_folders_and_the_log_marks_ads() {
    let f = fixture(PREROLL);
    let main = variant_url(&f.twitch("GET", &usher("site"), "").await.1);
    f.advance(2_000);
    let playlist = f.twitch("GET", &main, "").await.1;
    let segments = uris(&playlist);
    let ad = segments.iter().find(|u| u.contains("/ad/")).unwrap();
    let live = segments.iter().find(|u| u.contains("/live/")).unwrap();
    assert_eq!(f.twitch("GET", ad, "").await.1, "ad-720p 0");
    assert!(f.twitch("GET", live, "").await.1.starts_with("live-720p "));
    let log = f.log().await;
    let entries = log["log"].as_array().unwrap();
    let flags: Vec<(String, Value)> = entries.iter().filter(|e| e["path"].as_str().unwrap().starts_with("/v1/segment/")).map(|e| (e["url"].as_str().unwrap().to_string(), e["ad"].clone())).collect();
    assert_eq!(flags, vec![(ad.clone(), Value::Bool(true)), (live.clone(), Value::Bool(false))]);
    assert!(entries.iter().all(|e| e["status"] == 200));
}

#[tokio::test]
async fn gql_integrity_edge_ads_and_segment_posts() {
    let f = fixture(PREROLL);
    let body = r#"{"operationName":"PlaybackAccessToken","query":"q","variables":{"login":"simchannel","playerType":"popout","platform":"web"}}"#;
    let (status, text) = f.twitch("POST", "https://gql.twitch.tv/gql", body).await;
    assert_eq!(status, StatusCode::OK);
    assert!(text.contains("\\\"player_type\\\":\\\"popout\\\""));
    let integrity: Value = serde_json::from_str(&f.twitch("POST", "https://gql.twitch.tv/integrity", "").await.1).unwrap();
    assert_eq!(integrity["token"], "simintegrity");
    assert_eq!(f.twitch("GET", "https://edge.ads.twitch.tv/ads?bp=midroll", "").await.0, StatusCode::NO_CONTENT);
    assert_eq!(f.twitch("POST", "https://x.rufio.hls.live-video.net/v1/segment/abc", "").await.0, StatusCode::NO_CONTENT);
    let log = f.log().await;
    let hosts: Vec<&str> = log["log"].as_array().unwrap().iter().map(|e| e["host"].as_str().unwrap()).collect();
    // the player's bandwidth probe on the segment host, and its reports to *.live-video.net
    let (status, probe) = f.twitch("GET", "https://sim.j.cloudfront.hls.ttvnw.net/probe", "").await;
    assert_eq!((status, probe.len()), (StatusCode::OK, 16 * 1024));
    assert_eq!(f.twitch("POST", "https://global.poe.live-video.net/", "{}").await.0, StatusCode::NO_CONTENT);
    // GQL bodies are in the log, to tell which playerType was asked and how (persisted hash or full query)
    assert_eq!(log["log"][0]["body"]["variables"]["playerType"], "popout");
    assert!(log["log"][2].get("body").is_none());
    assert_eq!(hosts, vec!["gql.twitch.tv", "gql.twitch.tv", "edge.ads.twitch.tv", "x.rufio.hls.live-video.net"]);
}

#[tokio::test]
async fn control_api_loads_scenarios_by_name_and_clears_the_log() {
    let f = fixture(PREROLL);
    f.twitch("GET", &usher("site"), "").await;
    let (status, text) = f.local("POST", "/_sim/scenario?name=l2-01-live", "").await;
    assert_eq!((status, text.as_str()), (StatusCode::OK, "loaded L2-01"));
    let log = f.log().await;
    assert_eq!(log["sessions"].as_array().unwrap().len(), 0);
    assert_eq!(log["log"].as_array().unwrap().len(), 0);
    assert_eq!(f.local("POST", "/_sim/scenario?name=../x", "").await.0, StatusCode::BAD_REQUEST);
    assert_eq!(f.local("POST", "/_sim/scenario", "{}").await.0, StatusCode::BAD_REQUEST);
    let scenario: Value = serde_json::from_str(&f.local("GET", "/_sim/scenario", "").await.1).unwrap();
    assert_eq!(scenario["id"], "L2-01");
}

#[tokio::test]
async fn the_page_folder_is_served_and_control_paths_are_not_logged() {
    let f = fixture(PREROLL);
    assert_eq!(f.local("GET", "/page/index.html", "").await.1, "<html>page</html>");
    assert_eq!(f.local("GET", "/page/purple.js", "").await.1, "/* purple */");
    assert_eq!(f.local("GET", "/page/../Cargo.toml", "").await.0, StatusCode::NOT_FOUND);
    assert_eq!(f.local("GET", "/_sim/health", "").await.1, "ok");
    assert_eq!(f.log().await["log"].as_array().unwrap().len(), 0);
}

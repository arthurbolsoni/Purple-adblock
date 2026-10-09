//! Scenario files (`sim/scenarios/*.json`): what the simulated Twitch server does in one level 2 test.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Scenario {
    /// Level 2 scenario ID (docs/tests.md), for instance `L2-02`.
    pub id: String,
    #[serde(default)]
    pub description: String,
    /// The channel the usher path names; any other channel gets 404.
    pub channel: String,
    /// `EXTINF` of every segment (B-022: 2.000).
    #[serde(default = "default_segment_seconds")]
    pub segment_seconds: f64,
    /// Segments listed per media playlist (Twitch lists 14 when live, B-022).
    #[serde(default = "default_window")]
    pub window: u64,
    /// `EXT-X-TWITCH-PREFETCH` lines after the last live segment (B-022: 2); none during an ad break (B-026).
    #[serde(default = "default_prefetch")]
    pub prefetch: u64,
    pub variants: Vec<Variant>,
    /// Breaks on each token's timeline, in segments from the token's first media playlist poll.
    #[serde(default)]
    pub breaks: Vec<Break>,
    /// Per `playerType`: whether its tokens get the breaks. Types not listed use `default`.
    #[serde(default)]
    pub player_types: HashMap<String, PlayerType>,
    #[serde(default)]
    pub gql: Gql,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Variant {
    /// `NAME` of the variant (`720p30`), also the `VIDEO` group.
    pub name: String,
    pub resolution: String,
    pub bandwidth: u64,
    pub codecs: String,
    #[serde(default = "default_frame_rate")]
    pub frame_rate: f64,
    /// Folder under `sim/media/` with the live rendition (`seg-000.ts`, ... or `init.mp4`, `seg-000.m4s`, ...).
    pub live: String,
    /// Folder under `sim/media/` with the ad rendition.
    pub ad: String,
    /// fMP4: segments come with `EXT-X-MAP` (`init.mp4`) and the `.m4s` extension.
    #[serde(default)]
    pub fmp4: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Break {
    /// First segment of the break, counted from the token's first poll.
    pub at: u64,
    pub segments: u64,
    /// `ssai`: ad segments stitched into the playlist; `maf`: a `twitch-maf-ad` marker over live segments (CSAI, B-032).
    #[serde(default = "default_break_kind")]
    pub kind: BreakKind,
    /// `X-TV-TWITCH-AD-ROLL-TYPE`: `PREROLL` or `MIDROLL`.
    #[serde(default = "default_roll")]
    pub roll: String,
    /// `#EXTINF` title of the ad segments (`Amazon|<id>`, a 10-digit number, `InnovidAds|<id>`; B-035).
    #[serde(default = "default_title")]
    pub title: String,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum BreakKind {
    Ssai,
    Maf,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PlayerType {
    #[serde(default = "yes")]
    pub breaks: bool,
    /// Segments this type's playlists end behind the stream clock (B-048: a backup 1 to 5 behind the main playlist).
    #[serde(default)]
    pub lag: u64,
    /// How far this type's `MEDIA-SEQUENCE` runs ahead of the live sequence: the page token's after its stitched
    /// midrolls, while backup tokens asked before keep 0 (B-054). Same segments and date-times, higher numbers.
    #[serde(default)]
    pub ahead: i64,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Gql {
    /// A `PlaybackAccessToken` request by persisted-query hash gets `PersistedQueryNotFound` (B-014).
    #[serde(default)]
    pub persisted_query_not_found: bool,
    /// `playerType` → error message returned instead of a token (B-015).
    #[serde(default)]
    pub errors: HashMap<String, String>,
}

impl Scenario {
    pub fn from_json(text: &str) -> Result<Scenario, String> {
        let scenario: Scenario = serde_json::from_str(text).map_err(|e| e.to_string())?;
        scenario.check()?;
        Ok(scenario)
    }

    pub fn check(&self) -> Result<(), String> {
        if self.variants.is_empty() {
            return Err(format!("{}: no variant", self.id));
        }
        if self.segment_seconds <= 0.0 || self.window == 0 {
            return Err(format!("{}: segmentSeconds and window must be positive", self.id));
        }
        Ok(())
    }

    /// Whether tokens of `player_type` get the scenario's breaks.
    pub fn breaks_for(&self, player_type: &str) -> bool {
        self.player_types
            .get(player_type)
            .or_else(|| self.player_types.get("default"))
            .map(|p| p.breaks)
            .unwrap_or(true)
    }

    /// Segments the playlists of `player_type` end behind the stream clock (0 unless the scenario sets `lag`).
    pub fn lag_for(&self, player_type: &str) -> u64 {
        self.player_types
            .get(player_type)
            .or_else(|| self.player_types.get("default"))
            .map(|p| p.lag)
            .unwrap_or(0)
    }

    /// How far the `MEDIA-SEQUENCE` of `player_type` runs ahead of the live sequence (0 unless the scenario sets `ahead`).
    pub fn ahead_for(&self, player_type: &str) -> i64 {
        self.player_types
            .get(player_type)
            .or_else(|| self.player_types.get("default"))
            .map(|p| p.ahead)
            .unwrap_or(0)
    }

    pub fn variant(&self, name: &str) -> Option<&Variant> {
        self.variants.iter().find(|v| v.name == name)
    }
}

fn default_segment_seconds() -> f64 {
    2.0
}
fn default_window() -> u64 {
    14
}
fn default_prefetch() -> u64 {
    2
}
fn default_frame_rate() -> f64 {
    30.0
}
fn default_break_kind() -> BreakKind {
    BreakKind::Ssai
}
fn default_roll() -> String {
    "MIDROLL".into()
}
fn default_title() -> String {
    "Amazon|SIMAD".into()
}
fn yes() -> bool {
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    const MINIMAL: &str = r#"{"id":"L2-01","channel":"simchannel","variants":[{"name":"720p30","resolution":"1280x720","bandwidth":3000000,"codecs":"avc1.4D401F,mp4a.40.2","live":"live-720p","ad":"ad-720p"}]}"#;

    #[test]
    fn defaults_follow_the_live_playlist_twitch_serves() {
        let s = Scenario::from_json(MINIMAL).unwrap();
        assert_eq!((s.segment_seconds, s.window, s.prefetch), (2.0, 14, 2));
        assert!(s.breaks.is_empty());
        assert!(s.breaks_for("site"));
    }

    #[test]
    fn player_types_fall_back_to_default_then_to_breaks() {
        let mut s = Scenario::from_json(MINIMAL).unwrap();
        s.player_types.insert("default".into(), PlayerType { breaks: false, ..Default::default() });
        s.player_types.insert("site".into(), PlayerType { breaks: true, ..Default::default() });
        assert!(s.breaks_for("site"));
        assert!(!s.breaks_for("frontpage"));
    }

    #[test]
    fn lag_is_read_per_player_type_with_the_default_and_zero_otherwise() {
        let text = MINIMAL.replace(r#""variants""#, r#""playerTypes":{"default":{"breaks":false,"lag":3},"site":{"breaks":true}},"variants""#);
        let s = Scenario::from_json(&text).unwrap();
        assert_eq!((s.lag_for("frontpage"), s.lag_for("site")), (3, 0));
        assert_eq!(Scenario::from_json(MINIMAL).unwrap().lag_for("site"), 0);
    }

    #[test]
    fn ahead_is_read_per_player_type_with_the_default_and_zero_otherwise() {
        let text = MINIMAL.replace(r#""variants""#, r#""playerTypes":{"popout":{"breaks":true,"ahead":2}},"variants""#);
        let s = Scenario::from_json(&text).unwrap();
        assert_eq!((s.ahead_for("popout"), s.ahead_for("site")), (2, 0));
    }

    #[test]
    fn a_scenario_without_variants_is_refused() {
        let text = MINIMAL.replace(r#""variants":[{"name":"720p30","resolution":"1280x720","bandwidth":3000000,"codecs":"avc1.4D401F,mp4a.40.2","live":"live-720p","ad":"ad-720p"}]"#, r#""variants":[]"#);
        assert!(Scenario::from_json(&text).is_err());
    }

    #[test]
    fn every_scenario_file_loads() {
        let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/scenarios");
        let mut count = 0;
        for entry in std::fs::read_dir(dir).unwrap() {
            let path = entry.unwrap().path();
            if path.extension().and_then(|e| e.to_str()) != Some("json") {
                continue;
            }
            let text = std::fs::read_to_string(&path).unwrap();
            Scenario::from_json(&text).unwrap_or_else(|e| panic!("{}: {e}", path.display()));
            count += 1;
        }
        assert!(count > 0);
    }
}

//! Master and media playlists as Twitch serves them (docs/server/playlists.md, docs/server/ads.md).
//!
//! Segments follow one stream clock for every token: global segment `g` starts at `epoch + g * segment`, so a backup
//! token's live segments carry the same `PROGRAM-DATE-TIME` as the main token's (what the merge by time needs, F-13).
//! Breaks are placed on each token's own timeline, counted from its first media playlist poll (B-029: each new token
//! gets its own preroll).

use crate::scenario::{BreakKind, Scenario, Variant};
use chrono::{DateTime, SecondsFormat, Utc};

pub const PLAYLIST_HOST: &str = "https://video-weaver.sim.hls.ttvnw.net";
pub const SEGMENT_HOST: &str = "https://sim.j.cloudfront.hls.ttvnw.net";

/// One token's view of the stream.
#[derive(Clone, Debug)]
pub struct Timeline {
    pub session: u64,
    /// Unix ms of global segment 0.
    pub epoch_ms: i64,
    /// Global segment that was the newest at the token's first poll (its timeline's segment 0).
    pub first: i64,
    /// Whether the scenario's breaks apply to this token (its playerType).
    pub breaks: bool,
}

/// Number of files in a rendition folder, for the media loop (a discontinuity where it wraps).
#[derive(Clone, Copy, Debug)]
pub struct Counts {
    pub live: u64,
    pub ad: u64,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Listed {
    pub uri: String,
    pub ad: bool,
}

pub fn segment_ms(scenario: &Scenario) -> i64 {
    (scenario.segment_seconds * 1000.0).round() as i64
}

/// Global index of the newest segment at `now_ms`.
pub fn newest(scenario: &Scenario, epoch_ms: i64, now_ms: i64) -> i64 {
    (now_ms - epoch_ms).div_euclid(segment_ms(scenario))
}

fn date(ms: i64) -> String {
    DateTime::<Utc>::from_timestamp_millis(ms).unwrap_or_default().to_rfc3339_opts(SecondsFormat::Millis, true)
}

pub fn master(scenario: &Scenario, session: u64, now_ms: i64) -> String {
    let mut out = String::from("#EXTM3U\n");
    out += &format!("#EXT-X-SESSION-DATA:DATA-ID=\"NODE\",VALUE=\"{}\"\n", SEGMENT_HOST.trim_start_matches("https://"));
    out += &format!("#EXT-X-SESSION-DATA:DATA-ID=\"SERVER-TIME\",VALUE=\"{:.2}\"\n", now_ms as f64 / 1000.0);
    out += "#EXT-X-SESSION-DATA:DATA-ID=\"TRANSCODEMODE\",VALUE=\"cbr_v1\"\n";
    for v in &scenario.variants {
        out += &format!("#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID=\"{0}\",NAME=\"{0}\",AUTOSELECT=YES,DEFAULT=YES\n", v.name);
        out += &format!(
            "#EXT-X-STREAM-INF:BANDWIDTH={},RESOLUTION={},CODECS=\"{}\",VIDEO=\"{}\",FRAME-RATE={:.3}\n",
            v.bandwidth, v.resolution, v.codecs, v.name, v.frame_rate
        );
        out += &format!("{PLAYLIST_HOST}/v1/playlist/{session}/{}.m3u8\n", v.name);
    }
    out
}

#[derive(Clone, Copy, Debug, PartialEq)]
enum Kind {
    Live,
    /// SSAI ad segment: break index and position in the break.
    Ad(usize, u64),
}

/// What global segment `g` is for this token, and the MAF break over it, if any.
fn classify(scenario: &Scenario, t: &Timeline, g: i64) -> (Kind, Option<usize>) {
    if !t.breaks {
        return (Kind::Live, None);
    }
    let local = g - t.first;
    for (i, b) in scenario.breaks.iter().enumerate() {
        if local >= b.at as i64 && local < (b.at + b.segments) as i64 {
            return match b.kind {
                BreakKind::Ssai => (Kind::Ad(i, (local - b.at as i64) as u64), None),
                BreakKind::Maf => (Kind::Live, Some(i)),
            };
        }
    }
    (Kind::Live, None)
}

fn ext(v: &Variant) -> &'static str {
    if v.fmp4 {
        "m4s"
    } else {
        "ts"
    }
}

fn uri(t: &Timeline, v: &Variant, kind: Kind, g: i64) -> String {
    match kind {
        Kind::Live => format!("{SEGMENT_HOST}/v1/segment/{}/{}/live/{g}.{}", t.session, v.name, ext(v)),
        Kind::Ad(b, j) => format!("{SEGMENT_HOST}/v1/segment/{}/{}/ad/{b}-{j}.{}", t.session, v.name, ext(v)),
    }
}

fn map_uri(t: &Timeline, v: &Variant, ad: bool) -> String {
    format!("{SEGMENT_HOST}/v1/segment/{}/{}/{}/init.mp4", t.session, v.name, if ad { "ad" } else { "live" })
}

/// The media playlist a token's player gets at `now_ms`, and the segment URIs it lists (with their ad flag).
pub fn media(scenario: &Scenario, v: &Variant, t: &Timeline, counts: Counts, now_ms: i64) -> (String, Vec<Listed>) {
    let seg = segment_ms(scenario);
    let last = newest(scenario, t.epoch_ms, now_ms);
    let first = last - scenario.window as i64 + 1;
    // B-034: once a break is over (the newest segment past it), the playlist is live again over its whole window,
    // the positions the ads took included: the broadcast went on under the break
    let over = |g: i64| {
        scenario.breaks.iter().any(|b| {
            let (start, end) = (t.first + b.at as i64, t.first + (b.at + b.segments) as i64);
            g >= start && g < end && last >= end
        })
    };
    let kinds: Vec<(i64, Kind, Option<usize>)> = (first..=last)
        .map(|g| {
            let (k, maf) = if over(g) { (Kind::Live, None) } else { classify(scenario, t, g) };
            (g, k, maf)
        })
        .collect();

    let mut out = String::from("#EXTM3U\n");
    out += &format!("#EXT-X-VERSION:{}\n", if v.fmp4 { 6 } else { 3 });
    out += "#EXT-X-TARGETDURATION:6\n";
    out += &format!("#EXT-X-MEDIA-SEQUENCE:{}\n", 1000 + first);
    out += &format!("#EXT-X-TWITCH-LIVE-SEQUENCE:{}\n", 1000 + first);
    out += &format!("#EXT-X-TWITCH-ELAPSED-SECS:{:.3}\n", (first * seg) as f64 / 1000.0);
    out += &format!("#EXT-X-TWITCH-TOTAL-SECS:{:.3}\n", ((last + 1) * seg) as f64 / 1000.0);
    out += &format!(
        "#EXT-X-DATERANGE:ID=\"playlist-creation-{0}\",CLASS=\"timestamp\",START-DATE=\"{1}\",END-ON-NEXT=YES,X-SERVER-TIME=\"{0}.00\"\n",
        now_ms / 1000,
        date(now_ms)
    );

    // markers of the breaks the listed segments belong to (B-007, B-032)
    let mut seen: Vec<usize> = Vec::new();
    for (g, k, maf) in &kinds {
        let index = match (k, maf) {
            (Kind::Ad(b, _), _) => *b,
            (_, Some(b)) => *b,
            _ => continue,
        };
        if seen.contains(&index) {
            continue;
        }
        seen.push(index);
        let b = &scenario.breaks[index];
        let start_g = t.first + b.at as i64;
        let start = t.epoch_ms + start_g * seg;
        let duration = b.segments as f64 * scenario.segment_seconds;
        let _ = g;
        match b.kind {
            BreakKind::Ssai => {
                out += &format!(
                    "#EXT-X-DATERANGE:ID=\"stitched-ad-{0}-{1}\",CLASS=\"twitch-stitched-ad\",START-DATE=\"{2}\",DURATION={3:.3},X-TV-TWITCH-AD-ROLL-TYPE=\"{4}\",X-TV-TWITCH-AD-POD-LENGTH=\"1\",X-TV-TWITCH-AD-POD-POSITION=\"0\"\n",
                    start / 1000, b.segments, date(start), duration, b.roll
                );
                out += &format!(
                    "#EXT-X-DATERANGE:ID=\"source-{0}\",CLASS=\"twitch-stream-source\",START-DATE=\"{1}\",DURATION={2:.3},X-TV-TWITCH-STREAM-SOURCE=\"{3}\"\n",
                    start / 1000, date(start), duration, b.title
                );
            }
            BreakKind::Maf => {
                out += &format!(
                    "#EXT-X-DATERANGE:ID=\"maf-ad-{0}-{1}\",CLASS=\"twitch-maf-ad\",START-DATE=\"{2}\",PLANNED-DURATION={3:.3},END-ON-NEXT=YES\n",
                    start / 1000, (duration * 1e9) as u64, date(start), duration
                );
            }
        }
    }

    let mut listed = Vec::new();
    let mut previous: Option<Kind> = None;
    let mut map: Option<String> = None;
    for (g, k, _) in &kinds {
        let ad = matches!(k, Kind::Ad(..));
        let wraps = match k {
            Kind::Live => counts.live > 0 && g.rem_euclid(counts.live as i64) == 0,
            Kind::Ad(_, j) => *j > 0 && counts.ad > 0 && j % counts.ad == 0,
        };
        let changed = match (previous, k) {
            (None, _) => false,
            (Some(Kind::Live), Kind::Live) => false,
            (Some(Kind::Ad(a, _)), Kind::Ad(b, _)) => a != *b,
            _ => true,
        };
        if previous.is_some() && (changed || wraps) {
            out += "#EXT-X-DISCONTINUITY\n";
        }
        if v.fmp4 {
            let m = map_uri(t, v, ad);
            if map.as_deref() != Some(&m) {
                out += &format!("#EXT-X-MAP:URI=\"{m}\"\n");
                listed.push(Listed { uri: m.clone(), ad });
                map = Some(m);
            }
        }
        out += &format!("#EXT-X-PROGRAM-DATE-TIME:{}\n", date(t.epoch_ms + g * seg));
        let title = match k {
            Kind::Live => "live".to_string(),
            Kind::Ad(b, _) => scenario.breaks[*b].title.clone(),
        };
        out += &format!("#EXTINF:{:.3},{}\n", scenario.segment_seconds, title);
        let u = uri(t, v, *k, *g);
        out += &format!("{u}\n");
        listed.push(Listed { uri: u, ad });
        previous = Some(*k);
    }

    // prefetch lines only after a live segment (B-026: none during a break)
    if matches!(previous, Some(Kind::Live)) {
        for p in 1..=scenario.prefetch as i64 {
            let (k, _) = classify(scenario, t, last + p);
            if k != Kind::Live {
                break;
            }
            let u = uri(t, v, Kind::Live, last + p);
            out += &format!("#EXT-X-TWITCH-PREFETCH:{u}\n");
            listed.push(Listed { uri: u, ad: false });
        }
    }
    (out, listed)
}

/// A segment URI path (`/v1/segment/<session>/<variant>/<live|ad>/<name>`) → (variant, ad, file index or init).
#[derive(Debug, PartialEq)]
pub struct SegmentPath {
    pub variant: String,
    pub ad: bool,
    /// `None` for `init.mp4`.
    pub number: Option<u64>,
}

pub fn parse_segment_path(path: &str, counts: Counts) -> Option<SegmentPath> {
    let rest = path.strip_prefix("/v1/segment/")?;
    let parts: Vec<&str> = rest.split('/').collect();
    if parts.len() != 4 {
        return None;
    }
    let (variant, kind, name) = (parts[1].to_string(), parts[2], parts[3]);
    let ad = match kind {
        "ad" => true,
        "live" => false,
        _ => return None,
    };
    if name == "init.mp4" {
        return Some(SegmentPath { variant, ad, number: None });
    }
    let stem = name.split('.').next()?;
    let number = if ad {
        let j: u64 = stem.split('-').nth(1)?.parse().ok()?;
        j % counts.ad.max(1)
    } else {
        let g: i64 = stem.parse().ok()?;
        g.rem_euclid(counts.live.max(1) as i64) as u64
    };
    Some(SegmentPath { variant, ad, number: Some(number) })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::scenario::{Break, PlayerType};

    fn scenario(breaks: Vec<Break>, fmp4: bool) -> Scenario {
        Scenario {
            id: "T".into(),
            description: String::new(),
            channel: "simchannel".into(),
            segment_seconds: 2.0,
            window: 6,
            prefetch: 2,
            variants: vec![Variant {
                name: "720p30".into(),
                resolution: "1280x720".into(),
                bandwidth: 3_000_000,
                codecs: "avc1.4D401F,mp4a.40.2".into(),
                frame_rate: 30.0,
                live: "live-720p".into(),
                ad: "ad-720p".into(),
                fmp4,
            }],
            breaks,
            player_types: Default::default(),
            gql: Default::default(),
        }
    }

    const EPOCH: i64 = 1_791_400_000_000;
    const COUNTS: Counts = Counts { live: 30, ad: 15 };

    fn timeline(breaks: bool) -> Timeline {
        Timeline { session: 7, epoch_ms: EPOCH, first: 100, breaks }
    }

    fn preroll() -> Break {
        Break { at: 0, segments: 4, kind: BreakKind::Ssai, roll: "PREROLL".into(), title: "Amazon|SIMAD".into() }
    }

    #[test]
    fn master_lists_each_variant_with_its_media_group_and_playlist_url() {
        let s = scenario(vec![], false);
        let text = master(&s, 7, EPOCH);
        assert!(text.contains("#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID=\"720p30\",NAME=\"720p30\""));
        assert!(text.contains("#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720,CODECS=\"avc1.4D401F,mp4a.40.2\",VIDEO=\"720p30\",FRAME-RATE=30.000"));
        assert!(text.contains("https://video-weaver.sim.hls.ttvnw.net/v1/playlist/7/720p30.m3u8"));
    }

    #[test]
    fn live_playlist_has_window_segments_program_date_time_and_prefetch() {
        let s = scenario(vec![], false);
        let now = EPOCH + 110 * 2000 + 500; // newest global segment 110
        let (text, listed) = media(&s, &s.variants[0], &timeline(true), COUNTS, now);
        assert!(text.contains("#EXT-X-MEDIA-SEQUENCE:1105\n"));
        assert_eq!(text.matches("#EXTINF:2.000,live\n").count(), 6);
        assert!(text.contains(&format!(
            "#EXT-X-PROGRAM-DATE-TIME:{}\n#EXTINF:2.000,live\nhttps://sim.j.cloudfront.hls.ttvnw.net/v1/segment/7/720p30/live/105.ts\n",
            date(EPOCH + 105 * 2000)
        )));
        assert_eq!(text.matches("#EXT-X-TWITCH-PREFETCH:").count(), 2);
        assert!(text.ends_with("#EXT-X-TWITCH-PREFETCH:https://sim.j.cloudfront.hls.ttvnw.net/v1/segment/7/720p30/live/112.ts\n"));
        assert!(listed.iter().all(|l| !l.ad));
        assert!(!text.contains("DISCONTINUITY"));
        assert!(!text.contains("stitched"));
    }

    #[test]
    fn a_preroll_lists_ad_segments_with_the_stitched_marker_and_no_prefetch() {
        let s = scenario(vec![preroll()], false);
        let now = EPOCH + 102 * 2000; // the token's timeline at segment 2: ads 0..2 listed
        let (text, listed) = media(&s, &s.variants[0], &timeline(true), COUNTS, now);
        assert_eq!(text.matches("#EXTINF:2.000,Amazon|SIMAD\n").count(), 3);
        assert_eq!(text.matches("#EXTINF:2.000,live\n").count(), 3);
        assert!(text.contains("CLASS=\"twitch-stitched-ad\""));
        assert!(text.contains("X-TV-TWITCH-AD-ROLL-TYPE=\"PREROLL\""));
        assert!(text.contains("X-TV-TWITCH-STREAM-SOURCE=\"Amazon|SIMAD\""));
        assert_eq!(text.matches("#EXT-X-DISCONTINUITY\n").count(), 1);
        assert!(!text.contains("PREFETCH"));
        assert_eq!(listed.iter().filter(|l| l.ad).count(), 3);
        assert!(listed.iter().filter(|l| l.ad).all(|l| l.uri.contains("/ad/0-")));
    }

    #[test]
    fn after_the_break_the_playlist_is_live_again() {
        let s = scenario(vec![preroll()], false);
        let now = EPOCH + 112 * 2000; // timeline segment 12: the break (0..3) is out of the window
        let (text, listed) = media(&s, &s.variants[0], &timeline(true), COUNTS, now);
        assert!(!text.contains("stitched"));
        assert!(listed.iter().all(|l| !l.ad));
        assert_eq!(text.matches("PREFETCH").count(), 2);
    }

    #[test]
    fn once_the_break_is_over_the_whole_window_is_live() {
        // B-034: when a break ends the live playlist comes back over its whole window, the ad positions live again
        let s = scenario(vec![preroll()], false);
        let (text, listed) = media(&s, &s.variants[0], &timeline(true), COUNTS, EPOCH + 105 * 2000); // break 100..103
        assert!(text.contains("#EXT-X-MEDIA-SEQUENCE:1100\n"));
        assert_eq!(text.matches("#EXTINF:2.000,live\n").count(), 6);
        assert!(text.contains("/live/100.ts\n"));
        assert!(listed.iter().all(|l| !l.ad));
        assert!(!text.contains("stitched"));
        assert!(!text.contains("DISCONTINUITY"));
    }

    #[test]
    fn a_player_type_without_breaks_stays_live_through_the_break() {
        let s = scenario(vec![preroll()], false);
        let (text, listed) = media(&s, &s.variants[0], &timeline(false), COUNTS, EPOCH + 102 * 2000);
        assert!(!text.contains("stitched"));
        assert!(listed.iter().all(|l| !l.ad));
    }

    #[test]
    fn a_maf_break_marks_live_segments_with_twitch_maf_ad() {
        let maf = Break { at: 1, segments: 30, kind: BreakKind::Maf, roll: "MIDROLL".into(), title: String::new() };
        let s = scenario(vec![maf], false);
        let (text, listed) = media(&s, &s.variants[0], &timeline(true), COUNTS, EPOCH + 103 * 2000);
        assert!(text.contains("CLASS=\"twitch-maf-ad\""));
        assert!(text.contains("PLANNED-DURATION=60.000"));
        assert!(listed.iter().all(|l| !l.ad));
        assert_eq!(text.matches("#EXTINF:2.000,live\n").count(), 6);
    }

    #[test]
    fn the_live_media_loop_wrap_gets_a_discontinuity() {
        let s = scenario(vec![], false);
        let (text, _) = media(&s, &s.variants[0], &timeline(true), COUNTS, EPOCH + 122 * 2000); // 117..122, wraps at 120
        assert_eq!(text.matches("#EXT-X-DISCONTINUITY\n").count(), 1);
    }

    #[test]
    fn fmp4_playlists_carry_the_map_of_each_rendition() {
        let s = scenario(vec![preroll()], true);
        let (text, listed) = media(&s, &s.variants[0], &timeline(true), COUNTS, EPOCH + 102 * 2000);
        assert!(text.starts_with("#EXTM3U\n#EXT-X-VERSION:6\n"));
        assert!(text.contains("#EXT-X-MAP:URI=\"https://sim.j.cloudfront.hls.ttvnw.net/v1/segment/7/720p30/live/init.mp4\""));
        assert!(text.contains("#EXT-X-MAP:URI=\"https://sim.j.cloudfront.hls.ttvnw.net/v1/segment/7/720p30/ad/init.mp4\""));
        assert!(text.contains(".m4s\n"));
        assert!(listed.iter().any(|l| l.ad && l.uri.ends_with("/ad/init.mp4")));
    }

    #[test]
    fn backups_share_the_stream_clock() {
        let s = scenario(vec![preroll()], false);
        let main = media(&s, &s.variants[0], &timeline(true), COUNTS, EPOCH + 112 * 2000).0;
        let backup = media(&s, &s.variants[0], &Timeline { session: 8, epoch_ms: EPOCH, first: 110, breaks: false }, COUNTS, EPOCH + 112 * 2000).0;
        let dates = |t: &str| t.lines().filter(|l| l.starts_with("#EXT-X-PROGRAM-DATE-TIME")).map(String::from).collect::<Vec<_>>();
        assert_eq!(dates(&main), dates(&backup));
    }

    #[test]
    fn segment_paths_resolve_to_the_rendition_files() {
        assert_eq!(
            parse_segment_path("/v1/segment/7/720p30/live/122.ts", COUNTS),
            Some(SegmentPath { variant: "720p30".into(), ad: false, number: Some(2) })
        );
        assert_eq!(
            parse_segment_path("/v1/segment/7/720p30/ad/0-16.ts", COUNTS),
            Some(SegmentPath { variant: "720p30".into(), ad: true, number: Some(1) })
        );
        assert_eq!(
            parse_segment_path("/v1/segment/7/720p30/ad/init.mp4", COUNTS),
            Some(SegmentPath { variant: "720p30".into(), ad: true, number: None })
        );
        assert_eq!(parse_segment_path("/v1/segment/7/720p30/other/1.ts", COUNTS), None);
        let _ = PlayerType::default();
    }
}

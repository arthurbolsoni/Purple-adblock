//! `gql.twitch.tv/gql` `PlaybackAccessToken` and `gql.twitch.tv/integrity` (docs/server/tokens.md).

use crate::scenario::Scenario;
use serde_json::{json, Value};

/// The answer to a GQL body: one object for one operation, an array for a batch (as Twitch answers).
pub fn answer(scenario: &Scenario, body: &str) -> Value {
    let parsed: Value = serde_json::from_str(body).unwrap_or(Value::Null);
    match parsed {
        Value::Array(ops) => Value::Array(ops.iter().map(|op| operation(scenario, op)).collect()),
        op @ Value::Object(_) => operation(scenario, &op),
        _ => json!({ "errors": [{ "message": "invalid body" }] }),
    }
}

fn operation(scenario: &Scenario, op: &Value) -> Value {
    let name = op.get("operationName").and_then(Value::as_str).unwrap_or("");
    if !name.starts_with("PlaybackAccessToken") {
        // the page's other operations: an empty answer is enough for the isolated page
        return json!({ "data": {}, "extensions": { "operationName": name } });
    }
    let persisted = op.pointer("/extensions/persistedQuery").is_some() && op.get("query").is_none();
    if persisted && scenario.gql.persisted_query_not_found {
        return json!({ "errors": [{ "message": "PersistedQueryNotFound" }] });
    }
    let player_type = op.pointer("/variables/playerType").and_then(Value::as_str).unwrap_or("site");
    if let Some(message) = scenario.gql.errors.get(player_type) {
        return json!({ "errors": [{ "message": message }], "data": { "streamPlaybackAccessToken": null } });
    }
    let platform = op.pointer("/variables/platform").and_then(Value::as_str).unwrap_or("web");
    let login = op.pointer("/variables/login").and_then(Value::as_str).unwrap_or(&scenario.channel);
    json!({
        "data": { "streamPlaybackAccessToken": { "value": token_value(login, player_type, platform), "signature": "simsignature", "__typename": "PlaybackAccessToken" } },
        "extensions": { "operationName": name }
    })
}

/// The token's `value`: a JSON string with the flags Twitch sends (B-027, B-031), the channel and the player type.
pub fn token_value(channel: &str, player_type: &str, platform: &str) -> String {
    json!({
        "adblock": false, "authorization": { "forbidden": false, "reason": "" }, "blackout_enabled": false,
        "channel": channel, "channel_id": 1, "chansub": { "restricted_bitrates": [], "view_until": 1924905600 },
        "ci_gb": false, "device_id": "simdevice", "expires": 1924905600, "extended_history_allowed": false,
        "game": "", "hide_ads": false, "https_required": true, "mature": false, "partner": false,
        "platform": platform, "player_type": player_type, "private": { "allowed_to_view": true }, "privileged": false,
        "role": "", "server_ads": true, "show_ads": true, "subscriber": false, "turbo": false, "user_id": null,
        "user_ip": "203.0.113.1", "version": 3
    })
    .to_string()
}

/// `player_type` of an usher request's `token` query value; `site` when there is none.
pub fn player_type_of(token: Option<&str>) -> String {
    token
        .and_then(|t| serde_json::from_str::<Value>(t).ok())
        .and_then(|v| v.get("player_type").and_then(Value::as_str).map(String::from))
        .unwrap_or_else(|| "site".into())
}

pub fn integrity(now_ms: i64) -> Value {
    json!({ "token": "simintegrity", "expiration": now_ms + 16 * 3600 * 1000, "request_id": "simrequest" })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scenario() -> Scenario {
        Scenario::from_json(r#"{"id":"T","channel":"simchannel","variants":[{"name":"720p30","resolution":"1280x720","bandwidth":1,"codecs":"avc1.4D401F,mp4a.40.2","live":"l","ad":"a"}],"gql":{"persistedQueryNotFound":true,"errors":{"embed":"service error"}}}"#).unwrap()
    }

    #[test]
    fn a_token_request_gets_a_value_with_the_player_type_and_platform() {
        let body = r#"{"operationName":"PlaybackAccessToken_Template","query":"query ...","variables":{"login":"simchannel","playerType":"popout","platform":"web"}}"#;
        let answer = answer(&scenario(), body);
        let value: Value = serde_json::from_str(answer.pointer("/data/streamPlaybackAccessToken/value").unwrap().as_str().unwrap()).unwrap();
        assert_eq!(value["player_type"], "popout");
        assert_eq!(value["platform"], "web");
        assert_eq!(value["channel"], "simchannel");
        assert_eq!(value["server_ads"], true);
        assert_eq!(answer.pointer("/data/streamPlaybackAccessToken/signature").unwrap(), "simsignature");
    }

    #[test]
    fn a_batch_gets_an_array_in_the_same_order() {
        let body = r#"[{"operationName":"Other"},{"operationName":"PlaybackAccessToken","query":"q","variables":{"playerType":"site"}}]"#;
        let answer = answer(&scenario(), body);
        let list = answer.as_array().unwrap();
        assert_eq!(list.len(), 2);
        assert!(list[0].pointer("/data/streamPlaybackAccessToken").is_none());
        assert!(list[1].pointer("/data/streamPlaybackAccessToken/value").is_some());
    }

    #[test]
    fn persisted_query_not_found_and_player_type_errors() {
        let hashed = r#"{"operationName":"PlaybackAccessToken","extensions":{"persistedQuery":{"version":1,"sha256Hash":"x"}},"variables":{"playerType":"site"}}"#;
        assert_eq!(answer(&scenario(), hashed)["errors"][0]["message"], "PersistedQueryNotFound");
        let embed = r#"{"operationName":"PlaybackAccessToken","query":"q","variables":{"playerType":"embed"}}"#;
        assert_eq!(answer(&scenario(), embed)["errors"][0]["message"], "service error");
    }

    #[test]
    fn the_usher_token_names_the_player_type() {
        assert_eq!(player_type_of(Some(&token_value("c", "frontpage", "web"))), "frontpage");
        assert_eq!(player_type_of(Some("not json")), "site");
        assert_eq!(player_type_of(None), "site");
    }
}

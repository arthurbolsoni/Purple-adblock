// Reload of the Twitch player from the page at the end of an ad break (F-15, T-601).
//
// findReactNode and the root lookup in findReactRootNode are copied from Brave's Twitch scriptlet, with the document
// passed in instead of read from the global:
//   https://github.com/brave/adblock-resources/blob/60346357addf85035833f3731cb025b058f9600d/resources/vaft-ublock-origin.js
//   (getPlayerAndState). It is the same file as vaft/vaft-ublock-origin.js in TwitchAdSolutions:
//   by ryanbr, the maintained fork: https://github.com/ryanbr/TwitchAdSolutions/blob/74f1248f22a61fcbb559882f93cb60ca25b414e8/vaft/vaft-ublock-origin.js
//   by pixeltris, the original project: https://github.com/pixeltris/TwitchAdSolutions
//   (THIRD-PARTY-NOTICES.md)
// The player and player state constraints and the setSrc call follow getPlayerAndState and doTwitchPlayerTask there;
// Purple only does the soft reload (no new player instance, no new access token).
//
// This file is subject to the terms of the Mozilla Public License, v. 2.0 (brave/adblock-resources). If a copy of the
// MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// MIT License (TwitchAdSolutions: pixeltris/TwitchAdSolutions and its fork ryanbr/TwitchAdSolutions)
//
// Copyright (c) 2020-present TwitchAdSolutions Contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

type PageDocument = { querySelector: (selector: string) => any };
type PageStorage = { setItem: (key: string, value: string) => void };

function findReactNode(root: any, constraint: (node: any) => any): any {
  if (root.stateNode && constraint(root.stateNode)) {
    return root.stateNode;
  }
  let node = root.child;
  while (node) {
    const result = findReactNode(node, constraint);
    if (result) {
      return result;
    }
    node = node.sibling;
  }
  return null;
}

function findReactRootNode(doc: PageDocument): any {
  let reactRootNode = null;
  const rootNode = doc.querySelector("#root");
  if (rootNode && rootNode._reactRootContainer && rootNode._reactRootContainer._internalRoot && rootNode._reactRootContainer._internalRoot.current) {
    reactRootNode = rootNode._reactRootContainer._internalRoot.current;
  }
  if (reactRootNode == null && rootNode != null) {
    const containerName = Object.keys(rootNode).find((x) => x.startsWith("__reactContainer") || x.startsWith("__reactFiber"));
    if (containerName != null) {
      reactRootNode = rootNode[containerName];
    }
  }
  return reactRootNode;
}

// true when the player state was found and setSrc ran; false otherwise, and the caller falls back to pause/play (E6)
export function reloadTwitchPlayer(doc: PageDocument = document, storage?: PageStorage): boolean {
  try {
    const root = findReactRootNode(doc);
    if (!root) return false;
    const playerState = findReactNode(root, (node) => node.setSrc && node.setInitialPlaybackSettings);
    if (!playerState) return false;
    const holder = findReactNode(root, (node) => node.setPlayerActive && node.props && node.props.mediaPlayerInstance);
    const instance = holder?.props?.mediaPlayerInstance;
    const player = instance?.playerInstance ?? instance;
    // the player reads its quality from this key when it loads again (Brave writes it the same way)
    const group = player?.core?.state?.quality?.group;
    if (group) (storage ?? globalThis.localStorage)?.setItem("video-quality", JSON.stringify({ default: group }));
    playerState.setSrc({ isNewMediaPlayerInstance: false, refreshAccessToken: false });
    player?.play?.()?.catch?.(() => {});
    return true;
  } catch {
    return false;
  }
}

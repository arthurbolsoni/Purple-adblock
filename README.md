<center>

<img src="https://github.com/arthurbolsoni/Purple-adblock/raw/main/chrome/images/logov2-128.png">

# Purple Adblock

</center>

<div align="center">

![GitHub Repo stars](https://img.shields.io/github/stars/arthurbolsoni/Purple-adblock?label=Stars)
[![Discord](https://img.shields.io/discord/829993555820019773?label=Discord)](https://discord.gg/7MpUUDNxHx)
![License](https://img.shields.io/badge/license-GPLv3-blue.svg?label=License)
[![Mozilla Add-on](https://img.shields.io/amo/dw/%7Ba7399979-5203-4489-9861-b168187b52e1%7D?label=Firefox%20Users)](https://addons.mozilla.org/en-US/firefox/addon/purpleadblock/)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/lkgcfobnmghhbhgekffaadadhmeoindg?label=Chrome%20Users)](https://chrome.google.com/webstore/detail/purple-ads-blocker/lkgcfobnmghhbhgekffaadadhmeoindg)

</div>

## About the project

An adblocker for Twitch using server side signature.

## Installation

Download the extension here for: [Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/purpleadblock/) or [Google Chrome](https://chrome.google.com/webstore/detail/purple-adblock/lkgcfobnmghhbhgekffaadadhmeoindg).

It doesn't work with "Alternate Player for Twitch.tv", or other "twitch adblockers", but you can use generic ad blockers like "uBlock Origin".

### How it works

Purple proxies all streams through a proxy server, and if it detects an advertisement, it continue streaming from the channel you're watching, therefore avoiding buffering problems in the same connection. This is basically a MITM attack.

## Development

Install dependencies:

```bash
npm install
```

### Proxy server

#### Building

```bash
npm run server:build
```

#### Running

```bash
npm run server:start
```

To run in development:

```bash
npm run server:dev
```

## Contributing & Support

Please consider contributing to the project to keep it alive.

As long as you have good code practice and a good attitude, you're welcome to contribute.

If you're looking for some help, create an issue or come join us in the [Discord server](https://discord.gg/7MpUUDNxHx)

## Help cover the costs of running the server

**BTC:** 12NXXqNKTKD8nv89pdvHotF6JqX5CWfyZk

**LTC:** LYagnjToA6SZjAnEttdJEtp61bfvAN2xYU

**DOGECOIN:** DR3AdZD5gr2WBkyKZUuxLfxK26QQ6RHsvR

**BUY ME A COFFEE :)** [Click here](https://www.buymeacoffee.com/arthurbolsoni)

**Paypal :)** [Click here](https://www.paypal.com/donate/?business=7KG5ZT4AVJ2D6&no_recurring=0&currency_code=USD)

## Credits

1. <https://github.com/pixeltris/TwitchAdSolutions/issues/8>

2. <https://twitter.com/ChoosenEye>

3. <https://github.com/pixeltris/TwitchAdSolutions/issues/25#issuecomment-822883576>

4. ads list block <https://github.com/saucettv/VideoAdBlockForTwitch/>

5. Issue templates <https://github.com/sysdotini/hibiki>

## License

GNU General Public License v3.0

import { StreamType } from '../stream/interface/stream.enum';
import { Setting } from './interface/setting.interface';
import { Player } from './player';

describe('Player', () => {
    let player: Player;

    // Mock the global variable
    global.logPrint = jest.fn();

    beforeEach(() => {
        player = new Player();
    });

    test('setSettings() should set the setting', () => {
        const setting: Setting = {
            toggleProxy: true,
            proxyUrl: 'http://example.com',
            whitelist: ['testChannel'],
        };
        player.setSettings(setting);
        expect(player.setting).toEqual(setting);
    });

    test('currentStream() should return the correct Stream', () => {
        const channelName = 'testChannel';
        player.setChannel(channelName);
        const stream = player.currentStream();
        expect(stream.channelName).toBe(channelName);
    });

    test('isWhitelist() should return true if the current channel is whitelisted', () => {
        const channelName = 'testChannel';
        player.setSettings({ whitelist: [channelName] } as Setting);
        player.setChannel(channelName);
        expect(player.isWhitelist()).toBe(true);
    });

    describe('isAds', () => {
        it('should return true if the string contains a known ad substring', () => {
            const adUrl = 'https://ad.example.com/ad-content-stitched';
            expect(player.isAds(adUrl)).toBeTruthy();
        });

        it('should return false if the string does not contain a known ad substring', () => {
            const nonAdUrl = 'https://nonad.example.com/content';
            expect(player.isAds(nonAdUrl)).toBeFalsy();
        });

        it('should handle null or undefined input gracefully', () => {
            expect(player.isAds(null as any)).toBeFalsy();
            expect(player.isAds(undefined as any)).toBeFalsy();
            expect(player.isAds('')).toBeFalsy();
        });

        it('should call onStartAds() if the ad state changes to true', () => {
            player.onStartAds = jest.fn();
            player.playingAds = false;
            player.isAds('https://ad.example.com/ad-content-stitched', true);
            expect(player.onStartAds).toHaveBeenCalled();
        });

        it('should call onEndAds() if the ad state changes to false', () => {
            player.onEndAds = jest.fn();
            player.playingAds = true;
            player.isAds('https://nonad.example.com/content', true);
            expect(player.onEndAds).toHaveBeenCalled();
        });
    });
});
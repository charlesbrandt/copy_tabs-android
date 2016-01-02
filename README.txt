*2014.06.20 15:59:20
https://addons.mozilla.org/en-US/firefox/addon/copy-tabs/

*2014.06.19 18:58:27
good guide:
https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android/Walkthrough

Use this as a template:
https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android/Initialization_and_Cleanup#template_code

*2014.06.19 22:07:14
debugging pages on Android device by using console on a desktop firefox instance:
https://developer.mozilla.org/en-US/docs/Tools/Remote_Debugging/Firefox_for_Android

configure both browsers to allow it.

then, every time device is connected, run:
adb forward tcp:6000 tcp:6000

then in desktop Firefox browser choose Tools->Web Developer->Connect...

be sure to enable console on android firefox:
https://quality.mozilla.org/docs/mobile-firefox/firefox-mobile-enabling-the-error-console/
about:config
devtools.errorconsole.enabled

also need to be sure to use window.console.log
not just console.log



can also use:
adb logcat | grep Gecko

but this doesn't seem to show console messages (though some say it should)



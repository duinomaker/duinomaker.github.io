function browserdetails(useragent) {
    var os = false;
    // var brand = false;
    var details = {};

    if (Object(useragent).details !== undefined) {
        return useragent.details;
    }
    useragent = (' ' + useragent).toLowerCase();

    // if (useragent.indexOf('~:') !== -1) {
    //     brand = useragent.match(/~:(\d+)/);
    //     brand = brand && brand.pop() | 0;
    // }

    if (useragent.indexOf('windows phone') > 0) {
        os = 'Windows Phone';
    }
    else if (useragent.indexOf('android') > 0 || useragent.indexOf('andr0id') > 0) {
        os = 'Android';
    }
    else if (useragent.indexOf('iphone') > 0) {
        os = 'iPhone';
    }
    else if (useragent.indexOf('imega') > 0) {
        os = 'iPhone';
    }
    else if (useragent.indexOf('ipad') > 0) {
        os = 'iPad';
    }
    else if (useragent.indexOf(' edga/') > 0) {
        os = 'Android';
    }
    // else if (useragent.indexOf(' crios') > 0) {
    //     details.brand = 'CriOS';
    // }

    details.os = os || '';

    // if (brand) {
    //     details.brand = brand;
    // }

    return details;
}

var ua = window.navigator.userAgent.toLowerCase();
try {
    ua = Object(ua);
    ua.details = Object.create(browserdetails(ua));
} catch (e) { }

function isMobile() {
    var mobileStrings = [
        'iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini', 'ucbrowser',
        'windows mobile', 'windows phone', 'iemobile', 'mobile safari', 'bb10; touch'
    ];

    for (var i = mobileStrings.length; i--;) {
        if (ua.indexOf(mobileStrings[i]) > 0) {
            return true;
        }
    }

    return false;
}

var is_mobile = isMobile();
var is_ios = is_mobile && (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1 || ua.indexOf('ipod') > -1);

if (is_ios) {
    tmp = ua.match(/(?:iphone|cpu) os (\d+)[\._](\d+)/);
    if (tmp) {
        is_ios = parseInt(tmp[1]);
        if (!is_ios) {
            is_ios = true;
        }
    }
    tmp = undefined;

    if (is_mobile) {
        // Prevent Safari's copy&paste bug..
        window.onhashchange = function () {
            location.reload();
        };
    }
}

//   file: mega://#!<id>!<key>
// folder: mega://#F!<id>!<key>

var input_bar = document.getElementsByClassName('input')[0];

function getAppLink() {
    var link = input_bar.value.trim();
    var result = link.match(/mega.nz\/(file|folder)\/(.+)?#(.+)/);

    try {
        var key = result.pop();
        var id = result.pop();
        var type = result.pop();
    } catch (e) {
        return false;
    }

    return (type === 'file' ? '#!' : '#F!') + id + '!' + key;
}

function getStoreLink() {
    switch (ua.details.os) {
        case 'iPad':
        case 'iPhone':
            return 'https://itunes.apple.com/app/mega/id706857885';

        case 'Windows Phone':
            return 'zune://navigate/?phoneappID=1b70a4ef-8b9c-4058-adca-3b9ac8cc194a';

        case 'Android':
            return 'https://play.google.com/store/apps/details?id=mega.privacy.android.app&referrer=meganzindexandroid';
        
        default:
            return false;
    }
}

function redirectToApp() {

    var redirectLink = getAppLink();

    if (!redirectLink) {
        window.alert("The link is invalid.");
        return;
    }

    // If iOS (iPhone, iPad, iPod), use method based off https://github.com/prabeengiri/DeepLinkingToNativeApp/
    if (is_ios) {

        var appLink = 'mega://' + redirectLink;
        window.location = appLink;

        // var timeout = null;

        // var redirectToStore = function () {
        //     window.top.location = getStoreLink();
        // };

        // var redirect = function () {
        //     var ms = 500;

        //     window.location = appLink;

        //     if (is_ios > 8 && ua.details.brand !== 'CriOS') {
        //         ms = 4100;
        //     }

        //     timeout = setTimeout(redirectToStore, ms);
        // };

        // redirect();
    }

    // Otherwise if Windows Phone
    else if (ua.details.os === 'Windows Phone') {
        window.location = 'mega://' + redirectLink;
    }

    // Otherwise if Android
    else if (ua.indexOf('android') > -1) {
        var intent = 'intent://' + redirectLink + '/#Intent;scheme=mega;package=mega.privacy.android.app;end';
        document.location = intent;
    }
    else {
        // Otherwise show an error saying the device is unsupported
        window.alert('This device is unsupported.');
    }

    return false;
}

function redirectToStore() {
    var storeLink = getStoreLink();
    if (!storeLink) {
        window.alert('This device is unsupported.');
        return;
    }
    window.top.location = storeLink;
}
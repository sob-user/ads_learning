const ADVERTISING_SPACE = [];
const AD_UNITS = [];

const DEV_ENV = false;

const PLACEMENT_ID = 13232392;
const BIDDER = 'appnexus';

const PREBID_TIMEOUT = 1000;
const FAILSAFE_TIMEOUT = 3000;

const BIDDERS = {
    appnexus: {
        buyingSizes: {
            pagePeel: [300,250],
            mobileSticky: [320, 50],
            pushUpLeaderboard: [728,90],
        }
    }
}

function generateFakeAdSpaces() {
    let body = document.getElementsByTagName('body')[0];

    for(let bidder in BIDDERS) {
        let buyingSizes =  BIDDERS[bidder].buyingSizes;
        for(let size in  buyingSizes) {
            let createDiv = document.createElement('div');
            createDiv.className = 'ads_';
            createDiv.id = size;
            createDiv.style.width = `${buyingSizes[size][0]}px`;
            createDiv.style.height = `${buyingSizes[size][1]}px`;
            body.appendChild(createDiv);
        }
    }

    getAdvertisingSpaces('ads_');
}

function getAdvertisingSpaces(classname) {
    let space = document.getElementsByClassName(classname);
    for (let index = 0; index < space.length; index++) {
        ADVERTISING_SPACE.push(space[index]);
    }

    generateAdUnit();
}

function generateAdUnit() {
    ADVERTISING_SPACE.map((space) => {
        let unit = {
            code: space.id,
            mediaTypes: {
                banner: { 
                    sizes: [space.clientWidth, space.clientHeight] 
                },
                native: {
                    title: {
                        required: true
                    },
                    image: {
                        required: true
                    },
                    sponsoredBy: {
                        required: true
                    }
                }
            },
            bids: [{
                bidder: BIDDER,
                params: { 
                    placementId: PLACEMENT_ID,
                    allowSmallerSizes: true
                }
            }],
        };

        AD_UNITS.push(unit);
    });
}

generateFakeAdSpaces();

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];
googletag.cmd.push(function() {
    googletag.pubads().disableInitialLoad();
});

var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

pbjs.que.push(function() {
    pbjs.setConfig({
        debug: DEV_ENV,
        cache: {
            url: false
        }
    });
    pbjs.addAdUnits(AD_UNITS);
    pbjs.requestBids({
        bidsBackHandler: initAdserver,
        timeout: PREBID_TIMEOUT
    });
});

function initAdserver() {
    if(pbjs.initAdserverSet) return;
    pbjs.initAdserverSet = true;
    googletag.cmd.push(function() {
        pbjs.que.push(function() {
            pbjs.setTargetingForGPTAsync();
            googletag.pubads().refresh();
        });
    });

    pbjs.initAdserverSet = true;
}

setTimeout(function() {
    initAdserver();
}, FAILSAFE_TIMEOUT);

AD_UNITS.map((unit) => {
    googletag.cmd.push(function() {
        googletag.defineSlot('/6355419/Travel/Europe', unit.mediaTypes.banner.sizes, unit.code).addService(googletag.pubads());
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
    });

    googletag.cmd.push(function() {
        googletag.display(unit.code);
    });
});
var allColors = ["#000000",
"#ffffff",
"#a4c400",
"#60a917",
"#008a00",
"#00aba9",
"#1ba1e2",
"#0050ef",
"#6a00ff",
"#aa00ff",
"#dc4fad",
"#d80073",
"#a20025",
"#ce352c",
"#fa6800",
"#f0a30a",
"#e3c800",
"#825a2c",
"#6d8764",
"#647687",
"#76608a",
"#87794e",
"#555555",
"#333333",
"#222222",
"#63362f",
"#640024",
"#81003c",
"#4b0096",
"#1b6eae",
"#00356a",
"#004050",
"#003e00",
"#128023",
"#bf5a15",
"#9a1616",
"#9a165a",
"#57169a",
"#16499a",
"#4390df",
"#da5a53",
"#7ad61d",
"#00ccff",
"#45fffd",
"#78aa1c",
"#ffc194",
"#f472d0",
"#333333",
"#222222",
"#999999",
"#eeeeee",
"#00aff0"];

var metroStandardColors = [[,"#F3B200",,],
[,"#77B900",,],
[,"#2572EB",,],
[,"#AD103C",,],
["#2E1700","#632F00","#261300","#543A24",],
["#4E0000","#B01E00","#380000","#61292B",],
["#4E0038","#C1004F","#40002E","#662C58",],
["#2D004E","#7200AC","#250040","#4C2C66",],
["#1F0068","#4617B4","#180052","#423173",],
["#001E4E","#006AC1","#001940","#2C4566",],
["#004D60","#008287","#004050","#306772",],
["#004A00","#199900","#003E00","#2D652B",],
["#15992A","#00C13F","#128425","#3A9548",],
["#E56C19","#FF981D","#C35D15","#C27D4F",],
["#B81B1B","#FF2E12","#9E1716","#AA4344",],
["#B81B6C","#FF1D77","#9E165B","#AA4379",],
["#691BB8","#AA40FF","#57169A","#7F6E94",],
["#1B58B8","#1FAEFF","#16499A","#6E7E94",],
["#569CE3","#56C5FF","#4294DE","#6BA5E7",],
["#00AAAA","#00D8CC","#008E8E","#439D9A",],
["#83BA1F","#91D100","#7BAD18","#94BD4A",],
["#D39D09","#E1B700","#C69408","#CEA539",],
["#E064B7","#FF76BC","#DE4AAD","#E773BD",],
[,"#00A3A3",,],
[,"#FE7C22",,]];

function addSampleSong() {
    var sng = [{
        ID: 0, Title: "Sample Song", Lyrics: "~Em  Am     D7\n A lyrical line with chords above\n |Em A |Am lyrical |D7 line with embedded chords\n\nChorus:\nA chorus\n\nBridge:\nA bridge", Tempo: 1,
        Notes: "Some song notes", Genre: 47, Familiarity: 51, Artist: "The Overtones", Category: "A New Hope", Sample: "", ArtistID: 1, Key: 7, PlayCount: 1, Public: 0
    }];
    setLocal("songlist", JSON.stringify(sng));
}
function getClientIP()
{
    var ipAddress = "";
    $.ajax({
        url: "https://api.ipify.org?format=jsonp&callback=?",
        async: false,
        success: function (json) {
            ipAddress = json.ip;
        },
        error: function (result) {
            var z = result.responseText.replace("?", "").replace("(", "").replace(")", "").replace(";", "");
            if (z.indexOf("ip") > 0) {
                ipAddress = JSON.parse(z).ip;
            }
        }
    });
    return ipAddress;
}
function getiRequestName() {
    var band = document.location.toString();
    band = band.replace("#", "");
    band = decodeURI(band.substring(band.lastIndexOf("/") + 1));
    return band;
}

function getSongFromID(id)
{
    var sl = JSON.parse(localStorage.getItem("songlist"));
    return jlinq.from(sl).equals("ID", id).select()[0];
}
function localStorageSpace () {
    var l = JSON.stringify(localStorage).length * 2;
    l = (l/1000).toFixed(2) + " KB";
    return l;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rgbFnToHex(rgb)
{
    var s = rgb.replace("rgb(", "").replace(")", "").replace(/ /g, "").split(",");
    return rgbToHex(s[0], s[1], s[2]);
}

function createPaletteEntry(clr,id, elet) {
    var div = document.createElement("div");
    div.className = "paletteEntry";
    div.style.backgroundColor = clr;
    div.id = id;
    $(div).data("element", elet);
    return div;
}

function createPalette(elet)
{
    var table = document.getElementById("paletteTable");
    table.cssClass = "paletteTable";
    var d = 20;
    var r, c, j = 0, k = 0
    for (var i = 0; i < metroStandardColors.length; i++)
    {
        for (j = 0; j < metroStandardColors[i].length;j++)
        {
            if (metroStandardColors[i][j])
            {
                if ((k % 10) == 0)
                {
                    r = table.insertRow(0);          
                }
                c = r.insertCell(0);
                c.className = "paletteEntry";
                var d = createPaletteEntry(metroStandardColors[i][j],"c" + i,elet);
                c.appendChild(d);
                k++;
            }
        }
    }
    return table;
}


function createPalette2(elet) {
    
}

function getQueryParameters(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[unescape(decodeURIComponent(tokens[1]))] = unescape(decodeURIComponent(unescape(tokens[2])));
    }

    return params;
}
function isChrome() {
    if (window.chrome) return true;
    return false;
}
function keyIDFromName(name) {
    var ky = keys();
    var val = "-1";
    for (var i = 0; i < ky.length; i++)
    {
        if (ky[i].Name == name)
        {
            val = ky[i].ID;
            break;
        }
    }
    return val;
}
function tempoNameFromID(id)
{
    var tt = getSession("tempolist");
    if (!tt)
        tt = tempos();
    else tt = JSON.parse(tt);
    return jlinq.from(tt).equals("ID", id).select()[0].Name;   
}
function familiarityNameFromID(id)
{
    var fam = getLocal("familiaritylist");
    if (!fam)
        fam = familiarities();
    else fam = JSON.parse(fam);
    return jlinq.from(fam).equals("ID", id).select()[0].Name;
}
function genreNameFromID(id) {
    var gnr;
    gnr = getLocal("genrelist");
    if (!gnr)
        gnr = genres();
    else gnr = JSON.parse(gnr);
    return jlinq.from(gnr).equals("ID", id).select()[0].Name;
}
function genreIDFromName(name)
{
var gnr = genres();
var val = "";
var nm = unescape(decodeURI(name));
if (!isNaN(nm))
    return nm;
    for (var i = 0; i < gnr.length; i++)
    {
        if (gnr[i].Name == nm)
        {
            val = gnr[i].ID;
            break;
        }
    }
    return val;
}
function calculateForegroundColor(BGColor)
{
    var color = new RGBColor(BGColor);
    if (color.ok) { // 'ok' is true when the parsing was a success
        var brightness = calcBrightness(color);
        var foreColor = (brightness < 130) ? "#FFFFFF" : "#000000";
        return foreColor;
    }
}
function calcBrightness(color)
{
        return Math.sqrt(
            color.r * color.r * 0.299 +
            color.g * color.g * 0.587 +
            color.b * color.b * 0.114);
}
function incrementSongCount(art, ttl)
{
    var sl = getMasterSongList();
    var i = getSongIndex(art, ttl, sl);
    sl[i].PLayCount++;
    saveSong(sl[i],sl[i].Artist,sl[i].Title);
}
function getSongIndex(art, ttl, sl)
{
    var tLocal = useLocalStorage;
    var val = -1;
    useLocalStorage = false;
    
    for (var i = 0; i < sl.length; i++)
        if (unescape(decodeURI(art)) == sl[i].Artist && unescape(decodeURI(ttl)) == sl[i].Title)
            { val = i; break; }

    useLocalStorage = tLocal;
    return val;
}

function reverseArticle(val) {
    if (val == null)
        return null;
    if (val.indexOf(",The") > 0)
        val = "The " + val.substring(0, val.length - 4);
    if (val.indexOf(",An") > 0)
        val = "An " + val.substring(0, val.length - 3);
    if (val.indexOf(",A") > 0)
        val = "A " + val.substring(0, val.length - 2);
    return val;
}

function scrub(val) {
    val = val.replace(">", "").replace("<", "").replace("'", "\"");
    return val;
}
function pad(n) {
    if (n < 10)
        n = "0" + n.toString();
    return n;
}

Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c),10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return "$" + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function faceBookShare(url, title, descr, image, winWidth, winHeight) {
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);
    window.open('http://www.facebook.com/sharer.php?s=100&p[title]=' + title + '&p[summary]=' + descr + '&p[url]=' + url + '&p[images][0]=' + image, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}

function twitterShare(twitterHandle) {
    window.open('https://twitter.com/share?url=' + escape(window.location.href) + '&text=' + document.title + ' via @' + twitterHandle, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
}
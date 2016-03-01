/*global document*/

var ServiceRequestError = false;
var useLocalStorage = true;
var iRequestURL = "http://206.248.136.246/gigman/";
var iRequestLocation = "http://206.248.136.246/gigman/";// "http://localhost/gigman/";
var gigmanURLlocal = "http://localhost/GigManAccess/GigManAccess.GigManDataAccess.svc/";
var gigmanURL = "http://206.248.136.246/GigManAccess/GigManAccess.GigManDataAccess.svc/";
function ck(uid)
{
    var s = Date().toString(), i = getClientIP(), u = "";
    if (uid) u = uid; else u = getUserID() + "";
var Base64 = {
_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
encode: function (e)
{
var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e);
while (f < e.length) {
n = e.charCodeAt(f++);
r = e.charCodeAt(f++);
i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63;
if (isNaN(r)) { u = a = 64 } else
if (isNaN(i)) {
a = 64
} t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
} return t
}, decode: function (e)
{
var t = ""; var n, r, i; var s, o, u, a; var f = 0;
e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
while (f < e.length) {
s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++));
u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a;
t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) }
} t = Base64._utf8_decode(t); return t
}, _utf8_encode: function (e)
{
e = e.replace(/\r\n/g, "\n");
var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t
}, _utf8_decode: function (e) { var t = ""; var n = 0; var r = 0, c1 = 0, c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t }
}

    // Encode the String
    var keyset = { s: Base64.encode(s),i: Base64.encode(i),u:Base64.encode(u) };
    return keyset;
}

function setLocal(key, val) {
    "use strict";
    localStorage.setItem(key, val);
}
function setSession(key, val) {
    "use strict";
    sessionStorage.setItem(key, val);
}
function removeLocal(key) {
    "use strict";
    localStorage.removeItem(key);
}
function removeSession(key) {
    "use strict";
    sessionStorage.removeItem(key);
}
function clearSession() {
    "use strict";
    sessionStorage.clear();
}
function clearLocal() {
    "use strict";
    localStorage.clear();
}

function getLocal(key) {
    "use strict";
    var val = localStorage.getItem(key);
    if (val == "undefined") {
        val = null;
    }
    return val;
}

function getSession(key) {
    "use strict";
    return sessionStorage.getItem(key);
}

function setActiveArtist() {
    "use strict";
    var aa = artistAffiliations(getUserID());
    if (aa) {
        if (aa.length > 0) {
            setSession("activeartist", JSON.stringify(aa[0]));
        }
    }
}

function getActiveArtistName() {
    "use strict";
    if (!getSession("activeartist")) {
        setActiveArtist();
    }
    var aa = getSession("activeartist");
    if (aa) {
        aa = JSON.parse(aa);
    }
    if (aa && aa.Artist) {
        return aa.Artist.ArtistName;
    }
    else if (aa) {
        return aa.ArtistName;
    }
    return "";
}
function isPremium()
{
    /*if (!checkLoginStatus())
        return false;
    if (!getSession("activeartist"))
        setActiveArtist();*/
    var aa = getSession("activeartist");
    if (aa)
        aa = JSON.parse(aa);
    else return false;
    if (aa.Artist)
        return aa.Artist.PremiumMember;
    else return aa.PremiumMember;
}
function getActiveArtistID() {
    if (!getSession("activeartist"))
        setActiveArtist();
    var aa = getSession("activeartist");
    if (aa)
        aa = JSON.parse(aa);
    if (aa && aa.Artist)
        return aa.Artist.ArtistID;
    else if (aa)
        return aa.ArtistID;
    return -1;
}

function checkLoginStatus() {
    var lu = JSON.parse(getSession("loggedinuser"));
    if ((lu == null  || lu == "") && window.location.href.toLowerCase().indexOf("default.html") < 0) {
        //window.location.href = "default.html";
        return false;
    }
    else {
        if (lu == null)
            return false;
    }
    return true;
}
function getUserID() {
    var usr = getSession("loggedinuser");
    if (usr) {
        usr = JSON.parse(usr);
        return usr.UserID;
    }
    return 0;
}

function filterSongs(lst, flt) {
    if (flt.SortDirection) {
        if (!flt.SortByArtist) {
            lst = jlinq.from(lst).sort("Title").select();
        }
        else lst = jlinq.from(lst).sort("Artist").select();
    }
    if (flt.Artist && flt.Artist != "")
        flt = jlinq.from(flt).equals("Artist", flt.Artist).select();
    if (genre && parseInt(genre, 10) > 0)
        flt = jlinq.from(lst).equals("Genre", flt.Genre).select();

    if (flt.Category != "") {
        var lst2 = [];
        var cats = flt.Category.split("/");
        $.each(cats, function (i, v) {
            for (var i = 0; i < lst.length; i++) {
                if (lst[i].Category.indexOf(v) > -1)
                    lst2.push(lst[i]);
            }
        });
        lst = lst2;
    }
    if (parseInt(flt.Tempo,10) > 0)
        lst = jlinq.from(lst).equals("Tempo", flt.Tempo).select();
    if (parseInt(flt.Familiarity,10) > 0)
        lst = jlinq.from(lst).equals("Familiarity", flt.Tempo).select();
    return lst;
}

function premiumMember()
{
    return sessionStorage.getItem("premiummember");
}

function makeRequest(reqType, dta)
{
    var url = gigmanURL, data;
    //if (document.referrer == "" || document.referrer.indexOf("localhost") > -1)
    //    url = gigmanURLlocal;

    var method = "POST";
    if (jQuery.isEmptyObject(dta))
        method = "GET";
    ServiceRequestError = false;
    $.ajax({
        url: url + reqType,
        type: method,
        contentType: 'application/json',
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dta),
        async: false,
        success: function (result) {
            data = result;
        },
        error: function (result) {
            data = { "Error": true, "Result": result };
            ServiceRequestError = true;
        }
    });
    return data;
}

function findCategory(val, ary)
{
    for (var i = 0; i < ary.length; i++)
    {
        if (ary[i].Name == val)
            return i;
    }
    return -1;
}

function getCategoryList(art)
{
    var songs = JSON.parse(getLocal("songlist"));
    var cats = [];
    for (var i = 0; i < songs.length; i++)
    {
        var scats = songs[i].Category.split("/");
        for (var j = 0; j < scats.length; j++)
        {
            var k = findCategory(scats[j],cats);
            if (k > -1)
                cats[k].Count++;
            else
            {
                cats.push({ "Name": scats[j], "Count": 1 });
            }
        }
    }
    return cats;
}

function getGenreList(art)
{
    var songs = JSON.parse(getLocal("songlist"));
    var genres = JSON.parse(getSession("genrelist"));
    for (var i = 0; i < genres.length; i++)
        genres[i].Count = 0;
    for (var i = 0; i < songs.length; i++)
    {
        for (var j = 0; j < genres.length; j++) {
            if (songs[i].Genre == genres[j].ID) {
                genres[j].Count = genres[j].Count + 1;
            }
        }
    }
    return genres;
}
function updateSongList(song) {
    var lst = JSON.parse(getLocal("songlist"));
    for (var i = 0; i < lst.length; i++)
    {
        if (lst[i].ID == song.ID)
        {
            lst[i] = song;
            break;
        }
    }
    setLocal("songlist", JSON.stringify(lst));
}

function serviceRequest(reqType, dta) {
    var data;
    var url = gigmanURL;
    if (premiumMember() == null)
        sessionStorage.setItem("premiummember",isPremium());
    if (!premiumMember())
        useLocalStorage = true;
    switch (reqType) {
        case "iRequestMessagesGet":
        case "iRequestMessageGet":
        case "iRequestMessageDelete":
        case "iRequestMessagesDelete":
        case "RequestsGet":
        case "LiveRequestsGet":
        case "iRequestStatsGet":
        case "GetCountFromIP":
        case "JoinRequestCreate":
        case "JoinRequestByUserIDGet":
        case "JoinRequestGet":
        case "JoinRequestProcess":
        case "GenresByArtistIDGet":
        case "CategoriesGet":
        case "ArtistExists":
        case "ArtistListByUserIDGet":
        case "ArtistAffiliationsGet":
        case "ArtistCreate":
        case "ArtistDelete":
        case "ArtistLoadByID":
        case "ArtistLoadByName":
        case "ArtistLoadByiRequestName":
        case "ArtistMemberDelete":
        case "ArtistMembersLoad":
        case "ArtistSave":
        case "iRequestNameExists":
        case "UserCreate":
        case "UserUpdate":
        case "UserExists":
        case "UserLogin":
        case "UserVerify":
        case "UserArtistCreate":
        case "UserArtistDelete":
        case "UserArtistMessaging":
        case "UserInstrumentByUser":
        case "UserInstrumentByInstrument":
        case "InstrumentLoad":
        case "UserInstrumentSave":
        case "SetlistDelete":
        case "SetlistSave":
        case "SubsetsLoad":
        case "SetsLoad":
        case "SetlistLoad":
        case "SongUpdateAccess":
        case "SongSave":
        case "SongRandomLoad":
        case "SongLoad":
        case "SongLoadByTitle":
        case "SongLoadByID":
        case "SongListPublicLoad":
        case "SongListLoad":
        case "SongListAllLoad":
        case "SongDelete":
        case "SongArtistsLoad":
        case "CalendarList":
        case "CalendarSave":
        case "CalendarUpdate":
        case "CalendarDelete":
        case "CalendarShift":
        case "WantAdsLoad":
        case "WantAdLoad":
        case "WantAdsSearch":
        case "WantAdDelete":
        case "WantAdSave":
        case "ReportAd":
        case "SiteSettings":
        case "WantAdMediaLoad":
        case "WantAdMediaSave":
        case "WantAdMediaDelete":
        case "AllowedMediaLoad":
        case "WantAdMediaRename":
        case "WantAdAddVideo":
        case "WantAdSetMainImage":
        case "MakePayment":
        case "GetPaymentHistory":
        case "ArtistsLoad":
        case "iRequestArtistsList":
        case "AddAnnouncement":
        case "UpdateAnnouncement":
        case "DeleteAnnouncement":
        case "GetAnnouncements":
        case "GetAnnouncements":
        case "SaveSession":
        case "GetSession":
        case "UpdateSession":
            dta.key = ck(reqType == "UserLogin" || reqType == "UserExists" || reqType == "UserCreate" || reqType == "UserVerify" || reqType == "GetCountFromIP" || reqType == "CalendarList" ||
                reqType == "ArtistLoadByiRequestName" || reqType == "SongListPublicLoad" || reqType == "iRequestArtistsList" || reqType == "GetAnnouncements" ? "1000000000" : "");
    }
    switch (reqType) {
        case "SongArtistsLoad":
            if (premiumMember())
                return makeRequest(reqType, dta);
            else
                
            break;
        case "ArtistListByUserIDGet":
            if (getSession("userartistlist") == null || !getSession("userartistlist"))
                return makeRequest(reqType, dta);
            if (useLocalStorage && (lst = getSession("userartistlist")) != null)
                return JSON.parse(lst);
            break;
        case "ArtistAffiliationsGet":
            if (getSession("artistaffiliationslist") == null)
                return makeRequest(reqType,dta);
            var lst = "";
            if (useLocalStorage && (lst = getSession("artistaffiliationslist")) != null)
                return JSON.parse(lst);
            break;
        case "UserLogin":
            return makeRequest(reqType,dta);
            break;
        case "ArtistLoadByID":
            return makeRequest(reqType,dta);
            break;
        case "ArtistMembersLoad":
            return makeRequest(reqType,dta);
            break;
        case "SongListLoad":
            var lst = "";
            if (premiumMember() && localStorage("songlist") == null)
                return makeRequest(reqType, dta);
            if (useLocalStorage && (lst = getLocal("songlist")) != null)
                return filterSongs(JSON.parse(lst), dta);
            break;
        case "SongListAllLoad":
            var lst = "";
            if (useLocalStorage && (lst = getLocal("songlist")) != null)
                return JSON.parse(lst);
            else return makeRequest(reqType, dta);
            break;
        case "SongUpdateAccess":
            if (premiumMember())
                makeRequest(reqType, dta);
            var s = jlinq.from(JSON.parse(getLocal("songlist"))).equals("ID", dta.username).select()[0];
            s.PlayCount = (parseInt(s.PlayCount) + 1) + "";
            updateSongList(s);
            return s.PlayCount;
        break;
        case "SongLoadByID":
            if (getLocal("songlist") == null)
                songList("", "", "", "", "", "", "", getActiveArtistID());
            return jlinq.from(JSON.parse(getLocal("songlist"))).equals("ID",parseInt(dta.username)).select()[0];
            break;
        case "SongArtistsLoad":
            var lst = "";
            if (useLocalStorage && (lst = getSession("songartistlist")) != null)
                return JSON.parse(lst);
            break;
        case "GenresByArtistIDGet":
            return getGenreList(dta.username);
            break;
        case "GenresGet":
            if (getSession("genrelist") == null)
                return makeRequest(reqType, dta);
            if (useLocalStorage && (lst = getSession("genrelist")) != null)
                return JSON.parse(lst);
            break;
        case "CategoriesGet":
            return getCategoryList(dta.username);
            if (useLocalStorage && (lst = getSession("categorieslist")) != null)
                return JSON.parse(lst);
            break;
        case "FamiliaritiesGet":
            if (getSession("familiaritieslist") == null)
                return makeRequest(reqType, dta);
            if (useLocalStorage && (lst = getSession("familiaritieslist")) != null)
                return JSON.parse(lst);
            break;
        case "TemposGet":
            if (getSession("tempolist") == null)
                return makeRequest(reqType,dta)
            if (useLocalStorage && (lst = getSession("tempolist")) != null)
                return JSON.parse(lst);
            break;
        case "KeysGet":
            if (getSession("keyslist") == null)
                return makeRequest(reqType, dta);
            if (useLocalStorage && (lst = getSession("keyslist")) != null)
                return JSON.parse(lst);
            break;
        case "InstrumentLoad":
            return makeRequest(reqType, dta);
            break;
        case "ArtistsLoad":
            return makeRequest(reqType,dta);
            break;
        case "JoinRequestByUserIDGet":
        case "JoinRequestGet":
            return makeRequest(reqType,dta);
            break;
        case "CalendarShift":
        case "iMessages":
        case "CalendarSave":
        case "CalendarList":
        case "RequestsGet":
        case "iRequestMessagesGet":
        case "iRequestMessageGet":
        case "LiveRequestsGet":
        case "ArtistLoadByiRequestName":
        case "SongListPublicLoad":
        case "SongSave":
        case "iRequestStatsGet":
        case "iRequestMessageDelete":
        case "AddAnnouncement":
        case "UpdateAnnouncement":
        case "DeleteAnnouncement":
        case "GetAnnouncements":
            case "CalendarDelete":
            if (!premiumMember())
                return [];
            return makeRequest(reqType,dta);
            break;
        case "CountryList":
        case "StateList":
        case "WantAdTypesLoad":
        case "WantAdsLoad":
        case "WantAdLoad":
        case "WantAdsSearch":
        case "WantAdDelete":
        case "WantAdMediaDelete":
        case "WantAdMediaRename":
        case "AllowedMediaLoad":
        case "WantAdSave":
        case "SiteSettings":
        case "iRequestMessageCreate":
        case "RequestCreate":
        case "GetCountFromIP":
        case "UserExists":
        case "UserCreate":
        case "SongUpdateAccess":
        case "ArtistCreate":
        case "WantAdAddVideo":
        case "UserVerify":
        case "JoinRequestCreate":
        case "UserInstrumentByUser":
        case "UserUpdate":
        case "JoinRequestProcess":
        case "MakePayment":
        case "ArtistSave":
        case "WantAdSetMainImage":
        case "ReportAd":
        case "iRequestArtistsList":
        case "GetAnnouncements":
        case "SaveSession":
        case "UpdateSession":
        case "GetSession":
            return makeRequest(reqType, dta);
            break;
        case "SetsLoad":
        case "SubsetsLoad":
        case "SetlistLoad":
        case "SetlistSave":
        case "SetlistDelete":
            if (premiumMember())
                return makeRequest(reqType, dta);
            else return [];
            break;
    }
    if (!premiumMember())
        useLocalStorage = true;
    if (useLocalStorage && checkLoginStatus())
        return null;
}

// User
function userLogin(username, password) { // checked
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (e) {
            var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63;
                if (isNaN(r)) { u = a = 64 } else
                    if (isNaN(i)) {
                        a = 64
                    } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
            } return t
        }, decode: function (e) {
            var t = ""; var n, r, i; var s, o, u, a; var f = 0;
            e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) }
            } t = Base64._utf8_decode(t); return t
        }, _utf8_encode: function (e) {
            e = e.replace(/\r\n/g, "\n");
            var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t
        }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = 0, c1 = 0, c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t }
    }
    password = Base64.encode(password);
    var usr = serviceRequest("UserLogin", { "username": username, "password": password });
    if (!usr.Error) {
        setSession("loggedinuser", JSON.stringify(usr));
        if (usr.Username == "jeez")
            setSession("isadmin", true);
        setActiveArtist();
    }
    return usr;
}
function userExists(username, email) { // checked
    return serviceRequest("UserExists", { "username": username, "password": email });
}
function userCreate(username, password, firstname, lastname, email, role, instruments, country, state, city, postalCode) { // checked
    return serviceRequest("UserCreate", { "FirstName": firstname, "LastName": lastname, "Username": username, "Password": password, "Email": email,"Role":instruments,
        "Instruments":instruments,"Country":country,"City":city,"State":state,"PostalCode":postalCode });
}
function userUpdate(userID,firstname, lastname, email, role, password, instList, country, state, city, postalCode)
{
    return serviceRequest("UserUpdate", {
        "UserID": userID, "FirstName": firstname, "LastName": lastname, "Password": password, "Email": email, "Role": role, "Instruments": instList,
        "Country":country,"City":city,"State":state,"PostalCode":postalCode});
}
function userVerify(code, email)
{
    return serviceRequest("UserVerify", { "username":code,"password":email });
}
// Artist
function iRequestNameExists(name, artistID)
{
    return serviceRequest("iRequestNameExists", { "username": name, "password": artistID });
}
function artistExists(artistName, userID) {
    return serviceRequest("ArtistExists", { "username": artistName, "password": userID });
}

function artistListByUserID(userID) { // checked
    var aff = serviceRequest("ArtistListByUserIDGet", { "username": userID, "password": "" });
    setSession("userartistlist", JSON.stringify(aff));
    return aff;
}
function artistAffiliations(userID) { // checked
    var aff = serviceRequest("ArtistAffiliationsGet", { "username": userID, "password": "" });
    if (aff.length > 0)
        setSession("artistaffiliationslist", JSON.stringify(aff));
    return aff;
}
function makePayment(UserID, ArtistID, GigManPaymentPeriod, GigManPaymentAmount, RequestPaymentPeriod, RequestPaymentAmount, PaymentRecord)
{
    var res = serviceRequest("MakePayment", {
        "UserID": UserID, "ArtistID": ArtistID, "GigManPaymentPeriod": GigManPaymentPeriod, "GigManPaymentAmount": GigManPaymentAmount,
        "RequestPaymentPeriod": RequestPaymentPeriod, "RequestPaymentAmount": RequestPaymentAmount, "PaymentRecord": PaymentRecord
    });
    return res;
}
function updateUserArtistMessaging(id, value)
{
    return serviceRequest("UserArtistMessaging", { "username": id, "password": value });
}
function artistCreate(artistName, website, userid, showcategories, showartist, showmembers, ispublic,enableDownvotes,maxMessages,maxRequests,iRequestName,genres,offAirMessage) { // checked
    return serviceRequest("ArtistCreate", {
        "ArtistName": artistName, "Website": website, "UserID": userid, "ShowCategories": showcategories, "ShowArtist": showartist,
        "ShowMenbers": showmembers, IsPublic: ispublic, "EnableDownvotes":enableDownvotes,"MaxiMessages":maxMessages,"MaxiRequests":maxRequests,"iRequestName":iRequestName, "Genres":genres, "OffAirMessage":offAirMessage
    });
}
function artistSave(artistID, artistName, website, userid, showcategories, showartist, showmembers,enableDownvotes,maxMessages,maxRequests, ispublic, iRequestName, genres,offAirMessage,requestStatus) {
    return serviceRequest("ArtistSave", {
        "ArtistName": artistName, "Website": website, "UserID": userid, "ShowCategories": showcategories, "ShowArtist": showartist,
        "ShowMenbers": showmembers, "ArtistID": artistID, "EnableDownvotes": enableDownvotes, "MaxiMessages": maxMessages, "MaxiRequests": maxRequests, "IsPublic": ispublic,
        "iRequestName":iRequestName, "Genres":genres, "OffAirMessage":offAirMessage,"RequestStatus":requestStatus
    });
}
function artistDelete(artistID, userID) { // checked
    return serviceRequest("ArtistDelete", { "username": artistID, "password": userID });
}
function artistByID(artistID) { // checked
    var art = serviceRequest("ArtistLoadByID", { "username": artistID, "password": "" });
    setSession("activeartist", JSON.stringify(art));
    return art;
}
function artistByiRequestName(iRequestName) { // checked
    return serviceRequest("ArtistLoadByiRequestName", { "username": iRequestName, "password": "" });
}
function artistByName(artistName) { // checked
    return serviceRequest("ArtistLoadByName", { "username": artistName, "password": "" });
}
function artistsAll() { // checked
    return serviceRequest("ArtistsLoad", ck());
}
function iRequestArtistList()
{
    return serviceRequest("iRequestArtistsList", ck());
}
function artistMemberDelete(artistID, userID) { // checked
    return serviceRequest("ArtistMemberDelete", { "username": artistID, "password": userID });
}
function artistMembers(artistID) { // checked
    return serviceRequest("ArtistMembersLoad", { "username": artistID, "password": "" });
}

// UserArtist
function userArtistCreate(userID, artistID, artistRole) { // checked
    return serviceRequest("UserArtistCreate", { "UserID": userID, "ArtistID": artistID, "ArtistRole": artistRole });
}
function userArtistDelete(userID, artistID, artistRole) { // checked
    return serviceRequest("UserArtistDelete", { "UserID": userID, "ArtistID": artistID, "ArtistRole": artistRole });
}

// SetList
function setlistDelete(setName, subsetName, artistID) { // checked
    return serviceRequest("SetlistDelete", { "SetName": setName, "SubsetName": subsetName, "ArtistID": artistID });
}
function setlistSave(setlistName, subsetName, songs, artistID) { // checked
    return serviceRequest("SetlistSave", { "SetName": setlistName, "SubsetName": subsetName, "Songs": songs, "ArtistID": artistID });
}
function subsets(setlistName, artistID) { // checked
    return serviceRequest("SubsetsLoad", { "username": setlistName, "password": artistID });
}
function setlists(artistID) { // checked
    return serviceRequest("SetsLoad", { "username": artistID, "password": "" });
}
function setlist(setName, subsetName, artistID) { // checked
    return serviceRequest("SetlistLoad", { "SetName": setName, "SubsetName": subsetName, "ArtistID": artistID });
}
// Song
function songUpdateAccessDate(songID) { // checked
    if (getActiveArtistID() > 0)
        return serviceRequest("SongUpdateAccess", { "username": songID, "password": "" });
    else return [];
}
function saveSongListEdits(sl) {
    if (getActiveArtistID() > 0)
        for (var i = 0; i < sl.length; i++)
            if (sl[i].Status)
                if (sl[i].Status > 0)
                    songSave(sl[i]);
}

function songSave(song) { // checked
    if (getActiveArtistID() > 0)
        return serviceRequest("SongSave", song);
    var lst = JSON.parse(getLocal("songlist"));
    
    return false;
}
function songRandom(artistID) // checked
{
    if (getActiveArtistID() > 0)
        return serviceRequest("SongRandomLoad", { "username": artistID, "password": "" });
    return {};
}
function song(song) { // checked
    if (getActiveArtistID() > 0)
        return serviceRequest("SongLoad", song);
    return {};
}
function songByTitleAndArtist(title, artist, artistID)
{
    if (getActiveArtistID() > 0)
        return serviceRequest("SongLoadByTitle", { Title: title, Artist: artist, ArtistID: artistID });
    return {};
}
function songByID(songID) { // checked
    if (getActiveArtistID() > 0)
        return serviceRequest("SongLoadByID", { "username": songID, "password": "" });
    return {};
}
function songListPublic(artistID) { // checked
    if (artistID)
        return serviceRequest("SongListPublicLoad", { "username": artistID, "password": "" }).sort(function (a, b) { return (a.Title > b.Title) ? 1 : ((b.Title > a.Title) ? -1 : 0); });
    return [];
}
function songList(sortDir, artistSort, artist, genre, cat, tempo, familiarity, artistID) { // checked
    if (getActiveArtistID() > 0) {
        var lst = serviceRequest("SongListLoad", { "SortDirection": sortDir, "SortByArtist": artistSort, "Artist": artist, "Genre": genre, "Category": cat, "Tempo": tempo, "Familiarity": familiarity, "ArtistID": artistID });
        if (getLocal("songlist") == null)
            setLocal("songlist", JSON.stringify(lst));
        return lst;
    }
    return [];
}
function songListAll(artistID) { // checked
    if (getActiveArtistID() > 0) {
        var lst = serviceRequest("SongListAllLoad", { "username": artistID, "password": "" });//.sort(function (a, b) { return (a.Title > b.Title) ? 1 : ((b.Title > a.Title) ? -1 : 0); });
        if (getLocal("songlist") == null && lst != null)
            setLocal("songlist", JSON.stringify(lst));
        return lst;
    }
    return [];
}
function songDelete(songID) { // checked
    if (getActiveArtistID() > 0)
        return serviceRequest("SongDelete", { "username": songID, "password": "" });
    return false;
}
function songArtists(artistID) { // checked
    if (getActiveArtistID() > 0) {
        var lst = serviceRequest("SongArtistsLoad", { "username": artistID, "password": "" });
        setSession("songartistlist", JSON.stringify(lst));
        return lst;
    }
    return [];
}

// Lookups
function iMessages() { // checked
    return serviceRequest("iMessages", {});
}
function genresByArtistID(artistID) { // checked
    var lst = serviceRequest("GenresByArtistIDGet", { "username": artistID });
    setSession("songgenrelist", JSON.stringify(lst));
    return lst;
}
function genres() { // checked
    var lst = serviceRequest("GenresGet", {});
    setSession("genrelist", JSON.stringify(lst));
    return lst;
}
function categories(artistID) { // checked
    var lst = serviceRequest("CategoriesGet", { "username": artistID });
    setSession("categorylist", JSON.stringify(lst));
    return lst;
}
function familiarities() { // checked
    var lst = serviceRequest("FamiliaritiesGet", {});
    setSession("familiaritylist", JSON.stringify(lst));
    return lst;
}
function tempos() { // checked
    var lst = serviceRequest("TemposGet", {});
    setSession("tempolist", JSON.stringify(lst));
    return lst;
}
function keys() { // checked
    var lst = serviceRequest("KeysGet", {});
    setSession("keylist", JSON.stringify(lst));
    return lst;
}
function artistRoles() { // checked
    return serviceRequest("ArtistRolesGet", {});
}

// JoinRequest
function joinRequestCreate(userID, artistID) // checked
{
    return serviceRequest("JoinRequestCreate", { "username": userID, "password": artistID });
}
function joinRequestsByUserID(userID) // checked
{
    return serviceRequest("JoinRequestByUserIDGet", { "username": userID, "password": "" });
}
function joinRequests(artistID) // checked
{
    return serviceRequest("JoinRequestGet", { "username": artistID, "password": "" });
}
function joinRequestProcess(requestID, status, message, artistRole) // checked
{
    return serviceRequest("JoinRequestProcess", { "JoinRequestID": requestID, "Status": status, "Message": message, "ArtistRole": artistRole });
}


// iRequest
function getCountFromIP(ip,art) {
    return serviceRequest("GetCountFromIP", { "username": ip, "password": art });
}

function iRequestStats(artistID)
{
    return serviceRequest("iRequestStatsGet", { "username": artistID, "password": "" })
}
function iRequestCreate(artistID, songID, weight, ip) {
    return serviceRequest("RequestCreate", { ArtistID: artistID, SongID: songID, Weight: weight, IP:ip })
}
function iRequests(artistID, todayOnly) {
    return serviceRequest("RequestsGet", { username: artistID, password: todayOnly })
}
function iRequestsLive(artistID) {
    return serviceRequest("LiveRequestsGet", { username: artistID, password: "" })
}
// iRequestMessage
function iRequestMessageCreate(Recipient,Message, ArtistID,  Attachment, Heading, ip) {
    return serviceRequest("iRequestMessageCreate", { ArtistID: ArtistID, Message: Message, Recipient: Recipient, Attachment: Attachment, Heading:Heading, IP:ip })
}
function iRequestMessages(UserID, ArtistID, TodayOnly) {
    return serviceRequest("iRequestMessagesGet", { ArtistID: ArtistID, UserID: UserID, TodayOnly: TodayOnly })
}
function iRequestMessage(messageID) {
    return serviceRequest("iRequestMessageGet", { username: messageID, password: "" })
}
function iRequestMessageSave(messageID, ArtistID, Message, Recipient, Attachment, ip) {
    return serviceRequest("iRequestMessageUpdate", { MessageID: messageID, ArtistID: ArtistID, Message: Message, Recipient: Recipient, Attachment: Attachment, IP:ip })
}
function iRequestMessageDelete(messageID) {
    return serviceRequest("iRequestMessageDelete", { username: messageID, password: "" })
}
function iRequestMessagesDelete(userID) {
    return serviceRequest("iRequestMessagesDelete", { username: userID, password: "" })
}

// UserInstrument
function instrumentList() {
    return serviceRequest("InstrumentLoad", {"suername":"", "password":""});
}
function instrumentByUser(userID)
{
    return serviceRequest("UserInstrumentByUser", { "username": userID });
}
function usersByInstrument(instID) {
    return serviceRequest("UserInstrumentByInstrument", { "username": instID });
}
function userInstrumentSave(userID, instruments)
{
    return serviceRequest("UserInstrumentSave", { "username": userID, "password": instruments });
}

// Calendar
function calendarList(userID, artistID)
{
    return serviceRequest("CalendarList", { "username": userID, "password": artistID });
}
function calendarDelete(userID, artistID, calendarID)
{
    return serviceRequest("CalendarDelete", { "UserID": userID, "ArtistID": artistID, "CalendarID":calendarID });
}
function calendarSave(calendarID, userID, artistID, date,venue,setupTime,startTime,endTime,sets,url,visibility,notes,description,offset)
{
    return serviceRequest("CalendarSave", {
        "UserID": parseInt(userID), "ArtistID": artistID, "Date": date, "Venue": venue, "SetupTime": setupTime, "StartTime": startTime,
        "EndTime": endTime, "Sets": parseInt(sets), "URL": url, "CalendarID":calendarID,"Visibility":visibility,"Notes":notes,"Description":description, "Offset":offset
    });
}
function calendarShift(id, delta)
{
    return serviceRequest("CalendarShift", {"username":id,"password":delta});
}
function getRates() {
    return serviceRequest("SiteSettings", { "username": "Rates" });
}

// Want Ads
function wantAdTypesLoad() {    
    return serviceRequest("WantAdTypesLoad", { });
}
function wantAdsLoad(direction,adType,userID)
{
    return serviceRequest("WantAdsLoad", { "AdType" : adType ? adType : 0,"Direction":direction, "UserID":userID});
}
function wantAdLoad(id) {
    return serviceRequest("WantAdLoad", { "WantAdID": id });
}
function wantAdsSearch(searchTerm, adType,direction,userID)
{
    return serviceRequest("WantAdsSearch", { "Term": searchTerm, "AdType": adType, "Direction":direction,"UserID":userID });
}
function wantAdDelete(userID, adID)
{
    return serviceRequest("WantAdDelete", { "UserID": userID, "WantAdID": adID });
}
function wantAdSave(adType, instrument, location, direction, text, title, userID, price, phone, wantAdId) {
    return serviceRequest("WantAdSave", {
        "AdType": adType, "Instrument": instrument, "Location": location,
        "Direction": direction, "Text": text, "Title": title, "UserID": userID, "AdID": wantAdId,
        "Price":price,"Phone":phone
    });
}
function reportAd(userid, id, reason)
{
    return serviceRequest("ReportAd", { "UserID": parseInt(userid), "ItemID": parseInt(id), "Reason":reason });
}
function submitVideo(adID, key, title)
{
    return serviceRequest("WantAdAddVideo", { "AdID": adID, "Key": key, "Name":title });
}
function updateMainImage(adid, mediaid)
{
    return serviceRequest("WantAdSetMainImage", { "username": mediaid, "password": adid });
}
function wantAdMediaDelete(id,type)
{
    var del = serviceRequest("WantAdMediaDelete", { "username": id, "password": "" });
    var data = "";
    if (del)
    {
        $.ajax({
            url: "GigManMedia.aspx?WantAdMediaID=" + id + "&Action=DeleteMedia",
            async: false,
            success: function (result) {
                data = result;
            },
            error: function (result) {
                data = { "Error": true, "Result": result };
                ServiceRequestError = true;
            }
        });
    }
}
function wantAdMediaRename(id, name)
{
    return serviceRequest("WantAdMediaRename", { "username": id, "password": name });
}
function allowedMediaTypes() {
    return serviceRequest("AllowedMediaLoad", { "username": "", "password": "" });
}

// Geographic
function countries() {
    return serviceRequest("CountryList", {});
}
function states(country) {
    return serviceRequest("StateList", { "username": country, "password": "" });
}

// Announcement
function addAnnouncement(usrID, artID, text, date, title)
{
    return serviceRequest("AddAnnouncement", {
        ArtistID:artID,UserID:usrID,Text:text,AnnouncementDate:date,Title:title });
}

function updateAnnouncement(usrID, artID, text, date, title, id)
{
    return serviceRequest("UpdateAnnouncement", {
        UserID:usrID,ArtistID:artID,Text:text,AnnouncementDate:date, Title:title,ID:id
    });
}

function deleteAnnouncement(usrID, artID, id)
{
    return serviceRequest("DeleteAnnouncement", {
        UserID:usrID,ArtistID:artID,Text:'',AnnouncementDate:'1791-01-01', ID:id
    });
}

function getAnnouncements(usrID, artID)
{
    return serviceRequest("GetAnnouncements", { username:usrID,password:artID});
}
function getGMRAnnouncements(artID)
{
    return serviceRequest("GetAnnouncements", { username:1000000000,password:artID});
}

// Session
function saveUserSession(userID, ip, data, userAgent)
{
    return serviceRequest("SaveSession", {UserID:userID,IP:ip,Data:data,UserAgent:userAgent,SessionID:"0"});
}

function updateUserSession(userID, ip, data, userAgent, sessionID)
{
    return serviceRequest("UpdateSession", {UserID:userID,IP:ip,Data:data,UserAgent:userAgent,SessionID:sessionID});
}

function getUserSession(userID) {
    return serviceRequest("GetSession", { username: userID, password: "" });
}

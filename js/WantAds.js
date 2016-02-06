var table;
var mediaTypes = [];
$(document).ready(function () {

    updateLoginLinks();

    var scheme = getSession("colorscheme");
    if (scheme == "highcontrast")
        $("#colorScheme").prop("checked", true);
    mediaTypes = allowedMediaTypes();
    if (document.getElementById("navTable"))
        loadNavMenu();
    if (document.getElementById("recentAds"))
        loadRecent();
    $(document).on("click",".adLink",function() {
        window.location.href = "ad.html?id=" + $(this).data("adid");
    });
    if (checkLoginStatus())
        $("#createAdLink").show();
    else $("#createAdLink").hide();
    $("#Login").click(function () {
        login($("#Username").val(), $("#Password").val());
    });
    $(".createAdLink").click(function () {
        var charm = $("#editorCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
    $(document).on("click", ".reportLink", function () {
        var charm = $("#reportAdCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
    $(document).on("click", "CloseReportPanel", function () {
        var charm = $("#reportAdCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
    $("#CloseLoginPanel").click(function () {
        var charm = $("#loginCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        }
    });
    $("#waLoginLink").click(function () {
        if (getUserID() > 0)
            return;
        var charm = $("#loginCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
    $("#logoutLink").click(function () {
        removeSession("loggedinuser");
        updateLoginLinks();
    });
    $("#colorScheme").on("click", function () {
        if (this.checked)
            setLocal("colorscheme", "highcontrast");
        else setLocal("colorscheme", "classic");
        parent.location.reload();
    });
    $(document).on("click", "#search", function () {
        var t = $("#adTypes").val();
        if (typeof t === "undefined")
            t = "";
        window.location.href = "ads.html?st=" + $("#searchText").val() + "&at=" + t;
    });
    $(document).on("click", ".wantAdNavLink", function () {
        window.location.href = "ads.html?st=" + $(this).data("dir") + "&at=" + $(this).data("adtype");
    });
    $(document).on("click", ".adTable", function() {
        window.location.href = "ad.html?id=" + $(this).data("adid");
    });
    $(document).on("click", ".adTypeChild", function () {
        window.location.href = "ads.html?st=" + $(this).data("dir") + "&at=" + $(this).data("adtype");
    });
    $(document).on("click", ".adTypeParent", function () {
        window.location.href = "ads.html?st=" + $(this).data("dir") + "&at=" + $(this).data("adtype");
    });

    var imports = $("link[rel='import'");
    for (var i = 0; i < imports.length; i++)
        loadContent(imports[i].id,imports[i])
    loadContent();
    loadSearchAdTypes();
});
function updateLoginLinks()
{
    if (checkLoginStatus()) {
        var uName = JSON.parse(getSession("loggedinuser")).Username;
        $("#waLoginLink").text("Welcome " + uName);
        $("#logoutLink").show();
        $(".createAdLink").show();
    }
    else {
        $("#waLoginLink").text("Log in");
        $(".createAdLink").hide();
        $("#logoutLink").hide();
    }
}
function login(username, password) {
    var usr = userLogin(username, password);
    if (usr.Error) {
        $("#loginError").text("There was an error logging in.  Please ensure that your user name and password are spelled correctly");
    }
    else {
        var charm = $("#loginCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        }
        setSession("loggedinuser", JSON.stringify(usr));
        var as = artistAffiliations(usr.UserID);
        if (as && as.length > 0)
            if (getSession("activeartist") == null)
                setSession("activeartist", JSON.stringify(as[0]));
    }
    updateLoginLinks();
}

function loadSearchAdTypes() {
    var adTypes = wantAdTypesLoad();
    document.getElementById("adTypeContainer").innerHTML = "";
    var sel = document.createElement("select");
    sel.id = "adTypes";
    var opts = "<option value='0'></option>";
    $.each(adTypes, function (i, item) {
        if (item.Parent == 0)
            opts += "<option value='" + item.WantAdTypeID + "'>" + item.Name + "</option>"
    });
    sel.innerHTML = opts;
    document.getElementById("adTypeContainer").appendChild(sel);
    return adTypes;
}
function loadContent(id,link)
{
    if ($("#sideboardAds")[0])
    {
        var img = document.createElement("img");
        img.src = "Media/AdImages/300x250.gif";
        document.getElementById("sideboardAds").innerHTML = '';
        document.getElementById("sideboardAds").appendChild(img);
    }
    if ($("#leftAds")[0])
    {
        var img = document.createElement("img");
        img.src = "Media/AdImages/300x250.gif";
        document.getElementById("leftAds").innerHTML = '';
        document.getElementById("leftAds").appendChild(img);
    }
    if ($("#navAds")[0])
    {
        var img = document.createElement("img");
        img.src = "Media/AdImages/160x600.gif";
        document.getElementById("navAds").innerHTML = '';
        document.getElementById("navAds").appendChild(img);
    }
    if ($("#navPanelAds")[0])
    {
        var img = document.createElement("img");
        img.src = "Media/AdImages/160x600.gif";
        document.getElementById("navPanelAds").innerHTML = '';
        document.getElementById("navPanelAds").appendChild(img);

    }
    if ($("#midBannerAd")[0])
    {
        var img = document.createElement("img");
        img.src = "Media/AdImages/728x90.jpg";
        document.getElementById("midBannerAd").innerHTML = '';
        document.getElementById("midBannerAd").appendChild(img);
    }
    if ($("#leaderboard")[0])
    {
        var img = document.createElement("img");
        img.src = "Media/AdImages/728x90.png";
        document.getElementById("leaderboard").innerHTML = '';
        document.getElementById("leaderboard").appendChild(img);
    }
}
function assembleAdListing(value, type, full) {
    var t = "<table class='adTable' data-adid='" + full.AdID  + "'>";
    var imgName = getMainImage(full), fldr = "";
    
    var adDate = eval(full.DateCreated.replace(/\//g, ''));
    var ii = adDate.lastIndexOf(":");
    adDate = adDate.substring(0,ii);
    t += "<tr><td><div class='adListImgPanel'><img src='" + imgName + "' alt='" + full.Title + "'/></div></td>";
    t += "<td><table style='width:100%;border-collapse:collapse'><tr><td class='adPrice'>$" + full.Price.toFixed(2) + "</td></tr>";
    t += "<tr><td><a class='adLink' href='#' data-adid='" + full.AdID + "' title='" + full.Title +"'><b>" + full.Title + "</b><span class='mif-go'></span></a></td></tr>";
    t += "<tr><td><a class='adLink' href='#' data-adid='" + full.AdID + "' title='" + full.Title + "'>" + full.Location + "<span class='mif-go'></span></a> | " + adDate + "</td></tr>";
    t += "<tr><td>" + full.Text.substring(0,127) + "...</td>";
    t += "</tr></table></td></tr></table>";
    return t;
}

function loadNavMenu() {
    var lst = wantAdTypesLoad();
    var wantedl = "",wantedr = "";
    var offeringl = "",offeringr = "";
    
    for (var i = 0; i < lst.length; i++) {
        var s = "";
        if (lst[i].Parent < 0)
            continue;
        var pnt = false;
        if (lst[i].Parent > 0)
            m = " class='adTypeChild' ";
        else {
            m = " class='adTypeParent' ";
            pnt = true;
        }
        if (lst[i].Parent == 6 || lst[i].Parent == 7 || lst[i].Parent == 5 || lst[i].WantAdTypeID == 5 || lst[i].WantAdTypeID == 6 || lst[i].WantAdTypeID == 7 || lst[i].WantAdTypeID == 53
            || lst[i].Parent == 4 || lst[i].WantAdTypeID ==4) {
            wantedr += "<a href='#' data-dir='1' data-adtype='" + lst[i].WantAdTypeID + "'" + m + ">" + lst[i].Name + "</a>";
            offeringr += "<a href='#' data-dir='2' data-adtype='" + lst[i].WantAdTypeID + " '" + m + ">" + lst[i].Name + "</a>";
        }
        else {
            wantedl += "<a href='#' data-dir='1' data-adtype='" + lst[i].WantAdTypeID + "'" + m + ">" + lst[i].Name + "</a>";
            offeringl += "<a href='#' data-dir='2' data-adtype='" + lst[i].WantAdTypeID + " '" + m + ">" + lst[i].Name + "</a>";
        }
    }
    $("#wantedLeft").append(wantedl);
    $("#wantedRight").append(wantedr);
    $("#availableLeft").append(offeringl);
    $("#availableRight").append(offeringr);
}

function loadRecent()
{
    var lst = wantAdsSearch("", 1000);
    var ads = "";
    for (var i = 0; i < lst.length; i++)
    {
        var img = getMainImage(lst[i]);
        ads += "<a href='#' class='adLink recentAdLink' data-adid='" + lst[i].AdID + "'><img src='" + img + "' alt='" + lst[i].Title + "'><br/>" +
            lst[i].Title + "</a>";
    }

    $("#recentAds").append(ads);
}
function getMainImage(ad)
{
    var imgs = [], img, imgName = "", fldr = "";
    if (ad.Media && ad.Media.length > 0)
        imgs = jlinq.from(ad.Media).contains("Type", 1).or(2).or(3).or(4).select();
    if (imgs.length > 0) {
        imgs = jlinq.from(imgs).contains("IsMain", true).select();
    }
    if (imgs && imgs.length > 0)
        img = imgs[0];
    if (img) {
        if (img.Type < 5)
            fldr = "uploads/";
        else fldr = "uploads/";
        var nm = jlinq.from(mediaTypes).contains("MediaTypeID", Number(img.Type)).select()[0].Extension;
        imgName = fldr + img.WantAdMediaDiskID + "." + nm;
    }
    else imgName = "Media/WantAdImages/NoImage.png";
    return imgName;
}

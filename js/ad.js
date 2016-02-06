var ad;
var captchaAnswer, captchaAnswer2;
$(document).ready(function () {
    showCaptcha();
    
    var mt = allowedMediaTypes();
    var parms = getQueryParameters(document.location.search);
    ad = wantAdLoad(parms.id);
    var rptLnk = "";
    if (checkLoginStatus())
        rptLnk = " <a href='#' class='reportLink' data-adid='" + ad.AdID + "'><span class='mif-flag'></span> Report this ad</a>";
    $("#adTitle").html(ad.Title + rptLnk);
    $("#reportAdTitle").text(ad.Title);
    var mainFilled = false;
    var cls = "thumbnail selected";
    var img = "", audio = "", video = "";
    var firstIdIdx = -1;
    var nImg = 0, nVid = 0;
    for (var i = 0; i < ad.Media.length; i++)
    {
        var ext = mt[ad.Media[i].Type - 1].Extension;
        switch (ext)
        {
            case "jpg":
            case "jpeg":
            case "png":
                if (firstIdIdx == -1) firstIdIdx = i;
                if (ad.Media[i].IsMain && !mainFilled) {
                    setMainImage(ad.Media[i].WantAdMediaID, ext,ad.Media[i].WantAdMediaDiskID);
                    mainFilled = true;
                    cls = "thumbnail selected";
                }
                else cls = "thumbnail";
                img += "<div class='thumbnailPanel'><img title='" + ad.Media[i].Name + "' data-diskid='" + ad.Media[i].WantAdMediaDiskID + "' data-name='" + ad.Media.Name + "' class='" + cls + "' data-mediatype='" + ext + "' data-mediaid='" + ad.Media[i].WantAdMediaID + "' src='uploads/" + ad.Media[i].Name + "' alt='" + ad.Media[i].Name + "'/></div>";
                nImg++;
                if ((nImg % 4) == 0)
                    img += "<br/>";
                break;
            case "wav":
            case "wave":
            case "mp3":
                audio += "<a target=_NEW class='audioLink' href='uploads/" + ad.Media[i].WantAdMediaDiskID + "." + ext + "'>" + ad.Media[i].Name + "</a><br>";
                break;
            case "": // remote video
                nVid++;
                video += "<iframe class='waVideo' src='" + "https://www.youtube.com/embed/" + ad.Media[i].Url + "' title='" + ad.Media[i].Name + "'></iframe><br>";
                break;
        }
    }
    if (img.trim() != "" && !mainFilled)
    {
        setMainImage(ad.Media[firstIdIdx].WantAdMediaID, mt[ad.Media[firstIdIdx].Type - 1].Extension,ad.Media[firstIdIdx].WantAdMediaDiskID);
        mainFilled = true;
    }
    $("#otherAds").prop("href", "ads.html?uid=" + ad.UserID);
    if (img.trim() == "")
        $("#thumbnailPanel").hide();
    else $("#thumbnailPanel").html(img);
    if (audio.trim() == "")
        $("#audioPanel").hide();
    else $("#audioPanel").html(audio);
    if (video.trim() == "")
        $("#videoPanel").hide();
    else $("#videoPanel").html(video).show();

    if (!mainFilled)
        $("#mainImagePanel").hide();

    var adDate = eval(ad.DateCreated.replace(/\//g, ''));
    var ii = adDate.lastIndexOf(":");
    adDate = adDate.substring(0, ii);
    $("#adText").append(ad.Text.replace(/\n/g,"<br/>"));
    $("#listDate").text(adDate);
    $("#price").text(ad.Price.formatMoney(2,".",","));
    $("#location").text(ad.Location);

    var d = $("#largeImagePanel").dialog({
        modal: true,
        autoOPen:false,
        overlay: { backgroundColor: "#000", opacity: 0.5 },
        buttons: { "Close": function () { $(this).dialog('**destroy**'); } },
        close: function (ev, ui) { $(this).close(); },
    });

    $(document).on("click",".thumbnail",function() {
        setMainImage($(this).data("mediaid"), $(this).data("mediatype"), $(this).data("diskid"));
        $(".thumbnail").removeClass("selected");
        $(this).addClass("selected");
    });
    
    $("#captchaSend").click(function () {
        var ca = $("#captchaAnswer").val();
        if (captchaAnswer == ca) {
            $("#sendMail").prop("disabled",false);
        }
        else showCaptcha();
    });
    $("#captchaSend2").click(function () {
        var ca = $("#captchaAnswer2").val();
        if (captchaAnswer2 == ca) {
            $("#submitAdReport").prop("disabled", false);
            $("#captchaPanel2").hide();
        }
        else showCaptcha();
    });
    $("#mainImage").click(function () {
        var img = document.createElement("img");
        img.src = "uploads/" + $("#mainImage").data("diskid") + "." + $("#mainImage").data("ext");
        if (document.getElementById("largeImagePanel").firstChild)
            document.getElementById("largeImagePanel").removeChild(document.getElementById("largeImagePanel").firstChild);
        document.getElementById("largeImagePanel").appendChild(img);       
        $("#largeImagePanel").dialog("open");
    });
    $("#largeImagePanel").click(function () {
        $("#largeImagePanel").dialog("close");
    });
    $("#showPhone").click(function (e) {
        if (ad.Phone) {
            $(this).text(ad.Phone);
            $(this).prop("href", "tel:" + ad.Phone);
            e.preventDefault();
        }
        else $(this).text("n/a");
    });
    $("#submitAdReport").click(function () {
        if ($("#reportReason").val().trim() != "" && $("#reportReason").val().trim().length > 20)
            var e = reportAd(getUserID(),ad.AdID, $("#reportReason").val());
        else {
            $("#Message").text("You haven't given your reason for reporting this ad.");
            return;
        }
        if (e > 0)
            $("#Message").text("Thank you.  Your report has been set.");
        else if (e < 0)
            $("#Message").text("You have already reported this ad.");
        else $("#Message").text("There has been an error while submitting your report.  Please try again in a few minutes. If the problem persists, please contact us. ");
        showCaptcha2();
    });
    $("#CloseReportPanel").click(function () {
        var charm = $("#reportAdCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
});

function setMainImage(id,ext,diskid) {
    $("#mainImage").attr("src", "uploads/" + diskid + "." + ext);
    $("#mainImage").data("id",id);
    $("#mainImage").data("ext", ext);
    $("#mainImage").data("diskid",diskid);
}

function showCaptcha()
{
    $("#captchaAnswer").val('');
    var a = Math.floor((Math.random() * 10) + 1),
        b = Math.floor((Math.random() * 10) + 1);
    var op = Math.floor((Math.random() * 3) + 1);
    if (op > 2) { captchaAnswer = a * b; $("#captchaText").text("Multiply " + a + " and " + b); }
    else if (op > 1) { captchaAnswer = Math.max(a,b) - Math.min(a,b); $("#captchaText").text("Subtract " + Math.min(a,b) +  " from " + Math.max(a,b)); }
    else { captchaAnswer = a + b; $("#captchaText").text("Add " + a + " and " + b); }
    showCaptcha2();
}

function showCaptcha2()
{
    $("#captchaAnswer2").val('');
    var a = Math.floor((Math.random() * 20) + 1),
        b = Math.floor((Math.random() * 20) + 1);
    var op = Math.floor((Math.random() * 3) + 1);
    if (op > 2) { captchaAnswer2 = a * b; $("#captchaText2").text("Multiply " + a + " by " + b); }
    else if (op > 1) { captchaAnswer2 = a - b; $("#captchaText2").text("Subtract " + b +  " from " + a); }
    else { captchaAnswer2 = a + b; $("#captchaText2").text("Add " + a + " to " + b); }
}
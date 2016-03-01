var mt;
var mainImage = "";
var ad = null;
$(document).ready(function () {
    mt = allowedMediaTypes();


    $("#StatusMessage").text("");
    var opts = "";
    var groupstart = false;
    /*var dialog = $("#adEdAddMedia").dialog({
        autoOpen:false,
            modal: true,
            draggable: true,
            resizable: false,
            position: { my: "center center",at:"center center", of: "#adEdWrapper"},
            show: 'blind',
            hide: 'blind',
            width: 400,
            height:400,
            dialogClass: 'newMediaDlg',
            title: "Add Media",
            buttons: {
                "Ok": function () {
                    $(this).dialog("close");
                },
                "Cancel": function () {
                    $(this).dialog("close");
                }
            }
    });*/
    $("#newAd").click(function () {
        ad = null;
        $("#adDirectionSeek").prop("checked", true);
        $("#Title").val("");
        $("#Description").val("");
        $("#Price").val("");
        $("#Location").val("");
        $("#Phone").val("");
        document.getElementById('adType').value = 1;
    });


    var ads = wantAdTypesLoad();
    for (var i = 2; i < ads.length; i++) {
        var pad = "";
        if (ads[i].Parent == 0) {
            if (groupstart) opts += "</optgroup>";
            opts += "<optgroup value='" + ads[i].WantAdTypeID + "' label='" + ads[i].Name + "'>";
            groupstart = true;
        }
        else opts += "<option value='" + ads[i].WantAdTypeID + "'>" + pad + ads[i].Name + "</option>";
    }
    $("#adType").append(opts);

    $("#Save").click(function () {
        var err = "";
        if ($("#adType").val() == "") err += "Ad Type is required.<br/>";
        if ($("#Location").val().trim() == "") err += "Location is required.<br/>";
        if ($("#Title").val().trim() == "") err += "Title is required.<br/>";
        if ($("#Price").val().trim() == "") err += "Price is required.";
        if (err != "")
        {
            $("#StatusMessage").css("color", "red");
            $("#StatusMessage").append(err);
            return;
        }
        var dir = $("#adDirectionSeek").prop("checked") ? 1 : 0;
        var id = 0;
        if (ad) id = ad.AdID;
        var id = wantAdSave($("#adType").val(), "", $("#Location").val(),dir,
            $("#Description").val(), $("#Title").val(), getUserID(), $("#Price").val(),$("#Phone").val(),id);
        if (id > 0)
        {
            $("#StatusMessage").css("color", "green");
            $("#StatusMessage").append("Want Ad saved.");
            loadAds();
            return;
        }
    });
    $("#usersAds").on("change",function() {
        loadAd();
    })
    $(document).on("click", ".thumbnail", function () {
        setMainImage($(this).data("mediaid"),$(this).data("diskid"), $(this).data("mediatype"), $(this).data("name"));
        mainImage = $(this).data("mediaid");
        $(".thumbnail").removeClass(".selected");
        $(this).addClass(".selected");
        updateMainImage($("#usersAds").val(), mainImage);
    });
    $(document).on("click", ".deleteMediaLink, .deleteAudioMediaLink", function () {
        wantAdMediaDelete($(this).data("id"), $(this).data("type"));
        loadAd();
    });
    $("#submitVideo").click(function () {
        if ($("#usersAds").val() == "0" || $("#videoKey").val().trim() == "" || $("#videoTitle").val().trim() == "")
        {
            $("#StatusMessage").text("Vide Key and Video Title are required, and an ad must be loaded.")
        }
        var e = submitVideo(parseInt($("#usersAds").val()), $("#videoKey").val(), $("#videoTitle").val());
        if (!e) {
            $("#StatusMessage").text("There was an error.  Please try again in a few minutes.  If the problem persists, please contact us.");
        }
        else if (e == -1) {
            $("#StatusMessage").text("You have already added that video URL.");
        }
        else {
            loadAd();
            $("#StatusMessage").text("Your video has been added.");
        }
    });
    $(document).on("click", ".renameButton", function () {
        var mid = $(this).data("id")
        var txt = $("[id^=" + mid + "_name]").val();
        var oName = $("[id^=" + mid + "_name]").data("oldname");
        if (mid == "" || txt == "" || txt == oName)
            return;
        wantAdMediaRename(mid, txt);
        loadAd();
    });
    loadAds();
});

function setMainImage(mid, did, ext, name) {
    $("#mainImage").attr("src", "uploads/adlist/" + did + ".png");
    $("#mainImage").data("id", mid);
    $("#mainImage").data("diskid", did);
    $("#mainImage").data("ext", ext);
    $("#mainImage").data("name",name);
}

function loadMedia(ad)
{
    if (ad) {
        $("#uploadPanel").show();
        var mainFilled = false;
        var cls = "thumbnail selected";
        var img = "", audio = "";
        var firstIdIdx = -1;
        var nImg = 0, nAud = 0, nVid = 0;
        var audio = "<table style='width:100%'>", video = "";
        for (var i = 0; i < ad.Media.length; i++) {
            var ext = mt[ad.Media[i].Type - 1].Extension;
            switch (ext) {
                case "jpg":
                case "jpeg":
                case "png":
                    if (firstIdIdx == -1) firstIdIdx = i;
                    if (ad.Media[i].IsMain && !mainFilled) {
                        setMainImage(ad.Media[i].WantAdMediaID, ad.Media[i].WantAdMediaDiskID, ext, ad.Media[i].Name);
                        mainFilled = true;
                        cls = "thumbnail selected";
                        mainImage = ad.Media[i].WantAdMediaID;
                    }
                    else cls = "thumbnail";
                    img += "<div class='thumbnailPanel'><img title='" + ad.Media[i].Name + "' data-name='" + ad.Media[i].Name + "' class='" + cls + "' data-mediatype='" + ext + "' data-mediaid='" + ad.Media[i].WantAdMediaID +
                        "' data-diskid='" + ad.Media[i].WantAdMediaDiskID +"' src='uploads/thumbs/" + ad.Media[i].WantAdMediaDiskID + ".png" + "' alt='" + ad.Media[i].Name + "'/>";
                    img += "<a href=# title='Delete Media' class='deleteMediaLink' data-type='" + ad.Media[i].Type + "' data-id='" + ad.Media[i].WantAdMediaID + "'></a>";
                    img += "</div>";
                    nImg++;
                    if ((nImg % 4) == 0)
                        img += "<br/>";
                    break;
                case "wav":
                case "wave":
                case "mp3":
                    nAud++;
                    audio += "<tr><td><a href=# title='Delete Media' class='deleteAudioMediaLink' data-type='" + ad.Media[i].Type + "' data-id='" + ad.Media[i].WantAdMediaID + "'></a></td><td>" +
                        "<a target=_NEW class='audioLink' href='uploads/" + ad.Media[i].WantAdMediaDiskID + "." + ext + "'>" + ad.Media[i].Name + "</a></td><td>" +
                        "<input id='" + ad.Media[i].WantAdMediaID + "_name' type='text' maxchars='50' data-oldname='" + ad.Media[i].Name + "' data-id='" + ad.Media[i].WantAdMediaID + "' value='" + ad.Media[i].Name + "'></input></td><td>" + 
                        "<button class='button renameButton' data-id='" + ad.Media[i].WantAdMediaID + "'>Rename</button></td></tr>";
                    break;
                case "": // remote video
                    nVid++;
                    video += "<table class='videoDiv'><tr><td><a href=# title='Delete Media' class='deleteAudioMediaLink' data-type='" + ad.Media[i].Type + "' data-id='" + ad.Media[i].WantAdMediaID + "'></a></td>" + 
                        "<td><iframe class='waeVideo' src='" + "https://www.youtube.com/embed/" + ad.Media[i].Url + "' title='" + ad.Media[i].Name + "'></iframe></td></tr>" + 
                        "<tr><td colspan='2'><input id='" + ad.Media[i].WantAdMediaID + "_name' type='text'maxchars='50' data-id='" + ad.Media[i].WantAdMediaID + "' data-oldname='" + ad.Media[i].Name + "' value='" + ad.Media[i].Name + "'></input> " +
                        "<button class='button' data-id='" + ad.Media[i].WantAdMediaID + "'>Rename</button></table></td></tr>";

                    break;
            }
        }
        audio += "</table>";
        if (nImg >= 8 && nAud >= 2)
            $("#uploadPanel").hide();
        if (img.trim() != "" && !mainFilled) {
            setMainImage(ad.Media[firstIdIdx].WantAdMediaID, mt[ad.Media[firstIdIdx].Type - 1].Extension);
            mainFilled = true;
            mainImage = ad.Media[firstIdIdx].WantAdMediaID;
        }
        if (img.trim() == "")
            $("#thumbnailPanel").hide();
        else {
            $("#thumbnailPanel").show();
            $("#thumbnailPanel").html(img);
        }
        if (audio.trim() == "")
            $("#audioPanel").hide();
        else {
            $("#audioPanel").html(audio);
            $("#audioPanel").show();
        }
        if (video.trim() == "")
            $("#videoPanel").hide();
        else {
            $("#videoPanel").html(video);
            $("#videoPanel").show();
        }
        if (!mainFilled)
            $("#mainImagePanel").hide();
        else $("#mainImagePanel").show();
    }
}
function loadAd()
{
    ad = wantAdLoad($("#usersAds").val());
    if (ad.Direction == 1)
        $("#adDirectionSeek").prop("checked", true);
    else $("#adDirectionOffer").prop("checked", true);
    $("#Title").val(ad.Title);
    $("#Description").val(ad.Text);
    $("#Price").val(ad.Price);
    $("#Location").val(ad.Location);
    $("#Phone").val(ad.Phone);
    document.getElementById('adType').value = ad.AdType;

    loadMedia(ad);
    $("#uploadFrame").prop("src", "GigManMedia.aspx?Action=Upload&WantAdID=" + $("#usersAds").val() + "&skin=" + getSession("colorscheme"));   
}
function loadAds()
{
    var sel = document.getElementById("usersAds");
    for (i = sel.options.length - 1; i >= 0; i--) {
       sel.remove(i);
    }
    $("StatusMessage").text("");

    var ads = wantAdsLoad(0, 0, getUserID());
    var opts = "<option selected value='0'></option>";
    for (var i = 0; i < ads.length; i++)
    {
        opts += "<option value='" + ads[i].AdID + "'>" + ads[i].Title + "</option>";
    }
    $("#usersAds").append(opts);

}

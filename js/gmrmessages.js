var mbrs, art;
var ipAddress = "";
var attachment = "";

ipAddress = getClientIP();
$(document).ready(function () {
    setupDownloads();
    $("#uploaderAccordion").accordion({
        active: false,
        collapsible: true,
    });
    art = sessionStorage.getItem("artist");
    if (art)
        art = JSON.parse(art);
    if (!art.RequestStatus)
    {
        if (art.OffAirMessage && art.OffAirMessage.trim() != "")
            $("#message").html(art.OffAirMessage);
        else $("#message").html(art.ArtistName + " is offline right now.  You can try their calendar or announcements pages to see whjen they will be back.");
        $("#interface").hide();
        return;
    }
    $("#gmStyle").prop("href", "css/request-" + getSession("gmrcolorscheme") + ".css");
    //$("#gmWidgetStyle").prop("href", "css/messageWidget-" + getSession("gmrcolorscheme") + ".css");

    
    var nMsg = checkRegistry(art.UserID, "imessages", art.MaxiMessages);
    if (nMsg == art.MaxiMessages) {
        $("#message").html(art.ArtistName + " thanks you for using GigMan Request!<br/>Please note that you can send this artist " + art.MaxiMessages + " messages in a 24 hour period.");
        $("#interface").hide();
    }
    mbrs = artistMembers(art.ArtistID);
    getMessages();
    updateCountdown();
    var op = 1;
    if (mbrs.length < 1)
        op = 0;
    var html = "<tr class='row odd'><td class='instrument select' style='vertical-align:middle'>&nbsp;All&nbsp;<input type='checkbox' class='cb' style='float:right' data-target='-1' value='" + 0 + "'></input> " +
        "<td class='instrument select' colspan='2'>Leader&nbsp;</td><td><input style='float:right' class='cb' type='checkbox' data-target='leader' value='" + 1 + "'></input></td>" +
        "</tr><tr class='row even'><td colspan='3' style='text-align:center'><span style='opacity:" + op + "'>Or</td></tr>";
    
    for (var i = 0; i < mbrs.length; i++) {
        var cl = "";
        if (!(i % 2)) cl = " odd "; else cl = " even ";
        var inst = mbrs[i].ArtistRole, mbr = mbrs[i].User.FirstName + " " + mbrs[i].User.LastName;
        html += "<tr class='row " + cl + "'><td class='member'>" + mbr + "</td><td class='instrument'>" + inst + "</td>" +
        "<td class='select'><input type='checkbox' class='cb' data-target='" + mbrs[i].User.UserID + "' value='" + (i + 2) + "'></input><span class='check'></span></td></tr>"
    }
    $("#members").html($("#members").html() + html);
    $('.fileSelect').click(function () {
        $('input[type=file]').trigger('click');
    });
    $(document).on("click", ".cb", function () {
        $("#messageMessage").text("");
    });
    

    $('input[type=file]').change(function () {
        $('input[type=text]').val($(this).val());
        var file = document.getElementById('uFile').files[0];
        if (file) {
            //  getAsText(file);
            alert("Name: " + file.name + "\n" + "Last Modified Date :" + file.lastModifiedDate);
        }
    });
    $("#upload").click(function () {
        
    });
    $("#submitButton").click(function () {
        $("#messageMessage").text("");
        var tgt = getTarget();
        if (tgt == "-2") {
            $("#messageMessage").text("You haven't selected a recipient for your message!");
            return;
        }
        var mssg = $("#messageBody").val();
        var heading = $("#messages").val();
        var attachment = getAttachment();
        var a = iRequestMessageCreate(tgt, strip(mssg), art.ArtistID, attachment, heading, ipAddress);
        addRegistry(art.UserID, "imessages", 1);
        $("#message").text("Thanks from " + art.ArtistName + " for using GigMan Request!");
        $("#interface").hide();
    });
    jQuery(document).ready(function ($) {
        updateCountdown();
        $('#messageBody').change(updateCountdown);
        $('#messageBody').keyup(updateCountdown);
    });
});
function setupDownloads()
{
    $("#uploadDiv").prop("src", "uploader.aspx?ip=" + ipAddress + "&skin=" + $("#gmrStyle").prop("href") + "&type=1");
}
function getAttachment() {
    return attachment;
}
function updateCountdown() {
    // 140 is the max message length
    if(!jQuery('#messageBody').val())
        return;
    var remaining = 160 - jQuery('#messageBody').val().length;
    jQuery('#charsLeft').text(remaining + ' characters remaining.');
}
function getMessages() {
    var mssgs = iMessages();
    $("#messages").html("");
    $("#messages").append("<option value='0' disabled>Pick a greeting.</option>");
    for (var i = 0; i < mssgs.length; i++) {
        var o = "<option value='" + mssgs[i].ID + "' data-type='" + mssgs[i].Type + "'>" + mssgs[i].Message + "</option>";
        $("#messages").append(o);
    }
}
function getLeader() {
    val = "";
    $(mbrs).each(function (i, e) {
        if (e.ArtistRole.indexOf("Leader") > -1)
        { val = e.User.UserID; return; }
    });
    if (val != "")
        return val;
    return art.UserID;
}
function getTarget() {
    var val = "";
    $(".select input").each(function (i, e) {
        if ($(e).prop("checked") == true)
        { val += $(e).data("target") + ","; return; }
    })

    val = val.replace("leader", getLeader());
    if (val.indexOf("-1") > -1)
        val = "-1";
    if (val == "")
        val = "-2";
    var ids = val.split(",");
    var ids2 = [];
    $.each(ids, function (i, el) {
        if ($.inArray(el, ids2) === -1) ids2.push(el);
    });
    val = "";
    for (var i = 0; i < ids2.length; i++) {
        val += ids2[i];
        if (i < ids2.length - 2)
            val += ",";
    }
    return val;
}
function fileUploaded(v) {
    if (v) {
        attachment = v.value;
        if (attachment) {
            $("#photo").html("<img id='pImg' src='uploads/" + attachment + "' alt='Your photo thumbnail' />");
            $("#pImg").animate({ width: 100 });
        }
    }
    $("#uploaderAccordion").accordion({
        collapsible: true,
        active:false
    });
}


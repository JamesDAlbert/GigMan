var mbrs, art;
var ipAddress = "";
var attachment = "";

ipAddress = getClientIP();
$(document).ready(function () {
    setupDownloads();
    art = sessionStorage.getItem("artist");
    $("#gmStyle").prop("href", "css/request-" + getSession("colorscheme") + ".css");
    $("#gmWidgetStyle").prop("href", "css/messageWidget-" + getSession("colorscheme") + ".css");

    if (art)
        art = JSON.parse(art);
    var nMsg = checkRegistry(art.UserID, "imessages", art.MaxiMessages);
    if (nMsg == art.MaxiMessages) {
        $("#message").html(art.ArtistName + " thanks you for using GigMan Request!<br/>Please note that you can send this artist " + art.MaxiMessages + " messages in a 24 hour period.");
        $("#interface").hide();
    }
    mbrs = artistMembers(art.ArtistID);
    getMessages();
    updateCountdown();
    var html = "<tr class='row'><td class='member select'>&nbsp;All&nbsp;<label class='input-control checkbox'><input type='checkbox' data-target='-1' value='" + 0 + "'></input><span class='check'></span></label> " +
        "<td class='instrument select' colspan='2'><div>Leader&nbsp;<label class='input-control checkbox'><input type='checkbox' data-target='leader' value='" + 1 + "'></input><span class='check'></span></label>&nbsp;</div></td>" +
        "<td></td></tr><tr><td colspan='3' style='text-align:center'><b>Or</b></td></tr>";

    for (var i = 0; i < mbrs.length; i++) {
        var cl = "";
        if (!(i % 2)) cl = " even "; else cl = " odd ";
        var inst = mbrs[i].ArtistRole, mbr = mbrs[i].User.FirstName + " " + mbrs[i].User.LastName;
        html += "<tr class='row " + cl + "'><td class='member'>" + mbr + "</td><td class='instrument'>" + inst + "</td>" +
        "<td class='select'><label class='input-control checkbox'><input type='checkbox' data-target='" + mbrs[i].User.UserID + "' value='" + (i + 2) + "'></input><span class='check'></span></label></td></tr>"
    }
    $("#members").html($("#members").html() + html);
    $('.fileSelect').click(function () {
        $('input[type=file]').trigger('click');
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
        var a = iRequestMessageCreate(tgt, mssg, art.ArtistID, attachment, heading, ipAddress);
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
    $("#uploadDiv").prop("src", "uploader.aspx?ip=" + ipAddress + "&skin=" + $("#gmWidgetStyle").prop("href") + "&type=1");
}
function getAttachment() {
    return attachment;
}
function updateCountdown() {
    // 140 is the max message length
    var remaining = 160 - jQuery('#messageBody').val().length;
    jQuery('#charsLeft').text(remaining + ' characters remaining.');
}
function getMessages() {
    var mssgs = iMessages();
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
    attachment = v.value;
    if (attachment) {
        $("#photo").html("<img id='pImg' src='uploads/" + attachment + "' alt='Your photo thumbnail' />");
        $("#pImg").animate({ width: 100 });
    }
}


var table = null;
$(document).ready(function () {
    var adTypes = wantAdTypesLoad();
    mediaTypes = allowedMediaTypes();
    if (document.getElementById("navContainer"))
        loadNavMenu(adTypes);
    
    var parms = getQueryParameters(document.location.search);
    var ads;
    var adType = 0;
    if (parms.at != "")
        adType = parseInt(parms.at);
    if (parms.uid)
        ads = wantAdsLoad(0, 0, parms.uid);
    else if (parms.st == "1" || parms.st == "2" || parms.st == "0")
        ads = wantAdsLoad(parms.st, parms.at,0);
    else ads = wantAdsSearch(parms.st,adType,-1,0);
    table = null;
    if (parms.at > 0 || parms.st > 0) {
        var dir = "";
        if (parms.st == 1) dir = "Wanted";
        if (parms.st == 2) dir = "Available";
        if (parms.st == 0) dir = "All";
        var name = "All";
        var parent = 0;
        if (parms.at != "" && parms.at != "0") {
            name = jlinq.from(adTypes).equals("WantAdTypeID", parseInt(parms.at)).first().Name;
            parent = jlinq.from(adTypes).equals("WantAdTypeID", parseInt(parms.at)).first().Parent;
        }
        var rootName = "";
        if (parent > 0) {
            rootName = jlinq.from(adTypes).equals("WantAdTypeID", parent).first().Name;
            rootName = " <a clss='breadcrumb' href='ads.html?st=0&at=" + parent + "'>" + rootName + "</a> | ";
        }
        $("#searchCategoryName").html("<a class='breadcrumb' href='ads.html?st=" + parms.st + "&at=0'>" + dir + "</a> | " + rootName + name);
    }
    else $("#searchCategoryName").html("All Ads");
    if (!$.fn.DataTable.isDataTable('#adsTable')) {
        table = $('#adsTable').dataTable({
            "aaData": ads,
            "bPaginate": true,
            "pagingType": "full_numbers",
            destroy: true,
            bFilter: false,
            "bLengthChange": false,
            sDom: "",
            "aoColumnDefs": [
            {
                "bSortable": false, "aTargets": 0, "visible": true, "mRender": function (value, type, full) {
                    return assembleAdListing(value, type, full);
                }
            },
            ]
        });
    }
    else table = $('#ads').dataTable();
});
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="GigManMedia.aspx.cs" Inherits="GigManMedia" %>
<html>
<head>
    <title></title>
    <link runat="server" id="gmStyle" rel="stylesheet" href="css/ads-neon.min.css" />
    <script src="Scripts/jquery-2.1.4.min.js"></script>
    <style>
        body { margin:0;padding:0;font-family:arial;font-size:90%;}
        .fileInput {
            -moz-opacity:0 ;
	        filter:alpha(opacity: 0);
            opacity:0;
            z-index:2000;
            left:0;
            top:0;
            position:absolute;
            text-align:right;
        }
        .fakeFileInput{
            position: absolute;
	        top: 0px;
	        left: 0px;
	        z-index: 1;
        }
        .fakeFileInput button {
            margin-left:0;
        }
    </style>
</head>
<body>
    <asp:Panel runat="server" id="UploadPanel" visible="false" Width="99%">
        <form runat="server">
            <p>Allowed file types are JPG, PNG, GIF, WAV, MP3</p>
            <div style="position:relative">
            <asp:FileUpload CssClass="fileInput" runat="server" id="mediaFiles" name="mediaFiles[]" allowmultiple="true" />
                <div class="fakeFileInput">
                    <asp:TextBox runat="server" id="fakeText"/><button class="submit" id="messgeButton">Browse</button>
                </div>
            </div>
            <asp:Button class="submit" ID="Submit" runat="server" Text="Upload File(s)" style="float:right;margin-left:-1px" OnClick="Submit_Click"/><br /> <br />     
            <asp:Label ID="UploadStatusLabel" runat="server"></asp:Label>
        </form>
    </asp:Panel>
    <script>
        function loadAd() {
            parent.loadAd();
        }
        $("#mediaFiles").change(function () {
            var files = "";
            if ($("#mediaFiles")[0].files.length > 1)
                $("#<%=fakeText.ClientID%>").val($("#mediaFiles")[0].files.length + " files selected.");
        else 
        {
            for (var i = 0;i < $("#mediaFiles")[0].files.length;i++)
            files += $("#mediaFiles")[0].files[i].name + ";"
            $("#<%=fakeText.ClientID%>").val(files);
        }
        });
    </script>
</body>
</html>
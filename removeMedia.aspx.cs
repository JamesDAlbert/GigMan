using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;

public partial class removeMedia : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string id = Request.QueryString.Get("WantAdMediaID");
        string type = Request.QueryString.Get("WantAdMediaType");
        string path = "Media/";
        switch (type)
        {
            case "Image": path += "WantAdImages/";
                break;
            case "Audio": path += "WantAdAudio/";
                break;
            case "Video": path = "";
                break;
        }
        if (path != "")
            DeleteFile(path,id);
    }
    public void DeleteFile(string filePath,string id)
    {

        string diskPath = Server.MapPath(filePath);

        foreach (string fname in Directory.GetFiles(diskPath,id + ".*"))
            if (File.Exists(fname))
            {
                File.Delete(fname);
            }
    }
}
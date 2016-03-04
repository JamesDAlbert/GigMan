using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using GigManAccess;

public partial class uploader : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        //skin.Href = Request.QueryString["skin"] == null ? "" : Request.QueryString["skin"];
        if (IsPostBack && FileUpload1.HasFile)
        {
            if (FileUpload1.PostedFile.FileName.Length > 0)
            {
                fakeText.Text = FileUpload1.FileName;
                FileUpload1.Attributes["style"] = "display:none";
                ftype.Value = FileUpload1.PostedFile.ContentType.Substring(FileUpload1.PostedFile.ContentType.LastIndexOf("/") + 1);
                bool ok = false;
                switch (ftype.Value)
                {
                    case "jpg":
                    case "jpeg":
                    case "gif":
                    case "png":
                    case "tiff":
                        ok = true;
                        break;
                }
                if (ok)
                {
                    string typ = "";
                    if (Request.QueryString["type"] == "1") typ = "attachment";
                    if (Request.QueryString["type"] == "1") typ = "media";
                    int id = MSSSDataUtils.GetNextID(typ);
                    savedname.Value = id + FileUpload1.FileName.Substring(FileUpload1.FileName.LastIndexOf("."));
                    FileUpload1.SaveAs(Server.MapPath("~/Uploads/") + savedname.Value);
                    showImage();
                }
                else
                {
                    if (!string.IsNullOrEmpty(savedname.Value))
                        System.IO.File.Delete(savedname.Value);
                    Label1.Text = "Not an allowed file type";
                    
                    ctls.Attributes["style"] = "display:none;";
                }
            }
        }
        else
        {
            ctls.Attributes["style"] = "display:none";
            FileUpload1.Attributes["style"] = "display:inline-block";
            photo.InnerHtml = "";
        }
    }

    protected void CancelClick(object sender, EventArgs e)
    {
        string saveName = savedname.Value;
        System.IO.File.Delete(Server.MapPath("~/Uploads/") + savedname.Value);
        photo.InnerHtml = "";
        FileUpload1.Attributes["style"] = "display:inline-block";
        accepted.Attributes["style"] = "display:inline-block";
        ctls.Attributes["style"] = "display:none";
        Label1.Text = "";
    }

    protected void showImage()
    {
        if (!string.IsNullOrEmpty(savedname.Value))
            try
            {
                int w, h;
                using (System.Drawing.Bitmap b = new System.Drawing.Bitmap(Server.MapPath("~/Uploads") + "\\" + savedname.Value))
                {
                    w = b.Width;
                    h = b.Height;
                }
                h = (int)((100.0 / (double)w) * h);
                w = 100;
                photo.Attributes["style"] = "display:inline-block;margin-left:5px;margin-top:5px;";
                //uploadArea.Attributes["style"] = "line-height:" + h + "px;vertical-align:top";
                photo.InnerHtml = "<img src='uploads/" + savedname.Value + "' width='" + w + "' height='" + h + "'></img>";
                FileUpload1.Attributes["style"] = "display:none";
                ctls.Attributes["style"] = "display:inline-block;margin-top:10px;";
                accepted.Attributes["style"] = "display:none";
            }
            catch (Exception ex)
            {
                Label1.Text = "ERROR: " + ex.Source.ToString();
            }
        else
        {
            Label1.Text = "You have not specified a file.";
        }
    }
}
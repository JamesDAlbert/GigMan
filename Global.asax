<%@ Application Language="C#" %>

<script runat="server">

    void Application_Start(object sender, EventArgs e) 
    {
        // Code that runs on application startup

    }
    
    void Application_End(object sender, EventArgs e) 
    {
        //  Code that runs on application shutdown

    }
        
    void Application_Error(object sender, EventArgs e) 
    { 
        // Code that runs when an unhandled error occurs

    }

    void Session_Start(object sender, EventArgs e) 
    {
        // Code that runs when a new session is started

    }

    void Session_End(object sender, EventArgs e) 
    {
        // Code that runs when a session ends. 
        // Note: The Session_End event is raised only when the sessionstate mode
        // is set to InProc in the Web.config file. If session mode is set to StateServer 
        // or SQLServer, the event is not raised.

    }

    protected void Application_BeginRequest(Object sender, EventArgs e)
    {
        System.Web.Configuration.HttpRuntimeSection runTime = (System.Web.Configuration.HttpRuntimeSection)
            System.Web.Configuration.WebConfigurationManager.GetSection("system.web/httpRuntime");
        //Approx 100 Kb(for page content) size has been deducted because the maxRequestLength proprty is the page size, not only the file upload size
        int maxRequestLength = (runTime.MaxRequestLength - 100) * 1024;

        //This code is used to check the request length of the page and if the request length is greater than 
        //MaxRequestLength then retrun to the same page with extra query string value action=exception

        HttpContext context = ((HttpApplication)sender).Context;
        if (context.Request.ContentLength > maxRequestLength)
        {
            IServiceProvider provider = (IServiceProvider)context;
            HttpWorkerRequest workerRequest = (HttpWorkerRequest)provider.GetService(typeof(HttpWorkerRequest));
            // Check if body contains data
            if (workerRequest.HasEntityBody())
            {
                // get the total body length
                int requestLength = workerRequest.GetTotalEntityBodyLength();
                // Get the initial bytes loaded
                int initialBytes = 0;
                if (workerRequest.GetPreloadedEntityBody() != null)
                    initialBytes = workerRequest.GetPreloadedEntityBody().Length;
                if (!workerRequest.IsEntireEntityBodyIsPreloaded())
                {
                    byte[] buffer = new byte[512000];
                    // Set the received bytes to initial bytes before start reading
                    int receivedBytes = initialBytes;
                    while (requestLength - receivedBytes >= initialBytes)
                    {
                        // Read another set of bytes
                        initialBytes = workerRequest.ReadEntityBody(buffer, buffer.Length);
                        // Update the received bytes
                        receivedBytes += initialBytes;
                    }
                    initialBytes = workerRequest.ReadEntityBody(buffer, requestLength - receivedBytes);
                }
            }
            // Redirect the user to the same page with querystring action=exception. 
            context.Response.Redirect("GigManMedia.aspx?Action=error&type=exceed");
        }
    }
       
</script>

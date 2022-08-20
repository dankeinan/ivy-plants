using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using System.Collections.Generic;
using Microsoft.Azure.WebJobs.Extensions.Storage;
using Azure.Data.Tables;
using Aliencube.AzureFunctions.Extensions.OpenApi;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Attributes;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Enums;
using System.Net;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Security.Claims;



namespace FunctionApp2
{
    public class Notificatin : ServerlessHub
    {

        [FunctionName("index")]
        public IActionResult GetHomePage([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req, ExecutionContext context)
        {
            var path = Path.Combine("C:", "Users", "danie", "source", "repos", "gitGarden", "Server", "FunctionApp2", "index.html");
            Console.WriteLine(path);
            return new ContentResult
            {
                Content = File.ReadAllText(path),
                ContentType = "text/html",
            };
        }

        [FunctionName("negotiate")]
        public static SignalRConnectionInfo GetOrderNotificationsSignalRInfo(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req,
        [SignalRConnectionInfo(HubName = "serverless")] SignalRConnectionInfo connectionInfo)
        {
            return connectionInfo;
        }

    }
}

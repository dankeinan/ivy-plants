using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using Azure.Data.Tables;

namespace FunctionApp2
{
    public static class deleteplant
    {
        [FunctionName("deleteplant")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            string plantID = req.Query["plantID"];

            var sensorClient = new TableClient(
new Uri("http://storageaccountdnd.table.core.windows.net/"),
"Sensor",
new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));

            var plantClient = new TableClient(
new Uri("http://storageaccountdnd.table.core.windows.net/"),
"Plant",
new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));


            Azure.AsyncPageable<TableEntity> sensorUser = sensorClient.QueryAsync<TableEntity>(filter: $"plantID eq '{plantID}'");
            string sensorRowkey ="";
            string sensorID ="";
            await foreach (TableEntity u in sensorUser)
            { 
                sensorRowkey = u.GetString("RowKey");
                sensorID = u.GetString("sensorID");
            }

            Azure.AsyncPageable<TableEntity> plantUser = plantClient.QueryAsync<TableEntity>(filter: $"plantID eq '{plantID}'");
            string plantRowkey = "";
            await foreach (TableEntity i in plantUser)
            {
                plantRowkey = i.GetString("RowKey");
            }

            log.LogInformation("sensorRowkey: " + sensorRowkey);
            log.LogInformation("sensorID: " + sensorID);
            log.LogInformation("okantRowkey: " + plantRowkey);

            if (sensorRowkey != "" && plantRowkey != "")
            {
                await plantClient.DeleteEntityAsync(plantID, plantRowkey);
                await sensorClient.DeleteEntityAsync(sensorID, sensorRowkey);
                return new OkObjectResult("the data have been deleted");

            }
            else
            {
                if (sensorRowkey == "")
                    return new BadRequestObjectResult("no such sensor with that data");
                if (plantRowkey == "")
                    return new BadRequestObjectResult("no such plant with that data");

            }


            return new OkObjectResult("the data have been deleted");

        }
    }
}

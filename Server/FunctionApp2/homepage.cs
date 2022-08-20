using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Azure.Data.Tables;
using System.Text.Json;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Attributes;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Enums;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Azure.Storage.Blobs;

namespace FunctionApp2
{
    public static class homepage
    {
        [System.Web.Http.HttpGet]
        [Route("api/homepage/{userId}")]
        

        [FunctionName("homepage")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var userID = JObject.Parse(requestBody)["email"].ToString();
            var name = JObject.Parse(requestBody)["name"].ToString();

            //string userID = req.Query["email"];
            //string name = "";


            var tableClientUser = new TableClient(
                new Uri("http://storageaccountdnd.table.core.windows.net/"),
                "User",
                new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));

            Azure.AsyncPageable<TableEntity> userRows = tableClientUser.QueryAsync<TableEntity>(filter: $"userID eq '{userID}'");
            int count = 0;
            await foreach (TableEntity u in userRows)
            {
                count++;
            }
            if (count == 0)
            {
                string Dnow = DateTime.Now.ToString();
                string DnowShort = Dnow.Replace("/", "");
                DnowShort = DnowShort.Replace(" ", "");
                DnowShort = DnowShort.Replace(":", "");
                TableEntity userEntity = new TableEntity(userID, DnowShort);
                userEntity.Add("Timestamp", Dnow);
                userEntity.Add("userID", userID);
                userEntity.Add("name", name);
                log.LogInformation("update the user entity");
                await tableClientUser.AddEntityAsync(userEntity);

            }
            //assume the user already sign
            
            var tableClient = new TableClient(
                new Uri("http://storageaccountdnd.table.core.windows.net/"),
                "Plant",
                new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));

            Azure.AsyncPageable<TableEntity> userPlants = tableClient.QueryAsync<TableEntity>(filter: $"userID eq '{userID}'");

            List<TableEntity> plants_lst = new List<TableEntity>(); 
            await foreach (TableEntity plant in userPlants)
            {
                try
                {
                    if (String.Compare(plant["plantImage"].ToString(),"yes")==0)
                    {
                        plant.Add("imageUrl", "https://storageaccountdnd.blob.core.windows.net/imageplants/" + plant["plantID"].ToString());

                    }
                    else
                    {
                        plant.Add("imageUrl", "https://storageaccountdnd.blob.core.windows.net/imageplants/noPlant.png");

                    }
                }
                catch
                {
                    return new BadRequestObjectResult("cannot get to image from blob");

                }
                plants_lst.Add(plant);
            }
            string jsonString = System.Text.Json.JsonSerializer.Serialize(plants_lst);
            Console.WriteLine(jsonString);
            return new OkObjectResult(jsonString);
        }
    }
}

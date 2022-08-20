using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.Azure.WebJobs.Extensions.Storage;
using Azure.Data.Tables;
using Aliencube.AzureFunctions.Extensions.OpenApi;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Attributes;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Enums;
using System.Net;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using Azure.Storage.Blobs;

namespace FunctionApp2
{
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class SwaggerFormAttribute2 : Attribute
    {
        public string email { get; private set; }
        public string plantName { get; private set; }
        public string plantSpecies { get; private set; }
        public string plantImage { get; private set; }
        public string sensorID { get; private set; }

        public SwaggerFormAttribute2(string email, string plantName, string plantSpecies, string sensorID, string plantImage)
        {
            this.email = email;
            this.plantName = plantName;
            this.plantSpecies = plantSpecies;
            this.plantImage = plantImage;
            this.sensorID = sensorID;

        }

    }
    public static class addplant
    {
        private static readonly HttpClient client = new HttpClient();

        [FunctionName("addplant")]

        [OpenApiOperation(operationId: "addplant",
            tags: new[] {"addplant"},
            Summary = "",
            Description = "",
            Visibility = OpenApiVisibilityType.Important)]
        [OpenApiRequestBody(contentType: "application/json",
            bodyType: typeof(SwaggerFormAttribute2),
            Required  = true,
            Description = "")]


        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous,"get","post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            //string name = req.Query["name"];


            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            //var data = (JObject)JsonConvert.DeserializeObject(requestBody);
            //var plantInfo = data?.plantInfo; get info from the ui after using the cv endpoint
            //from the info we'll take the speices,the image,


            //var UserID = data?.email;
            var UserID = JObject.Parse(requestBody)["email"].ToString();

            //var plantName = data?.plantName;
            var plantName = JObject.Parse(requestBody)["plantName"].ToString();

            //var plantSpecies = data?.plantSpecies;
            var plantSpecies = JObject.Parse(requestBody)["plantSpecies"].ToString();

            //var plantPic = data?.plantImage;
            var plantPic = JObject.Parse(requestBody)["plantImage"].ToString();

            //var SensorsID = data?.sensorID;
            var sensorsID = JObject.Parse(requestBody)["sensorID"].ToString();



            var plantClient = new TableClient(
            new Uri("https://storageaccountdnd.table.core.windows.net/"),
            "Plant",
            new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));


            var sensorClient = new TableClient(
            new Uri("http://storageaccountdnd.table.core.windows.net/"),
            "Sensor",
            new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));
            


            Azure.AsyncPageable<TableEntity> userRows = sensorClient.QueryAsync<TableEntity>(filter: $"sensorID eq '{sensorsID}'");
            int count = 0;
            await foreach (TableEntity u in userRows)
            {
                count++;
            }
            if (count > 0)
            {
                return new BadRequestObjectResult("this sensor is already in use");
            }
            else
            {
                var invClient = new TableClient(
                new Uri("http://storageaccountdnd.table.core.windows.net/"),
                "Inventory",
                new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));
                Azure.AsyncPageable<TableEntity> uRows = invClient.QueryAsync<TableEntity>(filter: $"sensorID eq '{sensorsID}'");
                count = 0;
                await foreach (TableEntity i in uRows)
                {
                    count++;
                }
                if(count==0)
                {
                    return new BadRequestObjectResult("this sensor is not exit");

                }
                else { 
                string Dnow = DateTime.Now.ToString();
                string DnowShort = Dnow.Replace("/", "");
                DnowShort = DnowShort.Replace(" ", "");
                DnowShort = DnowShort.Replace(":", "");
                //for now the row key is random number
                TableEntity plantEntity = new TableEntity(plantName + DnowShort, DnowShort);
                    //plantEntity.Add("PartitionKey", );
                    //plantEntity.Add("RowKey", num);
                var plantID = plantName + DnowShort;
                plantEntity.Add("Timestamp", Dnow);
                plantEntity.Add("userID", UserID);
                plantEntity.Add("plantName", plantName);
                plantEntity.Add("plantID", plantID);
                plantEntity.Add("species", plantSpecies);
                plantEntity.Add("plantImage", "yes");
                plantEntity.Add("sensorID", sensorsID);
                plantEntity.Add("lastSample", "000");







                var response = await client.GetAsync("https://webscrappingdnd.azurewebsites.net/api/HttpTrigger?code=W-WE6okf3DFNfoWSsbtQ_0PATqEZHq3twDooQLwcFzGFAzFuiM7cjg==&clientId=default&name=" + plantSpecies);
                var content = "";   
                try
                {
                        content = await response.Content.ReadAsStringAsync();
                }
                catch
                {
                        return new BadRequestObjectResult("can not find the ideal moisture for this plant");
                }
                    //take moisture from the web scraping***********

                if(content == "")
                        return new BadRequestObjectResult("can not find the ideal moisture for this plant");


                    string moistureScrapping = content;
                string moisture = "";
                if (moistureScrapping == "D")
                    moisture = "50";
                if (moistureScrapping == "DM")
                    moisture = "150";
                if (moistureScrapping == "M")
                    moisture = "300";
                if (moistureScrapping == "MWe")
                    moisture = "300";
                if (moistureScrapping == "We")
                    moisture = "700";
                if (moistureScrapping == "WeWa")
                    moisture = "800";
                if (moistureScrapping == "Wa")
                    moisture = "900";


                 plantEntity.Add("moisture", moisture);



                TableEntity sensorEntity = new TableEntity();
                sensorEntity.Add("PartitionKey", sensorsID);
                sensorEntity.Add("RowKey", DnowShort);
                sensorEntity.Add("Timestamp", Dnow);
                sensorEntity.Add("userID", UserID);
                sensorEntity.Add("plantID", plantName + DnowShort);
                sensorEntity.Add("sensorID", sensorsID);
                    // need to add the first telemtry after reseting the sensor



                    //need to add ideal moisture and sun





                try
                {
                        var connstring = "DefaultEndpointsProtocol=https;AccountName=storageaccountdnd;AccountKey=azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw==;EndpointSuffix=core.windows.net";
                        var plantImage = new BlobClient(connstring, "imageplants", plantID);
                        byte[] bytes = Convert.FromBase64String(plantPic);// convert from base64 to stream
                        MemoryStream ms = new MemoryStream(bytes);
                        await plantImage.UploadAsync(ms); // upload to blob

                }
                catch
                {
                        plantEntity.Add("plantImage", "no");
                }
                log.LogInformation("update the plant entity");
                await plantClient.AddEntityAsync(plantEntity);
                log.LogInformation("update the sensor entity");
                await sensorClient.AddEntityAsync(sensorEntity);


                    string responseMessage = string.IsNullOrEmpty(plantName)
                    ? "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response."
                    : $"Hello,{plantName} . This HTTP triggered function executed successfully.";

                return new OkObjectResult(responseMessage);
                    }
            }
        }
    }
}
